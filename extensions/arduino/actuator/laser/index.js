const laser = formatMessage => ({
    name: formatMessage({
        id: 'laser.name',
        default: 'Laser'
    }),
    extensionId: 'laser',
    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/laser.png',
    description: formatMessage({
        id: 'laser.description',
        default: 'Control on, off, blink, PWM, and fade with the laser module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['actuator', 'laser', 'output'],
});

module.exports = laser;
