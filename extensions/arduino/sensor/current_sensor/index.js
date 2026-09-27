const currentSensor = formatMessage => ({
    name: formatMessage({
        id: 'currentsensor.name',
        default: 'Current Sensor'
    }),

    extensionId: 'currentsensor',

    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],

    iconURL: `asset/currentsensor.png`,

    description: formatMessage({
        id: 'currentsensor.description',
        default: 'Read AC or DC current from the ACS712 Hall-effect module.'
    }),

    featured: true,

    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',

    tags: ['sensor', 'current', 'power', 'acs712'],
});

module.exports = currentSensor;
