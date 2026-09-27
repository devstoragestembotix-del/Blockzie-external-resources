function addGenerator(Blockly) {

    // BLE (app) + LEDC PWM motors (AI RC SOCCER sketch patterns)
    // ESP32 1.0.6 has no analogWrite — use ledcSetup/ledcWrite

    function ensureRcCarBase (Blockly) {
        Blockly.Arduino.includes_['ble'] = `#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>`;
        Blockly.Arduino.includes_['servo'] = `#include <ESP32Servo.h>`;
        delete Blockly.Arduino.includes_['bt'];

        Blockly.Arduino.definitions_['vars'] = `
#define RCCAR_BLE_SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define RCCAR_BLE_CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define RCCAR_BLE_CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

BLEServer* rccarBleServer = nullptr;
BLECharacteristic* rccarBleTx = nullptr;
bool rccarBleConnected = false;

char command;
int motorSpeed = 210;
char lastMotionCmd = 'n';
char lastDriveCmd = 'u';  // last move before stop (for resume)
String rxBuffer;

// M1=BL M2=BR M3=FR M4=FL  (same as AI RC SOCCER sketch)
int motorPinA[4] = {23, 27, 12, 13};
int motorPinB[4] = {15, 19, 18, 2};
bool motorEnabled[4] = {true, true, true, true};

Servo servo_5;
Servo servo_14;
Servo servo_32;
Servo servo_33;

int servoPin = 14;
int servoAngle = 50;

struct RcCarCmdMap {
  String cmd;
  char motion;
};
#define RCCAR_CMD_MAP_MAX 16
RcCarCmdMap rccarCmdMaps[RCCAR_CMD_MAP_MAX];
int rccarCmdMapCount = 0;

void rccarRegisterCommand(const char* cmd, char motion);
bool rccarLookupCommand(const String& low, char& outMotion);
void handleAppCommand(String incoming);
void handleCommand(char cmd);
void startRcCarBle(const char* name);

const char* rccarBleName = "MyCar";
`;

        delete Blockly.Arduino.setups_['servo_setup'];

        Blockly.Arduino.definitions_['channels'] = `
// Motor i uses LEDC channels i*2 and i*2+1
#define RCCAR_MOTOR_PWM_FREQ 5000
#define RCCAR_MOTOR_PWM_BITS 8
`;

        Blockly.Arduino.definitions_['robot_functions'] = `
void setServoByPin(int pin, int angle){
  Servo* s = nullptr;
  switch(pin){
    case 5: s = &servo_5; break;
    case 14: s = &servo_14; break;
    case 32: s = &servo_32; break;
    case 33: s = &servo_33; break;
    default: return;
  }
  // No delay() here — BLE callback must stay fast
  if (!s->attached()) s->attach(pin);
  s->write(constrain(angle, 0, 180));
}

void setServoPosition(int position) {
  servoPin = 14;
  servoAngle = position;
  setServoByPin(14, position);
}

void motorWrite(int i, int a, int b) {
  if (!motorEnabled[i]) return;
  // Motors on LEDC 8-15 so ESP32Servo can use 0-7
  ledcWrite(8 + i * 2, a);
  ledcWrite(8 + i * 2 + 1, b);
}

// Exact polarity from working AI RC SOCCER sketch
void moveForward() {
  motorWrite(3, 0, motorSpeed);           // FL 13,2
  motorWrite(2, motorSpeed, 0);           // FR 12,18
  motorWrite(0, motorSpeed, 0);           // BL 23,15
  motorWrite(1, 0, motorSpeed);           // BR 27,19
}

void moveBackward() {
  motorWrite(3, motorSpeed, 0);
  motorWrite(2, 0, motorSpeed);
  motorWrite(0, 0, motorSpeed);
  motorWrite(1, motorSpeed, 0);
}

void moveLeft() {
  motorWrite(3, motorSpeed, 0);
  motorWrite(2, motorSpeed, 0);
  motorWrite(0, 0, motorSpeed);
  motorWrite(1, 0, motorSpeed);
}

void moveRight() {
  motorWrite(3, 0, motorSpeed);
  motorWrite(2, 0, motorSpeed);
  motorWrite(0, motorSpeed, 0);
  motorWrite(1, motorSpeed, 0);
}

// Forward polarity (WORKING — do not change):
//   FL(3)=(0,S)  FR(2)=(S,0)  BL(0)=(S,0)  BR(1)=(0,S)
// Rotate = spin in place from that polarity:
//   CW  = left side FORWARD + right side REVERSE
//   ACW = left side REVERSE + right side FORWARD
void rotateClockwise() {
  motorWrite(3, 0, motorSpeed);           // FL forward
  motorWrite(0, motorSpeed, 0);           // BL forward
  motorWrite(2, 0, motorSpeed);           // FR reverse
  motorWrite(1, motorSpeed, 0);           // BR reverse
}

void rotateAnticlockwise() {
  motorWrite(3, motorSpeed, 0);           // FL reverse
  motorWrite(0, 0, motorSpeed);           // BL reverse
  motorWrite(2, motorSpeed, 0);           // FR forward
  motorWrite(1, 0, motorSpeed);           // BR forward
}

void stopMotors() {
  for (int i = 0; i < 4; i++) {
    motorWrite(i, 0, 0);
  }
}

void applyMotionChar(char cmd) {
  switch (cmd) {
    case 'u': moveForward(); break;
    case 'd': moveBackward(); break;
    case 'l': moveLeft(); break;
    case 'r': moveRight(); break;
    case 'C': case 'c': rotateClockwise(); break;
    case 'G': case 'g': rotateAnticlockwise(); break;
    default: stopMotors(); break;
  }
}

void rccarRegisterCommand(const char* cmd, char motion) {
  if (rccarCmdMapCount >= RCCAR_CMD_MAP_MAX) return;
  String key = String(cmd);
  key.trim();
  key.toLowerCase();
  if (key.length() == 0) return;
  rccarCmdMaps[rccarCmdMapCount].cmd = key;
  rccarCmdMaps[rccarCmdMapCount].motion = motion;
  rccarCmdMapCount++;
}

bool rccarLookupCommand(const String& low, char& outMotion) {
  for (int i = 0; i < rccarCmdMapCount; i++) {
    if (low == rccarCmdMaps[i].cmd) {
      outMotion = rccarCmdMaps[i].motion;
      return true;
    }
  }
  return false;
}

void handleAppCommand(String incoming) {
  incoming.trim();
  if (incoming.length() == 0) return;

  String low = incoming;
  low.toLowerCase();
  Serial.print(F("CMD: "));
  Serial.println(incoming);

  if (low.startsWith("speed:")) {
    int v = low.substring(6).toInt();
    if (v >= 1 && v <= 5) motorSpeed = v * 50;
    else if (v > 5) motorSpeed = constrain(v, 0, 255);
    return;
  }
  if (low == "+" || low == "speed+") {
    motorSpeed = constrain(motorSpeed + 20, 0, 255);
    return;
  }
  if (low == "-" || low == "speed-") {
    motorSpeed = constrain(motorSpeed - 20, 0, 255);
    return;
  }
  if (low.length() == 1 && low[0] >= '1' && low[0] <= '5') {
    motorSpeed = (low[0] - '0') * 50;
    return;
  }

  char motion = 0;
  if (rccarLookupCommand(low, motion)) {
    // custom RC Car Action map
  } else if (low == "forward" || low == "u") motion = 'u';
  else if (low == "backward" || low == "reverse" || low == "d") motion = 'd';
  else if (low == "left" || low == "l") motion = 'l';
  else if (low == "right" || low == "r") motion = 'r';
  else if (low == "rotatecw" || low == "clockwise" || low == "c" || low == "rcw" ||
           low == "rotate clockwise" || low == "turn right") motion = 'C';
  else if (low == "rotateacw" || low == "anticlockwise" || low == "g" || low == "racw" ||
           low == "rotate anticlockwise" || low == "turn left") motion = 'G';
  else if (low == "stop" || low == "idle" || low == "n" || low == "halt" || low == "brake") motion = 'n';
  else if (low == "resume" || low == "start" || low == "go") {
    // Resume = last real move (NOT stop). Never lose direction on 'n'.
    motion = lastDriveCmd;
  } else if (low == "f" || low == "kick") {
    setServoPosition(60);
    return;
  } else if (low == "b" || low == "release") {
    setServoPosition(0);
    return;
  } else if (low.length() == 1 && low[0] >= '6' && low[0] <= '9') {
    setServoPosition((low[0] - '0') * 15);
    return;
  } else {
    return;
  }

  // RC Car Action "Resume" block maps to 'S'
  if (motion == 'S') {
    motion = lastDriveCmd;
  }

  lastMotionCmd = motion;
  if (motion == 'n') {
    stopMotors();
    // keep lastDriveCmd — so resume still knows previous move
  } else {
    lastDriveCmd = motion;
    applyMotionChar(motion);
  }
}

void handleCommand(char cmd) {
  handleAppCommand(String(cmd));
}

class RcCarBleServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    rccarBleConnected = true;
  }
  void onDisconnect(BLEServer* pServer) {
    // Do NOT call stopMotors() here — PWM/ledcWrite from BLE
    // disconnect callback can crash ESP32 (watchdog / queue assert).
    rccarBleConnected = false;
    pServer->getAdvertising()->start();
  }
};

class RcCarBleRxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    if (value.empty()) return;

    // IMPORTANT: do NOT treat first char of a word as a command.
    // "forward" starts with 'f' (servo) and "backward" with 'b' —
    // early single-char handling broke forward/backward.
    for (size_t i = 0; i < value.size(); ++i) {
      char ch = value[i];
      if (ch == '\\n' || ch == '\\r') {
        if (rxBuffer.length() > 0) {
          handleAppCommand(rxBuffer);
          rxBuffer = "";
        }
      } else {
        rxBuffer += ch;
      }
    }

    if (rxBuffer.length() > 0) {
      String peek = rxBuffer;
      peek.toLowerCase();
      char mappedMotion = 0;
      bool isMapped = rccarLookupCommand(peek, mappedMotion);
      // Complete word, custom map, OR single-char (u/d/l/r/n/C/G/f/b/1-9/+/-)
      if (peek == "forward" || peek == "backward" || peek == "left" || peek == "right" ||
          peek == "stop" || peek == "resume" || peek == "start" || peek == "go" ||
          peek == "rotatecw" || peek == "rotateacw" || peek == "rcw" || peek == "racw" ||
          peek == "clockwise" || peek == "anticlockwise" || peek == "reverse" ||
          peek.startsWith("speed:") ||
          peek == "speed+" || peek == "speed-" ||
          isMapped ||
          (peek.length() == 1)) {
        handleAppCommand(rxBuffer);
        rxBuffer = "";
      }
    }
  }
};

void startRcCarBle(const char* name) {
  BLEDevice::init(name);
  rccarBleServer = BLEDevice::createServer();
  rccarBleServer->setCallbacks(new RcCarBleServerCallbacks());

  BLEService* pService = rccarBleServer->createService(RCCAR_BLE_SERVICE_UUID);

  rccarBleTx = pService->createCharacteristic(
    RCCAR_BLE_CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  rccarBleTx->addDescriptor(new BLE2902());

  BLECharacteristic* pRx = pService->createCharacteristic(
    RCCAR_BLE_CHARACTERISTIC_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  pRx->setCallbacks(new RcCarBleRxCallbacks());

  pService->start();
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(RCCAR_BLE_SERVICE_UUID);

  BLEAdvertisementData advData;
  advData.setName(name);
  advData.setCompleteServices(BLEUUID(RCCAR_BLE_SERVICE_UUID));
  pAdvertising->setAdvertisementData(advData);

  BLEAdvertisementData scanResp;
  scanResp.setName(name);
  pAdvertising->setScanResponseData(scanResp);

  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();
}
`;

        Blockly.Arduino.loops_['main_loop'] = `
if (Serial.available()) {
  String input = Serial.readStringUntil('\\n');
  handleAppCommand(input);
}
`;
    }

    function ensureMotorsReady (Blockly) {
        // a1_ after a0_ pin enable so LEDC attaches to final pins
        if (Blockly.Arduino.setups_['a1_rccar_motors']) return;
        Blockly.Arduino.setups_['a1_rccar_motors'] = `
for (int i = 0; i < 4; i++) {
  pinMode(motorPinA[i], OUTPUT);
  pinMode(motorPinB[i], OUTPUT);
  ledcSetup(8 + i * 2, RCCAR_MOTOR_PWM_FREQ, RCCAR_MOTOR_PWM_BITS);
  ledcAttachPin(motorPinA[i], 8 + i * 2);
  ledcSetup(8 + i * 2 + 1, RCCAR_MOTOR_PWM_FREQ, RCCAR_MOTOR_PWM_BITS);
  ledcAttachPin(motorPinB[i], 8 + i * 2 + 1);
  ledcWrite(8 + i * 2, 0);
  ledcWrite(8 + i * 2 + 1, 0);
}
// Servo on pin 14 (uses LEDC 0-7 — motors are on 8-15)
servoPin = 14;
servo_14.attach(14);
servo_14.write(0);
`;
    }

    function ensureSerialMonitor (Blockly) {
        if (Blockly.Arduino.setups_['00_rccar_serial']) return;
        // Blockzie serial monitor = 9600 (same as wifi / rcAppBluetooth)
        Blockly.Arduino.setups_['00_rccar_serial'] = `
Serial.begin(9600);
delay(1500);
`;
    }

    function ensureBluetoothStart (Blockly, name) {
        ensureRcCarBase(Blockly);
        ensureSerialMonitor(Blockly);
        ensureMotorsReady(Blockly);
        Blockly.Arduino.setups_['b_rccar_ble'] = `
rccarBleName = ${name};
startRcCarBle(rccarBleName);
Serial.println();
Serial.println("=== BLE RC Car Ready ===");
Serial.print("Name: ");
Serial.println(rccarBleName);
Serial.println("Connect from app (BLE scan)");
`;
    }

    Blockly.Arduino.bt_connect = function () {
        ensureRcCarBase(Blockly);
        if (!Blockly.Arduino.setups_['b_rccar_ble']) {
            ensureBluetoothStart(Blockly, '"MyCar"');
        }
        return '';
    };

    Blockly.Arduino.bt_name = function (block) {
        ensureRcCarBase(Blockly);
        const name = Blockly.Arduino.valueToCode(
            block,
            'NAME',
            Blockly.Arduino.ORDER_ATOMIC
        ) || '"MyCar"';
        ensureBluetoothStart(Blockly, name);
        return '';
    };

    Blockly.Arduino.motor_setup = function (block) {
        ensureRcCarBase(Blockly);
        ensureSerialMonitor(Blockly);
        ensureMotorsReady(Blockly);

        const motorIndex = { M1: 0, M2: 1, M3: 2, M4: 3 };
        const motor = block.getFieldValue('MOTOR') || 'M1';
        const pin1 = block.getFieldValue('PIN1');
        const pin2 = block.getFieldValue('PIN2');
        const idx = motorIndex[motor];

        let enableCode = '';
        if (!Blockly.Arduino.rcCarMotorSelectStarted) {
            Blockly.Arduino.rcCarMotorSelectStarted = true;
            enableCode += `motorEnabled[0]=false; motorEnabled[1]=false; motorEnabled[2]=false; motorEnabled[3]=false;\n`;
        }
        enableCode += `motorPinA[${idx}] = ${pin1};\n`;
        enableCode += `motorPinB[${idx}] = ${pin2};\n`;
        enableCode += `motorEnabled[${idx}] = true;\n`;

        if (!Blockly.Arduino.setups_['a0_rccar_enable']) {
            Blockly.Arduino.setups_['a0_rccar_enable'] = '';
        }
        Blockly.Arduino.setups_['a0_rccar_enable'] += enableCode;

        return '';
    };

    const actionToMotion = {
        forward: 'u',
        backward: 'd',
        left: 'l',
        right: 'r',
        rotateCW: 'C',
        rotateACW: 'G',
        stop: 'n',
        resume: 'S'
    };

    Blockly.Arduino.rc_car_command = function (block) {
        ensureRcCarBase(Blockly);
        if (!Blockly.Arduino.setups_['b_rccar_ble']) {
            ensureBluetoothStart(Blockly, '"MyCar"');
        }

        const action = block.getFieldValue('ACTION') || 'forward';
        const motion = actionToMotion[action] || 'u';
        const cmd = Blockly.Arduino.valueToCode(block, 'CMD', Blockly.Arduino.ORDER_ATOMIC) || `"${action}"`;

        if (!Blockly.Arduino.setups_['a_rccar_cmd_maps']) {
            Blockly.Arduino.setups_['a_rccar_cmd_maps'] = '';
        }
        Blockly.Arduino.setups_['a_rccar_cmd_maps'] += `rccarRegisterCommand(${cmd}, '${motion}');\n`;
        return '';
    };

    Blockly.Arduino.set_speed = function (block) {
        ensureRcCarBase(Blockly);
        const speed = Blockly.Arduino.valueToCode(
            block,
            'SPEED',
            Blockly.Arduino.ORDER_ATOMIC
        ) || 210;
        return `motorSpeed = constrain((int)(${speed}), 0, 255);\n`;
    };

    Blockly.Arduino.set_servo = function (block) {
        ensureRcCarBase(Blockly);
        const pin = block.getFieldValue('PIN');
        const angle = Blockly.Arduino.valueToCode(
            block,
            'ANGLE',
            Blockly.Arduino.ORDER_ATOMIC
        ) || 90;
        return `
servoPin = ${pin};
servoAngle = ${angle};
setServoByPin(${pin}, ${angle});
`;
    };

    return Blockly;
}

exports = addGenerator;
