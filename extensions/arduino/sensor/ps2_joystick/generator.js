/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {

    function normalizePin (pinVal) {
        const s = String(pinVal == null ? '' : pinVal).trim();
        if (/^A\d+$/i.test(s)) {
            return s.toUpperCase();
        }
        const m = s.match(/(\d+)/);
        return m ? m[1] : s;
    }

    function resolveJoystickPin (pinVal) {
        return normalizePin(pinVal);
    }

    function resolveDigitalPin (pinVal) {
        return normalizePin(pinVal);
    }

    function joyIndexFromBlock (block) {
        const joy = block.getFieldValue('JOY') || '1';
        return Math.max(0, Math.min(7, (parseInt(joy, 10) || 1) - 1));
    }

    function ensurePs2JoystickDefinitions () {
        if (!Blockly.Arduino.definitions_.ps2joystick_vars) {
            Blockly.Arduino._ps2joyPins = {};
        }
        Blockly.Arduino.includes_.ps2joystick_math = `#include <math.h>`;

        Blockly.Arduino.definitions_.ps2joystick_vars = `
#if defined(ARDUINO_ARCH_ESP32)
  #ifndef JOY_ADC_MAX
    #define JOY_ADC_MAX 4095
  #endif
#else
  #ifndef JOY_ADC_MAX
    #define JOY_ADC_MAX 1023
  #endif
#endif

#ifndef JOY_ADC_CENTER
  #define JOY_ADC_CENTER (JOY_ADC_MAX / 2)
#endif
#ifndef JOY_DEFAULT_DEADZONE
  #define JOY_DEFAULT_DEADZONE (JOY_ADC_MAX / 25)
#endif
#ifndef JOY_DEFAULT_MOVE
  #define JOY_DEFAULT_MOVE (JOY_ADC_MAX / 5)
#endif
#ifndef JOY_DEFAULT_HIGH
  #define JOY_DEFAULT_HIGH ((JOY_ADC_MAX * 2) / 3)
#endif

uint8_t joystickXPin[8]  = { 255,255,255,255,255,255,255,255 };
uint8_t joystickYPin[8]  = { 255,255,255,255,255,255,255,255 };

int joystickCenterX[8] = { JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER };
int joystickCenterY[8] = { JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER,JOY_ADC_CENTER };
int joystickDeadzone[8] = { JOY_DEFAULT_DEADZONE,JOY_DEFAULT_DEADZONE,JOY_DEFAULT_DEADZONE,JOY_DEFAULT_DEADZONE,JOY_DEFAULT_DEADZONE,JOY_DEFAULT_DEADZONE,JOY_DEFAULT_DEADZONE,JOY_DEFAULT_DEADZONE };
int joystickMoveThr[8] = { JOY_DEFAULT_MOVE,JOY_DEFAULT_MOVE,JOY_DEFAULT_MOVE,JOY_DEFAULT_MOVE,JOY_DEFAULT_MOVE,JOY_DEFAULT_MOVE,JOY_DEFAULT_MOVE,JOY_DEFAULT_MOVE };
int joystickHighThr[8] = { JOY_DEFAULT_HIGH,JOY_DEFAULT_HIGH,JOY_DEFAULT_HIGH,JOY_DEFAULT_HIGH,JOY_DEFAULT_HIGH,JOY_DEFAULT_HIGH,JOY_DEFAULT_HIGH,JOY_DEFAULT_HIGH };
int joystickThrDown[8] = { 0,0,0,0,0,0,0,0 };
`;

        Blockly.Arduino.definitions_.ps2joystick_func = `
int joystickReadX(uint8_t j) {
  if (joystickXPin[j] == 255) return joystickCenterX[j];
  return analogRead(joystickXPin[j]);
}
int joystickReadY(uint8_t j) {
  if (joystickYPin[j] == 255) return joystickCenterY[j];
  return analogRead(joystickYPin[j]);
}

int joystickMap0To100(int v) {
  if (v < 0) v = 0;
  if (v > JOY_ADC_MAX) v = JOY_ADC_MAX;
  return map(v, 0, JOY_ADC_MAX, 0, 100);
}

String getJoystickDirection(uint8_t j) {
  const int dx = joystickReadX(j) - joystickCenterX[j];
  const int dy = joystickReadY(j) - joystickCenterY[j];
  const int dz = joystickDeadzone[j];
  const int thr = joystickMoveThr[j];
  const int ax = abs(dx);
  const int ay = abs(dy);

  if (ax <= dz && ay <= dz) return "CENTER";

  const int thrUp = (thr * 3) / 5;
  const int thrDn = joystickThrDown[j] > 0 ? joystickThrDown[j] : (thr / 4);

#if defined(ARDUINO_ARCH_ESP32)
  // ESP32 ADC (GPIO36/39) often centers high (~3000/4095), so DOWN has
  // little headroom and X couples when stick is pushed down.
  const int yRaw = joystickReadY(j);
  const int softAx = (ax * 3) / 5; // ~60% of X
  // Y near top rail (e.g. 4095) → treat as DOWN unless X clearly dominates
  if (dy > 0 && yRaw >= (int)((JOY_ADC_MAX * 92L) / 100) && ay >= thrDn) {
    if ((ay * 2) >= ax || ax < thr) return "DOWN";
  }
  if (dy > 0 && ay >= thrDn && ay >= softAx) return "DOWN";
  if (dy < 0 && ay >= thrUp && ay >= softAx) return "UP";
  if (ax >= thrUp && ax > ay) return (dx > 0) ? "RIGHT" : "LEFT";
  if (ay >= thrUp && dy < 0) return "UP";
  if (ay >= thrDn && dy > 0) return "DOWN";
#else
  if (ay >= ax) {
    if (dy < 0 && ay >= thrUp) return "UP";
    if (dy > 0 && ay >= thrDn) return "DOWN";
  }
  const int thrAxis = thrUp;
  if (ax > ay && ax >= thrAxis) {
    return (dx > 0) ? "RIGHT" : "LEFT";
  }
#endif

  const float mag = sqrtf((float)(dx * dx + dy * dy));
  const float thrHigh = (float)joystickHighThr[j];
  if (mag >= thrHigh && thrHigh > (float)thr) {
    const float angleStrong = atan2f((float)dy, (float)dx);
    if (angleStrong >= -0.785398f && angleStrong < 0.785398f) return "RIGHT";
    if (angleStrong >= 0.785398f && angleStrong < 2.35619f) return "DOWN";
    if (angleStrong >= -2.35619f && angleStrong < -0.785398f) return "UP";
    return "LEFT";
  }
  if (mag < (float)thr) return "CENTER";

  const float angle = atan2f((float)dy, (float)dx);
  if (angle >= -0.785398f && angle < 0.785398f) return "RIGHT";
  if (angle >= 0.785398f && angle < 2.35619f) return "DOWN";
  if (angle >= -2.35619f && angle < -0.785398f) return "UP";
  return "LEFT";
}

float getJoystickAngleDeg(uint8_t j) {
  const int dx = joystickReadX(j) - joystickCenterX[j];
  const int dy = joystickReadY(j) - joystickCenterY[j];
  const int dz = joystickDeadzone[j];
  if (abs(dx) <= dz && abs(dy) <= dz) return -1.0f;
  float a = atan2f((float)dy, (float)dx) * 180.0f / 3.14159265f;
  if (a < 0) a += 360.0f;
  return a;
}

float getJoystickMagnitude(uint8_t j) {
  const float dx = (float)(joystickReadX(j) - joystickCenterX[j]);
  const float dy = (float)(joystickReadY(j) - joystickCenterY[j]);
  return sqrtf(dx * dx + dy * dy);
}
`;
    }

    function buildJoystickSetupTail (j) {
        return `
#if defined(ARDUINO_ARCH_ESP32)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
  if (joystickXPin[${j}] != 255) analogSetPinAttenuation(joystickXPin[${j}], ADC_11db);
  if (joystickYPin[${j}] != 255) analogSetPinAttenuation(joystickYPin[${j}], ADC_11db);
#else
  if (joystickXPin[${j}] != 255) pinMode(joystickXPin[${j}], INPUT);
  if (joystickYPin[${j}] != 255) pinMode(joystickYPin[${j}], INPUT);
#endif
delay(30);
{
  long sx = 0, sy = 0;
  for (uint8_t _ji = 0; _ji < 8; _ji++) {
    delay(5);
    sx += joystickReadX(${j});
    sy += joystickReadY(${j});
  }
  joystickCenterX[${j}] = (int)(sx / 8);
  joystickCenterY[${j}] = (int)(sy / 8);
}
joystickThrDown[${j}] = joystickMoveThr[${j}] / 4;
#if defined(ARDUINO_ARCH_ESP32)
  if (joystickCenterY[${j}] > (JOY_ADC_MAX * 3) / 5) {
    joystickThrDown[${j}] = joystickMoveThr[${j}] / 8;
  } else if (joystickCenterY[${j}] < (JOY_ADC_MAX * 2) / 5) {
    joystickThrDown[${j}] = joystickMoveThr[${j}] / 6;
  }
  if (joystickDeadzone[${j}] < (JOY_ADC_MAX / 50)) {
    joystickDeadzone[${j}] = JOY_DEFAULT_DEADZONE;
  }
  if (joystickMoveThr[${j}] < (JOY_ADC_MAX / 8)) {
    joystickMoveThr[${j}] = JOY_DEFAULT_MOVE;
    joystickHighThr[${j}] = JOY_DEFAULT_HIGH;
  }
#endif
`;
    }

    function joystickPinState (j) {
        if (!Blockly.Arduino._ps2joyPins) {
            Blockly.Arduino._ps2joyPins = {};
        }
        if (!Blockly.Arduino._ps2joyPins[j]) {
            Blockly.Arduino._ps2joyPins[j] = { x: null, y: null, dz: null, low: null, high: null };
        }
        return Blockly.Arduino._ps2joyPins[j];
    }

    function rebuildJoystickSetup (j) {
        const joy = String(j + 1);
        const setupKey = `ps2joystick_setup_${joy}`;
        const st = joystickPinState(j);
        let pinAssign = '';
        if (st.x) {
            pinAssign += `joystickXPin[${j}] = (uint8_t)(${st.x});\n`;
        }
        if (st.y) {
            pinAssign += `joystickYPin[${j}] = (uint8_t)(${st.y});\n`;
        }
        if (!st.x && !st.y) {
            pinAssign = `
#if defined(ARDUINO_ARCH_ESP32)
  joystickXPin[${j}] = 36;
  joystickYPin[${j}] = 39;
#else
  joystickXPin[${j}] = A0;
  joystickYPin[${j}] = A1;
#endif
`;
        }
        let tune = '';
        if (st.dz) {
            tune += `joystickDeadzone[${j}] = (int)(${st.dz});\n`;
        }
        if (st.low) {
            tune += `joystickMoveThr[${j}] = (int)(${st.low});\njoystickThrDown[${j}] = (int)(${st.low}) / 4;\n`;
        }
        if (st.high) {
            tune += `joystickHighThr[${j}] = (int)(${st.high});\n`;
        }
        Blockly.Arduino.setups_[setupKey] = pinAssign + buildJoystickSetupTail(j) + tune;
    }

    function ensurePs2JoystickSetup (j, xPinExpr, yPinExpr, dzExpr, lowExpr, highExpr) {
        const st = joystickPinState(j);
        if (xPinExpr) {
            st.x = xPinExpr;
        }
        if (yPinExpr) {
            st.y = yPinExpr;
        }
        if (dzExpr) {
            st.dz = dzExpr;
        }
        if (lowExpr) {
            st.low = lowExpr;
        }
        if (highExpr) {
            st.high = highExpr;
        }
        rebuildJoystickSetup(j);
    }

    function preparePs2JoystickBlock (block, requireInitPins) {
        ensurePs2JoystickDefinitions();
        const j = joyIndexFromBlock(block);
        if (requireInitPins) {
            return j;
        }
        ensurePs2JoystickSetup(j);
        return j;
    }

    Blockly.Arduino.ps2joystick_init = function (block) {
        const j = preparePs2JoystickBlock(block, true);
        const axis = block.getFieldValue('AXIS');
        const pinField = block.getField('PIN');
        if (pinField) {
            const pinExpr = resolveJoystickPin(block.getFieldValue('PIN'));
            if (axis === 'Y') {
                ensurePs2JoystickSetup(j, null, pinExpr);
            } else {
                ensurePs2JoystickSetup(j, pinExpr, null);
            }
            return '';
        }
        const xPinExpr = resolveJoystickPin(block.getFieldValue('X_PIN'));
        const yPinExpr = resolveJoystickPin(block.getFieldValue('Y_PIN'));
        const dz = Blockly.Arduino.valueToCode(block, 'DZ', Blockly.Arduino.ORDER_ATOMIC) || 'JOY_DEFAULT_DEADZONE';
        const low = Blockly.Arduino.valueToCode(block, 'LOW', Blockly.Arduino.ORDER_ATOMIC) || 'JOY_DEFAULT_MOVE';
        const high = Blockly.Arduino.valueToCode(block, 'HIGH', Blockly.Arduino.ORDER_ATOMIC) || 'JOY_DEFAULT_HIGH';
        ensurePs2JoystickSetup(j, xPinExpr, yPinExpr, dz, low, high);
        return '';
    };

    Blockly.Arduino.ps2joystick_initX = function (block) {
        const j = preparePs2JoystickBlock(block, true);
        const xPinExpr = resolveJoystickPin(block.getFieldValue('X_PIN'));
        ensurePs2JoystickSetup(j, xPinExpr, null);
        return '';
    };

    Blockly.Arduino.ps2joystick_initY = function (block) {
        const j = preparePs2JoystickBlock(block, true);
        const yPinExpr = resolveJoystickPin(block.getFieldValue('Y_PIN'));
        ensurePs2JoystickSetup(j, null, yPinExpr);
        return '';
    };

    Blockly.Arduino.ps2joystick_axisValue = function (block) {
        const j = preparePs2JoystickBlock(block);
        const axis = block.getFieldValue('AXIS');
        const mode = block.getFieldValue('MODE');
        const readFn = axis === 'Y' ? `joystickReadY(${j})` : `joystickReadX(${j})`;
        if (mode === 'map') {
            return [`joystickMap0To100(${readFn})`, Blockly.Arduino.ORDER_ATOMIC];
        }
        return [readFn, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.ps2joystick_direction = function (block) {
        const j = preparePs2JoystickBlock(block);
        return [`getJoystickDirection(${j})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.ps2joystick_directionIs = function (block) {
        const j = preparePs2JoystickBlock(block);
        const dir = block.getFieldValue('DIR') || 'CENTER';
        return [`(getJoystickDirection(${j}) == "${dir}")`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.ps2joystick_setDeadzone = function (block) {
        const j = preparePs2JoystickBlock(block);
        const dz = Blockly.Arduino.valueToCode(block, 'DZ', Blockly.Arduino.ORDER_ATOMIC) || 'JOY_DEFAULT_DEADZONE';
        return `joystickDeadzone[${j}] = (int)(${dz});\n`;
    };

    Blockly.Arduino.ps2joystick_setThresholds = function (block) {
        const j = preparePs2JoystickBlock(block);
        const low = Blockly.Arduino.valueToCode(block, 'LOW', Blockly.Arduino.ORDER_ATOMIC) || 'JOY_DEFAULT_MOVE';
        const high = Blockly.Arduino.valueToCode(block, 'HIGH', Blockly.Arduino.ORDER_ATOMIC) || 'JOY_DEFAULT_HIGH';
        return `joystickMoveThr[${j}] = (int)(${low});\njoystickHighThr[${j}] = (int)(${high});\njoystickThrDown[${j}] = (int)(${low}) / 4;\n`;
    };

    Blockly.Arduino.ps2joystick_angle = function (block) {
        const j = preparePs2JoystickBlock(block);
        return [`getJoystickAngleDeg(${j})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.ps2joystick_magnitude = function (block) {
        const j = preparePs2JoystickBlock(block);
        return [`getJoystickMagnitude(${j})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    function ensureContinuousJoystickServo () {
        ensurePs2JoystickDefinitions();

        const isEsp32 = (function () {
            try {
                const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
                if (!ws) return false;
                const id = String(
                    ws.deviceId || ws.deviceType ||
                    (ws.options && (ws.options.deviceId || ws.options.deviceType)) || ''
                ).toLowerCase();
                return id.indexOf('esp32') >= 0 || id.indexOf('intermediate') >= 0;
            } catch (e) {
                return false;
            }
        }());

        if (isEsp32) {
            Blockly.Arduino.includes_.ps2joy_servo = '#include <ESP32Servo.h>';
        } else {
            Blockly.Arduino.includes_.ps2joy_servo = '#include <Servo.h>';
        }

        Blockly.Arduino.definitions_.ps2joystick_continuous = `
#ifndef JOY_CONT_MAX
#define JOY_CONT_MAX 8
#endif

Servo joyContServos[JOY_CONT_MAX];
bool joyContAttached[JOY_CONT_MAX];
int joyContPins[JOY_CONT_MAX];
int joyContPos[JOY_CONT_MAX];

int joyContSlotForPin(int servoPin) {
  for (int i = 0; i < JOY_CONT_MAX; i++) {
    if (joyContAttached[i] && joyContPins[i] == servoPin) return i;
  }
  for (int i = 0; i < JOY_CONT_MAX; i++) {
    if (!joyContAttached[i]) {
      joyContServos[i].attach(servoPin);
      joyContAttached[i] = true;
      joyContPins[i] = servoPin;
      joyContPos[i] = 90;
      joyContServos[i].write(90);
      return i;
    }
  }
  return -1;
}

// Continuous/smooth joystick→servo: hold off-center = step toward mapped angle; center = stop.
void joyContinuousServoControl(int servoPin, int analogPin, int minAngle, int maxAngle, int deadzone, int speed) {
  int slot = joyContSlotForPin(servoPin);
  if (slot < 0) return;
  minAngle = constrain(minAngle, 0, 180);
  maxAngle = constrain(maxAngle, 0, 180);
  if (minAngle > maxAngle) {
    int t = minAngle; minAngle = maxAngle; maxAngle = t;
  }
  if (speed < 1) speed = 1;

  int raw = analogRead(analogPin);
  int center = JOY_ADC_CENTER;
  int delta = raw - center;
  if (abs(delta) <= deadzone) {
    return; // center → stop (hold current angle)
  }

  int target = map(raw, 0, JOY_ADC_MAX, minAngle, maxAngle);
  target = constrain(target, minAngle, maxAngle);

  if (joyContPos[slot] < target) {
    joyContPos[slot] += speed;
    if (joyContPos[slot] > target) joyContPos[slot] = target;
  } else if (joyContPos[slot] > target) {
    joyContPos[slot] -= speed;
    if (joyContPos[slot] < target) joyContPos[slot] = target;
  } else {
    return;
  }
  joyContServos[slot].write(joyContPos[slot]);
}

// Hold-to-move (Pick & Place style): past low/high threshold steps; center = stop.
void joyHoldToMoveServo(int servoPin, int analogPin, int lowThr, int highThr,
                        int minAngle, int maxAngle, int step, int invert) {
  int slot = joyContSlotForPin(servoPin);
  if (slot < 0) return;
  minAngle = constrain(minAngle, 0, 180);
  maxAngle = constrain(maxAngle, 0, 180);
  if (minAngle > maxAngle) {
    int t = minAngle; minAngle = maxAngle; maxAngle = t;
  }
  if (step < 1) step = 1;
  if (lowThr > highThr) {
    int t = lowThr; lowThr = highThr; highThr = t;
  }

  int raw = analogRead(analogPin);
  int dir = 0;
  if (raw < lowThr) dir = 1;
  else if (raw > highThr) dir = -1;
  else return;

  if (invert) dir = -dir;
  joyContPos[slot] += dir * step;
  joyContPos[slot] = constrain(joyContPos[slot], minAngle, maxAngle);
  joyContServos[slot].write(joyContPos[slot]);
}
`;
        if (!Blockly.Arduino.setups_.ps2joystick_continuous_init) {
            Blockly.Arduino.setups_.ps2joystick_continuous_init = `
for (int _jc = 0; _jc < JOY_CONT_MAX; _jc++) {
  joyContAttached[_jc] = false;
  joyContPins[_jc] = -1;
  joyContPos[_jc] = 90;
}
`;
        }
    }

    Blockly.Arduino.ps2joystick_continuousServo = function (block) {
        ensureContinuousJoystickServo();
        const servoPin = resolveDigitalPin(block.getFieldValue('SERVO_PIN') || '9');
        const analogPin = resolveJoystickPin(block.getFieldValue('ANALOG_PIN') || 'A0');
        const minA = Blockly.Arduino.valueToCode(block, 'MIN', Blockly.Arduino.ORDER_ATOMIC) || '0';
        const maxA = Blockly.Arduino.valueToCode(block, 'MAX', Blockly.Arduino.ORDER_ATOMIC) || '180';
        const dz = Blockly.Arduino.valueToCode(block, 'DEADZONE', Blockly.Arduino.ORDER_ATOMIC) || '40';
        const speed = Blockly.Arduino.valueToCode(block, 'SPEED', Blockly.Arduino.ORDER_ATOMIC) || '2';
        return `joyContinuousServoControl(${servoPin}, ${analogPin}, ${minA}, ${maxA}, ${dz}, ${speed});\n`;
    };

    Blockly.Arduino.ps2joystick_holdToMove = function (block) {
        ensureContinuousJoystickServo();
        const servoPin = resolveDigitalPin(block.getFieldValue('SERVO_PIN') || '2');
        const analogPin = resolveJoystickPin(block.getFieldValue('ANALOG_PIN') || 'A4');
        const low = Blockly.Arduino.valueToCode(block, 'LOW', Blockly.Arduino.ORDER_ATOMIC) || '300';
        const high = Blockly.Arduino.valueToCode(block, 'HIGH', Blockly.Arduino.ORDER_ATOMIC) || '700';
        const minA = Blockly.Arduino.valueToCode(block, 'MIN', Blockly.Arduino.ORDER_ATOMIC) || '0';
        const maxA = Blockly.Arduino.valueToCode(block, 'MAX', Blockly.Arduino.ORDER_ATOMIC) || '180';
        const step = Blockly.Arduino.valueToCode(block, 'STEP', Blockly.Arduino.ORDER_ATOMIC) || '2';
        const invert = block.getFieldValue('INVERT') === '1' ? '1' : '0';
        return `joyHoldToMoveServo(${servoPin}, ${analogPin}, ${low}, ${high}, ${minA}, ${maxA}, ${step}, ${invert});\n`;
    };

    return Blockly;
}

exports = addGenerator;
