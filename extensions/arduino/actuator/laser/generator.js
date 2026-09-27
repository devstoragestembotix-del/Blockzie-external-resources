/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

function laserNormalizeArduinoPin (pinVal) {
    const s = String(pinVal == null ? '' : pinVal).trim();
    if (/^A\d+$/i.test(s)) {
        return s;
    }
    const m = s.match(/(\d+)/);
    return m ? m[1] : s;
}

function laserPinMacro (port) {
    return `LASER_PIN_P${port}`;
}

function laserPortIndex (port) {
    const n = String(port).replace(/[^0-9]/g, '');
    return n || '1';
}

function laserEnsurePortPinDef (Blockly, port, pinNum) {
    Blockly.Arduino.definitions_[`laser_portpin_${port}`] =
        `#define ${laserPinMacro(port)} ${pinNum}`;
}

function laserEnsurePort (Blockly, port) {
    const pinKey = `laser_portpin_${port}`;
    if (!Blockly.Arduino.definitions_[pinKey]) {
        laserEnsurePortPinDef(Blockly, port, 5);
    }
    Blockly.Arduino.setups_[`laser_pinmode_${port}`] =
        `pinMode(${laserPinMacro(port)}, OUTPUT);`;
}

function ensureLaserState (Blockly) {
    if (Blockly.Arduino.definitions_.laser_state_vars) {
        return;
    }
    Blockly.Arduino.definitions_.laser_state_vars = `
static bool laser_on_st[9] = {false};
static uint8_t laser_pwm_st[9] = {0};
static int laser_portIdx(int portNum) {
  if (portNum < 1) return 1;
  if (portNum > 8) return 8;
  return portNum;
}
`;
}

function ensureLaserHelpers (Blockly) {
    ensureLaserState(Blockly);
    if (Blockly.Arduino.definitions_.laser_helpers) {
        return;
    }
    Blockly.Arduino.definitions_.laser_helpers = `
#if defined(ARDUINO_ARCH_ESP32)
static void blockzieLaserReleasePwm(int pin) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  ledcDetach(pin);
#else
  ledcDetachPin(pin);
#endif
}
static void blockzieLaserDigitalRaw(int pin, bool on) {
  blockzieLaserReleasePwm(pin);
  pinMode(pin, OUTPUT);
  digitalWrite(pin, on ? HIGH : LOW);
}
static void blockzieLaserPwmRaw(int pin, int v) {
  v = constrain(v, 0, 255);
  if (v <= 0) {
    blockzieLaserDigitalRaw(pin, false);
    return;
  }
  if (v >= 255) {
    blockzieLaserDigitalRaw(pin, true);
    return;
  }
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  ledcAttach(pin, 5000, 8);
  ledcWrite(pin, (uint32_t)v);
#else
  const int ch = pin & 0x0F;
  static uint16_t blockzieLaserLedcReady = 0;
  if (!(blockzieLaserLedcReady & (1u << ch))) {
    ledcSetup(ch, 5000, 8);
    blockzieLaserLedcReady |= (1u << ch);
  }
  ledcAttachPin(pin, ch);
  ledcWrite(ch, (uint32_t)v);
#endif
}
#else
static void blockzieLaserDigitalRaw(int pin, bool on) {
  pinMode(pin, OUTPUT);
  digitalWrite(pin, on ? HIGH : LOW);
}
static void blockzieLaserPwmRaw(int pin, int v) {
  pinMode(pin, OUTPUT);
  analogWrite(pin, constrain(v, 0, 255));
}
#endif

static void blockzieLaserDigital(int pin, int portNum, bool on) {
  int idx = laser_portIdx(portNum);
  blockzieLaserDigitalRaw(pin, on);
  laser_on_st[idx] = on;
  laser_pwm_st[idx] = on ? 255 : 0;
}

static void blockzieLaserPwm(int pin, int portNum, int v) {
  int idx = laser_portIdx(portNum);
  v = constrain(v, 0, 255);
  blockzieLaserPwmRaw(pin, v);
  laser_pwm_st[idx] = (uint8_t)v;
  laser_on_st[idx] = (v > 0);
}

static void blockzieLaserBlinkStep(int pin, int portNum, int intervalMs) {
  intervalMs = constrain(intervalMs, 20, 60000);
  int half = intervalMs / 2;
  blockzieLaserDigital(pin, portNum, true);
  delay((unsigned long)half);
  blockzieLaserDigital(pin, portNum, false);
  delay((unsigned long)(intervalMs - half));
}

static void blockzieLaserBlinkTimes(int pin, int portNum, int times, int intervalMs) {
  times = constrain(times, 1, 1000);
  intervalMs = constrain(intervalMs, 20, 60000);
  for (int i = 0; i < times; i++) {
    blockzieLaserBlinkStep(pin, portNum, intervalMs);
  }
}

static void blockzieLaserDot(int pin, int portNum, int ms) {
  blockzieLaserDigital(pin, portNum, true);
  delay((unsigned long)ms);
  blockzieLaserDigital(pin, portNum, false);
  delay((unsigned long)ms);
}

static void blockzieLaserDash(int pin, int portNum, int ms) {
  blockzieLaserDigital(pin, portNum, true);
  delay((unsigned long)(ms * 3));
  blockzieLaserDigital(pin, portNum, false);
  delay((unsigned long)ms);
}

static void blockzieLaserSos(int pin, int portNum) {
  const int u = 120;
  blockzieLaserDot(pin, portNum, u);
  blockzieLaserDot(pin, portNum, u);
  blockzieLaserDot(pin, portNum, u);
  delay((unsigned long)u);
  blockzieLaserDash(pin, portNum, u);
  blockzieLaserDash(pin, portNum, u);
  blockzieLaserDash(pin, portNum, u);
  delay((unsigned long)u);
  blockzieLaserDot(pin, portNum, u);
  blockzieLaserDot(pin, portNum, u);
  blockzieLaserDot(pin, portNum, u);
  delay((unsigned long)(u * 3));
}

static void blockzieLaserFade(int pin, int portNum, int fromV, int toV, float secs) {
  fromV = constrain(fromV, 0, 255);
  toV = constrain(toV, 0, 255);
  if (secs < 0.05f) secs = 0.05f;
  int steps = (int)(secs * 50.0f);
  if (steps < 1) steps = 1;
  for (int i = 0; i <= steps; i++) {
    int v = fromV + (int)((long)(toV - fromV) * i / steps);
    blockzieLaserPwm(pin, portNum, v);
    delay((unsigned long)(secs * 1000.0f / steps));
  }
}
`;
}

