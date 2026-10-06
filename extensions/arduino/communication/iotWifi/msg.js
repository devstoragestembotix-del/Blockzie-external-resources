function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        IOT_WIFI_CATEGORY: 'IOT Hub',
        IOT_WIFI_CONNECTION_CATEGORY: 'Connection',
        IOT_WIFI_DATA_CATEGORY: 'Data',
        IOT_WIFI_COMMAND_CATEGORY: 'Dashboard Control',
        IOT_WIFI_CONNECT: 'connect WiFi SSID %1 password %2',
        IOT_SERVER_CONNECT: 'connect IoT %1 host %2 port %3 token %4 kit %5',
        IOT_PROTO_WEBSOCKET: 'WebSocket',
        IOT_PROTO_TCP: 'TCP',
        IOT_PROTO_UDP: 'UDP',
        IOT_LOOP_STEP: 'IoT loop step',
        IOT_IS_CONNECTED: 'IoT dashboard connected?',
        IOT_ADD_FIELD: 'key %1 value %2',
        IOT_CLEAR_FIELDS: 'clear IoT fields',
        IOT_SEND_SENSOR: 'send IoT sensor packet to dashboard',
        IOT_REGISTER_CONTROL: 'register IoT control key %1 on pin %2',
        IOT_HANDLE_COMMANDS: 'handle dashboard commands',
        IOT_SEND_PING: 'send ping / keep-alive'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        IOT_WIFI_CATEGORY: 'IOT Hub',
        IOT_WIFI_CONNECTION_CATEGORY: '连接',
        IOT_WIFI_DATA_CATEGORY: '数据',
        IOT_WIFI_COMMAND_CATEGORY: '仪表盘控制',
        IOT_WIFI_CONNECT: '连接 WiFi 名称 %1 密码 %2',
        IOT_SERVER_CONNECT: '连接 IoT %1 地址 %2 端口 %3 令牌 %4 套件号 %5',
        IOT_PROTO_WEBSOCKET: 'WebSocket',
        IOT_PROTO_TCP: 'TCP',
        IOT_PROTO_UDP: 'UDP',
        IOT_LOOP_STEP: 'IoT 循环步骤',
        IOT_IS_CONNECTED: 'IoT 仪表盘已连接？',
        IOT_ADD_FIELD: 'key %1 值 %2',
        IOT_CLEAR_FIELDS: '清空 IoT 字段',
        IOT_SEND_SENSOR: '发送 IoT 传感器数据到仪表盘',
        IOT_REGISTER_CONTROL: '注册 IoT 控制 key %1 引脚 %2',
        IOT_HANDLE_COMMANDS: '处理仪表盘命令',
        IOT_SEND_PING: '发送心跳 / 保活'
    });

    return Blockly;
}

exports = addMsg;
