const voltageSensor = formatMessage => ({
    name: formatMessage({
        id: 'voltagesensor.name',
        default: 'Voltage Sensor'
    }),
    extensionId: 'voltagesensor',
    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/voltagesensor.png',
    description: formatMessage({
        id: 'voltagesensor.description',
        default: 'Read analog voltage from the voltage sensor module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['sensor', 'voltage', 'analog', 'power'],
});

module.exports = voltageSensor;
