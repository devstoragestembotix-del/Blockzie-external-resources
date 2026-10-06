/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addGenerator(Blockly) {

    // ================================
    // INIT
    // ================================
    Blockly.Arduino.reedswitch_init = function (block) {
        const pin = block.getFieldValue('PIN');

        Blockly.Arduino.definitions_.reedswitch_pin = `#define REED_PIN ${pin}`;

        Blockly.Arduino.setups_.reedswitch_setup = `pinMode(REED_PIN, INPUT_PULLUP);`;

        return '';
    };

    // ================================
    // READ BOOLEAN (magnet detected?)
    // ================================
    Blockly.Arduino.reedswitch_read = function (block) {
        // Reed Switch: LOW = magnet nearby (with INPUT_PULLUP)
        const code = `(digitalRead(REED_PIN) == LOW)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };

    // ================================
    // READ RAW VALUE
    // ================================
    Blockly.Arduino.reedswitch_readRaw = function (block) {
        // 1 = magnet detected, 0 = not (invert INPUT_PULLUP LOW)
        const code = `(digitalRead(REED_PIN) == LOW ? 1 : 0)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };

    return Blockly;
}

module.exports = addGenerator;
