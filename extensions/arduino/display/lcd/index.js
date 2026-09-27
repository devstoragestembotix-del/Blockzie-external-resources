const lcd = formatMessage => ({
    name: formatMessage({
        id: 'lcd.name',
        default: '1602 LCD'
    }),
    extensionId: 'lcd',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp8266', 'arduinoEsp32', 'intermediateKit',
        'iotAiKit', 'iotAiKitnew', 'arduinoNano_arduinoUno'],
    iconURL: `asset/lcd.png`,
    description: formatMessage({
        id: 'lcd.description',
        default: 'Display text on the 1602 I2C LCD module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display'],
});

module.exports = lcd;
