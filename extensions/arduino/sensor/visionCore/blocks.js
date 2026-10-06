/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    // Setup — teal
    const colorSetup = '#00897B';
    const colorSetup2 = '#00695C';

    // Line / Color follow — blue
    const colorFollow = '#1E88E5';
    const colorFollow2 = '#1565C0';

    // Object follow — orange
    const colorObject = '#FB8C00';
    const colorObject2 = '#EF6C00';

    // QR car — purple
    const colorQr = '#7E57C2';
    const colorQr2 = '#5E35B1';

    // Manual motor test — red
    const colorManual = '#E53935';
    const colorManual2 = '#C62828';

    const followModeOptions = [
        [Blockly.Msg.VISIONCORE_MODE_LINE || 'line', 'LINE'],
        [Blockly.Msg.VISIONCORE_MODE_COLOR || 'color', 'COLOR']
    ];

    const manualDirOptions = [
        [Blockly.Msg.VISIONCORE_DIR_FORWARD || 'forward', 'FORWARD'],
        [Blockly.Msg.VISIONCORE_DIR_BACKWARD || 'backward', 'BACKWARD'],
        [Blockly.Msg.VISIONCORE_DIR_LEFT || 'left', 'LEFT'],
        [Blockly.Msg.VISIONCORE_DIR_RIGHT || 'right', 'RIGHT']
    ];

    const objectNameOptions = [
        ['person', 'person'],
        ['car', 'car'],
        ['dog', 'dog'],
        ['cat', 'cat'],
        ['bottle', 'bottle'],
        ['none', 'none']
    ];

    Blockly.Blocks.visioncore_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_INIT,
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_stop = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_STOP,
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_data_available = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_DATA_AVAILABLE,
                output: 'Boolean',
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.visioncore_read_steering = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_READ_STEERING,
                output: 'Number',
                colour: colorFollow,
                secondaryColour: colorFollow2,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.visioncore_steer_follow = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_STEER_FOLLOW,
                args0: [
                    { type: 'input_value', name: 'VALUE', check: 'Number' },
                    {
                        type: 'field_dropdown',
                        name: 'MODE',
                        options: followModeOptions
                    }
                ],
                colour: colorFollow,
                secondaryColour: colorFollow2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_signal_timeout = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_SIGNAL_TIMEOUT,
                colour: colorFollow,
                secondaryColour: colorFollow2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_is_centered = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_IS_CENTERED,
                args0: [
                    { type: 'input_value', name: 'VALUE', check: 'Number' },
                    {
                        type: 'field_dropdown',
                        name: 'MODE',
                        options: followModeOptions
                    }
                ],
                output: 'Boolean',
                colour: colorFollow,
                secondaryColour: colorFollow2,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.visioncore_update_object = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_UPDATE_OBJECT,
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_object_detected = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_OBJECT_DETECTED,
                output: 'Boolean',
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.visioncore_object_name = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_OBJECT_NAME,
                output: 'String',
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.visioncore_object_is = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_OBJECT_IS,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'NAME',
                        options: objectNameOptions
                    }
                ],
                output: 'Boolean',
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.visioncore_object_distance = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_OBJECT_DISTANCE,
                output: 'Number',
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.visioncore_steer_object = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_STEER_OBJECT,
                args0: [
                    { type: 'input_value', name: 'DISTANCE', check: 'Number' }
                ],
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_drive_straight = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_DRIVE_STRAIGHT,
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_object_lost = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_OBJECT_LOST,
                colour: colorObject,
                secondaryColour: colorObject2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_read_qr = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_READ_QR,
                output: 'String',
                colour: colorQr,
                secondaryColour: colorQr2,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.visioncore_move_qr = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_MOVE_QR,
                args0: [
                    { type: 'input_value', name: 'CMD', check: 'String' }
                ],
                colour: colorQr,
                secondaryColour: colorQr2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_motor_test = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_MOTOR_TEST,
                colour: colorManual,
                secondaryColour: colorManual2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.visioncore_move_manual = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VISIONCORE_MOVE_MANUAL,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'DIR',
                        options: manualDirOptions
                    },
                    { type: 'input_value', name: 'SPEED', check: 'Number' }
                ],
                colour: colorManual,
                secondaryColour: colorManual2,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
