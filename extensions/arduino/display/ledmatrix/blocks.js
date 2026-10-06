/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const Blockly = require('blockly/core');
require('./field_matrix.js');

function addBlocks(Blockly) {
    const color = '#FF8C00';
    const secondaryColour = '#FFB733';

    // arduinoEsp32 / intermediateKit (AI & Robotics)
    const esp32LedMatrixPins = [
        ['D1', '1'],
        ['D3', '3'],
        ['D4', '4'],
        ['D5', '5'],
        ['D25', '25'],
        ['D26', '26']
    ];

    // arduinoNano / iotAiKit / iotAiKitnew (AI & IoT)
    const nanoLedMatrixPins = [
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

    function isEsp32LedMatrixKit () {
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

    function getLedMatrixPinOptions () {
        return isEsp32LedMatrixKit() ? esp32LedMatrixPins : nanoLedMatrixPins;
    }

    function getDefaultLedMatrixPin () {
        return '5';
    }

    function fixLedMatrixPinField (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const validPins = getLedMatrixPinOptions().map((entry) => String(entry[1]));
        const current = String(pinField.getValue() || '');
        if (!validPins.includes(current)) {
            pinField.setValue(getDefaultLedMatrixPin());
        }
    }

    // ================= INIT =================
    Blockly.Blocks.ledmatrix_init = {
        init: function() {
            this.jsonInit({
                message0: 'init LED Matrix at pin %1 with %2 leds brightness %3',
                args0: [{
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: function () {
                            return getLedMatrixPinOptions();
                        }
                    },
                    { type: 'input_value', name: 'NUM_LEDS' },
                    { type: 'input_value', name: 'BRIGHTNESS' }
                ],
                colour: color,
                extensions: ['shape_statement']
            });
            const pinField = this.getField('PIN');
            if (pinField) {
                pinField.setValidator(function (newValue) {
                    const validPins = getLedMatrixPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultLedMatrixPin();
                });
            }
            fixLedMatrixPinField(this);
        }
    };

    // ================= DIGIT =================
    Blockly.Blocks.ledmatrix_showDigit = {
        init: function() {
            this.jsonInit({
                message0: 'show digit %1 on LED Matrix',
                args0: [{ type: 'input_value', name: 'DIGIT' }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= LETTER =================
    Blockly.Blocks.ledmatrix_showChar = {
        init: function() {
            this.jsonInit({
                message0: 'show letter %1 on LED Matrix',
                args0: [{
                    type: 'field_dropdown',
                    name: 'CHAR',
                    options: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => [c, c])
                }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= SYMBOL =================
    Blockly.Blocks.ledmatrix_showSymbol = {
        init: function() {
            this.jsonInit({
                message0: 'show symbol %1 on LED Matrix',
                args0: [{
                    type: 'field_dropdown',
                    name: 'SYMBOL',
                    options: [
                        ['♥ Heart', '*'],
                        ['☺ Smile', ':']
                    ]
                }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= CUSTOM PATTERN =================
    Blockly.Blocks.ledmatrix_draw_custom = {
        init: function() {
            this.jsonInit({
                message0: 'draw custom 7x5 pattern %1',
                args0: [{
                    type: 'field_matrix',
                    name: 'MATRIX',
                    value: '0'.repeat(35)
                }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;