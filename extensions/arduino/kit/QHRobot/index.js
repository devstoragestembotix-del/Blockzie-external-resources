const QDPRobot = () => ({
    name: 'QDP',
    extensionId: 'QDPRobot',
    supportDevice: ['QDPRobot_arduinoUnoUltra'],
    hide: true,
    blocks: `blocks.js`,
    generator: `generator.js`,
    toolbox: `toolbox.js`,
    msg: `msg.js`,
    library: 'lib',
    tags: ['kit'],
});

module.exports = QDPRobot;
