/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {

    const colour = '#BBBB00';
    const secondaryColour = '#888800';

    const digitalPins = [
        ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
        ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'],
        ['10', '10'], ['11', '11'], ['12', '12'], ['13', '13']
    ];

    Blockly.Blocks.lcd_config = {
        init: function () {
            this.jsonInit({
                message0: 'configure LCD %1 type %2 with address %3',
                args0: [
                    {
                        type: "field_dropdown",
                        name: "LCD_INDEX",
                        options: [
                            ["1", "1"],
                            ["2", "2"]
                        ]
                    },
                    {
                        type: "field_dropdown",
                        name: "TYPE",
                        options: [
                            ["I2C (MCP23008)", "I2C_MCP23008"],
                            ["I2C (PCF8574)", "I2C_PCF8574"]
                        ]
                    },
                    {
                        type: "field_dropdown",
                        name: "ADDRESS",
                        options: [
                            ["32 (0x20)", "0x20"],
                            ["33 (0x21)", "0x21"],
                            ["34 (0x22)", "0x22"],
                            ["35 (0x23)", "0x23"],
                            ["36 (0x24)", "0x24"],
                            ["37 (0x25)", "0x25"],
                            ["38 (0x26)", "0x26"],
                            ["39 (0x27)", "0x27"]
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };
    

    Blockly.Blocks.lcd_config_standard = {
        init: function () {
            this.jsonInit({
                message0: 'configure LCD %1 type to %2 with pins: RS %3 E %4 DB4 %5 DB5 %6 DB6 %7 DB7 %8',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'LCD_INDEX',
                        options: [['1', '1'], ['2', '2']]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'TYPE',
                        options: [['Standard', 'STANDARD']]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'RS',
                        options: digitalPins
                    },
                    {
                        type: 'field_dropdown',
                        name: 'E',
                        options: digitalPins
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DB4',
                        options: digitalPins
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DB5',
                        options: digitalPins
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DB6',
                        options: digitalPins
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DB7',
                        options: digitalPins
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_clear_screen = {
        init: function () {
            this.jsonInit({
                message0: 'clear LCD %1',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'LCD_INDEX',
                        options: [['1', '1'], ['2', '2']]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_backlight_control = {
        init: function () {
            this.jsonInit({
                message0: 'turn LCD %1 backlight %2',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'LCD_INDEX',
                        options: [['1', '1'], ['2', '2']]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'STATE',
                        options: [['on', 'on'], ['off', 'off']]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_set_position = {
        init: function () {
            this.jsonInit({
                message0: 'set LCD %1 cursor column %2 row %3',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'LCD_INDEX',
                        options: [['1', '1'], ['2', '2']]
                    },
                    {
                        type: 'input_value',
                        name: 'COLUMN'
                    },
                    {
                        type: 'input_value',
                        name: 'ROW'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_print_text = {
        init: function () {
            this.jsonInit({
                message0: 'LCD %1 print text %2',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'LCD_INDEX',
                        options: [['1', '1'], ['2', '2']]
                    },
                    {
                        type: 'input_value',
                        name: 'TEXT'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_action_control = {
        init: function () {
            this.jsonInit({
                message0: 'on LCD %1 %2',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'LCD_INDEX',
                        options: [['1', '1'], ['2', '2']]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'ACTION',
                        options: [
                            ['clear the screen', 'CLEAR'],
                            ['turn on the backlight', 'BACKLIGHT_ON'],
                            ['turn off the backlight', 'BACKLIGHT_OFF'],
                            ['turn on the display', 'DISPLAY_ON'],
                            ['turn off the display', 'DISPLAY_OFF'],
                            ['turn on the cursor', 'CURSOR_ON'],
                            ['turn off the cursor', 'CURSOR_OFF'],
                            ['turn on cursor blinking', 'BLINK_ON'],
                            ['turn off cursor blinking', 'BLINK_OFF'],
                            ['turn on autoscrolling', 'AUTOSCROLL_ON'],
                            ['turn off autoscrolling', 'AUTOSCROLL_OFF'],
                            ['scroll the display to the left', 'SCROLL_LEFT'],
                            ['scroll the display to the right', 'SCROLL_RIGHT'],
                            ['set print direction left to right', 'LTR'],
                            ['set print direction right to left', 'RTL']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };
    

    return Blockly;
}

exports = addBlocks;
