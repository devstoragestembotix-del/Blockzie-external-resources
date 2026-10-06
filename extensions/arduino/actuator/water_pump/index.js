const waterPump = formatMessage => ({

    name: formatMessage({

        id: 'waterpump.name',

        default: 'Water Pump'

    }),

    extensionId: 'waterpump',


    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],

    iconURL: 'asset/waterpump.png',

    description: formatMessage({

        id: 'waterpump.description',

        default: 'Control on and off with the water pump module.'

    }),

    featured: true,

    blocks: 'blocks.js',

    generator: 'generator.js',

    toolbox: 'toolbox.js',

    msg: 'msg.js',

    tags: ['actuator', 'pump', 'water'],


});



module.exports = waterPump;

