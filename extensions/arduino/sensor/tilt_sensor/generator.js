/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {
    // ================================
    // INIT
    // ================================
    Blockly.Arduino.tiltsensor_init = function (block) {
        const pin = block.getFieldValue('PIN');

        Blockly.Arduino.definitions_.tiltsensor_pin = `#define TILT_PIN ${pin}`;
        Blockly.Arduino.setups_.tiltsensor_setup = `pinMode(TILT_PIN, INPUT_PULLUP);`;

        return '';
    };

    // ================================
    // READ BOOLEAN (LOW = tilt, with pull-up)
    // ================================
    Blockly.Arduino.tiltsensor_read = function () {
        const code = `(digitalRead(TILT_PIN) == LOW)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };

    // ================================
    // READ RAW
    // ================================
    Blockly.Arduino.tiltsensor_readRaw = function () {
        const code = `digitalRead(TILT_PIN)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };

    return Blockly;
}

module.exports = addGenerator;
