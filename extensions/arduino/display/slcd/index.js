const slcd = formatMessage => ({
    name: formatMessage({
        id: 'slcd.name',
        default: 'LCD'
    }),
    extensionId: 'slcd',
    supportDevice: ['arduinoUno', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp8266'],
    iconURL: `asset/LCD.png`,
    description: formatMessage({
        id: 'slcd.description',
        default: 'Display text on the I2C LCD module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display'],
});

module.exports = slcd;
