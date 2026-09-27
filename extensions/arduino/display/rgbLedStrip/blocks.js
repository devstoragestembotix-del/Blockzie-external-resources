/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const colour = '#7700FF';
    const secondaryColour = '#4400B3';

    // AI & Robotics (ESP32): WS2812 data on kit output pins
    const esp32StripPins = [
        ['D4', '4'],
        ['D5', '5'],
        ['D14', '14'],
        ['D25', '25'],
        ['D26', '26'],
        ['D32', '32'],
        ['D33', '33']
    ];

    // AI & IoT (Nano): kit digital ports that work for WS2812
    const nanoStripPins = [
        ['4', '4'],
        ['5', '5'],
        ['6', '6'],
        ['7', '7'],
        ['10', '10'],
        ['11', '11']
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
            const value = String(entry[1] != null ? entry[1] : entry[0] || '');
            const n = parseInt(String(value).replace(/^IO/i, '').replace(/^D/i, ''), 10);
            return Number.isFinite(n) && n >= 25;
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

    function isEsp32Kit () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS) ||
            (/robotics/.test(deviceId) && !/iot/.test(deviceId))) {
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

    function getStripPinOptions () {
        return isEsp32Kit() ? esp32StripPins : nanoStripPins;
    }

    function getDefaultStripPin () {
        const opts = getStripPinOptions();
        return opts.length ? String(opts[0][1]) : '5';
    }

    function attachStripPinField (block) {
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const optionsFn = function () {
            return getStripPinOptions();
        };
        if (typeof pinField.menuGenerator_ !== 'undefined') {
            pinField.menuGenerator_ = optionsFn;
        }
        pinField.setValidator(function (newValue) {
            const validPins = optionsFn().map((entry) => String(entry[1]));
            const value = String(newValue || '');
            return validPins.includes(value) ? value : getDefaultStripPin();
        });
        const validPins = optionsFn().map((entry) => String(entry[1]));
        if (!validPins.includes(String(pinField.getValue() || ''))) {
            pinField.setValue(getDefaultStripPin());
        }
    }

    Blockly.Blocks.rgbLedStrip_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RGBLEDSTRIP_INIT,
                args0: [
                    {
                        type: 'input_value',
                        name: 'LEN'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: function () {
                            return getStripPinOptions();
                        }
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachStripPinField(this);
            const stripBlock = this;
            setTimeout(function () {
                attachStripPinField(stripBlock);
            }, 0);
        }
    };

    Blockly.Blocks.rgbLedStrip_setPixelColor = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RGBLEDSTRIP_SETPIXELCOLOR,
                args0: [
                    {
                        type: 'input_value',
                        name: 'NO'
                    },
                    {
                        type: 'input_value',
                        name: 'COLOR'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.rgbLedStrip_fill = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RGBLEDSTRIP_FILL,
                args0: [
                    {
                        type: 'input_value',
                        name: 'FIRST'
                    },
                    {
                        type: 'input_value',
                        name: 'COUNT'
                    },
                    {
                        type: 'input_value',
                        name: 'COLOR'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.rgbLedStrip_color = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RGBLEDSTRIP_COLOR,
                args0: [
                    {
                        type: 'input_value',
                        name: 'R'
                    },
                    {
                        type: 'input_value',
                        name: 'G'
                    },
                    {
                        type: 'input_value',
                        name: 'B'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.rgbLedStrip_setBrightness = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RGBLEDSTRIP_SETBRIGHTNESS,
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

    Blockly.Blocks.rgbLedStrip_clear = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RGBLEDSTRIP_CLEAR,
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.rgbLedStrip_show = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RGBLEDSTRIP_SHOW,
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
