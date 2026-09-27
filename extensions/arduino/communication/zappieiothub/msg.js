function addMsg(Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {

        ZIOTH_CATEGORY: 'Zappie IoT Hub',

        ZIOTH_LABEL_CONNECT: 'Connect',

        ZIOTH_LABEL_DATA: 'Sensor data',

        ZIOTH_LABEL_CMD: 'Dashboard commands',

        ZIOTH_WIFI_CONNECT: 'connect to WiFi SSID %1 password %2',

        ZIOTH_SERVER_CONNECT: 'connect IoT hub %1 host %2 port %3 token %4 kit %5',

        ZIOTH_PROTO_MQTT: 'MQTT',

        ZIOTH_PROTO_HTTPS: 'HTTPS',

        ZIOTH_LOOP: 'IoT hub keep-alive (put in forever loop)',

        ZIOTH_CONNECTED: 'IoT hub connected?',

        ZIOTH_ADD_FIELD: 'add sensor field %1 value %2',

        ZIOTH_CLEAR: 'clear sensor fields',

        ZIOTH_SEND: 'send sensor data to dashboard',

        ZIOTH_REGISTER: 'register command key %1 on pin %2',

        ZIOTH_HANDLE: 'check for dashboard commands now'

    });



    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {

        ZIOTH_CATEGORY: 'Zappie IoT Hub',

        ZIOTH_LABEL_CONNECT: '连接',

        ZIOTH_LABEL_DATA: '传感器数据',

        ZIOTH_LABEL_CMD: '仪表盘命令',

        ZIOTH_WIFI_CONNECT: '连接 WiFi 名称 %1 密码 %2',

        ZIOTH_SERVER_CONNECT: '连接 IoT 中心 %1 地址 %2 端口 %3 令牌 %4 套件 %5',

        ZIOTH_PROTO_MQTT: 'MQTT',

        ZIOTH_PROTO_HTTPS: 'HTTPS',

        ZIOTH_LOOP: 'IoT 中心保活（放入循环）',

        ZIOTH_CONNECTED: 'IoT 中心已连接？',

        ZIOTH_ADD_FIELD: '添加传感器字段 %1 值 %2',

        ZIOTH_CLEAR: '清空传感器字段',

        ZIOTH_SEND: '发送传感器数据到仪表盘',

        ZIOTH_REGISTER: '注册命令键 %1 引脚 %2',

        ZIOTH_HANDLE: '立即检查仪表盘命令'

    });



    return Blockly;

}



exports = addMsg;
