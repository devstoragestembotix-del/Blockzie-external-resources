/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#FF6F00';
    const secondaryColour = '#FF4F00';

    const nanoDigitalPins = [
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
        ['5', '5'],
        ['6', '6'],
        ['7', '7'],
        ['8', '8'],
        ['9', '9'],
        ['10', '10'],
        ['11', '11'],
        ['12', '12'],
        ['13', '13']
    ];

    const nanoPwmPins = [
        ['3', '3'],
        ['5', '5'],
        ['6', '6'],
        ['9', '9'],
        ['10', '10'],
        ['11', '11']
    ];

    // arduinoEsp32 / intermediateKit (AI & Robotics)
    const esp32DigitalPins = [
        ['D2', '2'],
        ['D3', '3'],
        ['D4', '4'],
        ['D5', '5'],
        ['D12', '12'],
        ['D13', '13'],
        ['D14', '14'],
        ['D15', '15'],
        ['D16', '16'],
        ['D17', '17'],
        ['D18', '18'],
        ['D19', '19'],
        ['D23', '23'],
        ['D25', '25'],
        ['D26', '26'],
        ['D27', '27'],
        ['D32', '32'],
        ['D33', '33']
    ];

    const esp32PwmPins = [
        ['D2', '2'],
        ['D4', '4'],
        ['D5', '5'],
        ['D12', '12'],
        ['D13', '13'],
        ['D14', '14'],
        ['D15', '15'],
        ['D16', '16'],
        ['D17', '17'],
        ['D18', '18'],
        ['D19', '19'],
        ['D23', '23'],
        ['D25', '25'],
        ['D26', '26'],
        ['D27', '27'],
        ['D32', '32'],
        ['D33', '33']
    ];

    const ESP32_KIT_IDS = ['arduinoesp32', 'intermediatekit'];
    const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew'];

    function ensureL298nMsgs () {
        const locales = Blockly.ScratchMsgs && Blockly.ScratchMsgs.locales;
        const localeId = (Blockly.ScratchMsgs && Blockly.ScratchMsgs.currentLocale_) || 'en';
        const fromLocale = (locales && (locales[localeId] || locales.en)) || {};
        const fallback = {
            L298N_INIT: 'initialize channel %1 IN1 %2 IN2 %3 EN %4',
            L298N_RUN: 'channel %1 run %2 speed %3',
            L298N_FORWARD: 'forward',
            L298N_BACK: 'backward',
            L298N_STOP: 'channel %1 stop'
        };
        Blockly.Msg = Blockly.Msg || {};
        Object.keys(fallback).forEach((key) => {
            if (!Blockly.Msg[key]) {
                Blockly.Msg[key] = fromLocale[key] || fallback[key];
            }
        });
    }

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

    function getFlyoutPinOptions (types) {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            const flyout = ws && ws.getFlyout && ws.getFlyout();
            const items = flyout && flyout.getFlyoutItems ? flyout.getFlyoutItems() : [];
            const blocks = items.filter(it => it && typeof it === 'object' && typeof it.getField === 'function');
            const match = blocks.find(b => types.indexOf(b.type) !== -1);
            if (match && match.getField('PIN') && match.getField('PIN').getOptions) {
                const opts = match.getField('PIN').getOptions();
                if (Array.isArray(opts) && opts.length) {
                    return opts;
                }
            }
        } catch (e) {
            // ignore — flyout is often empty when this category is opened
        }
        return null;
    }

    function isEsp32L298nKit () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS)) {
            return true;
        }
        if (deviceIdMatchesList(deviceId, NANO_KIT_IDS)) {
            return false;
        }

        const flyoutOpts = getFlyoutPinOptions([
            'arduino_pin_setDigitalOutput',
            'arduino_pin_setPwmOutput',
            'arduino_pin_readAnalogPin'
        ]);
        if (pinOptionsLookEsp32(flyoutOpts)) {
            return true;
        }
        if (pinOptionsLookNano(flyoutOpts)) {
            return false;
        }

        return false;
    }

    function getDigitalPinOptions () {
        const flyoutOpts = getFlyoutPinOptions([
            'arduino_pin_setDigitalOutput',
            'arduino_pin_readDigitalPin',
            'arduino_pin_setPinMode'
        ]);
        if (flyoutOpts && flyoutOpts.length) {
            return flyoutOpts;
        }
        return isEsp32L298nKit() ? esp32DigitalPins : nanoDigitalPins;
    }

    function getPwmPinOptions () {
        const flyoutOpts = getFlyoutPinOptions(['arduino_pin_setPwmOutput']);
        if (flyoutOpts && flyoutOpts.length) {
            return flyoutOpts;
        }
        return isEsp32L298nKit() ? esp32PwmPins : nanoPwmPins;
    }

    function digitalPinFieldOptions () {
        return function () {
            return getDigitalPinOptions();
        };
    }

    function pwmPinFieldOptions () {
        return function () {
            return getPwmPinOptions();
        };
    }

    ensureL298nMsgs();

    Blockly.Blocks.l298n_init = {
        init: function () {
            ensureL298nMsgs();
            this.jsonInit({
                message0: Blockly.Msg.L298N_INIT,
                args0: [
                    {
                        type: 'input_value',
                        name: 'CH'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'IN1',
                        options: digitalPinFieldOptions()
                    },
                    {
                        type: 'field_dropdown',
                        name: 'IN2',
                        options: digitalPinFieldOptions()
                    },
                    {
                        type: 'field_dropdown',
                        name: 'EN',
                        options: pwmPinFieldOptions()
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.l298n_run = {
        init: function () {
            ensureL298nMsgs();
            this.jsonInit({
                message0: Blockly.Msg.L298N_RUN,
                args0: [
                    {
                        type: 'input_value',
                        name: 'CH'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DIR',
                        options: [
                            [Blockly.Msg.L298N_FORWARD, 'L298N_FORWARD'],
                            [Blockly.Msg.L298N_BACK, 'L298N_BACKWARD']
                        ]
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

    Blockly.Blocks.l298n_stop = {
        init: function () {
            ensureL298nMsgs();
            this.jsonInit({
                message0: Blockly.Msg.L298N_STOP,
                args0: [
                    {
                        type: 'input_value',
                        name: 'CH'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
module.exports = addBlocks;
