const ps2Joystick = formatMessage => ({
    name: formatMessage({
        id: 'joystick.name',
        default: 'Joystick'
    }),

    extensionId: 'ps2joystick',

    supportDevice: [
        'arduinoNano',
        'arduinoNano_arduinoUno',
        'arduinoUno',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew',
        'ottoRobot',
        'ottoRobotnew'
    ],

    iconURL: `asset/ps2joystick.png`,

    description: formatMessage({
        id: 'joystick.description',
        default: 'Read X and Y position and movement direction from the joystick module.'
    }),

    featured: true,

    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',

    tags: ['sensor', 'joystick', 'analog'],
});

module.exports = ps2Joystick;
