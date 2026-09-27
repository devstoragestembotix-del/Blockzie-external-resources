/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {
    // ================================
    // INIT
    // ================================
    Blockly.Arduino.touchsensor_init = function (block) {
        const pin = block.getFieldValue('PIN');

        Blockly.Arduino.definitions_.touchsensor_pin = `#define TOUCH_PIN ${pin}`;
        Blockly.Arduino.setups_.touchsensor_setup = `pinMode(TOUCH_PIN, INPUT);`;

        return '';
    };

    // ================================
    // READ BOOLEAN (HIGH = touched)
    // ================================
    Blockly.Arduino.touchsensor_read = function () {
        const code = `(digitalRead(TOUCH_PIN) == HIGH)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };

    // ================================
    // READ RAW
    // ================================
    Blockly.Arduino.touchsensor_readRaw = function () {
        const code = `digitalRead(TOUCH_PIN)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };

    return Blockly;
}

module.exports = addGenerator;
