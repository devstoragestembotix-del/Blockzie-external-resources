/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

function ensurePinOutput (Blockly, pin) {
    Blockly.Arduino.setups_[`vibrationmotor_pin_${pin}`] = `pinMode(${pin}, OUTPUT);`;
}

function ensureMotorHelpers (Blockly) {
    if (Blockly.Arduino.definitions_.vibrationmotor_helpers) {
        return;
    }
    // ESP32: after ledcAttach/ledcWrite, plain digitalWrite often does nothing until
    // the pin is detached from LEDC. Always detach before GPIO HIGH/LOW for ON/OFF.
    Blockly.Arduino.definitions_.vibrationmotor_helpers = `
#if defined(ARDUINO_ARCH_ESP32)
static void blockzieVmReleasePwm(int pin) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  ledcDetach(pin);
#else
  ledcDetachPin(pin);
#endif
}
static void blockzieVibrationMotorDigital(int pin, bool on) {
  blockzieVmReleasePwm(pin);
  pinMode(pin, OUTPUT);
  digitalWrite(pin, on ? HIGH : LOW);
}
static void blockzieVibrationMotorPwm(int pin, int v) {
  v = constrain(v, 0, 255);
  if (v <= 0) {
    blockzieVibrationMotorDigital(pin, false);
    return;
  }
  if (v >= 255) {
    blockzieVibrationMotorDigital(pin, true);
    return;
  }
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  ledcAttach(pin, 5000, 8);
  ledcWrite(pin, (uint32_t)v);
#else
  const int ch = pin & 0x0F;
  static uint16_t blockzieVmLedcReady = 0;
  if (!(blockzieVmLedcReady & (1u << ch))) {
    ledcSetup(ch, 5000, 8);
    blockzieVmLedcReady |= (1u << ch);
  }
  ledcAttachPin(pin, ch);
  ledcWrite(ch, (uint32_t)v);
#endif
}
#else
static void blockzieVibrationMotorDigital(int pin, bool on) {
  pinMode(pin, OUTPUT);
  digitalWrite(pin, on ? HIGH : LOW);
}
static void blockzieVibrationMotorPwm(int pin, int v) {
  pinMode(pin, OUTPUT);
  analogWrite(pin, constrain(v, 0, 255));
}
#endif
`;
}

function addGenerator (Blockly) {
    Blockly.Arduino.vibrationmotor_init = function (block) {
        const pin = block.getFieldValue('PIN');
        ensurePinOutput(Blockly, pin);
        return '';
    };

    Blockly.Arduino.vibrationmotor_on = function (block) {
        const pin = block.getFieldValue('PIN');
        ensurePinOutput(Blockly, pin);
        ensureMotorHelpers(Blockly);
        return `blockzieVibrationMotorDigital(${pin}, true);\n`;
    };

    Blockly.Arduino.vibrationmotor_off = function (block) {
        const pin = block.getFieldValue('PIN');
        ensurePinOutput(Blockly, pin);
        ensureMotorHelpers(Blockly);
        return `blockzieVibrationMotorDigital(${pin}, false);\n`;
    };

    Blockly.Arduino.vibrationmotor_setPower = function (block) {
        const pin = block.getFieldValue('PIN');
        const power = Blockly.Arduino.valueToCode(block, 'POWER', Blockly.Arduino.ORDER_ATOMIC) || '255';
        ensurePinOutput(Blockly, pin);
        ensureMotorHelpers(Blockly);
        return `blockzieVibrationMotorPwm(${pin}, (int)(${power}));\n`;
    };

    Blockly.Arduino.vibrationmotor_vibrateMs = function (block) {
        const pin = block.getFieldValue('PIN');
        const ms = Blockly.Arduino.valueToCode(block, 'MS', Blockly.Arduino.ORDER_ATOMIC) || '200';
        ensurePinOutput(Blockly, pin);
        ensureMotorHelpers(Blockly);
        return (
            `blockzieVibrationMotorDigital(${pin}, true);\n` +
            `delay((unsigned long)(${ms}));\n` +
            `blockzieVibrationMotorDigital(${pin}, false);\n`
        );
    };

    return Blockly;
}

module.exports = addGenerator;
