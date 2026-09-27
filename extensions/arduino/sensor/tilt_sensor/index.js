const tiltSensor = formatMessage => ({
    name: formatMessage({
        id: 'tiltsensor.name',
        default: 'Tilt Sensor'
    }),
    extensionId: 'tiltsensor',
    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/tiltsensor.png',
    description: formatMessage({
        id: 'tiltsensor.description',
        default: 'Read tilt on or off state from the digital tilt-switch module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['sensor', 'tilt', 'switch', 'digital'],
});

module.exports = tiltSensor;
