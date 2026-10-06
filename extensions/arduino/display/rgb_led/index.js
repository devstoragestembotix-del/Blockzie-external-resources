const rgbLed = formatMessage => ({
    name: formatMessage({
        id: 'rgbled.name',
        default: 'RGB LED'
    }),
    extensionId: 'rgbled',
    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/rgbled.png',
    description: formatMessage({
        id: 'rgbled.description',
        default: 'Display colour on the WS2812 RGB LED module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display', 'rgb', 'led', 'neopixel'],
});

module.exports = rgbLed;
