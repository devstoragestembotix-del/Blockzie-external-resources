/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#FF6F00';
    const secondaryColour = '#E65100';

    // Include D2/D4 used by Pick & Place / DIY Otto servo wiring
    const nanoServoPins = [
        ['D2', '2'],
        ['D3', '3'],
        ['D4', '4'],
        ['D5', '5'],
        ['D6', '6'],
        ['D7', '7'],
        ['D8', '8'],
        ['D9', '9'],
        ['D10', '10'],
        ['D11', '11'],
        ['A0', 'A0'],
        ['A1', 'A1'],
        ['A2', 'A2'],
        ['A3', 'A3'],
        ['A4', 'A4'],
        ['A5', 'A5'],
        ['A6', 'A6'],
        ['A7', 'A7']
    ];

    // AI & Robotics: S1–S4 each has 2 signal pins
    const esp32ServoPins = [
        ['S1-A (D23)', '23'],
        ['S1-B (D15)', '15'],
        ['S2-A (D27)', '27'],
        ['S2-B (D19)', '19'],
        ['S3-A (D12)', '12'],
        ['S3-B (D18)', '18'],
        ['S4-A (D13)', '13'],
        ['S4-B (D2)', '2']
    ];

    const ESP32_KIT_IDS = ['arduinoesp32', 'intermediatekit'];
    const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew', 'ottorobot', 'ottorobotnew'];

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

    function getFlyoutDigitalPinOptions () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            const flyout = ws && ws.getFlyout && ws.getFlyout();
            const items = flyout && flyout.getFlyoutItems ? flyout.getFlyoutItems() : [];
            const blocks = items.filter(it => it && typeof it === 'object' && typeof it.getField === 'function');
            const digital = blocks.find(b =>
                b.type === 'arduino_pin_setDigitalOutput' ||
                b.type === 'arduino_pin_readDigitalPin' ||
                b.type === 'arduino_pin_setPinMode'
            );
            if (digital && digital.getField('PIN') && digital.getField('PIN').getOptions) {
                return digital.getField('PIN').getOptions();
            }
        } catch (e) {
            // ignore
        }
        return null;
    }

    function mergePinOptions (primary, fallback) {
        const seen = {};
        const result = [];
        const pushAll = (opts) => {
            if (!Array.isArray(opts)) {
                return;
            }
            opts.forEach((entry) => {
                const value = String(entry[1] != null ? entry[1] : entry[0] || '').trim();
                if (!value || seen[value]) {
                    return;
                }
                seen[value] = true;
                result.push([String(entry[0] || value), value]);
            });
        };
        pushAll(fallback);
        pushAll(primary);
        return result.length ? result : fallback;
    }

    function getServoPinOptions () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS)) {
            return esp32ServoPins;
        }
        // Always keep Nano/Otto servo pins (D2/D4/D5…) even if flyout list is shorter
        return mergePinOptions(getFlyoutDigitalPinOptions(), nanoServoPins);
    }

    function getDefaultServoPin () {
        const opts = getServoPinOptions();
        if (opts && opts.length) {
            return String(opts[0][1]);
        }
        return '9';
    }

    function servoPinFieldOptions () {
        return function () {
            return getServoPinOptions();
        };
    }

    function syncPinField (block) {
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const opts = getServoPinOptions().map(e => String(e[1]));
        if (!opts.includes(String(pinField.getValue()))) {
            pinField.setValue(getDefaultServoPin());
        }
    }

    function bindPinField (block) {
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        pinField.setValidator(function (newValue) {
            const opts = getServoPinOptions().map(e => String(e[1]));
            const v = String(newValue || '');
            return opts.includes(v) ? v : getDefaultServoPin();
        });
        syncPinField(block);
        // Toolbox/XML can set PIN after init; re-sync so orphan values like "23" never show.
        const prevOnChange = block.onchange;
        block.setOnChange(function (event) {
            if (typeof prevOnChange === 'function') {
                prevOnChange.call(this, event);
            }
            if (!event || event.blockId === this.id) {
                syncPinField(this);
            }
        });
    }

    Blockly.Blocks.smooth_servo_attach = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.SMOOTHSERVO_ATTACH,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: servoPinFieldOptions()
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            bindPinField(this);
        }
    };

    Blockly.Blocks.smooth_servo_write = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.SMOOTHSERVO_WRITE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: servoPinFieldOptions()
                    },
                    {
                        type: 'input_value',
                        name: 'ANGLE'
                        // no check: Scratch variables are untyped and won't snap into check:'Number'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            bindPinField(this);
        }
    };

    Blockly.Blocks.smooth_servo_move = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.SMOOTHSERVO_SMOOTH,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: servoPinFieldOptions()
                    },
                    {
                        type: 'input_value',
                        name: 'ANGLE'
                    },
                    {
                        type: 'input_value',
                        name: 'INTERVAL'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            bindPinField(this);
        }
    };

    return Blockly;
}

exports = addBlocks;
