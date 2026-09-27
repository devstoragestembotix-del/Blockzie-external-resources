/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function createDevicePinHelper (Blockly) {
    function deviceIdMatchesList (deviceId, ids) {
        const id = String(deviceId || '').toLowerCase();
        if (!id) {
            return false;
        }
        return ids.some((kitId) => id === kitId || id.includes(kitId));
    }

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

    function getWorkspaceDeviceId () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (ws) {
                const fromWs = String(
                    ws.deviceId || ws.deviceType ||
                    (typeof ws.getDeviceId === 'function' ? ws.getDeviceId() : '') ||
                    (ws.options && (ws.options.deviceId || ws.options.deviceType)) ||
                    (ws.device && (ws.device.deviceId || ws.device.id || ws.device.type)) ||
                    (ws.target && (ws.target.deviceId || ws.target.id)) ||
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
            const fromGlobals = getDeviceIdFromGlobals();
            if (fromGlobals) {
                return fromGlobals;
            }
        } catch (e) {
            return '';
        }
        return '';
    }

    function configurePinDropdown (block, fieldName, getOptionsFn, getDefaultFn) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const pinField = block.getField(fieldName);
        if (!pinField) {
            return;
        }
        const generator = function () {
            return getOptionsFn();
        };
        if (typeof pinField.menuGenerator_ !== 'undefined') {
            pinField.menuGenerator_ = generator;
        }
        if (typeof pinField.setOptions === 'function') {
            pinField.setOptions(getOptionsFn());
        }
        pinField.setValidator(function (newValue) {
            const validPins = getOptionsFn().map((entry) => String(entry[1]));
            const value = String(newValue || '');
            return validPins.includes(value) ? value : getDefaultFn();
        });
        const options = getOptionsFn();
        const validPins = options.map((entry) => String(entry[1]));
        const current = String(pinField.getValue() || '');
        if (!validPins.includes(current)) {
            pinField.setValue(getDefaultFn());
        }
    }

    function getUIDeviceLabel () {
        if (typeof document === 'undefined') {
            return '';
        }
        try {
            const labeled = document.querySelector(
                '[class*="device"], [class*="Device"], [data-device], button[title], .menu-bar_device'
            );
            const candidates = labeled
                ? [labeled]
                : Array.prototype.slice.call(document.querySelectorAll('button')).slice(0, 40);
            for (let i = 0; i < candidates.length; i++) {
                const text = (candidates[i].textContent || '').trim();
                if (/^zappie(\s+kit)?$/i.test(text)) {
                    return 'zappie';
                }
                if (/^ai\s*&\s*robotics(\s+kit)?$/i.test(text)) {
                    return 'intermediatekit';
                }
            }
        } catch (e) {
            // ignore
        }
        return '';
    }

    function isZappieKit (zappieKitIds) {
        const ids = zappieKitIds || [
            'zappie',
            'zappiekit_arduinosp32',
            'zappiekit'
        ];
        const uiLabel = getUIDeviceLabel();
        if (uiLabel === 'intermediatekit') {
            return false;
        }
        if (uiLabel === 'zappie') {
            return true;
        }
        const deviceId = getWorkspaceDeviceId();
        if (deviceId) {
            if (deviceId.includes('zappiekit') ||
                deviceIdMatchesList(deviceId, ids)) {
                return true;
            }
            if (/\bzappie\b/.test(deviceId)) {
                return true;
            }
        }
        return false;
    }

    return {
        deviceIdMatchesList,
        getWorkspaceDeviceId,
        configurePinDropdown,
        isZappieKit
    };
}

