/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const color = '#AE00AE';
    const secondaryColour = '#930093';

    // AI & Robotics (ESP32): kit digital outputs
    const esp32TcsPins = [
        ['D4', '4'],
        ['D5', '5'],
        ['D14', '14'],
        ['D25', '25'],
        ['D26', '26'],
        ['D32', '32'],
        ['D33', '33']
    ];

    // AI & IoT (Nano): kit digital ports
    const nanoTcsPins = [
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

    function getTcsPinOptions () {
        return isEsp32Kit() ? esp32TcsPins : nanoTcsPins;
    }

    function pickDistinctPins (options, count) {
        const pins = (options || []).map(function (entry) {
            return String(entry[1]);
        });
        const out = [];
        pins.forEach(function (pin) {
            if (pin && out.indexOf(pin) === -1 && out.length < count) {
                out.push(pin);
            }
        });
        while (out.length < count && pins.length) {
            out.push(pins[out.length % pins.length]);
        }
        return out;
    }

    function getDefaultTcsPins () {
        const picked = pickDistinctPins(getTcsPinOptions(), 5);
        return {
            S0: picked[0],
            S1: picked[1],
            S2: picked[2],
            S3: picked[3],
            OE: picked[4]
        };
    }

    function attachTcsPinFields (block) {
        const defaults = getDefaultTcsPins();
        const validPins = getTcsPinOptions().map((entry) => String(entry[1]));
        ['S0', 'S1', 'S2', 'S3', 'OE'].forEach(function (name) {
            const field = block.getField(name);
            if (!field) {
                return;
            }
            if (typeof field.menuGenerator_ !== 'undefined') {
                field.menuGenerator_ = getTcsPinOptions;
            }
            field.setValidator(function (newValue) {
                const value = String(newValue || '');
                return validPins.includes(value) ? value : defaults[name];
            });
            field.setValue(defaults[name]);
        });
    }

    Blockly.Blocks.tcs3200_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TCS3200_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'S0',
                        options: function () {
                            return getTcsPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'S1',
                        options: function () {
                            return getTcsPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'S2',
                        options: function () {
                            return getTcsPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'S3',
                        options: function () {
                            return getTcsPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'OE',
                        options: function () {
                            return getTcsPinOptions();
                        }
                    }
                ],
                tooltip: Blockly.Msg.TCS3200_INIT_TOOLTIP,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachTcsPinFields(this);
            const tcsBlock = this;
            setTimeout(function () {
                attachTcsPinFields(tcsBlock);
            }, 0);
        }
    };

    Blockly.Blocks.tcs3200_calibrateWhite = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TCS3200_CALIBRATEWHITE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.tcs3200_calibrateBlack = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TCS3200_CALIBRATEBLACK,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.tcs3200_measureColor = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TCS3200_MEASURECOLOR,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.tcs3200_getColorValue = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TCS3200_GETCOLORVALUE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'COLOUR',
                        options: [
                            [Blockly.Msg.TCS3200_COLOR_RED, 'TCS3200_RED'],
                            [Blockly.Msg.TCS3200_COLOR_GREEN, 'TCS3200_GREEN'],
                            [Blockly.Msg.TCS3200_COLOR_BLUE, 'TCS3200_BLUE'],
                            ['RGB', 'TCS3200_RGB']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
