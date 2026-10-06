const botzie = formatMessage => ({
    name: formatMessage({
        id: 'botzie.name',
        default: 'Botzie'
    }),
    extensionId: 'botzie',
    supportDevice: [
        'zappie',
        'zappieKit_arduinoEsp32',
        'zappiekit_arduinosp32',
        'zappiekit',
        'arduinoEsp32',
        'intermediateKit',
        'arduinoNano',
        'arduinoNano_arduinoUno',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/botzie.png',
    description: formatMessage({
        id: 'botzie.description',
        default: 'Control Botzie robot — Bluetooth/WiFi remote via mobile app.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['actuator', 'robot', 'communication']
});

module.exports = botzie;