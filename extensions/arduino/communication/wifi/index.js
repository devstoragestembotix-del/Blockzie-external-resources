const wifiExtension = formatMessage => ({
    name: formatMessage({
        id: 'wifi.name',
        default: 'WiFi Connection'
    }),
    extensionId: 'wifi',
    supportDevice: ['arduinoEsp32', 'arduinoEsp8266','intermediateKit'],
    iconURL: 'asset/wifi.png',
    description: formatMessage({
        id: 'wifi.description',
        default: 'Connect ESP32 or ESP8266 boards to a WiFi network.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['communication'],
});

module.exports = wifiExtension;
