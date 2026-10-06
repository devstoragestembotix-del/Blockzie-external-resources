function addMsg(Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        NANO_BLE_CATEGORY: 'Nano Bluetooth',
        NANO_BLE_CONNECTION: 'Initialize Bluetooth (RX %1 TX %2 Baud %3)'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        NANO_BLE_CATEGORY: 'Nano蓝牙',
        NANO_BLE_CONNECTION: '初始化蓝牙 (RX %1 TX %2 波特率 %3)'
    });

    return Blockly;
}
exports = addMsg;
