const touchSensor = formatMessage => ({
    name: formatMessage({
        id: 'touchsensor.name',
        default: 'Touch Sensor'
    }),
    extensionId: 'touchsensor',
    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/touchsensor.png',
    description: formatMessage({
        id: 'touchsensor.description',
        default: 'Read touch on or off state from the TTP223 touch module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['sensor', 'touch', 'digital'],
});

module.exports = touchSensor;
