/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#2E7D32';
    const secondaryColour = '#A5D6A7';

    // AI & Robotics (ESP32 / intermediateKit)
    const esp32VoltageSensorPins = [
        ['D33', '33'],
        ['D32', '32'],
        ['D34', '34'],
        ['D35', '35'],
        ['D36', '36'],
        ['D39', '39'],
        ['D25', '25'],
        ['D26', '26']
    ];

    // AI & IoT (Nano / iotAiKit)
    const nanoVoltageSensorPins = [
        ['A6', 'A6'],
        ['A7', 'A7'],
        ['A0', 'A0'],
        ['A1', 'A1'],
        ['A2', 'A2'],
        ['A3', 'A3'],
        ['A4', 'A4'],
        ['A5', 'A5']
    ];

    const ESP32_KIT_IDS = ['arduinoesp32', 'intermediatekit', 'esp32'];
    const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew'];

    function deviceIdMatchesList (deviceId, ids) {
        const id = String(deviceId || '').toLowerCase();
        if (!id) {
            return false;
        }
        return ids.some((kitId) => id === kitId || id.includes(kitId));
    }

    function classifyKitToken (raw) {
        const s = String(raw || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (!s || s.length > 64) {
            return '';
        }
        // Robotics first — do not treat as IoT Nano pins
        if (/ai\s*&\s*robotics/.test(s) || (s.indexOf('robotics') !== -1 && s.indexOf('iot') === -1)) {
            return 'esp32';
        }
        if (/ai\s*&\s*iot/.test(s) || s === 'arduino nano') {
            return 'nano';
        }
        if (deviceIdMatchesList(s, ESP32_KIT_IDS) && !deviceIdMatchesList(s, NANO_KIT_IDS)) {
            return 'esp32';
        }
        if (deviceIdMatchesList(s, NANO_KIT_IDS)) {
            return 'nano';
        }
        return '';
    }

    function getDeviceIdFromGlobals () {
        const parts = [];
        try {
            if (typeof window === 'undefined') {
                return '';
            }
            const w = window;
            if (w.Blockzie) {
                parts.push(w.Blockzie.deviceId, w.Blockzie.deviceType, w.Blockzie.deviceName);
                if (w.Blockzie.device) {
                    parts.push(
                        w.Blockzie.device.deviceId,
                        w.Blockzie.device.id,
                        w.Blockzie.device.type,
                        w.Blockzie.device.name
                    );
                }
            }
            if (w.openBlock) {
                parts.push(w.openBlock.deviceId, w.openBlock.deviceType);
            }
            if (w.vm && w.vm.runtime) {
                const rt = w.vm.runtime;
                parts.push(rt.deviceId, rt.deviceType, rt._deviceId);
                if (rt.device) {
                    parts.push(rt.device.deviceId, rt.device.id, rt.device.type, rt.device.name);
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
                    (ws.device && (ws.device.deviceId || ws.device.id || ws.device.type || ws.device.name)) ||
                    ''
                ).toLowerCase();
                if (fromWs) {
                    return fromWs;
                }
            }
            if (typeof Blockly !== 'undefined') {
                const fromBlockly = String(
                    (Blockly.Device && (Blockly.Device.deviceId || Blockly.Device.id || Blockly.Device.name)) ||
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

    function getUIDeviceLabel () {
        if (typeof document === 'undefined') {
            return '';
        }
        try {
            const selected = document.querySelectorAll(
                '[aria-pressed="true"], [aria-selected="true"], [aria-current="true"]'
            );
            for (let i = 0; i < selected.length; i++) {
                const el = selected[i];
                const fromAttr = classifyKitToken(
                    el.getAttribute('data-device-id') ||
                    el.getAttribute('data-deviceid') ||
                    el.getAttribute('data-device') ||
                    el.getAttribute('title') ||
                    ''
                );
                if (fromAttr) {
                    return fromAttr;
                }
                const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
                if (text && text.length <= 40) {
                    const fromText = classifyKitToken(text);
                    if (fromText) {
                        return fromText;
                    }
                }
            }

            const currentChip = document.querySelector(
                '[class*="selected"][class*="device"], [class*="device"][class*="active"], [class*="currentDevice"]'
            );
            if (currentChip) {
                const hit = classifyKitToken((currentChip.textContent || '').replace(/\s+/g, ' ').trim());
                if (hit) {
                    return hit;
                }
            }

            // Fallback: scan visible device buttons (same labels as kit switcher)
            const buttons = Array.prototype.slice.call(document.querySelectorAll('button')).slice(0, 80);
            for (let i = 0; i < buttons.length; i++) {
                const text = (buttons[i].textContent || '').replace(/\s+/g, ' ').trim();
                const hit = classifyKitToken(text);
                if (hit) {
                    return hit;
                }
            }
        } catch (e) {
            // ignore
        }
        return '';
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
                const n = parseInt(value.replace(/^IO/i, '').replace(/^D/i, ''), 10);
                return Number.isFinite(n) && n >= 25;
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

    // Robotics (ESP32) → Dxx pins; IoT (Nano) → A0–A7
    function isEsp32VoltageSensorKit () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS) && !deviceIdMatchesList(deviceId, NANO_KIT_IDS)) {
            return true;
        }
        if (deviceIdMatchesList(deviceId, NANO_KIT_IDS)) {
            return false;
        }
        const fromName = classifyKitToken(deviceId);
        if (fromName === 'esp32') {
            return true;
        }
        if (fromName === 'nano') {
            return false;
        }

        const ui = getUIDeviceLabel();
        if (ui === 'esp32') {
            return true;
        }
        if (ui === 'nano') {
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

    function getVoltageSensorPinOptions () {
        return isEsp32VoltageSensorKit() ? esp32VoltageSensorPins : nanoVoltageSensorPins;
    }

    function getDefaultVoltageSensorPin () {
        return isEsp32VoltageSensorKit() ? '33' : 'A6';
    }

    function getDefaultAdcRef () {
        return isEsp32VoltageSensorKit() ? '3.3' : '5.0';
    }

    function syncVoltageSensorFields (block) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const pinField = block.getField('PIN');
        if (pinField) {
            const optionsFn = function () {
                return getVoltageSensorPinOptions();
            };
            if (typeof pinField.menuGenerator_ !== 'undefined') {
                pinField.menuGenerator_ = optionsFn;
            }
            if (typeof pinField.setOptions === 'function') {
                pinField.setOptions(optionsFn());
            }
            const validPins = optionsFn().map((entry) => String(entry[1]));
            const current = String(pinField.getValue() || '');
            if (!validPins.includes(current)) {
                pinField.setValue(getDefaultVoltageSensorPin());
            }
        }
        const adcField = block.getField('ADCREF');
        if (adcField) {
            const want = getDefaultAdcRef();
            const cur = String(adcField.getValue() || '');
            if (isEsp32VoltageSensorKit() && cur === '5.0') {
                adcField.setValue('3.3');
            } else if (!isEsp32VoltageSensorKit() && cur === '3.3' && want === '5.0') {
                // keep user choice on Nano unless syncing fresh default only
            }
        }
    }

    function refreshAllVoltageSensorBlocks (workspace) {
        if (!workspace || typeof workspace.getAllBlocks !== 'function') {
            return;
        }
        workspace.getAllBlocks(false).forEach(function (b) {
            if (b && b.type === 'voltagesensor_init') {
                syncVoltageSensorFields(b);
            }
        });
    }

    function registerDeviceRefreshListener () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws || ws._voltageSensorDeviceRefresh) {
                return;
            }
            ws._voltageSensorDeviceRefresh = true;
            let lastDeviceKey = getWorkspaceDeviceId() + '|' + (isEsp32VoltageSensorKit() ? 'esp32' : 'nano');
            ws.addChangeListener(function () {
                const deviceKey = getWorkspaceDeviceId() + '|' + (isEsp32VoltageSensorKit() ? 'esp32' : 'nano');
                if (deviceKey === lastDeviceKey) {
                    return;
                }
                lastDeviceKey = deviceKey;
                refreshAllVoltageSensorBlocks(ws);
            });
            refreshAllVoltageSensorBlocks(ws);
        } catch (e) {
            // ignore
        }
    }

    const adcRefOptions = [
        ['5.0V', '5.0'],
        ['3.3V', '3.3']
    ];

    Blockly.Blocks.voltagesensor_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VOLTAGESENSOR_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: function () {
                            const opts = getVoltageSensorPinOptions();
                            try {
                                const field = this;
                                const current = String((field && field.getValue && field.getValue()) || '');
                                const valid = opts.map((entry) => String(entry[1]));
                                if (current && !valid.includes(current) && field.setValue) {
                                    const def = getDefaultVoltageSensorPin();
                                    setTimeout(function () {
                                        if (String(field.getValue()) !== def) {
                                            field.setValue(def);
                                        }
                                    }, 0);
                                }
                            } catch (e) {
                                // ignore
                            }
                            return opts;
                        }
                    },
                    { type: 'field_dropdown', name: 'ADCREF', options: adcRefOptions }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            const block = this;
            const pinField = this.getField('PIN');
            if (pinField) {
                pinField.setValidator(function (newValue) {
                    const validPins = getVoltageSensorPinOptions().map((entry) => String(entry[1]));
                    const value = String(newValue || '');
                    return validPins.includes(value) ? value : getDefaultVoltageSensorPin();
                });
            }
            const adcField = this.getField('ADCREF');
            if (adcField) {
                adcField.setValue(getDefaultAdcRef());
            }
            syncVoltageSensorFields(this);
            setTimeout(function () {
                syncVoltageSensorFields(block);
            }, 0);
            registerDeviceRefreshListener();
        },
        onchange: function () {
            syncVoltageSensorFields(this);
        }
    };

    Blockly.Blocks.voltagesensor_readVout = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VOLTAGESENSOR_READVOUT,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.voltagesensor_readRaw = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.VOLTAGESENSOR_READRAW,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
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

module.exports = addBlocks;
