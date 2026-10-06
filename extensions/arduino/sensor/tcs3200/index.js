const tcs3200 = formatMessage => ({
    name: 'TCS3200',
    extensionId: 'tcs3200',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp32', 'intermediateKit', 'iotAiKit', 'iotAiKitnew', 'arduinoNano_arduinoUno'],
    iconURL: `asset/tcs3200.png`,
    description: formatMessage({
        id: 'tcs3200.description',
        default: 'Read colour values from the TCS3200 colour module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['sensor'],
});

module.exports = tcs3200;
