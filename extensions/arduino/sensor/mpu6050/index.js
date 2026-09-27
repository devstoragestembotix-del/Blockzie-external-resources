const mpu6050 = formatMessage => ({
    name: formatMessage({
        id: 'mpu6050.name',
        default: 'MPU6050 Sensor'
    }),
    extensionId: 'mpu6050',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp32', 'arduinoEsp8266','intermediateKit','iotAiKit','arduinoNano_arduinoUno'],
    iconURL: `asset/mpu6050.png`,
    description: formatMessage({
        id: 'mpu6050.description',
        default: 'Read acceleration and rotation from the MPU6050 6-axis module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['sensor'],
});

module.exports = mpu6050;
