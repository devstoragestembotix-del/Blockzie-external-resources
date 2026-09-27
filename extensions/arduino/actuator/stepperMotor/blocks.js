/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const color = '#0096FF';
    const secondaryColour = '#4DB8FF';

    // arduinoEsp32 / intermediateKit (AI & Robotics): DIR=16, STEP=17 (also 21/22)
    const esp32StepperPins = [
        ['D16', '16'],
        ['D17', '17'],
        ['D21', '21'],
        ['D22', '22']
    ];

    // arduinoNano / iotAiKit / iotAiKitnew (AI & IoT): DIR=8, STEP=12
    const nanoStepperPins = [
        ['D8', '8'],
        ['D12', '12']
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

    function isEsp32StepperKit () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS)) {
            return true;
        }
        if (deviceIdMatchesList(deviceId, NANO_KIT_IDS)) {
            return false;
        }

        const flyoutOpts = getFlyoutDigitalPinOptions();
        if (pinOptionsLookEsp32(flyoutOpts)) {
            return true;
        }
        if (pinOptionsLookNano(flyoutOpts)) {
            return false;
        }

        return false;
    }

    function getStepperPinOptions () {
        return isEsp32StepperKit() ? esp32StepperPins : nanoStepperPins;
    }

    function getDefaultDirPin () {
        const opts = getStepperPinOptions();
        return opts.length ? String(opts[0][1]) : (isEsp32StepperKit() ? '16' : '8');
    }

    function getDefaultStepPin () {
        const opts = getStepperPinOptions();
        if (opts.length > 1) {
            return String(opts[1][1]);
        }
        return opts.length ? String(opts[0][1]) : (isEsp32StepperKit() ? '17' : '12');
    }

    function stepperPinFieldOptions () {
        return function () {
            return getStepperPinOptions();
        };
    }

    function pickAlternateStepperPin (avoidPin, preferDefault) {
        const validPins = getStepperPinOptions().map((entry) => String(entry[1]));
        const avoid = String(avoidPin || '');
        if (preferDefault && preferDefault !== avoid && validPins.includes(preferDefault)) {
            return preferDefault;
        }
        const alternate = validPins.find((pin) => pin !== avoid);
        return alternate || preferDefault || validPins[0] || avoid;
    }

    function applyStepperKitDefaults (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const dirField = block.getField('DIRPIN');
        const stepField = block.getField('STEPPIN');
        if (!dirField || !stepField) {
            return;
        }
        dirField.setValue(getDefaultDirPin());
        stepField.setValue(getDefaultStepPin());
    }

    function fixStepperPinFields (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const dirField = block.getField('DIRPIN');
        const stepField = block.getField('STEPPIN');
        const validPins = getStepperPinOptions().map((entry) => String(entry[1]));

        if (dirField && !validPins.includes(String(dirField.getValue() || ''))) {
            dirField.setValue(getDefaultDirPin());
        }
        if (stepField && !validPins.includes(String(stepField.getValue() || ''))) {
            stepField.setValue(getDefaultStepPin());
        }
        if (dirField && stepField && String(dirField.getValue()) === String(stepField.getValue())) {
            applyStepperKitDefaults(block);
        }
    }

    function makeStepperPinValidator (getDefaultPin, otherFieldName) {
        return function (newValue) {
            const validPins = getStepperPinOptions().map((entry) => String(entry[1]));
            const value = String(newValue || '');
            if (!validPins.includes(value)) {
                return getDefaultPin();
            }
            if (otherFieldName && this.sourceBlock_) {
                const otherField = this.sourceBlock_.getField(otherFieldName);
                if (otherField && String(otherField.getValue()) === value) {
                    const oldValue = String(this.getValue() || '');
                    const otherDefault = otherFieldName === 'STEPPIN' ?
                        getDefaultStepPin() : getDefaultDirPin();
                    const swapTo = (oldValue && oldValue !== value && validPins.includes(oldValue)) ?
                        oldValue :
                        pickAlternateStepperPin(value, otherDefault);
                    otherField.setValue(swapTo);
                }
            }
            return value;
        };
    }

    Blockly.Blocks.stepper_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.STEPPER_INIT || 'init stepper motor dir pin %1 step pin %2 steps/rev %3',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'DIRPIN',
                        options: stepperPinFieldOptions()
                    },
                    {
                        type: 'field_dropdown',
                        name: 'STEPPIN',
                        options: stepperPinFieldOptions()
                    },
                    {
                        type: 'input_value',
                        name: 'STEPS',
                        check: 'Number'
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: color,
                secondaryColour: secondaryColour,
                tooltip: 'Initialize stepper motor pins and steps per revolution'
            });
            const dirField = this.getField('DIRPIN');
            const stepField = this.getField('STEPPIN');
            if (dirField) {
                dirField.setValidator(makeStepperPinValidator(getDefaultDirPin, 'STEPPIN'));
            }
            if (stepField) {
                stepField.setValidator(makeStepperPinValidator(getDefaultStepPin, 'DIRPIN'));
            }
            applyStepperKitDefaults(this);
            const prevOnChange = this.onchange;
            this.setOnChange(function (event) {
                if (typeof prevOnChange === 'function') {
                    prevOnChange.call(this, event);
                }
                if (!event || event.blockId !== this.id) {
                    return;
                }
                fixStepperPinFields(this);
            });
        }
    };

    Blockly.Blocks.stepper_rotate = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.STEPPER_ROTATE || 'rotate stepper direction %1 speed (µs) %2 steps %3',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'DIR',
                        options: [['clockwise', 'HIGH'], ['counterclockwise', 'LOW']]
                    },
                    {
                        type: 'input_value',
                        name: 'SPEED',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'STEPS',
                        check: 'Number'
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: color,
                secondaryColour: secondaryColour,
                tooltip: 'Rotate the stepper motor with given direction and speed'
            });
        }
    };

    return Blockly;
}
exports = addBlocks;
