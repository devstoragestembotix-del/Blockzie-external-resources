function addMsg(Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        WIFI_CATEGORY: 'WiFi',
        WIFI_CONNECT: 'connect to WiFi SSID %1 password %2'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        WIFI_CATEGORY: 'WiFi连接',
        WIFI_CONNECT: '连接 WiFi 名称 %1 密码 %2'
    });

    return Blockly;
}

exports = addMsg;
