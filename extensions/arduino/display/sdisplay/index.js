const sdisplay = formatMessage => ({
    name: 'SDISPLAY',
    extensionId: 'sdisplay',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp8266', 'iotAiKit', 'iotAiKitnew', 'arduinoNano_arduinoUno'],
    iconURL: `asset/th.png`,
    description: formatMessage({
        id: 'sdisplay.description',
        default: 'Display graphics and text on the TFT screen module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display'],
});

module.exports = sdisplay;
