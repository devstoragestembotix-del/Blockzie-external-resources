/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const colour = '#B943FF';
    const secondaryColour = '#9900FF';

    // AI & Robotics (ESP32): LEDC/tone-capable kit outputs
    const esp32BuzzerPins = [
        ['D4', '4'],
        ['D5', '5'],
        ['D14', '14'],
        ['D25', '25'],
        ['D26', '26'],
        ['D32', '32'],
        ['D33', '33']
    ];

    // AI & IoT (Nano): PWM pins used on the kit
    const nanoBuzzerPins = [
        ['3', '3'],
        ['5', '5'],
        ['6', '6'],
        ['9', '9'],
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
            const value = String(entry[1] != null ? entry[1] : entry[0] || '');
            const n = parseInt(String(value).replace(/^IO/i, '').replace(/^D/i, ''), 10);
            return Number.isFinite(n) && n >= 25;
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

    function isEsp32Kit () {
        const deviceId = getWorkspaceDeviceId();
        if (deviceIdMatchesList(deviceId, ESP32_KIT_IDS) ||
            (/robotics/.test(deviceId) && !/iot/.test(deviceId))) {
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

    function getBuzzerPinOptions () {
        return isEsp32Kit() ? esp32BuzzerPins : nanoBuzzerPins;
    }

    function getDefaultBuzzerPin () {
        const opts = getBuzzerPinOptions();
        return opts.length ? String(opts[0][1]) : '5';
    }

    function attachBuzzerPinField (block) {
        const pinField = block.getField('PIN');
        if (!pinField) {
            return;
        }
        const optionsFn = function () {
            return getBuzzerPinOptions();
        };
        if (typeof pinField.menuGenerator_ !== 'undefined') {
            pinField.menuGenerator_ = optionsFn;
        }
        pinField.setValidator(function (newValue) {
            const validPins = optionsFn().map((entry) => String(entry[1]));
            const value = String(newValue || '');
            return validPins.includes(value) ? value : getDefaultBuzzerPin();
        });
        const validPins = optionsFn().map((entry) => String(entry[1]));
        if (!validPins.includes(String(pinField.getValue() || ''))) {
            pinField.setValue(getDefaultBuzzerPin());
        }
    }

    const note = [
        ['C3', 'note_C3'],
        ['C#3', 'note_Db3'],
        ['D3', 'note_D3'],
        ['D#3', 'note_Eb3'],
        ['E3', 'note_E3'],
        ['F3', 'note_F3'],
        ['F#3', 'note_Gb3'],
        ['G3', 'note_G3'],
        ['G#3', 'note_Ab3'],
        ['A3', 'note_A3'],
        ['A#3', 'note_Bb3'],
        ['B3', 'note_B3'],
        ['C4', 'note_C4'],
        ['C#4', 'note_Db4'],
        ['D4', 'note_D4'],
        ['D#4', 'note_Eb4'],
        ['E4', 'note_E4'],
        ['F4', 'note_F4'],
        ['F#4', 'note_Gb4'],
        ['G4', 'note_G4'],
        ['G#4', 'note_Ab4'],
        ['A4', 'note_A4'],
        ['A#4', 'note_Bb4'],
        ['B4', 'note_B4'],
        ['C5', 'note_C5'],
        ['C#5', 'note_Db5'],
        ['D5', 'note_D5'],
        ['D#5', 'note_Eb5'],
        ['E5', 'note_E5'],
        ['F5', 'note_F5'],
        ['F#5', 'note_Gb5'],
        ['G5', 'note_G5'],
        ['G#5', 'note_Ab5'],
        ['A5', 'note_A5'],
        ['A#5', 'note_Bb5'],
        ['B5', 'note_B5']
    ];

    const beatTime = [
        ['1', '1'],
        ['1/2', '0.5'],
        ['1/4', '0.25'],
        ['1/8', '0.125'],
        ['1/16', '0.0625'],
        ['2', '2'],
        ['4', '4']
    ];

    Blockly.Blocks.passiveBuzzer_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PASSIVEBUZZER_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: function () {
                            return getBuzzerPinOptions();
                        }
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
            attachBuzzerPinField(this);
            const buzzerBlock = this;
            setTimeout(function () {
                attachBuzzerPinField(buzzerBlock);
            }, 0);
        }
    };

    Blockly.Blocks.passiveBuzzer_playToneForBeat = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PASSIVEBUZZER_PLAYTONEFORBEAT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'FREQ',
                        options: note
                    },
                    {
                        type: 'field_dropdown',
                        name: 'TIME',
                        options: beatTime
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.passiveBuzzer_setTempo = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PASSIVEBUZZER_SETTEMPO,
                args0: [
                    {
                        type: 'input_value',
                        name: 'BPM'
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.passiveBuzzer_playRingtone = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.PASSIVEBUZZER_PLAYRINGTONE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'NO',
                        options: [
                            [Blockly.Msg.PASSIVEBUZZER_CONNECTION, 'R_connection'],
                            [Blockly.Msg.PASSIVEBUZZER_DISCONNECTION, 'R_disconnection'],
                            [Blockly.Msg.PASSIVEBUZZER_DIDI, 'R_buttonPushed'],
                            [Blockly.Msg.PASSIVEBUZZER_MODE1, 'R_mode1'],
                            [Blockly.Msg.PASSIVEBUZZER_MODE2, 'R_mode2'],
                            [Blockly.Msg.PASSIVEBUZZER_MODE3, 'R_mode3'],
                            [Blockly.Msg.PASSIVEBUZZER_SURPRISE, 'R_surprise'],
                            [Blockly.Msg.PASSIVEBUZZER_OHOOH, 'R_OhOoh'],
                            [Blockly.Msg.PASSIVEBUZZER_OHOOH2, 'R_OhOoh2'],
                            [Blockly.Msg.PASSIVEBUZZER_CUDDLY, 'R_cuddly'],
                            [Blockly.Msg.PASSIVEBUZZER_SLEEPING, 'R_sleeping'],
                            [Blockly.Msg.PASSIVEBUZZER_HAPPY, 'R_happy'],
                            [Blockly.Msg.PASSIVEBUZZER_SUPERHAPPY, 'R_superHappy'],
                            [Blockly.Msg.PASSIVEBUZZER_HAPPYSHORT, 'R_happy_short'],
                            [Blockly.Msg.PASSIVEBUZZER_SAD, 'R_sad'],
                            [Blockly.Msg.PASSIVEBUZZER_CONFUSED, 'R_confused'],
                            [Blockly.Msg.PASSIVEBUZZER_FART1, 'R_fart1'],
                            [Blockly.Msg.PASSIVEBUZZER_FART2, 'R_fart2'],
                            [Blockly.Msg.PASSIVEBUZZER_FART3, 'R_fart3']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
