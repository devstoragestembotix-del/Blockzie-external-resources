const softwareSerial = formatMessage => ({
    name: formatMessage({
        id: 'softwareSerial.name',
        default: 'Software Serial'
    }),
    extensionId: 'softwareSerial',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp32', 'arduinoEsp8266','intermediateKit','iotAiKit','arduinoNano_arduinoUno'],
    iconURL: `asset/softwareSerial.png`,
    description: formatMessage({
        id: 'softwareSerial.description',
        default: 'Connect serial devices on extra digital pins.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['communication'],
});

module.exports = softwareSerial;
