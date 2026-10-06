const rotaryEncoder = formatMessage => ({
    name: formatMessage({
        id: 'rotaryencoder.name',
        default: 'Rotary Encoder'
    }),

    extensionId: 'rotaryencoder',

    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],

    iconURL: `asset/rotaryencoder.png`,

    description: formatMessage({
        id: 'rotaryencoder.description',
        default: 'Read rotation direction, step count, and speed from the rotary encoder module.'
    }),

    featured: true,

    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',

    tags: ['sensor', 'rotary', 'encoder', 'knob'],
});

module.exports = rotaryEncoder;
