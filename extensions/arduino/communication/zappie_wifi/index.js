const zappieWifiExtension = formatMessage => ({
    name: formatMessage({
        id: 'zappiewifi.name',
        default: 'Zappie WiFi'
    }),
    extensionId: 'zappiewifi',
    supportDevice: ['zappie'],
    iconURL: 'asset/wifi.png',
    description: formatMessage({
        id: 'zappiewifi.description',
        default: 'Connect Zappie ESP32 to WiFi. Same SSID/password HTTP layer as AI & Robotics; Zappie opcodes on /control.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['communication']
});

module.exports = zappieWifiExtension;
