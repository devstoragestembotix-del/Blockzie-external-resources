function addBlocks(Blockly) {

    const color = '#1565C0';

    const secondaryColour = '#0D47A1';


    Blockly.Blocks.zioth_wifi_connect = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_WIFI_CONNECT,

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


    Blockly.Blocks.zioth_server_connect = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_SERVER_CONNECT,

                args0: [

                    {

                        type: 'field_dropdown',

                        name: 'PROTOCOL',

                        options: [

                            [Blockly.Msg.ZIOTH_PROTO_MQTT, 'mqtt'],

                            [Blockly.Msg.ZIOTH_PROTO_HTTPS, 'https']

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

            const protoField = this.getField('PROTOCOL');

            if (protoField) {

                protoField.setValidator((newProto) => {

                    const ports = { mqtt: '1883', https: '5000' };

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


    Blockly.Blocks.zioth_loop_step = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_LOOP,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    Blockly.Blocks.zioth_is_connected = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_CONNECTED,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['output_boolean']

            });

        }

    };


    Blockly.Blocks.zioth_add_field = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_ADD_FIELD,

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


    Blockly.Blocks.zioth_clear_fields = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_CLEAR,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    Blockly.Blocks.zioth_send_sensor = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_SEND,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    Blockly.Blocks.zioth_register_control = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_REGISTER,

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


    Blockly.Blocks.zioth_handle_commands = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.ZIOTH_HANDLE,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    return Blockly;

}



exports = addBlocks;
