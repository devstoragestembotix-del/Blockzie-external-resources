function addMsg(Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        BLE_CATEGORY: 'BLE',
         BT_CATEGORY: 'Bluetooth',
        BLE_CONNECTION: 'Initialize BLE with name %1',
        BT_CLASSIC_CONNECTION: 'Configure BT Classic with name %1',
        BT_AVAILABLE: 'is data available on Bluetooth?',
        BT_READ: 'read bytes from Bluetooth',
        BT_SEND: 'send %1 on Bluetooth',

        // Serial
        SERIAL_SET_BAUD: 'set serial %1 baud rate to %2',
        SERIAL_AVAILABLE: 'bytes available on serial %1',
        SERIAL_READ_BYTES: 'read bytes on serial %1',
        SERIAL_READ_NUMBER: 'get a number from serial %1',
        SERIAL_READ_STRING: 'read bytes as a string from serial %1',
        SERIAL_WRITE: 'write %1 on serial %2'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        BLE_CATEGORY: '蓝牙BLE',
          BT_CATEGORY: '蓝牙', 
        BLE_CONNECTION: '初始化蓝牙，名称 %1',
        BT_CLASSIC_CONNECTION: '配置蓝牙经典，名称 %1',
        BT_AVAILABLE: '蓝牙上有数据可用？',
        BT_READ: '从蓝牙读取字节',
        BT_SEND: '通过蓝牙发送 %1',

        // Serial
        SERIAL_SET_BAUD: '设置串口 %1 波特率为 %2',
        SERIAL_AVAILABLE: '串口 %1 上可用的字节数',
        SERIAL_READ_BYTES: '在串口 %1 上读取字节',
        SERIAL_READ_NUMBER: '从串口 %1 获取数字',
        SERIAL_READ_STRING: '从串口 %1 读取字符串',
        SERIAL_WRITE: '在串口 %2 上写入 %1'
    });


    return Blockly;
}

exports = addMsg;
