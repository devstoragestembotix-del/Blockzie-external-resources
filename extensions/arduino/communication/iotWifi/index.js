const iotWifiExtension = formatMessage => ({
    name: formatMessage({
        id: 'iotWifi.name',
        default: 'IOT Hub'
    }),
    extensionId: 'iotWifi',
    supportDevice: [
        'arduinoNano',
        'arduinoNano_arduinoUno',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/wifi.png',
    description: formatMessage({
        id: 'iotWifi.description',
        default: 'Connect the Nano and ESP-01 to the IoT dashboard over WiFi.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['communication', 'iot', 'wifi']
});

module.exports = iotWifiExtension;
