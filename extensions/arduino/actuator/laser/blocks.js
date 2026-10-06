/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#C62828';
    const secondaryColour = '#EF5350';

    const portOptions = [
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
        ['5', '5'],
        ['6', '6'],
        ['7', '7'],
        ['8', '8']
    ];

    // arduinoEsp32 / intermediateKit (AI & Robotics)
    const esp32LaserPins = [
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
    const nanoLaserPins = [
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

    function isEsp32LaserKit () {
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

    function getLaserPinOptions () {
        return isEsp32LaserKit() ? esp32LaserPins : nanoLaserPins;
    }

    function getDefaultLaserPin () {
        return isEsp32LaserKit() ? '5' : '5';
    }

    function fixLaserPinField (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const validPins = getLaserPinOptions().map((entry) => String(entry[1]));
        const current = String(pinField.getValue() || '');
        if (!validPins.includes(current)) {
            pinField.setValue(getDefaultLaserPin());
        }
    }

    const portField = () => ({
        type: 'field_dropdown',
        name: 'PORT',
        options: portOptions
    });

    Blockly.Blocks.laser_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_INIT,
                args0: [
                    portField(),
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: function () {
                            return getLaserPinOptions();
                        }
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            const pinField = this.getField('PIN');
            if (pinField) {
                pinField.setValidator(function (newValue) {
                    const validPins = getLaserPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultLaserPin();
                });
            }
            fixLaserPinField(this);
        }
    };

    Blockly.Blocks.laser_setState = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_SETSTATE,
                args0: [
                    portField(),
                    {
                        type: 'field_dropdown',
                        name: 'STATE',
                        options: [
                            ['ON', 'ON'],
                            ['OFF', 'OFF']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.laser_onForSecs = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_ONFORSECS,
                args0: [
                    portField(),
                    {
                        type: 'input_value',
                        name: 'SECS',
                        check: 'Number'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.laser_pulseMs = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_PULSEMS,
                args0: [
                    portField(),
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
        }
    };

    Blockly.Blocks.laser_blinkEvery = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_BLINKEVERY,
                args0: [
                    portField(),
                    {
                        type: 'input_value',
                        name: 'MS',
                        check: 'Number'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement'],
                tooltip: Blockly.Msg.LASER_BLINKEVERY_TOOLTIP
            });
        }
    };

    Blockly.Blocks.laser_blinkTimes = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_BLINKTIMES,
                args0: [
                    portField(),
                    {
                        type: 'input_value',
                        name: 'TIMES',
                        check: 'Number'
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
        }
    };

    Blockly.Blocks.laser_sos = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_SOS,
                args0: [portField()],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.laser_setPower = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_SETPOWER,
                args0: [
                    portField(),
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
        }
    };

    Blockly.Blocks.laser_setBrightnessPercent = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_SETBRIGHTNESSPCT,
                args0: [
                    portField(),
                    {
                        type: 'input_value',
                        name: 'PCT',
                        check: 'Number'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.laser_fade = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_FADE,
                args0: [
                    portField(),
                    {
                        type: 'input_value',
                        name: 'FROM',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'TO',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'SECS',
                        check: 'Number'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.laser_isOn = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_ISON,
                args0: [portField()],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.laser_getPwm = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.LASER_GETPWM,
                args0: [portField()],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    return Blockly;
}

module.exports = addBlocks;
