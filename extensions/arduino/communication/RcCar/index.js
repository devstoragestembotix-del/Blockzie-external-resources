const bleRobotExtension = formatMessage => ({

    name: formatMessage({
        id: 'bleRobot.name',
        default: 'AI Robotic RC Car'
    }),

    extensionId: 'bleRobot',


    supportDevice: ['arduinoEsp32', 'intermediateKit'],


    iconURL: 'asset/ble.png',

    description: formatMessage({
        id: 'bleRobot.description',
        default: 'Control the AI robotic RC car over Bluetooth Low Energy.'
    }),

    featured: true,

    blocks: 'blocks.js',

    generator: 'generator.js',

    toolbox: 'toolbox.js',

    msg: 'msg.js',

    library: 'lib',

    tags: ['communication', 'robot', 'ble'],


});

module.exports = bleRobotExtension;
