const l298n = formatMessage => ({
    name: 'L298N',
    extensionId: 'l298n',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp8266', 'arduinoEsp32', 'intermediateKit', 'iotAiKit', 'iotAiKitnew',
        'arduinoNano_arduinoUno'],
    iconURL: `asset/l298n.png`,
    description: formatMessage({
        id: 'l298n.description',
        default: 'Control two DC motors with the L298N dual driver module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['actuator'],
});

module.exports = l298n;
