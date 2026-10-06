/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const color = '#42CCFF';
    const secondaryColour = '#00BFFF';

    // arduinoEsp32 / intermediateKit (AI & Robotics)
    const esp32DhtPins = [
        ['D3', '3'],
        ['D4', '4'],
        ['D5', '5'],
        ['D12', '12'],
        ['D25', '25'],
        ['D26', '26']
    ];

    // arduinoNano / iotAiKit / iotAiKitnew (AI & IoT)
    const nanoDhtPins = [
        ['4', '4'],
        ['5', '5'],
        ['6', '6'],
        ['7', '7'],
        ['10', '10'],
        ['11', '11'],
        ['12', '12']
    ];

    const ESP32_KIT_IDS = ['arduinoesp32', 'intermediatekit', 'zappie'];
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

    function isEsp32DhtKit () {
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

    function getDhtPinOptions () {
        return isEsp32DhtKit() ? esp32DhtPins : nanoDhtPins;
    }

    function getDefaultDhtPin () {
        return '5';
    }

    function fixDhtPinField (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const validPins = getDhtPinOptions().map((entry) => String(entry[1]));
        const current = String(pinField.getValue() || '');
        if (!validPins.includes(current)) {
            pinField.setValue(getDefaultDhtPin());
        }
    }

    Blockly.Blocks.dht_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.DHT_INIT,
                args0: [
                    {
                        type: 'input_value',
                        name: 'NO'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: function () {
                            return getDhtPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'MODEL',
                        options: [
                            ['dht11', '11'],
                            ['dht21', '21'],
                            ['dht22', '22']]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            const pinField = this.getField('PIN');
            if (pinField) {
                pinField.setValidator(function (newValue) {
                    const validPins = getDhtPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultDhtPin();
                });
            }
            fixDhtPinField(this);
            // Toolbox/XML can set PIN after init; re-sync orphan values like "2".
            const prevOnChange = this.onchange;
            this.setOnChange(function (event) {
                if (typeof prevOnChange === 'function') {
                    prevOnChange.call(this, event);
                }
                if (!event || event.blockId === this.id) {
                    fixDhtPinField(this);
                }
            });
        }
    };

    Blockly.Blocks.dht_readHumidity = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.DHT_READ_HUMIDITY,
                args0: [
                    {
                        type: 'input_value',
                        name: 'NO'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };


    Blockly.Blocks.dht_readTemperature = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.DHT_READ_TEMPERATURE,
                args0: [
                    {
                        type: 'input_value',
                        name: 'NO'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'UNIT',
                        options: [
                            ['℃', 'false'],
                            ['℉', 'true']]
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
