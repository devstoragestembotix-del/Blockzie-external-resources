function addBlocks (Blockly) {
    const color = '#1565C0';
    const secondaryColour = '#0D47A1';

    Blockly.Blocks.iot_wifi_connect = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_WIFI_CONNECT,
                args0: [
                    { type: 'input_value', name: 'SSID' },
                    { type: 'input_value', name: 'PASSWORD' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.iot_server_connect = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_SERVER_CONNECT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PROTOCOL',
                        options: [
                            [Blockly.Msg.IOT_PROTO_WEBSOCKET, 'websocket'],
                            [Blockly.Msg.IOT_PROTO_TCP, 'tcp'],
                            [Blockly.Msg.IOT_PROTO_UDP, 'udp']
                        ]
                    },
                    { type: 'input_value', name: 'HOST' },
                    { type: 'input_value', name: 'PORT' },
                    { type: 'input_value', name: 'TOKEN' },
                    { type: 'input_value', name: 'KIT' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            // Auto-set correct dashboard port when protocol changes
            const protoField = this.getField('PROTOCOL');
            if (protoField) {
                protoField.setValidator((newProto) => {
                    const ports = {
                        websocket: '5010',
                        tcp: '5010',
                        udp: '5020'
                    };
                    const port = ports[newProto];
                    if (!port) return newProto;
                    const portInput = this.getInput('PORT');
                    if (!portInput || !portInput.connection) return newProto;
                    const target = portInput.connection.targetBlock();
                    if (target && target.type === 'math_number') {
                        target.setFieldValue(port, 'NUM');
                    }
                    return newProto;
                });
            }
        }
    };

    Blockly.Blocks.iot_loop_step = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_LOOP_STEP,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.iot_is_connected = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_IS_CONNECTED,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.iot_add_field = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_ADD_FIELD,
                args0: [
                    { type: 'input_value', name: 'NAME' },
                    { type: 'input_value', name: 'VALUE' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.iot_clear_fields = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_CLEAR_FIELDS,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.iot_send_sensor_packet = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_SEND_SENSOR,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.iot_register_control = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_REGISTER_CONTROL,
                args0: [
                    { type: 'input_value', name: 'KEY' },
                    { type: 'input_value', name: 'PIN' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.iot_handle_commands = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_HANDLE_COMMANDS,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.iot_send_ping = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.IOT_SEND_PING,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
