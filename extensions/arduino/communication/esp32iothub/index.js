const esp32IotHubExtension = formatMessage => ({

    name: formatMessage({

        id: 'esp32iothub.name',

        default: 'ESP32 IoT Hub'

    }),

    extensionId: 'esp32iothub',

    supportDevice: ['arduinoEsp32', 'arduinoEsp8266', 'intermediateKit'],

    iconURL: 'asset/wifi.png',

    description: formatMessage({

        id: 'esp32iothub.description',

        default: 'Send sensor data and receive commands from the IoT dashboard over MQTT or HTTP.'

    }),

    featured: true,

    blocks: 'blocks.js',

    generator: 'generator.js',

    toolbox: 'toolbox.js',

    msg: 'msg.js',

    library: 'lib',

    tags: ['communication', 'iot', 'wifi', 'mqtt', 'http']

});



module.exports = esp32IotHubExtension;
