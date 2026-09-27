const tcs34725 = formatMessage => ({
    name: formatMessage({
        id: 'tcs34725.name',
        default: 'Colour Sensor'
    }),
    extensionId: 'tcs34725',
    supportDevice: [
        'arduinoEsp32',
        'intermediateKit',
        'arduinoNano',
        'arduinoNano_arduinoUno',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/tcs34725.png',
    description: formatMessage({
        id: 'tcs34725.description',
        default: 'Read RGB colour values from the TCS34725 I2C colour module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['sensor', 'colour', 'rgb', 'i2c'],
});

module.exports = tcs34725;
