/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {

    function ensureBtSerial (rxPin, txPin) {
        Blockly.Arduino.includes_['software_serial'] = '#include <SoftwareSerial.h>';
        if (rxPin != null && txPin != null) {
            Blockly.Arduino.definitions_['a_rc_bt_softserial'] = '#define RC_BT_SOFTSERIAL 1';
            Blockly.Arduino.definitions_['rc_bt_serial'] =
                `SoftwareSerial rcBtSerial(${rxPin}, ${txPin});`;
        } else if (!Blockly.Arduino.definitions_['rc_bt_serial']) {
            Blockly.Arduino.definitions_['a_rc_bt_softserial'] = '#define RC_BT_SOFTSERIAL 1';
            Blockly.Arduino.definitions_['rc_bt_serial'] =
                'SoftwareSerial rcBtSerial(A3, 13);';
        }
    }

    function ensureBtCore (rxPin, txPin) {
        ensureBtSerial(rxPin, txPin);

        Blockly.Arduino.includes_['string_h'] = '#include <string.h>';

        Blockly.Arduino.definitions_['rc_bt_state'] =
`char rcBtCmd = 0;
char rcBtToken[16];
char rcBtBuf[16];
uint8_t rcBtBufLen = 0;
unsigned long rcBtBufMs = 0;
char rcBtName[24] = "App";
bool rcBtHasCmd = false;
bool rcBtAnnounced = false;
unsigned long rcBtLastMs = 0;
unsigned long rcBtPriorityMs = 300;
int rcBtStatePin = -1;
int rcBtLink = -1;
unsigned long rcBtHighSince = 0;
unsigned long rcBtLowSince = 0;

void rcBtOnDataReceived();
`;

        Blockly.Arduino.definitions_['rc_bt_helpers'] =
`void rcBtAnnounceConnect() {
  if (rcBtAnnounced) return;
  rcBtAnnounced = true;
  Serial.print(F("Connected: "));
  Serial.println(rcBtName);
}

void rcBtAnnounceDisconnect() {
  if (!rcBtAnnounced) return;
  rcBtAnnounced = false;
  Serial.print(F("Disconnected: "));
  Serial.println(rcBtName);
}

bool rcBtIsMoveCmd(char c) {
  return c == 'u' || c == 'd' || c == 'l' || c == 'r' ||
         c == 'b' || c == 'c' || c == 'f' || c == 'a';
}

void rcBtApplyToken(const char* tok) {
  if (!tok || !tok[0]) return;

  const char* label = 0;
  if (!strcmp(tok, "u")) label = "up";
  else if (!strcmp(tok, "d")) label = "down";
  else if (!strcmp(tok, "l")) label = "left";
  else if (!strcmp(tok, "r")) label = "right";
  else if (!strcmp(tok, "b")) label = "back";
  else if (!strcmp(tok, "c")) label = "center";
  else if (!strcmp(tok, "f")) label = "hello";
  else if (!strcmp(tok, "a")) label = "action A";
  else if (!strcmp(tok, "stop")) label = "stop";
  else return;

  strncpy(rcBtToken, tok, 15);
  rcBtToken[15] = 0;
  rcBtCmd = tok[1] ? 0 : tok[0];
  rcBtHasCmd = true;
  rcBtLastMs = millis();
  if (rcBtStatePin < 0) {
    rcBtAnnounceConnect();
  }
  Serial.print(F("Received: "));
  Serial.println(label);
  rcBtOnDataReceived();
}

void rcBtFlushBuf() {
  if (rcBtBufLen == 0) return;
  rcBtBuf[rcBtBufLen] = 0;
  if (!strcmp(rcBtBuf, "stop")) {
    rcBtApplyToken("stop");
  }
  rcBtBufLen = 0;
}

void rcBtPollLink() {
  if (rcBtStatePin < 0) return;
  const unsigned long now = millis();
  const bool high = digitalRead(rcBtStatePin) == HIGH;
  if (high) {
    if (rcBtHighSince == 0) rcBtHighSince = now;
    rcBtLowSince = 0;
    if (rcBtLink != 1 && (now - rcBtHighSince) >= 1500UL) {
      rcBtLink = 1;
      rcBtAnnounceConnect();
    }
  } else {
    if (rcBtLowSince == 0) rcBtLowSince = now;
    rcBtHighSince = 0;
    if (rcBtLink != 0 && (now - rcBtLowSince) >= 1500UL) {
      rcBtLink = 0;
      rcBtAnnounceDisconnect();
    }
  }
}

void rcBtPollEvent() {
  rcBtPollLink();
  while (rcBtSerial.available()) {
    char c = (char)rcBtSerial.read();
    if (c >= 'A' && c <= 'Z') c = (char)(c + 32);
    if (c == '\\r' || c == '\\n' || c == ' ' || c == '\\t') {
      rcBtFlushBuf();
      continue;
    }
    if (c < 'a' || c > 'z') continue;

    if (rcBtBufLen == 0 && rcBtIsMoveCmd(c)) {
      char one[2];
      one[0] = c;
      one[1] = 0;
      rcBtApplyToken(one);
      continue;
    }

    if (rcBtBufLen < 15) {
      rcBtBuf[rcBtBufLen++] = c;
      rcBtBufMs = millis();
    }
    rcBtBuf[rcBtBufLen] = 0;
    if (!strcmp(rcBtBuf, "stop")) {
      rcBtFlushBuf();
    }
  }
  if (rcBtBufLen && (millis() - rcBtBufMs) > 80UL) {
    rcBtFlushBuf();
  }
}

bool rcBtPriorityActive() {
  return (millis() - rcBtLastMs) < rcBtPriorityMs;
}
`;

        if (!Blockly.Arduino.definitions_['rc_bt_on_recv']) {
            Blockly.Arduino.definitions_['rc_bt_on_recv'] =
`void rcBtOnDataReceived() {
}
`;
        } 
    }

    function getWorkspaceDeviceId () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws) {
                return '';
            }
            return String(
                ws.deviceId || ws.deviceType ||
                (typeof ws.getDeviceId === 'function' ? ws.getDeviceId() : '') ||
                (ws.options && (ws.options.deviceId || ws.options.deviceType)) ||
                ''
            ).toLowerCase();
        } catch (e) {
            return '';
        }
    }

    function getSpiderBoardFromBlocks () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws || typeof ws.getAllBlocks !== 'function') {
                return null;
            }
            const boards = ws.getAllBlocks(false).filter(b => b && b.type === 'rc_spider_board');
            if (!boards.length) {
                return null;
            }
            return boards[0].getFieldValue('BOARD') || null;
        } catch (e) {
            return null;
        }
    }

    function isSpiderEsp32Board () {
        if (Blockly.Arduino.spiderBoard === 'ESP32') {
            return true;
        }
        if (Blockly.Arduino.spiderBoard === 'NANO') {
            return false;
        }
        const fromBlock = getSpiderBoardFromBlocks();
        if (fromBlock === 'ESP32') {
            return true;
        }
        if (fromBlock === 'NANO') {
            return false;
        }
        const id = getWorkspaceDeviceId();
        // Only ESP32 / intermediate kit use built-in BT
        if (id.includes('esp32') || id.includes('intermediatekit')) {
            return true;
        }
        // ottoRobot, Nano, Humanoid, unknown → SoftSerial (safe for board 'nano')
        return false;
    }

    function ensureSpiderBase (Blockly) {
        // Always clear ESP32-only includes first (stale codegen / board switch)
        delete Blockly.Arduino.includes_['rc_spider_bt'];
        delete Blockly.Arduino.includes_['rc_spider_servo'];

        const esp32 = isSpiderEsp32Board();
        Blockly.Arduino.spiderIsEsp32 = esp32;
        const btName = Blockly.Arduino.spiderBtName ||
            (esp32 ? '"ESP32_SPIDER"' : '"SpiderRobot"');

        // Important: do NOT emit BluetoothSerial.h on Nano (library detect fails)
        if (esp32) {
            Blockly.Arduino.includes_['rc_spider_bt'] = `#include "BluetoothSerial.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>`;
            Blockly.Arduino.includes_['rc_spider_servo'] = '#include <ESP32Servo.h>';
            Blockly.Arduino.definitions_['a_rc_spider_headers'] =
`BluetoothSerial SerialBT;
BLECharacteristic* spiderBleTx = nullptr;
volatile char spiderBleCmd = 0;
volatile bool spiderBleCmdReady = false;

#define SPIDER_BLE_SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define SPIDER_BLE_UUID_RX      "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define SPIDER_BLE_UUID_TX      "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

class SpiderBleServerCb : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {}
  void onDisconnect(BLEServer* pServer) { BLEDevice::startAdvertising(); }
};

class SpiderBleRxCb : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    String v = pCharacteristic->getValue();
    if (v.length() == 0) return;
    spiderBleCmd = v.charAt(0);
#else
    std::string v = pCharacteristic->getValue();
    if (v.empty()) return;
    spiderBleCmd = v[0];
#endif
    spiderBleCmdReady = true;
  }
};

void spiderStartBle(const char* name) {
  BLEDevice::init(name);
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new SpiderBleServerCb());
  BLEService* service = server->createService(SPIDER_BLE_SERVICE_UUID);
  spiderBleTx = service->createCharacteristic(
    SPIDER_BLE_UUID_TX, BLECharacteristic::PROPERTY_NOTIFY);
  spiderBleTx->addDescriptor(new BLE2902());
  BLECharacteristic* rx = service->createCharacteristic(
    SPIDER_BLE_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  rx->setCallbacks(new SpiderBleRxCb());
  service->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  // iOS: keep name in the 31-byte adv packet; 128-bit UUID goes in scan response.
  BLEAdvertisementData ad;
  ad.setFlags(0x06);
  ad.setName(name);
  adv->setAdvertisementData(ad);
  BLEAdvertisementData sr;
  sr.setCompleteServices(BLEUUID(SPIDER_BLE_SERVICE_UUID));
  adv->setScanResponseData(sr);
  adv->setScanResponse(true);
  adv->setMinPreferred(0x06);
  BLEDevice::startAdvertising();
}
`;
        } else {
            Blockly.Arduino.includes_['software_serial'] = '#include <SoftwareSerial.h>';
            Blockly.Arduino.includes_['servo'] = '#include <Servo.h>';
            Blockly.Arduino.definitions_['a_rc_spider_headers'] =
`SoftwareSerial SerialBT(A3, 13);
`;
        }

        // Working ESP32 Spider sketch logic (smoothMove + gaits)
        Blockly.Arduino.definitions_['rc_spider_vars'] =
`Servo servo_14; // URP
Servo servo_12; // URA
Servo servo_13; // LRA
Servo servo_15; // LRP
Servo servo_16; // ULP
Servo servo_5;  // ULA
Servo servo_4;  // LLA
Servo servo_2;  // LLP

char spiderCmd = 0;

int pos14 = 90, pos12 = 90, pos13 = 90, pos15 = 90;
int pos16 = 90, pos5  = 90, pos4  = 90, pos2  = 90;
`;

        delete Blockly.Arduino.definitions_['rc_spider_frames'];

        Blockly.Arduino.definitions_['rc_spider_functions'] =
`void smoothMove(int t14, int t12, int t13, int t15,
                int t16, int t5,  int t4,  int t2,
                int stepDelay) {
  bool done = false;
  while (!done) {
    done = true;
    if (pos14 != t14) { pos14 += (pos14 < t14) ? 1 : -1; done = false; }
    if (pos12 != t12) { pos12 += (pos12 < t12) ? 1 : -1; done = false; }
    if (pos13 != t13) { pos13 += (pos13 < t13) ? 1 : -1; done = false; }
    if (pos15 != t15) { pos15 += (pos15 < t15) ? 1 : -1; done = false; }
    if (pos16 != t16) { pos16 += (pos16 < t16) ? 1 : -1; done = false; }
    if (pos5  != t5 ) { pos5  += (pos5  < t5 ) ? 1 : -1; done = false; }
    if (pos4  != t4 ) { pos4  += (pos4  < t4 ) ? 1 : -1; done = false; }
    if (pos2  != t2 ) { pos2  += (pos2  < t2 ) ? 1 : -1; done = false; }
    servo_14.write(pos14);
    servo_12.write(pos12);
    servo_13.write(pos13);
    servo_15.write(pos15);
    servo_16.write(pos16);
    servo_5.write(pos5);
    servo_4.write(pos4);
    servo_2.write(pos2);
    delay(stepDelay);
  }
}

void standby() {
  smoothMove(70, 90, 90, 110, 110, 90, 90, 70, 3);
}

void forward() {
  smoothMove(90,90,90,110,110,90,90,90,4);
  smoothMove(90,120,90,110,110,90,60,90,4);
  smoothMove(70,120,90,110,110,90,60,70,4);
  smoothMove(70,120,90,90,90,90,60,70,4);
  smoothMove(70,90,90,90,90,90,90,70,4);
  smoothMove(70,90,120,90,90,60,90,70,4);
  smoothMove(70,90,120,110,110,60,90,70,4);
  smoothMove(90,90,120,110,110,60,90,90,4);
  smoothMove(90,90,90,110,110,90,90,90,4);
  smoothMove(70,90,90,110,110,90,90,70,4);
}

void back() {
  smoothMove(90,90,90,110,110,90,90,90,4);
  smoothMove(90,60,90,110,110,90,120,90,4);
  smoothMove(70,60,90,110,110,90,120,70,4);
  smoothMove(70,60,90,90,90,90,120,70,4);
  smoothMove(70,90,90,90,90,90,90,70,4);
  smoothMove(70,90,60,90,90,120,90,70,4);
  smoothMove(70,90,60,110,110,120,90,70,4);
  smoothMove(90,90,60,110,110,120,90,90,4);
  smoothMove(90,90,90,110,110,90,90,90,4);
  smoothMove(70,90,90,110,110,90,90,70,4);
}

void turnleft() {
  smoothMove(90,135,90,110,110,90,135,90,3);
  smoothMove(70,135,90,110,110,90,135,70,3);
  smoothMove(70,135,135,90,90,135,135,70,3);
  smoothMove(70,90,90,110,110,90,90,70,3);
}

void turnright() {
  smoothMove(70,90,45,90,90,45,90,70,3);
  smoothMove(70,90,45,110,110,45,90,70,3);
  smoothMove(90,45,45,110,110,45,45,90,3);
  smoothMove(70,90,90,110,110,90,90,70,3);
}

void hello() {
  smoothMove(170,90,135,90,90,90,90,90,2);
  smoothMove(170,130,135,90,90,90,90,90,2);
  smoothMove(170,50,135,90,90,90,90,90,2);
  smoothMove(170,130,135,90,90,90,90,90,2);
  smoothMove(170,90,135,90,90,90,90,90,2);
  smoothMove(70,90,135,90,90,90,90,90,2);
}

void dance1() {
  smoothMove(50,90,90,90,90,90,90,90,3);
  smoothMove(90,90,90,130,90,90,90,90,3);
  smoothMove(90,90,90,90,90,90,90,50,3);
  smoothMove(90,90,90,90,130,90,90,90,3);
}

void dance2() {
  smoothMove(70,45,135,110,110,135,45,70,3);
  smoothMove(115,45,135,65,110,135,45,70,3);
  smoothMove(70,45,135,110,65,135,45,115,3);
}

void dance3() {
  smoothMove(70,45,45,110,110,135,135,70,3);
  smoothMove(90,45,45,60,90,135,135,70,3);
  smoothMove(90,45,45,110,90,135,135,120,3);
  smoothMove(70,90,90,110,110,90,90,70,3);
}
`;

        if (!Blockly.Arduino.definitions_['rc_spider_handler']) {
            Blockly.Arduino.definitions_['rc_spider_handler'] =
`void handleSpiderCommand(char cmd) {
  switch (cmd) {
    case 'u': forward(); break;
    case 'd': back(); break;
    case 'l': turnleft(); break;
    case 'r': turnright(); break;
    case 'f': hello(); break;
    case 'b': dance1(); break;
    case 'c': dance2(); break;
    case 'a': dance3(); break;
    default: break;
  }
}
`;
        }

        const btBegin = esp32 ?
            `SerialBT.begin(${btName});
spiderStartBle(${btName});
Serial.print("BT name (Android Classic + iOS BLE): ");
Serial.println(${btName});` :
            `SerialBT.begin(9600);
Serial.println("HC-05: iOS needs HM-10 BLE module; phone shows AT+NAME");`;

        const servoAttach = esp32 ?
`servo_14.attach(23); // URP
servo_12.attach(4);  // URA
servo_13.attach(13); // LRA
servo_15.attach(26); // LRP
servo_16.attach(25); // ULP
servo_5.attach(5);   // ULA
servo_4.attach(14);  // LLA
servo_2.attach(27);  // LLP` :
`servo_14.attach(A2); // URP
servo_12.attach(2);  // URA
servo_13.attach(5);  // LRA
servo_15.attach(3);  // LRP
servo_16.attach(9);  // ULP
servo_5.attach(6);   // ULA
servo_4.attach(4);   // LLA
servo_2.attach(7);   // LLP`;

        delete Blockly.Arduino.setups_['rc_spider_bt_start'];
        delete Blockly.Arduino.setups_['rc_spider_servo_setup'];

        Blockly.Arduino.setups_['0_rc_spider_setup'] =
`Serial.begin(9600);
delay(500);
${btBegin}
${servoAttach}
delay(1000);
standby();
Serial.println("ready");
Serial.println("ESP32 Spider Robot Ready");
`;

        Blockly.Arduino.loops_['0_rc_spider_bt_loop'] = esp32 ?
`if (spiderBleCmdReady) {
  spiderBleCmdReady = false;
  spiderCmd = (char)spiderBleCmd;
  Serial.print("Received Command: ");
  Serial.println(spiderCmd);
  handleSpiderCommand(spiderCmd);
}
if (SerialBT.available()) {
  char c = (char)SerialBT.read();
  if (c == '\\r' || c == '\\n') {
    // skip
  } else {
    spiderCmd = c;
    Serial.print("Received Command: ");
    Serial.println(c);
    handleSpiderCommand(spiderCmd);
  }
}
` :
`if (SerialBT.available()) {
  char c = (char)SerialBT.read();
  if (c == '\\r' || c == '\\n') {
    // skip
  } else {
    spiderCmd = c;
    Serial.print("Received Command: ");
    Serial.println(c);
    handleSpiderCommand(spiderCmd);
  }
}
`;
    }

    function rebuildSpiderHandler (Blockly) {
        const cases = Blockly.Arduino.spiderCmdCases || {};
        const keys = Object.keys(cases);
        let caseCode = '';
        if (keys.length) {
            keys.sort().forEach(cmd => {
                caseCode += `    case '${cmd}': ${cases[cmd]} break;\n`;
            });
        } else {
            // Default map from working sketch
            caseCode =
`    case 'u': forward(); break;
    case 'd': back(); break;
    case 'l': turnleft(); break;
    case 'r': turnright(); break;
    case 'f': hello(); break;
    case 'b': dance1(); break;
    case 'c': dance2(); break;
    case 'a': dance3(); break;
`;
        }
        Blockly.Arduino.definitions_['rc_spider_handler'] =
`void handleSpiderCommand(char cmd) {
  switch (cmd) {
${caseCode}    default: break;
  }
}
`;
    }

    const spiderActionCode = {
        forward: 'forward();',
        backward: 'back();',
        left: 'turnleft();',
        right: 'turnright();',
        hello: 'hello();',
        dance1: 'dance1();',
        dance2: 'dance2();',
        dance3: 'dance3();',
        home: 'standby();'
    };

    // =========================
    // Humanoid HC-05 path (unchanged)
    // =========================
    Blockly.Arduino.rc_bt_init = function (block) {
        const rxPin = block.getFieldValue('RX') || 'A3';
        const txPin = block.getFieldValue('TX') || '13';
        const baud = block.getFieldValue('BAUD') || '9600';
        const stateField = String(block.getFieldValue('STATE') || 'none').trim();
        const statePin = (!stateField || stateField === 'none') ? '-1' : stateField;
        const rawName = String(block.getFieldValue('NAME') || 'App').replace(/[^\x20-\x7E]/g, '').substring(0, 20);
        const nameC = rawName.replace(/\\/g, '\\\\').replace(/"/g, '\\"') || 'App';

        ensureBtCore(rxPin, txPin);

        Blockly.Arduino.setups_['rc_bt_setup'] =
`rcBtSerial.begin(${baud});
Serial.begin(9600);
strncpy(rcBtName, "${nameC}", sizeof(rcBtName) - 1);
rcBtName[sizeof(rcBtName) - 1] = 0;
rcBtToken[0] = 0;
rcBtStatePin = ${statePin};
if (rcBtStatePin >= 0) {
  pinMode(rcBtStatePin, INPUT);
}
Serial.println(F("Pick and Place Ready"));
Serial.print(F("Device name: "));
Serial.println(rcBtName);
`;

        Blockly.Arduino.loops_['rc_bt_poll_event'] = 'rcBtPollEvent();';

        return '';
    };

    Blockly.Arduino.rc_bt_when_received = function (block) {
        ensureBtCore();
        let branch = Blockly.Arduino.statementToCode(block, 'DO');
        branch = Blockly.Arduino.addLoopTrap(branch, block.id);

        Blockly.Arduino.definitions_['rc_bt_on_recv'] =
`void rcBtOnDataReceived() {
${branch}}
`;

        Blockly.Arduino.loops_['rc_bt_poll_event'] = 'rcBtPollEvent();';

        return '';
    };

    Blockly.Arduino.rc_bt_available = function () {
        ensureBtCore();
        return ['rcBtSerial.available()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.rc_bt_read_cmd = function () {
        ensureBtCore();
        return ['String(rcBtToken)', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.rc_bt_command = function () {
        ensureBtCore();
        return ['String(rcBtToken)', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.rc_bt_command_is = function (block) {
        ensureBtCore();
        const cmd = String(block.getFieldValue('CMD') || 'u').replace(/[^a-z]/g, '');
        return [`(strcmp(rcBtToken, "${cmd}") == 0)`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.rc_bt_set_priority_ms = function (block) {
        ensureBtCore();
        const ms = Blockly.Arduino.valueToCode(block, 'MS', Blockly.Arduino.ORDER_ATOMIC) || '300';
        return `rcBtPriorityMs = (unsigned long)(${ms});\n`;
    };

    Blockly.Arduino.rc_bt_priority_active = function () {
        ensureBtCore();
        return ['rcBtPriorityActive()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.rc_bt_run_every = function (block) {
        ensureBtCore();
        const ms = Blockly.Arduino.valueToCode(block, 'MS', Blockly.Arduino.ORDER_ATOMIC) || '20';
        let branch = Blockly.Arduino.statementToCode(block, 'DO');
        branch = Blockly.Arduino.addLoopTrap(branch, block.id);
        const uid = String(block.id || '0').replace(/[^a-zA-Z0-9]/g, '_');

        Blockly.Arduino.definitions_[`rc_bt_run_every_${uid}`] =
`unsigned long rcRunEveryLast_${uid} = 0;
`;

        Blockly.Arduino.loops_[`rc_bt_run_every_${uid}`] =
`if (millis() - rcRunEveryLast_${uid} >= (unsigned long)(${ms})) {
  rcRunEveryLast_${uid} = millis();
${branch}}
`;

        return '';
    };

    // =========================
    // ESP32 / Nano Spider Robot path
    // =========================
    Blockly.Arduino.rc_spider_board = function (block) {
        const board = block.getFieldValue('BOARD') || 'NANO';
        Blockly.Arduino.spiderBoard = board;
        Blockly.Arduino.spiderCmdCases = Blockly.Arduino.spiderCmdCases || {};
        Blockly.Arduino.spiderBtName = Blockly.Arduino.spiderBtName ||
            (board === 'ESP32' ? '"ESP32_SPIDER"' : '"SpiderRobot"');
        ensureSpiderBase(Blockly);
        rebuildSpiderHandler(Blockly);
        return '';
    };

    Blockly.Arduino.rc_spider_connect = function (block) {
        Blockly.Arduino.spiderCmdCases = {};
        const mode = (block && block.getFieldValue('BTMODE')) ||
            (getSpiderBoardFromBlocks() || (getWorkspaceDeviceId().includes('esp32') ? 'ESP32' : 'NANO'));
        // Keep board override aligned with Bluetooth mode dropdown
        Blockly.Arduino.spiderBoard = mode === 'ESP32' ? 'ESP32' : 'NANO';
        Blockly.Arduino.spiderBtName = Blockly.Arduino.spiderBoard === 'ESP32' ?
            '"ESP32_SPIDER"' : '"SpiderRobot"';
        ensureSpiderBase(Blockly);
        rebuildSpiderHandler(Blockly);
        return '';
    };

    Blockly.Arduino.rc_spider_set_name = function (block) {
        const name = Blockly.Arduino.valueToCode(
            block,
            'NAME',
            Blockly.Arduino.ORDER_ATOMIC
        ) || (isSpiderEsp32Board() ? '"ESP32_SPIDER"' : '"SpiderRobot"');
        Blockly.Arduino.spiderBtName = name;
        ensureSpiderBase(Blockly);
        return '';
    };

    Blockly.Arduino.rc_spider_map = function (block) {
        ensureSpiderBase(Blockly);
        const cmd = block.getFieldValue('CMD') || 'u';
        const action = block.getFieldValue('ACTION') || 'forward';
        if (!Blockly.Arduino.spiderCmdCases) {
            Blockly.Arduino.spiderCmdCases = {};
        }
        Blockly.Arduino.spiderCmdCases[cmd] = spiderActionCode[action] || spiderActionCode.forward;
        rebuildSpiderHandler(Blockly);
        return '';
    };

    return Blockly;
}

exports = addGenerator;