function addGenerator (Blockly) {
    const order = Blockly.Arduino.ORDER_ATOMIC || 0;

    Blockly.Arduino.laser_init = function (block) {
        const port = block.getFieldValue('PORT');
        const pin = laserNormalizeArduinoPin(block.getFieldValue('PIN'));
        laserEnsurePortPinDef(Blockly, port, pin);
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return '';
    };

    Blockly.Arduino.laser_setState = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const on = block.getFieldValue('STATE') === 'ON';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return `blockzieLaserDigital(${laserPinMacro(port)}, ${pIdx}, ${on ? 'true' : 'false'});\n`;
    };

    Blockly.Arduino.laser_onForSecs = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const secs = Blockly.Arduino.valueToCode(block, 'SECS', order) || '1';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        const pin = laserPinMacro(port);
        return (
            `blockzieLaserDigital(${pin}, ${pIdx}, true);\n` +
            `delay((unsigned long)((${secs}) * 1000));\n` +
            `blockzieLaserDigital(${pin}, ${pIdx}, false);\n`
        );
    };

    Blockly.Arduino.laser_pulseMs = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const ms = Blockly.Arduino.valueToCode(block, 'MS', order) || '200';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        const pin = laserPinMacro(port);
        return (
            `blockzieLaserDigital(${pin}, ${pIdx}, true);\n` +
            `delay((unsigned long)(${ms}));\n` +
            `blockzieLaserDigital(${pin}, ${pIdx}, false);\n`
        );
    };

    Blockly.Arduino.laser_blinkEvery = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const ms = Blockly.Arduino.valueToCode(block, 'MS', order) || '100';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return `blockzieLaserBlinkStep(${laserPinMacro(port)}, ${pIdx}, (int)(${ms}));\n`;
    };

    Blockly.Arduino.laser_blinkTimes = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const times = Blockly.Arduino.valueToCode(block, 'TIMES', order) || '5';
        const ms = Blockly.Arduino.valueToCode(block, 'MS', order) || '200';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return (
            `blockzieLaserBlinkTimes(${laserPinMacro(port)}, ${pIdx}, ` +
            `(int)(${times}), (int)(${ms}));\n`
        );
    };

    Blockly.Arduino.laser_sos = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return `blockzieLaserSos(${laserPinMacro(port)}, ${pIdx});\n`;
    };

    Blockly.Arduino.laser_setPower = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const power = Blockly.Arduino.valueToCode(block, 'POWER', order) || '255';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return `blockzieLaserPwm(${laserPinMacro(port)}, ${pIdx}, (int)(${power}));\n`;
    };

    Blockly.Arduino.laser_setBrightnessPercent = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const pct = Blockly.Arduino.valueToCode(block, 'PCT', order) || '50';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return (
            `blockzieLaserPwm(${laserPinMacro(port)}, ${pIdx}, ` +
            `(int)constrain((long)(${pct}) * 255L / 100L, 0L, 255L));\n`
        );
    };

    Blockly.Arduino.laser_fade = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        const fromV = Blockly.Arduino.valueToCode(block, 'FROM', order) || '0';
        const toV = Blockly.Arduino.valueToCode(block, 'TO', order) || '255';
        const secs = Blockly.Arduino.valueToCode(block, 'SECS', order) || '3';
        laserEnsurePort(Blockly, port);
        ensureLaserHelpers(Blockly);
        return (
            `blockzieLaserFade(${laserPinMacro(port)}, ${pIdx}, ` +
            `(int)(${fromV}), (int)(${toV}), (float)(${secs}));\n`
        );
    };

    Blockly.Arduino.laser_isOn = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        ensureLaserHelpers(Blockly);
        const code = `laser_on_st[laser_portIdx(${pIdx})]`;
        return [code, order];
    };

    Blockly.Arduino.laser_getPwm = function (block) {
        const port = block.getFieldValue('PORT');
        const pIdx = laserPortIndex(port);
        ensureLaserHelpers(Blockly);
        const code = `(int)laser_pwm_st[laser_portIdx(${pIdx})]`;
        return [code, order];
    };

    return Blockly;
}

module.exports = addGenerator;
