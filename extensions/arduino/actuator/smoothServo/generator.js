/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {

    function isEsp32Device () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws) {
                return false;
            }
            const id = String(
                ws.deviceId || ws.deviceType ||
                (typeof ws.getDeviceId === 'function' ? ws.getDeviceId() : '') ||
                (ws.options && (ws.options.deviceId || ws.options.deviceType)) ||
                ''
            ).toLowerCase();
            return id.indexOf('esp32') >= 0 || id.indexOf('intermediate') >= 0;
        } catch (e) {
            return false;
        }
    }

    function avrSmoothServoCore () {
        return `#ifndef SS_MAX_SERVOS
#define SS_MAX_SERVOS 8
#endif

int ssPins[SS_MAX_SERVOS];
bool ssSlotUsed[SS_MAX_SERVOS];
bool ssHwOn[SS_MAX_SERVOS];
bool ssKnowPos[SS_MAX_SERVOS];
int ssPos[SS_MAX_SERVOS];
int ssTarget[SS_MAX_SERVOS];
unsigned long ssLastMs[SS_MAX_SERVOS];
unsigned long ssIntervalMs[SS_MAX_SERVOS];
bool ssMoving[SS_MAX_SERVOS];
unsigned long ssPulseMs = 0;

void ssPauseBtRx() {
#ifdef RC_BT_SOFTSERIAL
  rcBtSerial.stopListening();
#endif
}

void ssResumeBtRx() {
#ifdef RC_BT_SOFTSERIAL
  rcBtSerial.listen();
#endif
}

int ssSlotForPin(int pin) {
  for (int i = 0; i < SS_MAX_SERVOS; i++) {
    if (ssSlotUsed[i] && ssPins[i] == pin) return i;
  }
  for (int i = 0; i < SS_MAX_SERVOS; i++) {
    if (!ssSlotUsed[i]) {
      ssSlotUsed[i] = true;
      ssHwOn[i] = false;
      ssKnowPos[i] = false;
      ssPins[i] = pin;
      ssPos[i] = 0;
      ssTarget[i] = 0;
      ssMoving[i] = false;
      ssIntervalMs[i] = 15;
      return i;
    }
  }
  return -1;
}

void ssEnsureHw(int idx, int angle) {
  if (idx < 0) return;
  angle = constrain(angle, 0, 180);
  ssPos[idx] = angle;
  if (!ssHwOn[idx]) {
    pinMode(ssPins[idx], OUTPUT);
    digitalWrite(ssPins[idx], LOW);
    ssHwOn[idx] = true;
  }
}

void ssSendPulses() {
  unsigned long now = millis();
  if (now - ssPulseMs < 20UL) return;
  ssPulseMs = now;
  ssPauseBtRx();
  for (int i = 0; i < SS_MAX_SERVOS; i++) {
    if (!ssHwOn[i] || !ssKnowPos[i]) continue;
    int us = (int)map(ssPos[i], 0, 180, 544, 2400);
    uint8_t pin = (uint8_t)ssPins[i];
    noInterrupts();
    digitalWrite(pin, HIGH);
    delayMicroseconds(us);
    digitalWrite(pin, LOW);
    interrupts();
  }
  ssResumeBtRx();
}

void ssSmoothUpdate() {
  unsigned long now = millis();
  for (int i = 0; i < SS_MAX_SERVOS; i++) {
    if (!ssMoving[i] || !ssSlotUsed[i] || !ssKnowPos[i]) continue;
    if (now - ssLastMs[i] < ssIntervalMs[i]) continue;
    ssLastMs[i] = now;
    if (ssPos[i] < ssTarget[i]) {
      ssPos[i]++;
    } else if (ssPos[i] > ssTarget[i]) {
      ssPos[i]--;
    } else {
      ssMoving[i] = false;
    }
  }
  ssSendPulses();
}

void ssWaitMoving(int idx) {
  while (idx >= 0 && ssMoving[idx]) {
    ssSmoothUpdate();
    delay(1);
  }
  ssSendPulses();
}

void ssAttachPin(int pin) {
  ssSlotForPin(pin);
}

void ssSmoothPin(int pin, int angle, unsigned long intervalMs) {
  int idx = ssSlotForPin(pin);
  if (idx < 0) return;
  angle = constrain(angle, 0, 180);
  if (intervalMs < 1) intervalMs = 1;

  if (!ssKnowPos[idx]) {
    ssTarget[idx] = angle;
    ssKnowPos[idx] = true;
    ssMoving[idx] = false;
    ssEnsureHw(idx, angle);
    ssPulseMs = 0;
    ssSendPulses();
    return;
  }

  if (ssPos[idx] == angle) {
    ssTarget[idx] = angle;
    ssMoving[idx] = false;
    ssEnsureHw(idx, angle);
    ssPulseMs = 0;
    ssSendPulses();
    return;
  }

  ssTarget[idx] = angle;
  ssIntervalMs[idx] = intervalMs;
  ssLastMs[idx] = millis();
  ssMoving[idx] = true;
  ssWaitMoving(idx);
}

void ssWritePin(int pin, int angle) {
  ssSmoothPin(pin, angle, 15);
}
`;
    }

    function esp32SmoothServoCore () {
        return `#ifndef SS_MAX_SERVOS
#define SS_MAX_SERVOS 8
#endif

Servo ssServos[SS_MAX_SERVOS];
int ssPins[SS_MAX_SERVOS];
bool ssSlotUsed[SS_MAX_SERVOS];
bool ssHwOn[SS_MAX_SERVOS];
bool ssKnowPos[SS_MAX_SERVOS];
int ssPos[SS_MAX_SERVOS];
int ssTarget[SS_MAX_SERVOS];
unsigned long ssLastMs[SS_MAX_SERVOS];
unsigned long ssIntervalMs[SS_MAX_SERVOS];
bool ssMoving[SS_MAX_SERVOS];

int ssSlotForPin(int pin) {
  for (int i = 0; i < SS_MAX_SERVOS; i++) {
    if (ssSlotUsed[i] && ssPins[i] == pin) return i;
  }
  for (int i = 0; i < SS_MAX_SERVOS; i++) {
    if (!ssSlotUsed[i]) {
      ssSlotUsed[i] = true;
      ssHwOn[i] = false;
      ssKnowPos[i] = false;
      ssPins[i] = pin;
      ssPos[i] = 0;
      ssTarget[i] = 0;
      ssMoving[i] = false;
      ssIntervalMs[i] = 15;
      return i;
    }
  }
  return -1;
}

void ssEnsureHw(int idx, int angle) {
  if (idx < 0) return;
  angle = constrain(angle, 0, 180);
  if (!ssHwOn[idx]) {
    ssServos[idx].attach(ssPins[idx]);
    ssHwOn[idx] = true;
  }
  ssServos[idx].write(angle);
}

void ssSmoothUpdate() {
  unsigned long now = millis();
  for (int i = 0; i < SS_MAX_SERVOS; i++) {
    if (!ssMoving[i] || !ssSlotUsed[i] || !ssKnowPos[i]) continue;
    if (now - ssLastMs[i] < ssIntervalMs[i]) continue;
    ssLastMs[i] = now;
    if (ssPos[i] < ssTarget[i]) {
      ssPos[i]++;
    } else if (ssPos[i] > ssTarget[i]) {
      ssPos[i]--;
    } else {
      ssMoving[i] = false;
      continue;
    }
    ssEnsureHw(i, ssPos[i]);
  }
}

void ssWaitMoving(int idx) {
  while (idx >= 0 && ssMoving[idx]) {
    ssSmoothUpdate();
    delay(1);
  }
}

void ssAttachPin(int pin) {
  ssSlotForPin(pin);
}

void ssSmoothPin(int pin, int angle, unsigned long intervalMs) {
  int idx = ssSlotForPin(pin);
  if (idx < 0) return;
  angle = constrain(angle, 0, 180);
  if (intervalMs < 1) intervalMs = 1;

  if (!ssKnowPos[idx]) {
    ssPos[idx] = angle;
    ssTarget[idx] = angle;
    ssKnowPos[idx] = true;
    ssMoving[idx] = false;
    ssEnsureHw(idx, angle);
    return;
  }

  if (ssPos[idx] == angle) {
    ssTarget[idx] = angle;
    ssMoving[idx] = false;
    ssEnsureHw(idx, angle);
    return;
  }

  ssTarget[idx] = angle;
  ssIntervalMs[idx] = intervalMs;
  ssLastMs[idx] = millis();
  ssMoving[idx] = true;
  ssWaitMoving(idx);
}

void ssWritePin(int pin, int angle) {
  ssSmoothPin(pin, angle, 15);
}
`;
    }

    function ensureSmoothServoCore () {
        if (isEsp32Device()) {
            Blockly.Arduino.includes_['smooth_servo'] = '#include <ESP32Servo.h>';
            Blockly.Arduino.definitions_['smooth_servo_core'] = esp32SmoothServoCore();
        } else {
            // Nano: do not use Servo.h (Timer1). SoftwareSerial interrupts jitter those pulses.
            delete Blockly.Arduino.includes_['smooth_servo'];
            Blockly.Arduino.definitions_['smooth_servo_core'] = avrSmoothServoCore();
        }

        if (!Blockly.Arduino.setups_['smooth_servo_init']) {
            Blockly.Arduino.setups_['smooth_servo_init'] =
`for (int i = 0; i < SS_MAX_SERVOS; i++) {
  ssSlotUsed[i] = false;
  ssHwOn[i] = false;
  ssKnowPos[i] = false;
  ssPins[i] = -1;
  ssPos[i] = 0;
  ssTarget[i] = 0;
  ssMoving[i] = false;
  ssIntervalMs[i] = 15;
}
`;
        }

        Blockly.Arduino.loops_['smooth_servo_update'] = 'ssSmoothUpdate();';
    }

    Blockly.Arduino.smooth_servo_attach = function (block) {
        ensureSmoothServoCore();
        const pin = block.getFieldValue('PIN') || '9';
        return `ssAttachPin(${pin});\n`;
    };

    Blockly.Arduino.smooth_servo_write = function (block) {
        ensureSmoothServoCore();
        const pin = block.getFieldValue('PIN') || '9';
        const angle = Blockly.Arduino.valueToCode(block, 'ANGLE', Blockly.Arduino.ORDER_ATOMIC) || '90';
        return `ssWritePin(${pin}, ${angle});\n`;
    };

    Blockly.Arduino.smooth_servo_move = function (block) {
        ensureSmoothServoCore();
        const pin = block.getFieldValue('PIN') || '9';
        const angle = Blockly.Arduino.valueToCode(block, 'ANGLE', Blockly.Arduino.ORDER_ATOMIC) || '90';
        const interval = Blockly.Arduino.valueToCode(block, 'INTERVAL', Blockly.Arduino.ORDER_ATOMIC) || '15';
        return `ssSmoothPin(${pin}, ${angle}, ${interval});\n`;
    };

    return Blockly;
}

exports = addGenerator;
