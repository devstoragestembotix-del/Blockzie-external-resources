/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const color = '#F08080';
    const secondaryColour = '#CD5C5C';

    const esp32SdaPins = [['IO21', '21']];
    const esp32SclPins = [['IO22', '22']];
    const nanoSdaPins = [['A4', 'A4']];
    const nanoSclPins = [['A5', 'A5']];

    const ESP32_KIT_IDS = ['arduinoesp32', 'intermediatekit'];
    const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew', 'arduinouno'];

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

    function isEsp32I2cKit () {
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

    function getSdaPinOptions () {
        return isEsp32I2cKit() ? esp32SdaPins : nanoSdaPins;
    }

    function getSclPinOptions () {
        return isEsp32I2cKit() ? esp32SclPins : nanoSclPins;
    }

    function getDefaultSdaPin () {
        return isEsp32I2cKit() ? '21' : 'A4';
    }

    function getDefaultSclPin () {
        return isEsp32I2cKit() ? '22' : 'A5';
    }

    function applyI2cPinDefaults (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const sdaField = block.getField('SDA');
        const sclField = block.getField('SCL');
        if (sdaField) {
            sdaField.setValue(getDefaultSdaPin());
        }
        if (sclField) {
            sclField.setValue(getDefaultSclPin());
        }
    }

    function fixI2cPinFields (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const sdaField = block.getField('SDA');
        const sclField = block.getField('SCL');
        const validSda = getSdaPinOptions().map((entry) => String(entry[1]));
        const validScl = getSclPinOptions().map((entry) => String(entry[1]));
        if (sdaField && !validSda.includes(String(sdaField.getValue() || ''))) {
            sdaField.setValue(getDefaultSdaPin());
        }
        if (sclField && !validScl.includes(String(sclField.getValue() || ''))) {
            sclField.setValue(getDefaultSclPin());
        }
    }

    Blockly.Blocks.apds9960_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.APDS9960_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'SDA',
                        options: function () {
                            return getSdaPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'SCL',
                        options: function () {
                            return getSclPinOptions();
                        }
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            applyI2cPinDefaults(this);
            const prevOnChange = this.onchange;
            this.setOnChange(function (event) {
                if (typeof prevOnChange === 'function') {
                    prevOnChange.call(this, event);
                }
                if (!event || event.blockId !== this.id) {
                    return;
                }
                fixI2cPinFields(this);
            });
        }
    };

    Blockly.Blocks.apds9960_isGestureAvailable = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.APDS9960_ISGESTUREAVAILABLE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.apds9960_readGesture = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.APDS9960_READGESTURE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.apds9960_isGesture = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.APDS9960_ISGESTURE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'GESTURE',
                        options: [
                            [Blockly.Msg.APDS9960_GESTURE_UP, 'GESTURE_UP'],
                            [Blockly.Msg.APDS9960_GESTURE_DOWN, 'GESTURE_DOWN'],
                            [Blockly.Msg.APDS9960_GESTURE_LEFT, 'GESTURE_LEFT'],
                            [Blockly.Msg.APDS9960_GESTURE_RIGHT, 'GESTURE_RIGHT']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.apds9960_isProximityAvailable = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.APDS9960_ISPROXIMITYAVAILABLE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.apds9960_readProximity = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.APDS9960_READPROXIMITY,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
