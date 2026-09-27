/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const color = '#0066CC';
    const secondaryColour = '#005AB5';

    // Kit I2C: ESP32 SDA=21 SCL=22 | Nano/Uno SDA=A4 SCL=A5
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

    Blockly.Blocks.mpu6050_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.MPU6050_INIT,
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
                    },
                    {
                        type: 'field_dropdown',
                        name: 'AR',
                        options: [
                            ['2G', 'MPU6050_RANGE_2_G'],
                            ['4G', 'MPU6050_RANGE_4_G'],
                            ['8G', 'MPU6050_RANGE_8_G'],
                            ['16G', 'MPU6050_RANGE_16_G']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'GR',
                        options: [
                            ['250°/s', 'MPU6050_RANGE_250_DEG'],
                            ['500°/s', 'MPU6050_RANGE_500_DEG'],
                            ['1000°/s', 'MPU6050_RANGE_1000_DEG'],
                            ['2000°/s', 'MPU6050_RANGE_2000_DEG']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'FB',
                        options: [
                            ['260Hz', 'MPU6050_BAND_260_HZ'],
                            ['184Hz', 'MPU6050_BAND_184_HZ'],
                            ['94Hz', 'MPU6050_BAND_94_HZ'],
                            ['44Hz', 'MPU6050_BAND_44_HZ'],
                            ['21Hz', 'MPU6050_BAND_21_HZ'],
                            ['10Hz', 'MPU6050_BAND_10_HZ'],
                            ['5Hz', 'MPU6050_BAND_5_HZ']
                        ]
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

    Blockly.Blocks.mpu6050_readData = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.MPU6050_READDATA,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.mpu6050_acceleration = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.MPU6050_ACCELERATION,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'AXIS',
                        options: [
                            ['x', 'x'],
                            ['y', 'y'],
                            ['z', 'z']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.mpu6050_gyro = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.MPU6050_GYRO,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'AXIS',
                        options: [
                            ['x', 'x'],
                            ['y', 'y'],
                            ['z', 'z']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };


    Blockly.Blocks.mpu6050_temperature = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.MPU6050_TEMPERATURE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
