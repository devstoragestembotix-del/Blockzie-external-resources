/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const color = '#D39DDB';
    const secondaryColour = '#BA55D3';

    // arduinoEsp32 / intermediateKit (AI & Robotics) / zappie
    // Hardware kit wiring: TRIG=IO17, ECHO=IO16 (swapped vs older 16/17 default).
    // Keep each field to a single option so users cannot pick the non-working pair.
    const esp32UltrasonicTrigPins = [
        ['IO17', '17']
    ];
    const esp32UltrasonicEchoPins = [
        ['IO16', '16']
    ];

    // arduinoNano / iotAiKit / iotAiKitnew (AI & IoT): kit port TRIG=D12, ECHO=D8
    const nanoUltrasonicPins = [
        ['D12', '12'],
        ['D8', '8'],
        ['A4', 'A4'],
        ['A5', 'A5']
    ];

    const ESP32_KIT_IDS = [
        'arduinoesp32', 'intermediatekit',
        'zappie', 'zappiekit_arduinosp32', 'zappiekit'
    ];
    const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew'];

    function getDeviceIdFromGlobals () {
        const parts = [];
        try {
            if (typeof window === 'undefined') {
                return '';
            }
            const w = window;
            if (w.Blockzie) {
                parts.push(w.Blockzie.deviceId, w.Blockzie.deviceType);
                if (w.Blockzie.device) {
                    parts.push(w.Blockzie.device.deviceId, w.Blockzie.device.id, w.Blockzie.device.type);
                }
            }
            if (w.openBlock) {
                parts.push(w.openBlock.deviceId, w.openBlock.deviceType);
            }
            if (w.vm && w.vm.runtime) {
                const rt = w.vm.runtime;
                parts.push(rt.deviceId, rt.deviceType, rt._deviceId);
                if (rt.device) {
                    parts.push(rt.device.deviceId, rt.device.id, rt.device.type);
                }
            }
            if (w.store && typeof w.store.getState === 'function') {
                const state = w.store.getState();
                const device = (state && (state.device ||
                    (state.gui && state.gui.device) ||
                    (state.scratchGui && state.scratchGui.device))) || null;
                if (device) {
                    parts.push(device.deviceId, device.id, device.type, device.name);
                }
            }
        } catch (e) {
            // ignore
        }
        return parts.filter(Boolean).map((v) => String(v).toLowerCase()).join(' ');
    }

    function getUIDeviceLabel () {
        if (typeof document === 'undefined') {
            return '';
        }
        try {
            const els = document.querySelectorAll('button, span, div, p, label, a');
            for (let i = 0; i < els.length; i++) {
                const el = els[i];
                if (el.children && el.children.length > 4) {
                    continue;
                }
                const text = (el.textContent || '').trim();
                if (/^zappie(\s+kit)?$/i.test(text)) {
                    return 'zappie';
                }
                if (/^ai\s*&\s*robotics(\s+kit)?$/i.test(text)) {
                    return 'intermediatekit';
                }
                if (/^ai\s*&\s*iot(\s+kit)?$/i.test(text)) {
                    return 'iotaikit';
                }
            }
        } catch (e) {
            // ignore
        }
        return '';
    }

    function getWorkspaceDeviceId () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (ws) {
                const fromWs = String(
                    ws.deviceId || ws.deviceType ||
                    (typeof ws.getDeviceId === 'function' ? ws.getDeviceId() : '') ||
                    (ws.options && (ws.options.deviceId || ws.options.deviceType)) ||
                    (ws.device && (ws.device.deviceId || ws.device.id || ws.device.type)) ||
                    ''
                ).toLowerCase();
                if (fromWs) {
                    return fromWs;
                }
            }
            if (typeof Blockly !== 'undefined') {
                const fromBlockly = String(
                    (Blockly.Device && (Blockly.Device.deviceId || Blockly.Device.id)) ||
                    Blockly.deviceId ||
                    ''
                ).toLowerCase();
                if (fromBlockly) {
                    return fromBlockly;
                }
            }
            return getDeviceIdFromGlobals();
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
            if (/^IO\d+/i.test(label)) {
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

    function isZappieUltrasonicKit () {
        const uiLabel = getUIDeviceLabel();
        if (uiLabel === 'zappie') {
            return true;
        }
        const deviceId = getWorkspaceDeviceId();
        return deviceIdMatchesList(deviceId, ['zappie', 'zappiekit', 'zappiekit_arduinosp32']);
    }

    function isEsp32UltrasonicKit () {
        if (isZappieUltrasonicKit()) {
            return true;
        }
        const uiLabel = getUIDeviceLabel();
        if (uiLabel === 'intermediatekit') {
            return true;
        }
        if (uiLabel === 'iotaikit') {
            return false;
        }
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

    function getUltrasonicTrigPinOptions () {
        return isEsp32UltrasonicKit() ? esp32UltrasonicTrigPins : nanoUltrasonicPins;
    }

    function getUltrasonicEchoPinOptions () {
        return isEsp32UltrasonicKit() ? esp32UltrasonicEchoPins : nanoUltrasonicPins;
    }

    function getDefaultUltrasonicTrigPin () {
        return isEsp32UltrasonicKit() ? '17' : '12';
    }

    function getDefaultUltrasonicEchoPin () {
        return isEsp32UltrasonicKit() ? '16' : '8';
    }

    function pickAlternateUltrasonicPin (avoidPin, preferDefault, pinOptions) {
        const validPins = pinOptions.map((entry) => String(entry[1]));
        const avoid = String(avoidPin || '');
        if (preferDefault && preferDefault !== avoid && validPins.includes(preferDefault)) {
            return preferDefault;
        }
        const alternate = validPins.find((pin) => pin !== avoid);
        return alternate || preferDefault || validPins[0] || avoid;
    }

    function applyUltrasonicKitDefaults (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const trigField = block.getField('TRIG');
        const echoField = block.getField('ECHO');
        if (!trigField || !echoField) {
            return;
        }
        // AI & IoT: TRIG=D12, ECHO=D8 | ESP32 kit: TRIG=IO17, ECHO=IO16
        trigField.setValue(getDefaultUltrasonicTrigPin());
        echoField.setValue(getDefaultUltrasonicEchoPin());
    }

    function fixUltrasonicPinFields (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const trigField = block.getField('TRIG');
        const echoField = block.getField('ECHO');
        const validTrigPins = getUltrasonicTrigPinOptions().map((entry) => String(entry[1]));
        const validEchoPins = getUltrasonicEchoPinOptions().map((entry) => String(entry[1]));

        if (trigField && !validTrigPins.includes(String(trigField.getValue() || ''))) {
            trigField.setValue(getDefaultUltrasonicTrigPin());
        }
        if (echoField && !validEchoPins.includes(String(echoField.getValue() || ''))) {
            echoField.setValue(getDefaultUltrasonicEchoPin());
        }
        if (trigField && echoField && String(trigField.getValue()) === String(echoField.getValue())) {
            // Both landed on same option (e.g. first list item) — use kit pair.
            applyUltrasonicKitDefaults(block);
        }
    }

    function makeUltrasonicPinValidator (getDefaultPin, otherFieldName, getPinOptions) {
        return function (newValue) {
            const validPins = getPinOptions().map((entry) => String(entry[1]));
            const value = String(newValue || '');
            if (!validPins.includes(value)) {
                return getDefaultPin();
            }
            // Nano only: if user picks the other field's pin, swap instead of rejecting.
            // ESP32 fields are single-option (fixed kit wiring), so no swap needed.
            if (!isEsp32UltrasonicKit() && otherFieldName && this.sourceBlock_) {
                const otherField = this.sourceBlock_.getField(otherFieldName);
                if (otherField && String(otherField.getValue()) === value) {
                    const oldValue = String(this.getValue() || '');
                    const otherDefault = otherFieldName === 'ECHO' ?
                        getDefaultUltrasonicEchoPin() : getDefaultUltrasonicTrigPin();
                    const otherOptions = otherFieldName === 'ECHO' ?
                        getUltrasonicEchoPinOptions() : getUltrasonicTrigPinOptions();
                    const swapTo = (oldValue && oldValue !== value && validPins.includes(oldValue)) ?
                        oldValue :
                        pickAlternateUltrasonicPin(value, otherDefault, otherOptions);
                    otherField.setValue(swapTo);
                }
            }
            return value;
        };
    }

    Blockly.Blocks.ultrasonic_readDistance = {
        init: function () { /* eslint-disable-line func-style */
            this.jsonInit({
                message0: Blockly.Msg.ULTRASONIC_READ_DISTANCE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'TRIG',
                        options: function () {
                            return getUltrasonicTrigPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'ECHO',
                        options: function () {
                            return getUltrasonicEchoPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'UNIT',
                        options: [
                            ['cm', 'CM'],
                            ['inch', 'INC']]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
            const trigField = this.getField('TRIG');
            const echoField = this.getField('ECHO');
            if (trigField) {
                trigField.setValidator(makeUltrasonicPinValidator(
                    getDefaultUltrasonicTrigPin, 'ECHO', getUltrasonicTrigPinOptions));
            }
            if (echoField) {
                echoField.setValidator(makeUltrasonicPinValidator(
                    getDefaultUltrasonicEchoPin, 'TRIG', getUltrasonicEchoPinOptions));
            }
            applyUltrasonicKitDefaults(this);
            // After toolbox/XML apply, only repair invalid/orphan pins — do not
            // overwrite a valid user/saved choice (e.g. A4/A5).
            const prevOnChange = this.onchange;
            this.setOnChange(function (event) {
                if (typeof prevOnChange === 'function') {
                    prevOnChange.call(this, event);
                }
                if (!event || event.blockId !== this.id) {
                    return;
                }
                fixUltrasonicPinFields(this);
            });
        }
    };


    return Blockly;
}

exports = addBlocks;
