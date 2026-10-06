/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {

    const OTTO_PIN_DEFS = `
#define PIN_TRIGGER         12
#define PIN_ECHO            11
#define PIN_LEG_L           2
#define PIN_LEG_R           3
#define PIN_FOOT_L          4
#define PIN_FOOT_R          7
#define PIN_BUZZER          10
#define PIN_HAND_L          6
#define PIN_HAND_R          9`;

    const OTTO_ULTRASONIC_FN = `
long ottoReadDistanceCm() {
  digitalWrite(PIN_TRIGGER, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIGGER, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIGGER, LOW);
  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) return 999;
  return (long)(duration * 0.034 / 2);
}`;

    function ensureStemBot (Blockly) {
        Blockly.Arduino.includes_.otto_includes = '#include <StemBot.h>\n';
        Blockly.Arduino.definitions_.otto_object = 'StemBot Otto;\n';
        Blockly.Arduino.definitions_.otto_pins = OTTO_PIN_DEFS;
        Blockly.Arduino.definitions_.otto_ultrasonic_fn = OTTO_ULTRASONIC_FN;
    }

    function ensureUltrasonicPins (Blockly) {
        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_ultrasonic_pins = `pinMode(PIN_TRIGGER, OUTPUT);
pinMode(PIN_ECHO, INPUT);
`;
    }

    function isDistanceVariable (block, Blockly) {
        const varId = block.getFieldValue('VAR');
        if (!varId || !Blockly.Arduino.nameDB_) {
            return false;
        }
        return Blockly.Arduino.nameDB_.getName(varId, Blockly.Names.NameType.VARIABLE) === 'distance';
    }

    function patchDistanceVariable (Blockly) {
        const getHandler = Blockly.Arduino.variables_get ||
            (Blockly.Arduino.forBlock && Blockly.Arduino.forBlock.variables_get);
        if (getHandler) {
            const wrappedGet = function (block) {
                if (isDistanceVariable(block, Blockly)) {
                    ensureUltrasonicPins(Blockly);
                    return ['ottoReadDistanceCm()', Blockly.Arduino.ORDER_ATOMIC];
                }
                return getHandler.call(this, block);
            };
            Blockly.Arduino.variables_get = wrappedGet;
            if (Blockly.Arduino.forBlock) {
                Blockly.Arduino.forBlock.variables_get = wrappedGet;
            }
        }

        const setHandler = Blockly.Arduino.variables_set ||
            (Blockly.Arduino.forBlock && Blockly.Arduino.forBlock.variables_set);
        if (setHandler) {
            const wrappedSet = function (block) {
                if (isDistanceVariable(block, Blockly)) {
                    ensureUltrasonicPins(Blockly);
                    const value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ASSIGNMENT) ||
                        'ottoReadDistanceCm()';
                    return `distance = ${value};\n`;
                }
                return setHandler.call(this, block);
            };
            Blockly.Arduino.variables_set = wrappedSet;
            if (Blockly.Arduino.forBlock) {
                Blockly.Arduino.forBlock.variables_set = wrappedSet;
            }
        }
    }

    patchDistanceVariable(Blockly);

    Blockly.Arduino.otto_init = function () {
        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_setup = `pinMode(PIN_TRIGGER, OUTPUT);
pinMode(PIN_ECHO, INPUT);
Otto.init(PIN_LEG_L, PIN_LEG_R, PIN_FOOT_L, PIN_FOOT_R, PIN_BUZZER, PIN_HAND_L, PIN_HAND_R, true);
Serial.begin(9600);
Otto.home();
`;
        return '';
    };

    Blockly.Arduino.otto_read_distance = function () {
        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_ultrasonic_pins = `pinMode(PIN_TRIGGER, OUTPUT);
pinMode(PIN_ECHO, INPUT);
`;
        return ['ottoReadDistanceCm()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.otto_home = function () {
        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_setup = `Otto.init(PIN_LEG_L, PIN_LEG_R, PIN_FOOT_L, PIN_FOOT_R, PIN_BUZZER, PIN_HAND_L, PIN_HAND_R, true);
`;
        return 'Otto.home();\n';
    };

    Blockly.Arduino.otto_walk = function (block) {
        const steps = Blockly.Arduino.valueToCode(block, 'STEPS', Blockly.Arduino.ORDER_ATOMIC) || '1';
        const time = Blockly.Arduino.valueToCode(block, 'TIME', Blockly.Arduino.ORDER_ATOMIC) || '1000';
        const direction = block.getFieldValue('DIRECTION');

        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_setup = `Otto.init(PIN_LEG_L, PIN_LEG_R, PIN_FOOT_L, PIN_FOOT_R, PIN_BUZZER, PIN_HAND_L, PIN_HAND_R, true);
`;
        return `Otto.walk(${steps}, ${time}, ${direction});\n`;
    };

    Blockly.Arduino.otto_moonwalker = function (block) {
        const count = Blockly.Arduino.valueToCode(block, 'COUNT', Blockly.Arduino.ORDER_ATOMIC) || '1';
        const speed = Blockly.Arduino.valueToCode(block, 'SPEED', Blockly.Arduino.ORDER_ATOMIC) || '1000';
        const height = Blockly.Arduino.valueToCode(block, 'HEIGHT', Blockly.Arduino.ORDER_ATOMIC) || '25';
        const direction = block.getFieldValue('DIRECTION');

        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_setup = `Otto.init(PIN_LEG_L, PIN_LEG_R, PIN_FOOT_L, PIN_FOOT_R, PIN_BUZZER, PIN_HAND_L, PIN_HAND_R, true);
`;

        return `for (int i = 0; i < ${count}; i++) {\n  Otto.moonwalker(1, ${speed}, ${height}, ${direction});\n}\n`;
    };

    Blockly.Arduino.otto_jump = function (block) {
        const steps = Blockly.Arduino.valueToCode(block, 'STEPS', Blockly.Arduino.ORDER_ATOMIC) || '1';
        const time = Blockly.Arduino.valueToCode(block, 'TIME', Blockly.Arduino.ORDER_ATOMIC) || '1000';

        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_setup = `Otto.init(PIN_LEG_L, PIN_LEG_R, PIN_FOOT_L, PIN_FOOT_R, PIN_BUZZER, PIN_HAND_L, PIN_HAND_R, true);
`;

        return `Otto.jump(${steps}, ${time});\n`;
    };

    Blockly.Arduino.otto_turn = function (block) {
        const steps = Blockly.Arduino.valueToCode(block, 'STEPS', Blockly.Arduino.ORDER_ATOMIC) || '1';
        const time = Blockly.Arduino.valueToCode(block, 'TIME', Blockly.Arduino.ORDER_ATOMIC) || '1000';
        const direction = block.getFieldValue('DIRECTION');

        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_setup = `Otto.init(PIN_LEG_L, PIN_LEG_R, PIN_FOOT_L, PIN_FOOT_R, PIN_BUZZER, PIN_HAND_L, PIN_HAND_R, true);
`;

        return `Otto.turn(${steps}, ${time}, ${direction});\n`;
    };

    Blockly.Arduino.otto_shake_leg = function (block) {
        const steps = Blockly.Arduino.valueToCode(block, 'STEPS', Blockly.Arduino.ORDER_ATOMIC) || '1';
        const time = Blockly.Arduino.valueToCode(block, 'TIME', Blockly.Arduino.ORDER_ATOMIC) || '1000';
        const direction = block.getFieldValue('DIRECTION');

        ensureStemBot(Blockly);
        Blockly.Arduino.setups_.otto_setup = `Otto.init(PIN_LEG_L, PIN_LEG_R, PIN_FOOT_L, PIN_FOOT_R, PIN_BUZZER, PIN_HAND_L, PIN_HAND_R, true);
`;

        return `Otto.shakeLeg(${steps}, ${time}, ${direction});\n`;
    };

    Blockly.Arduino.otto_move_command = function (block) {
        const command = block.getFieldValue('COMMAND');

        Blockly.Arduino.includes_.bluetooth_libs = `#include <SoftwareSerial.h>\n#include <Servo.h>`;

        Blockly.Arduino.definitions_.bluetooth_defs = `
SoftwareSerial BT(13, A3); // RX, TX
Servo servo_1;
Servo servo_2;
Servo servo_3;
Servo servo_4;

#define SERVO_1 2
#define SERVO_2 3
#define SERVO_3 4
#define SERVO_4 7
#define BUZZER 10`;

        Blockly.Arduino.setups_.bluetooth_setup = `
Serial.begin(9600);
BT.begin(9600);
servo_1.attach(SERVO_1);
servo_2.attach(SERVO_2);
servo_3.attach(SERVO_3);
servo_4.attach(SERVO_4);
pinMode(BUZZER, OUTPUT);
digitalWrite(BUZZER, LOW);`;

        return `BT.write('${command}');\n`;
    };

    return Blockly;
}

module.exports = addGenerator;
