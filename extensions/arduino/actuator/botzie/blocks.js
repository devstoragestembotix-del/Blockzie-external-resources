/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#FF6F00';
    const secondaryColour = '#1565C0';

    const directionOptions = [
        [Blockly.Msg.BOTZIE_MOVE_FORWARD || 'forward', 'FORWARD'],
        [Blockly.Msg.BOTZIE_MOVE_BACKWARD || 'backward', 'BACKWARD'],
        [Blockly.Msg.BOTZIE_TURN_LEFT || 'left', 'LEFT'],
        [Blockly.Msg.BOTZIE_TURN_RIGHT || 'right', 'RIGHT']
    ];

    const commandOptions = [
        ['forward', 'forward'],
        ['backward', 'backward'],
        ['left', 'left'],
        ['right', 'right'],
        ['stop', 'stop'],
        ['rotateCW', 'rotateCW'],
        ['rotateCCW', 'rotateCCW'],
        ['resume', 'resume']
    ];

    Blockly.Blocks.botzie_setup = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_SETUP,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    const ESP32_KIT_IDS = ['zappie', 'arduinoesp32', 'intermediatekit'];

    function getWorkspaceDeviceId () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws) return '';
            return String(
                ws.deviceId || ws.deviceType ||
                (typeof ws.getDeviceId === 'function' ? ws.getDeviceId() : '') ||
                (ws.options && (ws.options.deviceId || ws.options.deviceType)) ||
                ''
            ).toLowerCase();
        } catch (e) {
            return '';
        }
    }

    function isEsp32Kit () {
        const id = getWorkspaceDeviceId();
        return ESP32_KIT_IDS.some((kitId) => id === kitId || id.includes(kitId));
    }

    function bluetoothModeOptions () {
        const ble = [Blockly.Msg.BOTZIE_BT_BLE || 'BLE', 'BLE'];
        const classic = [Blockly.Msg.BOTZIE_BT_CLASSIC || 'classic', 'CLASSIC'];
        if (!isEsp32Kit()) {
            return [classic];
        }
        return [ble, classic];
    }

    Blockly.Blocks.botzie_connect_bluetooth = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_CONNECT_BT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'MODE',
                        options: bluetoothModeOptions
                    },
                    {
                        type: 'input_value',
                        name: 'NAME'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    const wifiModeOptions = [
        [Blockly.Msg.BOTZIE_WIFI_STA || 'join network', 'STA'],
        [Blockly.Msg.BOTZIE_WIFI_AP || 'hotspot (AP)', 'AP']
    ];

    Blockly.Blocks.botzie_connect_wifi = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_CONNECT_WIFI,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'MODE',
                        options: wifiModeOptions
                    },
                    { type: 'input_value', name: 'SSID' },
                    { type: 'input_value', name: 'PASSWORD' }
                ],
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // Not shown in toolbox — kept for older saved projects.

    Blockly.Blocks.botzie_disconnect = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_DISCONNECT,
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // Palette blocks below are not shown in toolbox (app remote control only).
    // Kept so older saved projects still load.

    Blockly.Blocks.botzie_move_forward = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_MOVE_FORWARD,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_move_backward = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_MOVE_BACKWARD,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_turn_left = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_TURN_LEFT,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_turn_right = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_TURN_RIGHT,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_stop = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_STOP,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_rotate_cw = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_ROTATE_CW,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_rotate_ccw = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_ROTATE_CCW,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // Legacy block — kept for saved projects; not shown in toolbox palette.
    Blockly.Blocks.botzie_move_direction_speed = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_MOVE_DIR_SPEED,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'DIR',
                        options: directionOptions
                    },
                    {
                        type: 'input_value',
                        name: 'SPEED'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_set_lr_speed = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_SET_LR_SPEED,
                args0: [
                    { type: 'input_value', name: 'LEFT' },
                    { type: 'input_value', name: 'RIGHT' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_set_speed_percent = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_SET_SPEED_PCT,
                args0: [{ type: 'input_value', name: 'PCT' }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_increase_speed = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_INCREASE_SPEED,
                args0: [{ type: 'input_value', name: 'AMT' }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_decrease_speed = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_DECREASE_SPEED,
                args0: [{ type: 'input_value', name: 'AMT' }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_speed_value = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_SPEED_VALUE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.botzie_distance_cm = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_DISTANCE_CM,
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.botzie_obstacle_detected = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_OBSTACLE,
                args0: [{ type: 'input_value', name: 'CM' }],
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.botzie_line_sensor_left = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_LINE_LEFT,
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.botzie_line_sensor_right = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_LINE_RIGHT,
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.botzie_send_terminal = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_SEND_TERMINAL,
                args0: [{ type: 'input_value', name: 'TEXT' }],
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_send_graph = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_SEND_GRAPH,
                args0: [
                    { type: 'input_value', name: 'LABEL' },
                    { type: 'input_value', name: 'VALUE' }
                ],
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_action_command = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_ACTION_COMMAND || 'Botzie action %1 command %2',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'ACTION',
                        options: [
                            [Blockly.Msg.BOTZIE_MOVE_FORWARD || 'Move Forward', 'forward'],
                            [Blockly.Msg.BOTZIE_MOVE_BACKWARD || 'Move Backward', 'backward'],
                            [Blockly.Msg.BOTZIE_TURN_LEFT || 'Steer Left', 'left'],
                            [Blockly.Msg.BOTZIE_TURN_RIGHT || 'Steer Right', 'right'],
                            [Blockly.Msg.BOTZIE_ROTATE_CW || 'Rotate CW', 'rotateCW'],
                            [Blockly.Msg.BOTZIE_ROTATE_CCW || 'Rotate ACW', 'rotateCCW'],
                            [Blockly.Msg.BOTZIE_STOP || 'Stop', 'stop'],
                            [Blockly.Msg.BOTZIE_RESUME || 'Resume', 'resume']
                        ]
                    },
                    {
                        type: 'input_value',
                        name: 'CMD'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.botzie_command_is = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_COMMAND_IS,
                args0: [{
                    type: 'field_dropdown',
                    name: 'CMD',
                    options: commandOptions
                }],
                message1: '%1',
                args1: [{
                    type: 'input_statement',
                    name: 'STACK'
                }],
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['shape_hat']
            });
            this.setNextStatement(false, null);
        }
    };

    Blockly.Blocks.botzie_received_command = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_RECEIVED_COMMAND,
                colour: secondaryColour,
                secondaryColour: color,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.botzie_beep = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.BOTZIE_BEEP,
                args0: [{ type: 'input_value', name: 'SECS' }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

module.exports = addBlocks;
