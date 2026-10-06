/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#5E35B1';
    const secondaryColour = '#B39DDB';

    // arduinoEsp32 / intermediateKit (AI & Robotics)
    const esp32TiltSensorPins = [
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
    const nanoTiltSensorPins = [
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

    function isEsp32TiltSensorKit () {
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

    function getTiltSensorPinOptions () {
        return isEsp32TiltSensorKit() ? esp32TiltSensorPins : nanoTiltSensorPins;
    }

    function getDefaultTiltSensorPin () {
        return '5';
    }

    function fixTiltSensorPinField (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const validPins = getTiltSensorPinOptions().map((entry) => String(entry[1]));
        const current = String(pinField.getValue() || '');
        if (!validPins.includes(current)) {
            pinField.setValue(getDefaultTiltSensorPin());
        }
    }

    // ================= INIT =================
    Blockly.Blocks.tiltsensor_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TILTSENSOR_INIT,
                args0: [{
                    type: 'field_dropdown',
                    name: 'PIN',
                    options: function () {
                        return getTiltSensorPinOptions();
                    }
                }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            const pinField = this.getField('PIN');
            if (pinField) {
                pinField.setValidator(function (newValue) {
                    const validPins = getTiltSensorPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultTiltSensorPin();
                });
            }
            fixTiltSensorPinField(this);
            // Toolbox/XML can set PIN after init; re-sync orphan values like "2".
            const prevOnChange = this.onchange;
            this.setOnChange(function (event) {
                if (typeof prevOnChange === 'function') {
                    prevOnChange.call(this, event);
                }
                if (!event || event.blockId === this.id) {
                    fixTiltSensorPinField(this);
                }
            });
        }
    };

    // ================= READ (Tilt detected?) =================
    Blockly.Blocks.tiltsensor_read = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TILTSENSOR_READ,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    // ================= READ RAW =================
    Blockly.Blocks.tiltsensor_readRaw = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.TILTSENSOR_READRAW,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    return Blockly;
}

module.exports = addBlocks;
