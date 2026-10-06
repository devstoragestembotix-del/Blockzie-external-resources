/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {
    const order = Blockly.Arduino.ORDER_ATOMIC || 0;
    const orderConditional = Blockly.Arduino.ORDER_CONDITIONAL || 0;

    function ensureVisionCore (Blockly) {
        if (Blockly.Arduino.definitions_.visioncore_core) {
            return;
        }

        Blockly.Arduino.definitions_.visioncore_pins = `
#define VC_MOTOR_L_FWD 23
#define VC_MOTOR_L_BWD 15
#define VC_MOTOR_R_FWD 27
#define VC_MOTOR_R_BWD 19
#define VC_UART_RX 16
#define VC_UART_TX 17
#define VC_CH_L1 0
#define VC_CH_L2 1
#define VC_CH_R1 2
#define VC_CH_R2 3
#define VC_PWM_FREQ 1000
#define VC_PWM_RES 8
#define VC_BASE_SPEED 120
#define VC_MAX_SPEED 220
#define VC_KP 0.5f
#define VC_SIGNAL_TIMEOUT_MS 300
#define VC_OBJECT_LOST_MS 500
#define VC_FRAME_WIDTH 320
#define VC_MAX_CORRECTION 90
#define VC_DEAD_ZONE 0.10f
#define VC_QR_SPEED_FWD 150
#define VC_QR_RUN_MS 2000
#define VC_QR_TURN_MS 900
#define VC_QR_TURN_OUTER 200
#define VC_QR_TURN_INNER 0
`;

        Blockly.Arduino.definitions_.visioncore_vars = `
int vcSteeringValue = 0;
unsigned long vcLastReceived = 0;
String vcObjName = "none";
int vcObjCx = 160;
int vcObjWidth = 320;
unsigned long vcLastObjTime = 0;
String vcQrCmd = "";
String vcLastQrCmd = "";
String vcRxLine = "";
`;

        Blockly.Arduino.includes_.visioncore_math = '#include <math.h>';
        Blockly.Arduino.definitions_.visioncore_core = `
void vcSetMotors(int lFwd, int lBwd, int rFwd, int rBwd) {
  ledcWrite(VC_CH_L1, constrain(lFwd, 0, 255));
  ledcWrite(VC_CH_L2, constrain(lBwd, 0, 255));
  ledcWrite(VC_CH_R1, constrain(rFwd, 0, 255));
  ledcWrite(VC_CH_R2, constrain(rBwd, 0, 255));
}

void vcStopMotors() {
  vcSetMotors(0, 0, 0, 0);
}

void vcDriveStraight() {
  vcSetMotors(VC_BASE_SPEED, 0, VC_BASE_SPEED, 0);
}

void vcSteerFollow(int value, int deadband) {
  int err = value;
  if (abs(err) < deadband) err = 0;
  int correction = (int)(VC_KP * err);
  int leftSpeed = constrain(VC_BASE_SPEED + correction, 0, VC_MAX_SPEED);
  int rightSpeed = constrain(VC_BASE_SPEED - correction, 0, VC_MAX_SPEED);
  vcSetMotors(leftSpeed, 0, rightSpeed, 0);
  Serial.printf("[STEER] val=%d  L=%d  R=%d\\n", value, leftSpeed, rightSpeed);
}

void vcAppendSerialChar(char c) {
  if (c == '\\n' || c == '\\r') {
    if (vcRxLine.length() > 0) {
      Serial.print("[VC RX] ");
      Serial.println(vcRxLine);
    }
    vcRxLine.trim();
    if (vcRxLine.length() > 0) {
      if (vcRxLine.indexOf(',') >= 0) {
        int comma1 = vcRxLine.indexOf(',');
        int comma2 = vcRxLine.indexOf(',', comma1 + 1);
        if (comma1 > 0 && comma2 > comma1) {
          vcObjName = vcRxLine.substring(0, comma1);
          vcObjCx = vcRxLine.substring(comma1 + 1, comma2).toInt();
          vcObjWidth = vcRxLine.substring(comma2 + 1).toInt();
          if (vcObjWidth <= 0) vcObjWidth = VC_FRAME_WIDTH;
          if (vcObjName != "none") {
            vcLastObjTime = millis();
          }
          Serial.printf("[OBJECT] %s  cx=%d  w=%d\\n",
            vcObjName.c_str(), vcObjCx, vcObjWidth);
        }
      } else {
        String lower = vcRxLine;
        lower.toLowerCase();
        if (lower == "forward" || lower == "backward" || lower == "left" ||
            lower == "right" || lower == "stop") {
          vcQrCmd = lower;
          Serial.print("[QR] ");
          Serial.println(vcQrCmd);
        } else {
          vcSteeringValue = vcRxLine.toInt();
          vcLastReceived = millis();
          Serial.printf("[LINE/COLOR] position=%d\\n", vcSteeringValue);
        }
      }
    }
    vcRxLine = "";
  } else if ((unsigned char)c >= 32) {
    vcRxLine += c;
  }
}

void vcPollVisionCoreSerial() {
  while (Serial2.available()) {
    vcAppendSerialChar((char)Serial2.read());
  }
}

void vcPollSteeringSerial() {
  vcPollVisionCoreSerial();
}

void vcSteerToward(float offset) {
  if (fabs(offset) < VC_DEAD_ZONE) {
    vcSetMotors(VC_BASE_SPEED, 0, 0, VC_BASE_SPEED);
    return;
  }
  int correction = (int)(fabs(offset) * VC_MAX_CORRECTION);
  int leftSpeed = VC_BASE_SPEED;
  int rightSpeed = VC_BASE_SPEED;
  if (offset < 0.0f) {
    rightSpeed -= correction;
  } else {
    leftSpeed -= correction;
  }
  vcSetMotors(leftSpeed, 0, rightSpeed, 0);
  Serial.printf("[OBJECT STEER] offset=%.2f  L=%d  R=%d\\n", offset, leftSpeed, rightSpeed);
}

void vcGoStraightIfObjectLost() {
  if (vcObjName == "none" && vcLastObjTime > 0 &&
      millis() - vcLastObjTime > VC_OBJECT_LOST_MS) {
    vcDriveStraight();
  }
}

void vcSignalTimeoutStop() {
  if (vcLastReceived != 0 && millis() - vcLastReceived > VC_SIGNAL_TIMEOUT_MS) {
    vcStopMotors();
    Serial.println("[VC] No camera signal — motors stopped");
    vcLastReceived = 0;
  }
}

void vcQrStop() {
  vcSetMotors(0, 0, 0, 0);
}

void vcQrDriveForward(int durationMs) {
  vcSetMotors(VC_QR_SPEED_FWD, 0, VC_QR_SPEED_FWD, 0);
  delay(durationMs);
  vcQrStop();
}

void vcQrDriveBackward(int durationMs) {
  vcSetMotors(0, VC_QR_SPEED_FWD, 0, VC_QR_SPEED_FWD);
  delay(durationMs);
  vcQrStop();
}

void vcQrCmdLeft() {
  vcSetMotors(VC_QR_TURN_INNER, 0, VC_QR_TURN_OUTER, 0);
  delay(VC_QR_TURN_MS);
  int remaining = VC_QR_RUN_MS - VC_QR_TURN_MS;
  if (remaining > 0) {
    vcSetMotors(VC_QR_SPEED_FWD, 0, VC_QR_SPEED_FWD, 0);
    delay(remaining);
  }
  vcQrStop();
  vcLastQrCmd = "stop";
}

void vcQrCmdRight() {
  vcSetMotors(VC_QR_TURN_OUTER, 0, VC_QR_TURN_INNER, 0);
  delay(VC_QR_TURN_MS);
  int remaining = VC_QR_RUN_MS - VC_QR_TURN_MS;
  if (remaining > 0) {
    vcSetMotors(VC_QR_SPEED_FWD, 0, VC_QR_SPEED_FWD, 0);
    delay(remaining);
  }
  vcQrStop();
  vcLastQrCmd = "stop";
}

void vcExecuteQrCommand(const String &cmdRaw) {
  String cmd = cmdRaw;
  cmd.trim();
  cmd.toLowerCase();
  if (cmd.length() == 0) return;
  if (cmd == vcLastQrCmd) return;
  vcLastQrCmd = cmd;
  Serial.print("[QR CMD] ");
  Serial.println(cmd);

  if (cmd == "forward") {
    vcQrDriveForward(VC_QR_RUN_MS);
    vcLastQrCmd = "stop";
  } else if (cmd == "backward") {
    vcQrDriveBackward(VC_QR_RUN_MS);
    vcLastQrCmd = "stop";
  } else if (cmd == "left") {
    vcQrCmdLeft();
  } else if (cmd == "right") {
    vcQrCmdRight();
  } else if (cmd == "stop") {
    vcQrStop();
  } else {
    vcQrStop();
    vcLastQrCmd = "stop";
  }
}
`;
    }

    function ensureVisionCoreSetup (Blockly) {
        ensureVisionCore(Blockly);
        if (Blockly.Arduino.setups_.visioncore_init) {
            return;
        }
        Blockly.Arduino.setups_.visioncore_init = `
Serial.begin(115200);
Serial2.begin(115200, SERIAL_8N1, VC_UART_RX, VC_UART_TX);
ledcSetup(VC_CH_L1, VC_PWM_FREQ, VC_PWM_RES);
ledcAttachPin(VC_MOTOR_L_FWD, VC_CH_L1);
ledcSetup(VC_CH_L2, VC_PWM_FREQ, VC_PWM_RES);
ledcAttachPin(VC_MOTOR_L_BWD, VC_CH_L2);
ledcSetup(VC_CH_R1, VC_PWM_FREQ, VC_PWM_RES);
ledcAttachPin(VC_MOTOR_R_FWD, VC_CH_R1);
ledcSetup(VC_CH_R2, VC_PWM_FREQ, VC_PWM_RES);
ledcAttachPin(VC_MOTOR_R_BWD, VC_CH_R2);
vcStopMotors();
Serial.println("Vision Core ready (UART RX=16, L9110S 23/15/27/19)");
`;
    }

    function deadbandForMode (mode) {
        return mode === 'COLOR' ? 10 : 15;
    }

    Blockly.Arduino.visioncore_init = function () {
        ensureVisionCoreSetup(Blockly);
        return '';
    };

    Blockly.Arduino.visioncore_stop = function () {
        ensureVisionCore(Blockly);
        return 'vcStopMotors();\n';
    };

    Blockly.Arduino.visioncore_data_available = function () {
        ensureVisionCore(Blockly);
        return ['(Serial2.available() > 0)', order];
    };

    Blockly.Arduino.visioncore_read_steering = function () {
        ensureVisionCore(Blockly);
        return ['(vcPollSteeringSerial(), vcSteeringValue)', order];
    };

    Blockly.Arduino.visioncore_steer_follow = function (block) {
        ensureVisionCore(Blockly);
        const value = Blockly.Arduino.valueToCode(block, 'VALUE', order) || '0';
        const deadband = deadbandForMode(block.getFieldValue('MODE') || 'LINE');
        return `vcSteerFollow(${value}, ${deadband});\n`;
    };

    Blockly.Arduino.visioncore_signal_timeout = function () {
        ensureVisionCore(Blockly);
        return 'vcSignalTimeoutStop();\n';
    };

    Blockly.Arduino.visioncore_is_centered = function (block) {
        ensureVisionCore(Blockly);
        const value = Blockly.Arduino.valueToCode(block, 'VALUE', order) || '0';
        const deadband = deadbandForMode(block.getFieldValue('MODE') || 'LINE');
        return [`(abs(${value}) < ${deadband})`, orderConditional];
    };

    Blockly.Arduino.visioncore_update_object = function () {
        ensureVisionCore(Blockly);
        return 'vcPollVisionCoreSerial();\n';
    };

    Blockly.Arduino.visioncore_object_detected = function () {
        ensureVisionCore(Blockly);
        return ['(vcObjName != "none")', orderConditional];
    };

    Blockly.Arduino.visioncore_object_name = function () {
        ensureVisionCore(Blockly);
        return ['vcObjName', order];
    };

    Blockly.Arduino.visioncore_object_is = function (block) {
        ensureVisionCore(Blockly);
        const name = block.getFieldValue('NAME') || 'person';
        return [`(vcObjName == "${name}")`, orderConditional];
    };

    Blockly.Arduino.visioncore_object_distance = function () {
        ensureVisionCore(Blockly);
        const code = '(((float)vcObjCx / (float)vcObjWidth) * 2.0f - 1.0f)';
        return [code, order];
    };

    Blockly.Arduino.visioncore_steer_object = function (block) {
        ensureVisionCore(Blockly);
        const distance = Blockly.Arduino.valueToCode(block, 'DISTANCE', order) || '0';
        return `vcSteerToward(${distance});\n`;
    };

    Blockly.Arduino.visioncore_drive_straight = function () {
        ensureVisionCore(Blockly);
        return 'vcDriveStraight();\n';
    };

    Blockly.Arduino.visioncore_object_lost = function () {
        ensureVisionCore(Blockly);
        return 'vcGoStraightIfObjectLost();\n';
    };

    Blockly.Arduino.visioncore_read_qr = function () {
        ensureVisionCore(Blockly);
        return ['(vcPollVisionCoreSerial(), vcQrCmd)', order];
    };

    Blockly.Arduino.visioncore_move_qr = function (block) {
        ensureVisionCore(Blockly);
        const cmd = Blockly.Arduino.valueToCode(block, 'CMD', order) || '""';
        return `vcExecuteQrCommand(String(${cmd}));\n`;
    };

    Blockly.Arduino.visioncore_motor_test = function () {
        ensureVisionCore(Blockly);
        ensureVisionCoreSetup(Blockly);
        return `vcSetMotors(180, 0, 180, 0);
delay(400);
vcStopMotors();
Serial.println("Vision Core motor test done");
`;
    };

    Blockly.Arduino.visioncore_move_manual = function (block) {
        ensureVisionCore(Blockly);
        const dir = block.getFieldValue('DIR') || 'FORWARD';
        const speed = Blockly.Arduino.valueToCode(block, 'SPEED', order) || '120';
        const maps = {
            FORWARD: `vcSetMotors(${speed}, 0, ${speed}, 0);`,
            BACKWARD: `vcSetMotors(0, ${speed}, 0, ${speed});`,
            LEFT: `vcSetMotors(0, 0, ${speed}, 0);`,
            RIGHT: `vcSetMotors(${speed}, 0, 0, 0);`
        };
        return `${maps[dir] || maps.FORWARD}\n`;
    };

    return Blockly;
}

exports = addGenerator;
