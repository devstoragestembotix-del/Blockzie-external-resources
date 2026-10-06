const QDPRobotC02 = () => ({
    name: 'QDPRobotC02',
    extensionId: 'QDPRobotC02',
    supportDevice: ['QDPRobotC02_arduinoEsp32'],
    hide: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['kit'],
});

module.exports = QDPRobotC02;
