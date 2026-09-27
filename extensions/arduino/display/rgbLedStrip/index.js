const rgbLedStrip = formatMessage => ({
    name: formatMessage({
        id: 'rgbLedStrip.name',
        default: 'RGB LED Strip'
    }),
    extensionId: 'rgbLedStrip',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp8266', 'arduinoEsp32','intermediateKit','iotAiKit','iotAiKitnew','arduinoNano_arduinoUno'],
    iconURL: `asset/rgbLedStrip.png`,
    description: formatMessage({
        id: 'rgbLedStrip.description',
        default: 'Display colour on the WS2812 RGB LED strip module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display'],
});

module.exports = rgbLedStrip;
