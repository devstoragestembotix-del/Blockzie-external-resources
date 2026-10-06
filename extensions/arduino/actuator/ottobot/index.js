const ottobot = formatMessage => ({
    name: 'STEMRobot',
    extensionId: 'ottobot',
    supportDevice: ['arduinoUno', 'arduinoNano','arduinoNano_arduinoUno'],
    iconURL: `asset/otto.png`,
    description: formatMessage({
        id: 'ottobot.description',
        default: 'Control walking and gestures on the STEMRobot humanoid robot.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['actuator'],
});

module.exports = ottobot;
