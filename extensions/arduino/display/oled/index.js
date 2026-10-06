const oled = formatMessage => ({
    name: 'OLED',
    extensionId: 'oled',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp32', 'arduinoEsp8266','intermediateKit','iotAiKit','iotAiKitnew','arduinoNano_arduinoUno'],
    iconURL: `asset/oled.png`,
    description: formatMessage({
        id: 'oled.description',
        default: 'Display text and graphics on the SSD1306 I2C OLED module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display'],
});

module.exports = oled;
