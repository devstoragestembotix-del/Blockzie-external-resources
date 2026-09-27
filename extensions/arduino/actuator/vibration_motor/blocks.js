/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#FF7043';
    const secondaryColour = '#F4511E';

    // arduinoEsp32 / intermediateKit (AI & Robotics)
    const esp32VibrationMotorPins = [
        ['D1', '1'],
        ['D3', '3'],
        ['D4', '4'],
        ['D5', '5'],
        ['D14', '14'],
        ['D25', '25'],
        ['D26', '26'],
        ['D32', '32'],
        ['D33', '33']
    ];

    // arduinoNano / iotAiKit / iotAiKitnew (AI & IoT)
    const nanoVibrationMotorPins = [
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

    function isEsp32VibrationMotorKit () {
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

    function getVibrationMotorPinOptions () {
        return isEsp32VibrationMotorKit() ? esp32VibrationMotorPins : nanoVibrationMotorPins;
    }

    function getDefaultVibrationMotorPin () {
        return '5';
    }

    function vibrationMotorPinFieldOptions () {
        return function () {
            return getVibrationMotorPinOptions();
        };
    }

    function fixVibrationMotorPinField (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const validPins = getVibrationMotorPinOptions().map((entry) => String(entry[1]));
        const current = String(pinField.getValue() || '');
        if (!validPins.includes(current)) {
            pinField.setValue(getDefaultVibrationMotorPin());
        }
    }

    function attachVibrationMotorPinField (block) {
        const pinField = block.getField('PIN');
        if (pinField) {
            pinField.setValidator(function (newValue) {
                const validPins = getVibrationMotorPinOptions().map((entry) => String(entry[1]));
                const value = String(newValue || '');
                return validPins.includes(value) ? value : getDefaultVibrationMotorPin();
            });
        }
        fixVibrationMotorPinField(block);
    }

    Blockly.Blocks.vibrationmotor_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VIBRATIONMOTOR_INIT,
                args0: [{
                    type: 'field_dropdown',
                    name: 'PIN',
                    options: vibrationMotorPinFieldOptions()
                }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachVibrationMotorPinField(this);
        }
    };

    Blockly.Blocks.vibrationmotor_on = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VIBRATIONMOTOR_ON,
                args0: [{
                    type: 'field_dropdown',
                    name: 'PIN',
                    options: vibrationMotorPinFieldOptions()
                }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachVibrationMotorPinField(this);
        }
    };

    Blockly.Blocks.vibrationmotor_off = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VIBRATIONMOTOR_OFF,
                args0: [{
                    type: 'field_dropdown',
                    name: 'PIN',
                    options: vibrationMotorPinFieldOptions()
                }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachVibrationMotorPinField(this);
        }
    };

    Blockly.Blocks.vibrationmotor_setPower = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VIBRATIONMOTOR_SETPOWER,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: vibrationMotorPinFieldOptions()
                    },
                    {
                        type: 'input_value',
                        name: 'POWER',
                        check: 'Number'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachVibrationMotorPinField(this);
        }
    };

    Blockly.Blocks.vibrationmotor_vibrateMs = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VIBRATIONMOTOR_VIBRATEMS,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: vibrationMotorPinFieldOptions()
                    },
                    {
                        type: 'input_value',
                        name: 'MS',
                        check: 'Number'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachVibrationMotorPinField(this);
        }
    };

    return Blockly;
}

module.exports = addBlocks;