function addBlocks (Blockly) {
    const color = '#00897B';
    const secondaryColour = '#80CBC4';

    const {
        deviceIdMatchesList,
        getWorkspaceDeviceId,
        configurePinDropdown
    } = createDevicePinHelper(Blockly);

    const joystickIdOptions = [
        ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
        ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8']
    ];

    // arduinoEsp32 / intermediateKit (AI & Robotics): fixed RJ11 port pins only
    const esp32JoystickXPins = [
        ['D36', '36']
    ];
    const esp32JoystickYPins = [
        ['D39', '39']
    ];

    const esp32LegacyJoystickXPin = '36';
    const esp32LegacyJoystickYPin = '39';

    // arduinoNano / iotAiKit / iotAiKitnew (AI & IoT): analog A0–A7
    const nanoJoystickXPins = [
        ['A0', 'A0'], ['A1', 'A1'], ['A2', 'A2'], ['A3', 'A3'],
        ['A4', 'A4'], ['A5', 'A5'], ['A6', 'A6'], ['A7', 'A7']
    ];
    const nanoJoystickYPins = [
        ['A0', 'A0'], ['A1', 'A1'], ['A2', 'A2'], ['A3', 'A3'],
        ['A4', 'A4'], ['A5', 'A5'], ['A6', 'A6'], ['A7', 'A7']
    ];

    const ESP32_KIT_IDS = ['arduinoesp32', 'intermediatekit'];
    const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew'];

    function isLegacyAnalogLabel (pinVal) {
        return /^A\d+$/i.test(String(pinVal || '').trim());
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

    function isEsp32JoystickKit () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS)) {
            return true;
        }
        if (deviceIdMatchesList(deviceId, NANO_KIT_IDS)) {
            return false;
        }
        const id = String(deviceId || '').toLowerCase();
        if (/robotics/.test(id) && !/iot/.test(id)) {
            return true;
        }
        if (/ai\s*&\s*iot/.test(id) || /iotaikit/.test(id)) {
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

    function getJoystickXPinOptions () {
        return isEsp32JoystickKit() ? esp32JoystickXPins : nanoJoystickXPins;
    }

    function getJoystickYPinOptions () {
        return isEsp32JoystickKit() ? esp32JoystickYPins : nanoJoystickYPins;
    }

    function isNanoAnalogPin (pinVal) {
        return /^A[0-7]$/i.test(String(pinVal || '').trim());
    }

    function migrateJoystickXPin (pinVal) {
        const value = String(pinVal || '');
        if (isEsp32JoystickKit()) {
            if (isLegacyAnalogLabel(value) || value !== esp32LegacyJoystickXPin) {
                return esp32LegacyJoystickXPin;
            }
            return value;
        }
        if (!isNanoAnalogPin(value)) {
            return 'A0';
        }
        return value.toUpperCase();
    }

    function migrateJoystickYPin (pinVal) {
        const value = String(pinVal || '');
        if (isEsp32JoystickKit()) {
            if (isLegacyAnalogLabel(value) || value !== esp32LegacyJoystickYPin) {
                return esp32LegacyJoystickYPin;
            }
            return value;
        }
        if (!isNanoAnalogPin(value)) {
            return 'A1';
        }
        return value.toUpperCase();
    }

    function getDefaultJoystickXPin () {
        const opts = getJoystickXPinOptions();
        return opts.length ? String(opts[0][1]) : (isEsp32JoystickKit() ? '36' : 'A0');
    }

    function getDefaultJoystickYPin () {
        const opts = getJoystickYPinOptions();
        return opts.length ? String(opts[0][1]) : (isEsp32JoystickKit() ? '39' : 'A1');
    }

    /** Nano 0–1023 scale; ESP32 0–4095 scale (matches JOY_ADC_MAX in generator). */
    function getDefaultDeadzone () {
        return isEsp32JoystickKit() ? 164 : 40;
    }

    function getDefaultMoveThr () {
        // Nano/Uno Project 2: LOW=200, HIGH=800 (0–1023 scale)
        return isEsp32JoystickKit() ? 819 : 200;
    }

    function getDefaultHighThr () {
        return isEsp32JoystickKit() ? 2730 : 800;
    }

    const nanoContinuousAnalogPins = [
        ['A0', 'A0'], ['A1', 'A1'], ['A2', 'A2'], ['A3', 'A3'],
        ['A4', 'A4'], ['A5', 'A5'], ['A6', 'A6'], ['A7', 'A7']
    ];
    const esp32ContinuousAnalogPins = [
        ['D36', '36'], ['D39', '39'],
        ['D32', '32'], ['D33', '33'], ['D34', '34'], ['D35', '35']
    ];
    const nanoContinuousServoPins = [
        ['D2', '2'], ['D3', '3'], ['D4', '4'], ['D5', '5'], ['D6', '6'],
        ['D9', '9'], ['D10', '10'], ['D11', '11']
    ];
    const esp32ContinuousServoPins = [
        ['D5', '5'], ['D14', '14'], ['D25', '25'],
        ['D26', '26'], ['D32', '32'], ['D33', '33']
    ];

    function getContinuousAnalogPinOptions () {
        return isEsp32JoystickKit() ? esp32ContinuousAnalogPins : nanoContinuousAnalogPins;
    }

    function getContinuousServoPinOptions () {
        return isEsp32JoystickKit() ? esp32ContinuousServoPins : nanoContinuousServoPins;
    }

    function getDefaultContinuousAnalogPin () {
        const opts = getContinuousAnalogPinOptions();
        return opts.length ? String(opts[0][1]) : (isEsp32JoystickKit() ? '36' : 'A0');
    }

    function getDefaultContinuousServoPin () {
        const opts = getContinuousServoPinOptions();
        return opts.length ? String(opts[0][1]) : (isEsp32JoystickKit() ? '5' : '3');
    }

    function getInitAxis (block) {
        const axis = block && typeof block.getFieldValue === 'function' ?
            String(block.getFieldValue('AXIS') || 'X') : 'X';
        return axis === 'Y' ? 'Y' : 'X';
    }

    function getInitPinOptions (block) {
        return getInitAxis(block) === 'Y' ? getJoystickYPinOptions() : getJoystickXPinOptions();
    }

    function getInitDefaultPin (block) {
        return getInitAxis(block) === 'Y' ? getDefaultJoystickYPin() : getDefaultJoystickXPin();
    }

    function migrateInitPin (block, pinVal) {
        return getInitAxis(block) === 'Y' ?
            migrateJoystickYPin(pinVal) :
            migrateJoystickXPin(pinVal);
    }

    function fixJoystickPinFields (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }

        if (block.getField('PIN')) {
            configurePinDropdown(
                block, 'PIN',
                function () {
                    return getInitPinOptions(block);
                },
                function () {
                    return getInitDefaultPin(block);
                }
            );
            const pinField = block.getField('PIN');
            if (pinField) {
                pinField.setValue(migrateInitPin(block, pinField.getValue()));
            }
            return;
        }

        configurePinDropdown(block, 'X_PIN', getJoystickXPinOptions, getDefaultJoystickXPin);
        configurePinDropdown(block, 'Y_PIN', getJoystickYPinOptions, getDefaultJoystickYPin);

        const xField = block.getField('X_PIN');
        const yField = block.getField('Y_PIN');
        if (xField) {
            xField.setValue(migrateJoystickXPin(xField.getValue()));
        }
        if (yField) {
            yField.setValue(migrateJoystickYPin(yField.getValue()));
        }
    }

    const KIT_SCALE_DEFAULTS = {
        DZ: [40, 164],
        LOW: [200, 300, 819],
        HIGH: [700, 800, 2730],
        DEADZONE: [40, 164]
    };

    function isFlyoutBlock (block) {
        try {
            return !!(block && (block.isInFlyout ||
                (block.workspace && block.workspace.isFlyout)));
        } catch (e) {
            return false;
        }
    }

    function isKitScaleDefaultValue (kind, raw) {
        const n = parseInt(raw, 10);
        const known = KIT_SCALE_DEFAULTS[kind] || [];
        return Number.isFinite(n) && known.indexOf(n) !== -1;
    }

    function setKitShadowNumber (block, inputName, value, kind) {
        if (!block || typeof block.getInput !== 'function') {
            return;
        }
        const input = block.getInput(inputName);
        if (!input || !input.connection) {
            return;
        }
        const connected = input.connection.targetBlock();
        if (!connected || connected.type !== 'math_whole_number' || !connected.isShadow()) {
            return;
        }
        const numField = connected.getField('NUM');
        if (!numField) {
            return;
        }
        const current = String(numField.getValue() || '');
        if (isFlyoutBlock(block) || !current || isKitScaleDefaultValue(kind, current)) {
            numField.setValue(String(value));
        }
    }

    function fixJoystickTuningBlock (block) {
        if (!block) {
            return;
        }
        if (block.type === 'ps2joystick_setDeadzone') {
            setKitShadowNumber(block, 'DZ', getDefaultDeadzone(), 'DZ');
        } else if (block.type === 'ps2joystick_setThresholds') {
            setKitShadowNumber(block, 'LOW', getDefaultMoveThr(), 'LOW');
            setKitShadowNumber(block, 'HIGH', getDefaultHighThr(), 'HIGH');
        } else if (block.type === 'ps2joystick_continuousServo') {
            setKitShadowNumber(block, 'DEADZONE', getDefaultDeadzone(), 'DEADZONE');
        } else if (block.type === 'ps2joystick_holdToMove') {
            const holdLow = isEsp32JoystickKit() ? 819 : 300;
            const holdHigh = isEsp32JoystickKit() ? 2730 : 700;
            setKitShadowNumber(block, 'LOW', holdLow, 'LOW');
            setKitShadowNumber(block, 'HIGH', holdHigh, 'HIGH');
        }
    }

    function attachKitTuningDefaults (block) {
        fixJoystickTuningBlock(block);
        const apply = function () {
            fixJoystickTuningBlock(block);
        };
        setTimeout(apply, 0);
        setTimeout(apply, 50);
        registerDeviceRefreshListener();
    }

    function refreshAllPs2JoystickBlocks (workspace) {
        if (!workspace || typeof workspace.getAllBlocks !== 'function') {
            return;
        }
        workspace.getAllBlocks(false).forEach(function (b) {
            if (b.type === 'ps2joystick_init' ||
                b.type === 'ps2joystick_initX' ||
                b.type === 'ps2joystick_initY') {
                fixJoystickPinFields(b);
                if (b.type === 'ps2joystick_init') {
                    fixJoystickTuningBlock(b);
                }
            } else if (b.type === 'ps2joystick_continuousServo' ||
                b.type === 'ps2joystick_holdToMove') {
                configurePinDropdown(
                    b, 'SERVO_PIN',
                    getContinuousServoPinOptions, getDefaultContinuousServoPin
                );
                configurePinDropdown(
                    b, 'ANALOG_PIN',
                    getContinuousAnalogPinOptions, getDefaultContinuousAnalogPin
                );
                fixJoystickTuningBlock(b);
            } else if (b.type === 'ps2joystick_setDeadzone' ||
                b.type === 'ps2joystick_setThresholds') {
                fixJoystickTuningBlock(b);
            }
        });
    }

    function registerDeviceRefreshListener () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws || ws._ps2JoystickDeviceRefresh) {
                return;
            }
            ws._ps2JoystickDeviceRefresh = true;
            let lastDeviceKey = getWorkspaceDeviceId();
            ws.addChangeListener(function () {
                const deviceKey = getWorkspaceDeviceId();
                if (deviceKey === lastDeviceKey) {
                    return;
                }
                lastDeviceKey = deviceKey;
                refreshAllPs2JoystickBlocks(ws);
            });
            refreshAllPs2JoystickBlocks(ws);
        } catch (e) {
            // ignore
        }
    }

    function attachJoystickPinValidators (block) {
        const pinField = block.getField('PIN');
        const axisField = block.getField('AXIS');
        if (pinField) {
            pinField.setValidator(function (newValue) {
                return migrateInitPin(block, newValue);
            });
        }
        if (axisField) {
            axisField.setValidator(function (newValue) {
                const axis = newValue === 'Y' ? 'Y' : 'X';
                const pin = block.getField('PIN');
                if (pin) {
                    const defaultPin = axis === 'Y' ?
                        getDefaultJoystickYPin() : getDefaultJoystickXPin();
                    const options = axis === 'Y' ?
                        getJoystickYPinOptions() : getJoystickXPinOptions();
                    if (typeof pin.menuGenerator_ !== 'undefined') {
                        pin.menuGenerator_ = function () {
                            return options;
                        };
                    }
                    pin.setValue(defaultPin);
                }
                return axis;
            });
        }
        fixJoystickPinFields(block);
    }

    Blockly.Blocks.ps2joystick_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_INIT,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions },
                    {
                        type: 'field_dropdown',
                        name: 'AXIS',
                        options: [['X', 'X'], ['Y', 'Y']]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: function () {
                            return getInitPinOptions(this.sourceBlock_ || this);
                        }
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachJoystickPinValidators(this);
            registerDeviceRefreshListener();
        }
    };

    Blockly.Blocks.ps2joystick_axisValue = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_AXISVALUE,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions },
                    {
                        type: 'field_dropdown',
                        name: 'AXIS',
                        options: [['X', 'X'], ['Y', 'Y']]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'MODE',
                        options: [
                            [Blockly.Msg.PS2JOYSTICK_MODE_RAW || 'raw', 'raw'],
                            [Blockly.Msg.PS2JOYSTICK_MODE_0_100 || '0-100', 'map']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.ps2joystick_direction = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_DIRECTION,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.ps2joystick_directionIs = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_DIRECTIONIS,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions },
                    {
                        type: 'field_dropdown',
                        name: 'DIR',
                        options: [
                            [Blockly.Msg.PS2JOYSTICK_DIR_UP || 'upward', 'UP'],
                            [Blockly.Msg.PS2JOYSTICK_DIR_DOWN || 'downward', 'DOWN'],
                            [Blockly.Msg.PS2JOYSTICK_DIR_LEFT || 'left', 'LEFT'],
                            [Blockly.Msg.PS2JOYSTICK_DIR_RIGHT || 'right', 'RIGHT'],
                            [Blockly.Msg.PS2JOYSTICK_DIR_CENTER || 'center', 'CENTER']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.ps2joystick_setDeadzone = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_SETDEADZONE,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions },
                    { type: 'input_value', name: 'DZ' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachKitTuningDefaults(this);
        }
    };

    Blockly.Blocks.ps2joystick_setThresholds = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_SETTHRESHOLDS,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions },
                    { type: 'input_value', name: 'LOW' },
                    { type: 'input_value', name: 'HIGH' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachKitTuningDefaults(this);
        }
    };

    Blockly.Blocks.ps2joystick_angle = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_ANGLE,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.ps2joystick_magnitude = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_MAGNITUDE,
                args0: [
                    { type: 'field_dropdown', name: 'JOY', options: joystickIdOptions }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    // Smooth / continuous map-to-target (unchanged)
    Blockly.Blocks.ps2joystick_continuousServo = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_CONTINUOUS_SERVO,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'SERVO_PIN',
                        options: function () {
                            return getContinuousServoPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'ANALOG_PIN',
                        options: function () {
                            return getContinuousAnalogPinOptions();
                        }
                    },
                    { type: 'input_value', name: 'MIN' },
                    { type: 'input_value', name: 'MAX' },
                    { type: 'input_value', name: 'DEADZONE' },
                    { type: 'input_value', name: 'SPEED' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            configurePinDropdown(
                this, 'SERVO_PIN',
                getContinuousServoPinOptions, getDefaultContinuousServoPin
            );
            configurePinDropdown(
                this, 'ANALOG_PIN',
                getContinuousAnalogPinOptions, getDefaultContinuousAnalogPin
            );
            attachKitTuningDefaults(this);
        }
    };

    // Hold-to-move — Joystick only (not smooth servo)
    Blockly.Blocks.ps2joystick_holdToMove = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PS2JOYSTICK_HOLD_TO_MOVE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'SERVO_PIN',
                        options: function () {
                            return getContinuousServoPinOptions();
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'ANALOG_PIN',
                        options: function () {
                            return getContinuousAnalogPinOptions();
                        }
                    },
                    { type: 'input_value', name: 'LOW' },
                    { type: 'input_value', name: 'HIGH' },
                    { type: 'input_value', name: 'MIN' },
                    { type: 'input_value', name: 'MAX' },
                    { type: 'input_value', name: 'STEP' },
                    {
                        type: 'field_dropdown',
                        name: 'INVERT',
                        options: [
                            [Blockly.Msg.PS2JOYSTICK_HOLD_NORMAL || 'normal', '0'],
                            [Blockly.Msg.PS2JOYSTICK_HOLD_INVERT || 'invert', '1']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            configurePinDropdown(
                this, 'SERVO_PIN',
                getContinuousServoPinOptions, getDefaultContinuousServoPin
            );
            configurePinDropdown(
                this, 'ANALOG_PIN',
                getContinuousAnalogPinOptions, getDefaultContinuousAnalogPin
            );
            attachKitTuningDefaults(this);
        }
    };

    try {
        if (typeof setTimeout === 'function') {
            setTimeout(registerDeviceRefreshListener, 0);
        } else {
            registerDeviceRefreshListener();
        }
    } catch (e) {
        registerDeviceRefreshListener();
    }

    return Blockly;
}

exports = addBlocks;
