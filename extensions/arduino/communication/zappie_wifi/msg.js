function addMsg(Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        ZAPPIE_WIFI_CATEGORY: 'WiFi',
        ZAPPIE_WIFI_CONNECT: 'connect to WiFi SSID %1 password %2'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        ZAPPIE_WIFI_CATEGORY: 'WiFi连接',
        ZAPPIE_WIFI_CONNECT: '连接 WiFi 名称 %1 密码 %2'
    });

    return Blockly;
}

exports = addMsg;
