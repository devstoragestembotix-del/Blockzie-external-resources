function addBlocks(Blockly) {

    const color = '#1565C0';

    const secondaryColour = '#0D47A1';


    Blockly.Blocks.ioth_wifi_connect = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_WIFI_CONNECT,

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


    Blockly.Blocks.ioth_server_connect = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_SERVER_CONNECT,

                args0: [

                    {

                        type: 'field_dropdown',

                        name: 'PROTOCOL',

                        options: [

                            [Blockly.Msg.IOT_HUB_PROTO_MQTT, 'mqtt'],

                            [Blockly.Msg.IOT_HUB_PROTO_HTTPS, 'https'],

                            [Blockly.Msg.IOT_HUB_PROTO_HTTP, 'http']

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

                    const ports = { mqtt: '1883', https: '5000', http: '5000' };

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


    Blockly.Blocks.ioth_loop_step = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_LOOP,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    Blockly.Blocks.ioth_is_connected = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_CONNECTED,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['output_boolean']

            });

        }

    };


    Blockly.Blocks.ioth_add_field = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_ADD_FIELD,

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


    Blockly.Blocks.ioth_clear_fields = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_CLEAR,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    Blockly.Blocks.ioth_send_sensor = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_SEND,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    Blockly.Blocks.ioth_register_control = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_REGISTER,

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


    Blockly.Blocks.ioth_handle_commands = {

        init: function () {

            this.jsonInit({

                message0: Blockly.Msg.IOT_HUB_HANDLE,

                colour: color,

                secondaryColour: secondaryColour,

                extensions: ['shape_statement']

            });

        }

    };


    return Blockly;

}



exports = addBlocks;
