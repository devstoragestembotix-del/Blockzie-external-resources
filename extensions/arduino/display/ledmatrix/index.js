const ledMatrix = formatMessage => ({
    name: formatMessage({
        id: 'ledmatrix.name',
        default: 'LED Matrix (7x5)'
    }),

    extensionId: 'ledmatrix',

    supportDevice: [
        'arduinoNano',
        'arduinoUno',
        'arduinoMega2560',
        'arduinoEsp32',
        'arduinoNano_arduinoUno',
        'intermediateKit',
        'iotAiKit'
    ],

    iconURL: `asset/ledmatrix.png`,

    description: formatMessage({
        id: 'ledmatrix.description',
        default: 'Display digits, letters, and patterns on the 7x5 LED matrix module.'
    }),

    featured: true,

    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',

    library: 'lib',

    tags: ['display', 'led', 'matrix'],
});

module.exports = ledMatrix;
