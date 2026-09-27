/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    Blockly.Arduino.softwareSerial_begin = function (block) {
        const no = Blockly.Arduino.valueToCode(block, 'NO', Blockly.Arduino.ORDER_ATOMIC);
        const rx = Blockly.Arduino.valueToCode(block, 'RX', Blockly.Arduino.ORDER_ATOMIC);
        const tx = Blockly.Arduino.valueToCode(block, 'TX', Blockly.Arduino.ORDER_ATOMIC);
        const baudrate = this.getFieldValue('BAUD');

        Blockly.Arduino.includes_.softwareSerial_begin = `#include <SoftwareSerial.h>`;
        Blockly.Arduino.definitions_[`softwareSerial_begin${no}`] = `SoftwareSerial softwareSerial_${no}(${rx}, ${tx});`;
        return `softwareSerial_${no}.begin(${baudrate});\n`;
    };

    Blockly.Arduino.softwareSerial_print = function (block) {
        const no = Blockly.Arduino.valueToCode(block, 'NO', Blockly.Arduino.ORDER_ATOMIC);
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);
        const eol = this.getFieldValue('EOL');

        if (eol === '0') {

            return `softwareSerial_${no}.println(${data});\n`;
        }
        return `softwareSerial_${no}.print(${data});\n`;
    };

    Blockly.Arduino.softwareSerial_available = function (block) {
        const no = Blockly.Arduino.valueToCode(block, 'NO', Blockly.Arduino.ORDER_ATOMIC);
        return [`softwareSerial_${no}.available()`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.softwareSerial_readAByte = function (block) {
        const no = Blockly.Arduino.valueToCode(block, 'NO', Blockly.Arduino.ORDER_ATOMIC);
        return [`softwareSerial_${no}.read()`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.softwareSerial_readAnumber = function (block) {
        const no = Blockly.Arduino.valueToCode(block, 'NO', Blockly.Arduino.ORDER_ATOMIC);
        const code = `(softwareSerial_${no}.available() ? softwareSerial_${no}.readStringUntil('\\n').toInt() : -1)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };


    Blockly.Arduino.softwareSerial_readAString = function (block) { 
        const no = Blockly.Arduino.valueToCode(block, "NO", Blockly.Arduino.ORDER_ATOMIC); 
        const code = `(softwareSerial_${no}.available() ? softwareSerial_${no}.readStringUntil('\\n') : "")`; 
        return [code, Blockly.Arduino.ORDER_ATOMIC]; 
    };



    // Blockly.Arduino.softwareSerial_readAnumber = function (block) {
    //     const no = Blockly.Arduino.valueToCode(block, 'NO', Blockly.Arduino.ORDER_ATOMIC);
    //     const code = `softwareSerial_${no}.parseInt()`;
    //     return [code, Blockly.Arduino.ORDER_ATOMIC];
    // };

    // Blockly.Arduino.softwareSerial_readAByte = function (block) {
    //     const no = Blockly.Arduino.valueToCode(block, 'NO', Blockly.Arduino.ORDER_ATOMIC);
    //     return [`(softwareSerial_${no}.read() - '0')`, Blockly.Arduino.ORDER_ATOMIC];
    // };


    return Blockly;
}

exports = addGenerator;
