/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function normalizeTm1637Pin (pinVal) {
    const s = String(pinVal == null ? '' : pinVal).trim();
    if (/^A\d+$/i.test(s)) {
        return s.toUpperCase();
    }
    const m = s.match(/(\d+)/);
    return m ? m[1] : s;
}

function addGenerator (Blockly) {
    Blockly.Arduino.fourDigitClockDisplay_init = function (block) {
        const dio = normalizeTm1637Pin(block.getFieldValue('DIO'));
        const clk = normalizeTm1637Pin(block.getFieldValue('CLK'));

        Blockly.Arduino.includes_.fourDigitClockDisplay_init = `#include <TM1637.h>`;
        Blockly.Arduino.definitions_.fourDigitClockDisplay_init = `TM1637 fourDigitClockDisplay(${clk}, ${dio});`;

        return `fourDigitClockDisplay.init();\nfourDigitClockDisplay.set(2);\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_setBrightness = function (block) {
        const brt = Blockly.Arduino.valueToCode(block, 'BRT', Blockly.Arduino.ORDER_ATOMIC);

        return `fourDigitClockDisplay.set(${brt});\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_brightnessNumber = function (block) {
        const num = block.getFieldValue('NUM');

        return [`${num}`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.fourDigitClockDisplay_displayNumber = function (block) {
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);

        return `fourDigitClockDisplay.displayNum(${data});\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_displayNumberEx = function (block) {
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC) || '0';
        const len = block.getFieldValue('LEN') || '4';
        const pos = block.getFieldValue('POS') || '0';
        const lz = block.getFieldValue('LZ') || 'false';

        return `fourDigitClockDisplay.showNumberDec(${data}, ${lz}, ${len}, ${pos});\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_displayNumberDots = function (block) {
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC) || '0';
        const len = block.getFieldValue('LEN') || '4';
        const pos = block.getFieldValue('POS') || '0';
        const dots = block.getFieldValue('DOTS') || '0b00000000';
        const lz = block.getFieldValue('LZ') || 'false';

        return `fourDigitClockDisplay.showNumberDecEx(${data}, ${dots}, ${lz}, ${len}, ${pos});\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_setSegments = function (block) {
        const segs = String(block.getFieldValue('SEGS') || '').trim();
        const len = block.getFieldValue('LEN') || '2';
        const pos = block.getFieldValue('POS') || '0';
        const segsCode = segs.length ? segs : '0';

        return `{\n  uint8_t _fdcdSegs[] = { ${segsCode} };\n  fourDigitClockDisplay.setSegments(_fdcdSegs, ${len}, ${pos});\n}\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_displayString = function (block) {
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);

        return `fourDigitClockDisplay.displayStr(${data});\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_display = function (block) {
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);
        const pos = block.getFieldValue('POS');

        return `fourDigitClockDisplay.display(${pos}, ${data});\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_setPoint = function (block) {
        const sta = block.getFieldValue('STA');

        return `fourDigitClockDisplay.point(${sta});\n`;
    };

    Blockly.Arduino.fourDigitClockDisplay_clear = function () {
        return `fourDigitClockDisplay.clearDisplay();\n`;
    };

    return Blockly;
}

exports = addGenerator;
