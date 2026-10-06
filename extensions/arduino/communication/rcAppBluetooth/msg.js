function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        RCAPPBT_CATEGORY: 'Pick and Place',
        RCAPPBT_SPIDER_CATEGORY: 'Spider Robot',
        RCAPPBT_INIT: 'initialize HC-05 Bluetooth RX %1 TX %2 baud %3 STATE %4 name %5',
        RCAPPBT_STATE_NONE: 'none',
        RCAPPBT_WHEN_RECEIVED: 'when Bluetooth data received %1 %2',
        RCAPPBT_AVAILABLE: 'Bluetooth data available?',
        RCAPPBT_READ_CMD: 'read Bluetooth command',
        RCAPPBT_COMMAND: 'Bluetooth command',
        RCAPPBT_COMMAND_IS: 'Bluetooth command is %1',
        RCAPPBT_PRIORITY_ACTIVE: 'Bluetooth priority active? (skip joystick)',
        RCAPPBT_SET_PRIORITY_MS: 'set Bluetooth priority delay %1 ms',
        RCAPPBT_RUN_EVERY: 'run every %1 ms %2 %3',
        RCAPPBT_SPIDER_BOARD: 'Spider board %1',
        RCAPPBT_SPIDER_BOARD_NANO: 'Arduino Nano',
        RCAPPBT_SPIDER_BOARD_ESP32: 'ESP32',
        RCAPPBT_SPIDER_CONNECT: 'Spider Bluetooth %1',
        RCAPPBT_SPIDER_BT_NANO: 'HC-05 (Nano)',
        RCAPPBT_SPIDER_BT_ESP32: 'ESP32 BT',
        RCAPPBT_SPIDER_SET_NAME: 'Spider BT name %1',
        RCAPPBT_SPIDER_MAP: 'Spider command %1 run %2'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        RCAPPBT_CATEGORY: 'Pick and Place',
        RCAPPBT_SPIDER_CATEGORY: '蜘蛛机器人',
        RCAPPBT_INIT: '初始化 HC-05 蓝牙 RX %1 TX %2 波特率 %3 STATE %4 名称 %5',
        RCAPPBT_STATE_NONE: '无',
        RCAPPBT_WHEN_RECEIVED: '当收到蓝牙数据 %1 %2',
        RCAPPBT_AVAILABLE: '蓝牙有数据？',
        RCAPPBT_READ_CMD: '读取蓝牙命令',
        RCAPPBT_COMMAND: '蓝牙命令',
        RCAPPBT_COMMAND_IS: '蓝牙命令是 %1',
        RCAPPBT_PRIORITY_ACTIVE: '蓝牙优先活动中？（跳过摇杆）',
        RCAPPBT_SET_PRIORITY_MS: '设置蓝牙优先延时 %1 毫秒',
        RCAPPBT_RUN_EVERY: '每隔 %1 毫秒运行 %2 %3',
        RCAPPBT_SPIDER_BOARD: '蜘蛛板 %1',
        RCAPPBT_SPIDER_BOARD_NANO: 'Arduino Nano',
        RCAPPBT_SPIDER_BOARD_ESP32: 'ESP32',
        RCAPPBT_SPIDER_CONNECT: '蜘蛛蓝牙 %1',
        RCAPPBT_SPIDER_BT_NANO: 'HC-05 (Nano)',
        RCAPPBT_SPIDER_BT_ESP32: 'ESP32 蓝牙',
        RCAPPBT_SPIDER_SET_NAME: '蜘蛛蓝牙名称 %1',
        RCAPPBT_SPIDER_MAP: '蜘蛛命令 %1 执行 %2'
    });

    return Blockly;
}

exports = addMsg;
