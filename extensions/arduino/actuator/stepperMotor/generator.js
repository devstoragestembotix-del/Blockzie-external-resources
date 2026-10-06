/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    Blockly.Arduino.stepper_init = function (block) {
        const dirPin = block.getFieldValue('DIRPIN');
        const stepPin = block.getFieldValue('STEPPIN');
        const steps = Blockly.Arduino.valueToCode(block, 'STEPS', Blockly.Arduino.ORDER_ATOMIC) || '800';

        Blockly.Arduino.definitions_.stepper_vars = `
const int dirPin = ${dirPin};
const int stepPin = ${stepPin};
const int stepsPerRevolution = ${steps};
`;

        Blockly.Arduino.setups_.stepper_pins = `
pinMode(stepPin, OUTPUT);
pinMode(dirPin, OUTPUT);
`;

        return '';
    };

    Blockly.Arduino.stepper_rotate = function (block) {
        const dir = block.getFieldValue('DIR');
        const speed = Blockly.Arduino.valueToCode(block, 'SPEED', Blockly.Arduino.ORDER_ATOMIC) || '2000';
        const steps = Blockly.Arduino.valueToCode(block, 'STEPS', Blockly.Arduino.ORDER_ATOMIC) || '800';

        return `
digitalWrite(dirPin, ${dir});
for (int x = 0; x < ${steps}; x++) {
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(${speed});
    digitalWrite(stepPin, LOW);
    delayMicroseconds(${speed});
}
delay(1000);
`;
    };

    return Blockly;
}
exports = addGenerator;
