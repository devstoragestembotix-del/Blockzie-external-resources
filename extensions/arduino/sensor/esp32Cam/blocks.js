/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const colorSetup = '#5E35B1';
    const colorSetup2 = '#4527A0';
    const colorBasic = '#00897B';
    const colorBasic2 = '#00695C';
    const colorInter = '#1E88E5';
    const colorInter2 = '#1565C0';
    const colorAdv = '#FB8C00';
    const colorAdv2 = '#EF6C00';
    const colorUart = '#E53935';
    const colorUart2 = '#C62828';

    const objectOptions = [
        ['person', 'person'],
        ['car', 'car'],
        ['dog', 'dog'],
        ['cat', 'cat'],
        ['bottle', 'bottle']
    ];

    const qrCmdOptions = [
        [Blockly.Msg.ESP32CAM_QR_FWD || 'forward', 'forward'],
        [Blockly.Msg.ESP32CAM_QR_BWD || 'backward', 'backward'],
        [Blockly.Msg.ESP32CAM_QR_LEFT || 'left', 'left'],
        [Blockly.Msg.ESP32CAM_QR_RIGHT || 'right', 'right'],
        [Blockly.Msg.ESP32CAM_QR_UTURN || 'U Turn', 'uturn'],
        [Blockly.Msg.ESP32CAM_QR_STOP || 'stop', 'stop']
    ];

    const scCmdOptions = [
        [Blockly.Msg.ESP32CAM_QR_FWD || 'forward', 'forward'],
        [Blockly.Msg.ESP32CAM_QR_BWD || 'backward', 'backward'],
        [Blockly.Msg.ESP32CAM_QR_LEFT || 'left', 'left'],
        [Blockly.Msg.ESP32CAM_QR_RIGHT || 'right', 'right'],
        [Blockly.Msg.ESP32CAM_QR_UTURN || 'U Turn', 'uturn']
    ];

    const colorTrackOptions = [
        ['Red', 'Red'],
        ['Green', 'Green'],
        ['Blue', 'Blue'],
        ['Yellow', 'Yellow']
    ];

    Blockly.Blocks.esp32cam_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'SOURCE',
                        options: [
                            [Blockly.Msg.ESP32CAM_SOURCE_CAMERA || 'ESP32-CAM', 'CAMERA'],
                            [Blockly.Msg.ESP32CAM_SOURCE_WEB || 'web stream', 'WEB_STREAM']
                        ]
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_stream_url = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_STREAM_URL,
                args0: [
                    {
                        type: 'input_value',
                        name: 'URL',
                        check: 'String'
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_wifi = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_WIFI,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'MODE',
                        options: [
                            [Blockly.Msg.ESP32CAM_WIFI_STA || 'join network', 'STA'],
                            [Blockly.Msg.ESP32CAM_WIFI_AP || 'hotspot (AP)', 'AP']
                        ]
                    },
                    {
                        type: 'input_value',
                        name: 'SSID',
                        check: 'String'
                    },
                    {
                        type: 'input_value',
                        name: 'PASSWORD',
                        check: 'String'
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_resolution = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_RESOLUTION,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'SIZE',
                        options: [
                            ['160 × 120', 'QQVGA'],
                            ['320 × 240', 'QVGA'],
                            ['640 × 480', 'VGA'],
                            ['800 × 600', 'SVGA']
                        ]
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_frame_rate = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_FRAME_RATE,
                args0: [
                    {
                        type: 'input_value',
                        name: 'FPS',
                        check: 'Number'
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_jpeg_quality = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_JPEG_QUALITY,
                args0: [
                    {
                        type: 'input_value',
                        name: 'QUALITY',
                        check: 'Number'
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_rotation = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_ROTATION,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'ROTATION',
                        options: [
                            ['0°', '0'],
                            ['90°', '90'],
                            ['180°', '180'],
                            ['270°', '270']
                        ]
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_flip = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_FLIP,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'FLIP',
                        options: [
                            [Blockly.Msg.ESP32CAM_FLIP_NONE || 'none', 'NONE'],
                            [Blockly.Msg.ESP32CAM_FLIP_HORIZONTAL || 'horizontal', 'HORIZONTAL'],
                            [Blockly.Msg.ESP32CAM_FLIP_VERTICAL || 'vertical', 'VERTICAL'],
                            [Blockly.Msg.ESP32CAM_FLIP_BOTH || 'both', 'BOTH']
                        ]
                    }
                ],
                colour: colorSetup,
                secondaryColour: colorSetup2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_led_on = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_LED_ON,
                colour: colorBasic,
                secondaryColour: colorBasic2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_led_off = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_LED_OFF,
                colour: colorBasic,
                secondaryColour: colorBasic2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_stream_web = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_STREAM_WEB,
                colour: colorBasic,
                secondaryColour: colorBasic2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_handle_client = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_HANDLE_CLIENT,
                colour: colorBasic,
                secondaryColour: colorBasic2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_surveillance = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_SURVEILLANCE,
                colour: colorBasic,
                secondaryColour: colorBasic2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_face_mode = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_FACE_MODE,
                colour: colorInter,
                secondaryColour: colorInter2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_color_mode = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_COLOR_MODE,
                colour: colorInter,
                secondaryColour: colorInter2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_finger_mode = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_FINGER_MODE,
                colour: colorInter,
                secondaryColour: colorInter2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_qr_mode = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_QR_MODE,
                colour: colorAdv,
                secondaryColour: colorAdv2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_emotion_mode = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_EMOTION_MODE,
                colour: colorAdv,
                secondaryColour: colorAdv2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_object_mode = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_OBJECT_MODE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'NAME',
                        options: objectOptions
                    }
                ],
                colour: colorAdv,
                secondaryColour: colorAdv2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_line_black = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_LINE_BLACK,
                colour: colorAdv,
                secondaryColour: colorAdv2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_line_white = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_LINE_WHITE,
                colour: colorAdv,
                secondaryColour: colorAdv2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_send_steering = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_SEND_STEERING,
                args0: [
                    { type: 'input_value', name: 'VALUE', check: 'Number' }
                ],
                colour: colorUart,
                secondaryColour: colorUart2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_send_qr = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_SEND_QR,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'CMD',
                        options: qrCmdOptions
                    }
                ],
                colour: colorUart,
                secondaryColour: colorUart2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_send_qr_raw = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_SEND_QR_RAW,
                args0: [
                    { type: 'input_value', name: 'TEXT', check: 'String' }
                ],
                colour: colorUart,
                secondaryColour: colorUart2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_send_surveillance = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_SEND_SC,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'CMD',
                        options: scCmdOptions
                    }
                ],
                colour: colorUart,
                secondaryColour: colorUart2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_send_color = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_SEND_CT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'COLOR',
                        options: colorTrackOptions
                    },
                    { type: 'input_value', name: 'FOUND', check: 'Number' },
                    { type: 'input_value', name: 'ERRX', check: 'Number' },
                    { type: 'input_value', name: 'ERRY', check: 'Number' }
                ],
                colour: colorUart,
                secondaryColour: colorUart2,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.esp32cam_send_object = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ESP32CAM_SEND_OBJECT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'NAME',
                        options: objectOptions
                    },
                    { type: 'input_value', name: 'CX', check: 'Number' },
                    { type: 'input_value', name: 'WIDTH', check: 'Number' }
                ],
                colour: colorUart,
                secondaryColour: colorUart2,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
