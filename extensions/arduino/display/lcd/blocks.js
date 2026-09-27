/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const colour = '#BBBB00';
    const secondaryColour = '#888800';

    // AI & Robotics ESP32: D21 SDA, D22 SCL
    const esp32LcdSdaPins = [['D21', '21']];
    const esp32LcdSclPins = [['D22', '22']];

    // AI & IoT Nano: A4 SDA, A5 SCL
    const nanoLcdSdaPins = [['A4', 'A4']];
    const nanoLcdSclPins = [['A5', 'A5']];

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

    function isEsp32LcdKit () {
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

    function getLcdSdaPinOptions () {
        return isEsp32LcdKit() ? esp32LcdSdaPins : nanoLcdSdaPins;
    }

    function getLcdSclPinOptions () {
        return isEsp32LcdKit() ? esp32LcdSclPins : nanoLcdSclPins;
    }

    function getDefaultLcdSdaPin () {
        return isEsp32LcdKit() ? '21' : 'A4';
    }

    function getDefaultLcdSclPin () {
        return isEsp32LcdKit() ? '22' : 'A5';
    }

    function fixLcdPinFields (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const sdaField = block.getField('SDA');
        const sclField = block.getField('SCL');
        const validSda = getLcdSdaPinOptions().map((entry) => String(entry[1]));
        const validScl = getLcdSclPinOptions().map((entry) => String(entry[1]));
        if (sdaField && !validSda.includes(String(sdaField.getValue() || ''))) {
            sdaField.setValue(getDefaultLcdSdaPin());
        }
        if (sclField && !validScl.includes(String(sclField.getValue() || ''))) {
            sclField.setValue(getDefaultLcdSclPin());
        }
    }

    Blockly.Blocks.lcd_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'ADDR',
                        options: [
                            ['0x20', '0x20'],
                            ['0x21', '0x21'],
                            ['0x22', '0x22'],
                            ['0x23', '0x23'],
                            ['0x24', '0x24'],
                            ['0x25', '0x25'],
                            ['0x26', '0x26'],
                            ['0x27', '0x27']
                        ]
                    },
                    {
                        type: 'field_number',
                        name: 'COLS',
                        value: 16,
                        min: 1,
                        precision: 1
                    },
                    {
                        type: 'field_number',
                        name: 'ROWS',
                        value: 2,
                        min: 1,
                        precision: 1
                    },
                    {
                        type: 'field_dropdown',
                        name: 'SDA',
                        options: function () {
                            return getLcdSdaPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'SCL',
                        options: function () {
                            return getLcdSclPinOptions();
                        }
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            const sdaField = this.getField('SDA');
            const sclField = this.getField('SCL');
            if (sdaField) {
                sdaField.setValidator(function (newValue) {
                    const validPins = getLcdSdaPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultLcdSdaPin();
                });
            }
            if (sclField) {
                sclField.setValidator(function (newValue) {
                    const validPins = getLcdSclPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultLcdSclPin();
                });
            }
            fixLcdPinFields(this);
        }
    };

    Blockly.Blocks.lcd_setCursorPosition = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_SETCURSORPOSITION,
                args0: [
                    {
                        type: 'input_value',
                        name: 'X'
                    },
                    {
                        type: 'input_value',
                        name: 'Y'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_print = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_PRINT,
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

    Blockly.Blocks.lcd_printNumber = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_PRINTNUMBER,
                args0: [
                    {
                        type: 'input_value',
                        name: 'NUMBER'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_printCharCode = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_PRINTCHARCODE,
                args0: [
                    {
                        type: 'input_value',
                        name: 'CODE'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_clear = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_CLEAR,
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_setBackLight = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_SETBACKLIGHT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'STATE',
                        options: [
                            [Blockly.Msg.LCD_SATE_ON, 'on'],
                            [Blockly.Msg.LCD_SATE_OFF, 'off']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_setCursorStyle = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_SETCURSORSTYLE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'STATE',
                        options: [
                            [Blockly.Msg.LCD_SATE_DISPLAY, 'display'],
                            [Blockly.Msg.LCD_SATE_HIDE, 'hide']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'STYLE',
                        options: [
                            [Blockly.Msg.LCD_STYLE_BLINK, 'blink'],
                            [Blockly.Msg.LCD_STYLE_NOBLINK, 'onBlink']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.lcd_scrollDisplay = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LCD_SCROLLDISPLAY,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'DIR',
                        options: [
                            [Blockly.Msg.LCD_SCROLL_LEFT, 'left'],
                            [Blockly.Msg.LCD_SCROLL_RIGHT, 'right']
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
