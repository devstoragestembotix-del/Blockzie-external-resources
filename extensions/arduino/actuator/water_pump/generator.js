/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

function ensurePinOutput (Blockly, pin) {
    Blockly.Arduino.setups_[`waterpump_pin_${pin}`] = `pinMode(${pin}, OUTPUT);`;
}

function ensurePumpHelpers (Blockly) {
    if (Blockly.Arduino.definitions_.waterpump_helpers) {
        return;
    }
    Blockly.Arduino.definitions_.waterpump_helpers = `
#if defined(ARDUINO_ARCH_ESP32)
static void blockzieWaterPumpReleasePwm(int pin) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  ledcDetach(pin);
#else
  ledcDetachPin(pin);
#endif
}
static void blockzieWaterPumpDigital(int pin, bool on) {
  blockzieWaterPumpReleasePwm(pin);
  pinMode(pin, OUTPUT);
  digitalWrite(pin, on ? HIGH : LOW);
}
static void blockzieWaterPumpPwm(int pin, int v) {
  v = constrain(v, 0, 255);
  if (v <= 0) {
    blockzieWaterPumpDigital(pin, false);
    return;
  }
  if (v >= 255) {
    blockzieWaterPumpDigital(pin, true);
    return;
  }
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  ledcAttach(pin, 5000, 8);
  ledcWrite(pin, (uint32_t)v);
#else
  const int ch = pin & 0x0F;
  static uint16_t blockzieWaterPumpLedcReady = 0;
  if (!(blockzieWaterPumpLedcReady & (1u << ch))) {
    ledcSetup(ch, 5000, 8);
    blockzieWaterPumpLedcReady |= (1u << ch);
  }
  ledcAttachPin(pin, ch);
  ledcWrite(ch, (uint32_t)v);
#endif
}
#else
static void blockzieWaterPumpDigital(int pin, bool on) {
  pinMode(pin, OUTPUT);
  digitalWrite(pin, on ? HIGH : LOW);
}
static void blockzieWaterPumpPwm(int pin, int v) {
  pinMode(pin, OUTPUT);
  analogWrite(pin, constrain(v, 0, 255));
}
#endif
`;
}

function addGenerator (Blockly) {
    const order = Blockly.Arduino.ORDER_ATOMIC || 0;

    Blockly.Arduino.waterpump_init = function (block) {
        const pin = block.getFieldValue('PIN');
        ensurePinOutput(Blockly, pin);
        return '';
    };

    Blockly.Arduino.waterpump_setState = function (block) {
        const pin = block.getFieldValue('PIN');
        const on = block.getFieldValue('STATE') === 'ON';
        ensurePinOutput(Blockly, pin);
        ensurePumpHelpers(Blockly);
        return `blockzieWaterPumpDigital(${pin}, ${on ? 'true' : 'false'});\n`;
    };

    Blockly.Arduino.waterpump_onForSecs = function (block) {
        const pin = block.getFieldValue('PIN');
        const secs = Blockly.Arduino.valueToCode(block, 'SECS', order) || '5';
        ensurePinOutput(Blockly, pin);
        ensurePumpHelpers(Blockly);
        return (
            `blockzieWaterPumpDigital(${pin}, true);\n` +
            `delay((unsigned long)((${secs}) * 1000));\n` +
            `blockzieWaterPumpDigital(${pin}, false);\n`
        );
    };

    Blockly.Arduino.waterpump_setSpeedPercent = function (block) {
        const pin = block.getFieldValue('PIN');
        const pct = Blockly.Arduino.valueToCode(block, 'PCT', order) || '100';
        ensurePinOutput(Blockly, pin);
        ensurePumpHelpers(Blockly);
        return (
            `blockzieWaterPumpPwm(${pin}, ` +
            `(int)constrain((long)(${pct}) * 255L / 100L, 0L, 255L));\n`
        );
    };

    return Blockly;
}

module.exports = addGenerator;
