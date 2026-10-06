function addMsg(Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {

        IOT_HUB_CATEGORY: 'ESP32 IoT Hub',

        IOT_HUB_LABEL_CONNECT: 'Connect',

        IOT_HUB_LABEL_DATA: 'Sensor data',

        IOT_HUB_LABEL_CMD: 'Dashboard commands',

        IOT_HUB_WIFI_CONNECT: 'connect to WiFi SSID %1 password %2',

        IOT_HUB_SERVER_CONNECT: 'connect IoT hub %1 host %2 port %3 token %4 kit %5',

        IOT_HUB_PROTO_MQTT: 'MQTT',

        IOT_HUB_PROTO_HTTPS: 'HTTPS',

        IOT_HUB_PROTO_HTTP: 'HTTP',

        IOT_HUB_LOOP: 'IoT hub keep-alive (put in forever loop)',

        IOT_HUB_CONNECTED: 'IoT hub connected?',

        IOT_HUB_ADD_FIELD: 'add sensor field %1 value %2',

        IOT_HUB_CLEAR: 'clear sensor fields',

        IOT_HUB_SEND: 'send sensor data to dashboard',

        IOT_HUB_REGISTER: 'register command key %1 on pin %2',

        IOT_HUB_HANDLE: 'check for dashboard commands now'

    });



    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {

        IOT_HUB_CATEGORY: 'ESP32 IoT Hub',

        IOT_HUB_LABEL_CONNECT: '连接',

        IOT_HUB_LABEL_DATA: '传感器数据',

        IOT_HUB_LABEL_CMD: '仪表盘命令',

        IOT_HUB_WIFI_CONNECT: '连接 WiFi 名称 %1 密码 %2',

        IOT_HUB_SERVER_CONNECT: '连接 IoT 中心 %1 地址 %2 端口 %3 令牌 %4 套件 %5',

        IOT_HUB_PROTO_MQTT: 'MQTT',

        IOT_HUB_PROTO_HTTPS: 'HTTPS',

        IOT_HUB_PROTO_HTTP: 'HTTP',

        IOT_HUB_LOOP: 'IoT 中心保活（放入循环）',

        IOT_HUB_CONNECTED: 'IoT 中心已连接？',

        IOT_HUB_ADD_FIELD: '添加传感器字段 %1 值 %2',

        IOT_HUB_CLEAR: '清空传感器字段',

        IOT_HUB_SEND: '发送传感器数据到仪表盘',

        IOT_HUB_REGISTER: '注册命令键 %1 引脚 %2',

        IOT_HUB_HANDLE: '立即检查仪表盘命令'

    });



    return Blockly;

}



exports = addMsg;
