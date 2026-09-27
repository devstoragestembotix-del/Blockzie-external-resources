/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks (Blockly) {
    const color = '#1565C0';
    const secondaryColour = '#0D47A1';

    const defaultBtPins = [
        ['A3 (RX)', 'A3'],
        ['D13 (TX)', '13'],
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
        ['D12', '12'],
        ['A0', 'A0'],
        ['A1', 'A1'],
        ['A2', 'A2'],
        ['A4', 'A4'],
        ['A5', 'A5']
    ];

    const cmdOptions = [
        ['u (up)', 'u'],
        ['d (down)', 'd'],
        ['l (left)', 'l'],
        ['r (right)', 'r'],
        ['b (back)', 'b'],
        ['c (center)', 'c'],
        ['stop', 'stop']
    ];

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

    function normalizePinOptions (opts) {
        if (!Array.isArray(opts) || !opts.length) {
            return defaultBtPins;
        }
        const seen = {};
        const result = [];
        opts.forEach((entry) => {
            const raw = String(entry[1] != null ? entry[1] : entry[0] || '').trim();
            if (!raw || seen[raw]) {
                return;
            }
            seen[raw] = true;
            let label = String(entry[0] || raw);
            if (raw === 'A3' || raw === '17') {
                label = 'A3 (RX)';
            } else if (raw === '13') {
                label = 'D13 (TX)';
            }
            result.push([label, raw === '17' ? 'A3' : raw]);
        });
        if (!seen.A3 && !seen['17']) {
            result.unshift(['A3 (RX)', 'A3']);
        }
        if (!seen['13']) {
            result.push(['D13 (TX)', '13']);
        }
        return result.length ? result : defaultBtPins;
    }

    function getBtPinOptions () {
        const flyoutOpts = getFlyoutDigitalPinOptions();
        if (flyoutOpts && flyoutOpts.length) {
            return normalizePinOptions(flyoutOpts);
        }
        return defaultBtPins;
    }

    function btPinFieldOptions () {
        return function () {
            return getBtPinOptions();
        };
    }

    function btStatePinOptions () {
        return function () {
            const none = [[Blockly.Msg.RCAPPBT_STATE_NONE || 'none', 'none']];
            return none.concat(getBtPinOptions());
        };
    }

    Blockly.Blocks.rc_bt_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'RX',
                        options: btPinFieldOptions()
                    },
                    {
                        type: 'field_dropdown',
                        name: 'TX',
                        options: btPinFieldOptions()
                    },
                    {
                        type: 'field_dropdown',
                        name: 'BAUD',
                        options: [
                            ['9600', '9600'],
                            ['38400', '38400'],
                            ['57600', '57600'],
                            ['115200', '115200']
                        ]
                    },
                    {
                        type: 'field_dropdown',
                        name: 'STATE',
                        options: btStatePinOptions()
                    },
                    {
                        type: 'field_input',
                        name: 'NAME',
                        text: 'App'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.rc_bt_when_received = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_WHEN_RECEIVED,
                args0: [
                    { type: 'input_dummy' },
                    { type: 'input_statement', name: 'DO' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_hat']
            });
            this.setNextStatement(false, null);
        }
    };

    Blockly.Blocks.rc_bt_available = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_AVAILABLE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.rc_bt_read_cmd = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_READ_CMD,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.rc_bt_command = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_COMMAND,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.rc_bt_command_is = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_COMMAND_IS,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'CMD',
                        options: cmdOptions
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.rc_bt_set_priority_ms = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_SET_PRIORITY_MS,
                args0: [
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

    Blockly.Blocks.rc_bt_priority_active = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_PRIORITY_ACTIVE,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.rc_bt_run_every = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_RUN_EVERY,
                args0: [
                    {
                        type: 'input_value',
                        name: 'MS',
                        check: 'Number'
                    },
                    { type: 'input_dummy' },
                    { type: 'input_statement', name: 'DO' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_hat']
            });
            this.setNextStatement(false, null);
        }
    };

    // Bluetooth single-char commands a–z (from RC App / terminal)
    const spiderCmdOptions = [];
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i);
        spiderCmdOptions.push([letter, letter]);
    }

    const spiderActionOptions = [
        ['Forward', 'forward'],
        ['Backward', 'backward'],
        ['Left', 'left'],
        ['Right', 'right'],
        ['Hello', 'hello'],
        ['Dance1', 'dance1'],
        ['Dance2', 'dance2'],
        ['Dance3', 'dance3'],
        ['Standby', 'home']
    ];

    const spiderColor = '#00897B';
    const spiderSecondary = '#00695C';

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

    function isEsp32Device () {
        const id = getWorkspaceDeviceId();
        return id.includes('esp32') || id.includes('intermediatekit');
    }

    function getSpiderBoardFromWorkspace () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws || typeof ws.getAllBlocks !== 'function') {
                return null;
            }
            const boards = ws.getAllBlocks(false).filter(b => b && b.type === 'rc_spider_board');
            if (!boards.length) {
                return null;
            }
            return boards[0].getFieldValue('BOARD') || null;
        } catch (e) {
            return null;
        }
    }

    // Prefer explicit Spider board block; else follow linked device.
    function resolveSpiderBoard () {
        const fromBlock = getSpiderBoardFromWorkspace();
        if (fromBlock === 'ESP32' || fromBlock === 'NANO') {
            return fromBlock;
        }
        return isEsp32Device() ? 'ESP32' : 'NANO';
    }

    function spiderBoardOptions () {
        return function () {
            // Spider Robot (otto) can target either MCU — keep both choices.
            // Dependent blocks (BT mode / name) sync from the selected value.
            return [
                [Blockly.Msg.RCAPPBT_SPIDER_BOARD_NANO || 'Arduino Nano', 'NANO'],
                [Blockly.Msg.RCAPPBT_SPIDER_BOARD_ESP32 || 'ESP32', 'ESP32']
            ];
        };
    }

    function spiderBtModeOptions () {
        return function () {
            if (resolveSpiderBoard() === 'ESP32') {
                return [[Blockly.Msg.RCAPPBT_SPIDER_BT_ESP32 || 'ESP32 BT', 'ESP32']];
            }
            return [[Blockly.Msg.RCAPPBT_SPIDER_BT_NANO || 'HC-05 (Nano)', 'NANO']];
        };
    }

    function defaultSpiderBtName () {
        return resolveSpiderBoard() === 'ESP32' ? 'ESP32_SPIDER' : 'SpiderRobot';
    }

    function syncSpiderNameShadow (block) {
        try {
            const input = block.getInput('NAME');
            if (!input || !input.connection) {
                return;
            }
            const target = input.connection.targetBlock();
            if (!target || target.type !== 'text') {
                return;
            }
            const field = target.getField('TEXT');
            if (!field) {
                return;
            }
            const cur = String(field.getValue() || '');
            // Only auto-swap known defaults so user custom names stay.
            if (cur === 'ESP32_SPIDER' || cur === 'SpiderRobot' || cur === '') {
                field.setValue(defaultSpiderBtName());
            }
        } catch (e) {
            // ignore
        }
    }

    function refreshSpiderBoardDependentBlocks () {
        try {
            const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
            if (!ws || typeof ws.getAllBlocks !== 'function') {
                return;
            }
            ws.getAllBlocks(false).forEach(b => {
                if (!b) {
                    return;
                }
                if (b.type === 'rc_spider_connect') {
                    const f = b.getField('BTMODE');
                    if (f && f.getOptions) {
                        const opts = f.getOptions();
                        if (opts && opts.length) {
                            f.setValue(opts[0][1]);
                        }
                    }
                } else if (b.type === 'rc_spider_set_name') {
                    syncSpiderNameShadow(b);
                }
            });
        } catch (e) {
            // ignore
        }
    }

    Blockly.Blocks.rc_spider_board = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_SPIDER_BOARD || 'Spider board %1',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'BOARD',
                        options: spiderBoardOptions()
                    }
                ],
                colour: spiderColor,
                secondaryColour: spiderSecondary,
                extensions: ['shape_statement']
            });
            const field = this.getField('BOARD');
            if (field) {
                field.setValue(isEsp32Device() ? 'ESP32' : 'NANO');
            }
        },
        onchange: function (event) {
            if (!event || event.blockId === this.id ||
                (event.type === 'change' && event.name === 'BOARD')) {
                refreshSpiderBoardDependentBlocks();
            }
        }
    };

    Blockly.Blocks.rc_spider_connect = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_SPIDER_CONNECT || 'Spider Bluetooth %1',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'BTMODE',
                        options: spiderBtModeOptions()
                    }
                ],
                colour: spiderColor,
                secondaryColour: spiderSecondary,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.rc_spider_set_name = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_SPIDER_SET_NAME || 'Spider BT name %1',
                args0: [
                    {
                        type: 'input_value',
                        name: 'NAME'
                    }
                ],
                colour: spiderColor,
                secondaryColour: spiderSecondary,
                extensions: ['shape_statement']
            });
            const self = this;
            setTimeout(() => {
                syncSpiderNameShadow(self);
            }, 0);
        },
        onchange: function () {
            syncSpiderNameShadow(this);
        }
    };

    Blockly.Blocks.rc_spider_map = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.RCAPPBT_SPIDER_MAP,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'CMD',
                        options: spiderCmdOptions
                    },
                    {
                        type: 'field_dropdown',
                        name: 'ACTION',
                        options: spiderActionOptions
                    }
                ],
                colour: spiderColor,
                secondaryColour: spiderSecondary,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
