const fourDigitClockDisplay = formatMessage => ({
    name: formatMessage({
        id: 'fourDigitClockDisplay.name',
        default: '4-Digit Clock Display'
    }),
    extensionId: 'fourDigitClockDisplay',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp8266', 'arduinoEsp32','intermediateKit','iotAiKit','arduinoNano_arduinoUno'],
    iconURL: `asset/fourDigitClockDisplay.png`,
    description: formatMessage({
        id: 'fourDigitClockDisplay.description',
        default: 'Display time and numbers on the TM1637 4-digit module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display'],
});

module.exports = fourDigitClockDisplay;
