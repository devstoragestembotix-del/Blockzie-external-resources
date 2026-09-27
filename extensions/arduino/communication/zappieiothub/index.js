const zappieIotHubExtension = formatMessage => ({

    name: formatMessage({

        id: 'zappieiothub.name',

        default: 'Zappie IoT Hub'

    }),

    extensionId: 'zappieiothub',

    supportDevice: ['zappie'],

    iconURL: 'asset/wifi.png',

    description: formatMessage({

        id: 'zappieiothub.description',

        default: 'Send Zappie sensor data and receive commands from the IoT dashboard over MQTT or HTTPS.'

    }),

    featured: true,

    blocks: 'blocks.js',

    generator: 'generator.js',

    toolbox: 'toolbox.js',

    msg: 'msg.js',

    library: 'lib',

    tags: ['communication', 'iot', 'wifi', 'mqtt', 'https', 'zappie']

});



module.exports = zappieIotHubExtension;
