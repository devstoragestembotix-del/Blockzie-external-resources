/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const colour = '#FF7F50';
    const secondaryColour = '#FF6347';

    // AI & Robotics ESP32: D21 DIO, D22 CLK
    const esp32Tm1637DioPins = [['D21', '21']];
    const esp32Tm1637ClkPins = [['D22', '22']];

    // AI & IoT Nano: DIO = 12 or A4, CLK = 8 or A5
    const nanoTm1637DioPins = [
        ['12', '12'],
        ['A4', 'A4']
    ];
    const nanoTm1637ClkPins = [
        ['8', '8'],
        ['A5', 'A5']
    ];

    const ESP32_KIT_IDS = ['arduinoesp32', 'intermediatekit'];
    const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew'];

    function getWorkspaceDeviceId () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws) {
                return '';
            }
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

    function deviceIdMatchesList (deviceId, ids) {
        const id = String(deviceId || '').toLowerCase();
        if (!id) {
            return false;
        }
        return ids.some((kitId) => id === kitId || id.includes(kitId));
    }

    function pinOptionsLookNano (opts) {
        if (!Array.isArray(opts) || !opts.length) {
            return false;
        }
        return opts.some((entry) => {
            const value = String(entry[1] != null ? entry[1] : entry[0] || '');
            return /^A\d+$/i.test(value.trim());
        });
    }

    function pinOptionsLookEsp32 (opts) {
        if (!Array.isArray(opts) || !opts.length) {
            return false;
        }
        return opts.some((entry) => {
            const label = String(entry[0] || '');
            const value = String(entry[1] != null ? entry[1] : entry[0] || '');
            if (/^IO\d+/i.test(label) || /^D\d+/i.test(label)) {
                return true;
            }
            const n = parseInt(value.replace(/^IO/i, ''), 10);
            return Number.isFinite(n) && (n >= 25 || (n >= 32 && n <= 39));
        });
    }

    function getFlyoutAnalogPinOptions () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            const flyout = ws && ws.getFlyout && ws.getFlyout();
            const items = flyout && flyout.getFlyoutItems ? flyout.getFlyoutItems() : [];
            const blocks = items.filter(it => it && typeof it === 'object' && typeof it.getField === 'function');
            const analog = blocks.find(b => b.type === 'arduino_pin_readAnalogPin');
            if (analog && analog.getField('PIN') && analog.getField('PIN').getOptions) {
                return analog.getField('PIN').getOptions();
            }
        } catch (e) {
            // ignore
        }
        return null;
    }

    function isEsp32Tm1637Kit () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS)) {
            return true;
        }
        if (deviceIdMatchesList(deviceId, NANO_KIT_IDS)) {
            return false;
        }

        const flyoutOpts = getFlyoutAnalogPinOptions();
        if (pinOptionsLookEsp32(flyoutOpts)) {
            return true;
        }
        if (pinOptionsLookNano(flyoutOpts)) {
            return false;
        }

        return false;
    }

    function getTm1637DioPinOptions () {
        return isEsp32Tm1637Kit() ? esp32Tm1637DioPins : nanoTm1637DioPins;
    }

    function getTm1637ClkPinOptions () {
        return isEsp32Tm1637Kit() ? esp32Tm1637ClkPins : nanoTm1637ClkPins;
    }

    function getDefaultTm1637DioPin () {
        return isEsp32Tm1637Kit() ? '21' : 'A4';
    }

    function getDefaultTm1637ClkPin () {
        return isEsp32Tm1637Kit() ? '22' : 'A5';
    }

    function fixTm1637PinFields (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const dioField = block.getField('DIO');
        const clkField = block.getField('CLK');
        const validDio = getTm1637DioPinOptions().map((entry) => String(entry[1]));
        const validClk = getTm1637ClkPinOptions().map((entry) => String(entry[1]));
        if (dioField && !validDio.includes(String(dioField.getValue() || ''))) {
            dioField.setValue(getDefaultTm1637DioPin());
        }
        if (clkField && !validClk.includes(String(clkField.getValue() || ''))) {
            clkField.setValue(getDefaultTm1637ClkPin());
        }
    }

    Blockly.Blocks.fourDigitClockDisplay_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'DIO',
                        options: function () {
                            return getTm1637DioPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'CLK',
                        options: function () {
                            return getTm1637ClkPinOptions();
                        }
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            const dioField = this.getField('DIO');
            const clkField = this.getField('CLK');
            if (dioField) {
                dioField.setValidator(function (newValue) {
                    const validPins = getTm1637DioPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultTm1637DioPin();
                });
            }
            if (clkField) {
                clkField.setValidator(function (newValue) {
                    const validPins = getTm1637ClkPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultTm1637ClkPin();
                });
            }
            fixTm1637PinFields(this);
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_setBrightness = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_SETBRIGHTNESS,
                args0: [
                    {
                        type: 'input_value',
                        name: 'BRT'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_brightnessNumber = {
        init: function () {
            this.jsonInit({
                message0: '%1',
                args0: [
                    {
                        type: 'field_slider',
                        name: 'NUM',
                        value: '0',
                        precision: 1,
                        min: '0',
                        max: '7'
                    }
                ],
                output: 'Number',
                outputShape: Blockly.OUTPUT_SHAPE_ROUND,
                colour: Blockly.Colours.textField,
                colourSecondary: Blockly.Colours.textField,
                colourTertiary: Blockly.Colours.textField
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_displayNumber = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_DISPLAYNUMBER,
                args0: [
                    {
                        type: 'input_value',
                        name: 'DATA'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_displayNumberEx = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_DISPLAYNUMBEREX,
                args0: [
                    {
                        type: 'input_value',
                        name: 'DATA'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'LEN',
                        options: [
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3'],
                            ['4', '4']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'POS',
                        options: [
                            ['0', '0'],
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'LZ',
                        options: [
                            [Blockly.Msg.FOURDIGITCLOCKDISPLAY_YES, 'true'],
                            [Blockly.Msg.FOURDIGITCLOCKDISPLAY_NO, 'false']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_displayNumberDots = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_DISPLAYNUMBERDOTS,
                args0: [
                    {
                        type: 'input_value',
                        name: 'DATA'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'LEN',
                        options: [
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3'],
                            ['4', '4']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'POS',
                        options: [
                            ['0', '0'],
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DOTS',
                        options: [
                            ['0b00000000', '0b00000000'],
                            ['0b10000000', '0b10000000'],
                            ['0b01000000', '0b01000000'],
                            ['0b00100000', '0b00100000'],
                            ['0b00010000', '0b00010000'],
                            ['0b11110000', '0b11110000']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'LZ',
                        options: [
                            [Blockly.Msg.FOURDIGITCLOCKDISPLAY_YES, 'true'],
                            [Blockly.Msg.FOURDIGITCLOCKDISPLAY_NO, 'false']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_setSegments = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_SETSEGMENTS,
                args0: [
                    {
                        type: 'field_input',
                        name: 'SEGS',
                        text: 'SEG_A|SEG_B|SEG_F|SEG_G, SEG_A|SEG_D|SEG_E|SEG_F'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'LEN',
                        options: [
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3'],
                            ['4', '4']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'POS',
                        options: [
                            ['0', '0'],
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_displayString = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_DISPLAYSTRING,
                args0: [
                    {
                        type: 'input_value',
                        name: 'DATA'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_display = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_DISPLAY,
                args0: [
                    {
                        type: 'input_value',
                        name: 'DATA'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'POS',
                        options: [
                            ['1', '0'],
                            ['2', '1'],
                            ['3', '2'],
                            ['4', '3']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_setPoint = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_SETPOINT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'STA',
                        options: [
                            [Blockly.Msg.FOURDIGITCLOCKDISPLAY_STATE_ON, 'true'],
                            [Blockly.Msg.FOURDIGITCLOCKDISPLAY_STATE_OFF, 'false']
                        ]
                    }
                ],
                tooltip: Blockly.Msg.FOURDIGITCLOCKDISPLAY_SETPOINT_TOOLTIP,
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.fourDigitClockDisplay_clear = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.FOURDIGITCLOCKDISPLAY_CLEAR,
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
