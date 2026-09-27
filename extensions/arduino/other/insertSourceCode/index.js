const insertSourceCode = formatMessage => ({
    name: formatMessage({
        id: 'insertSourceCode.name',
        default: 'Insert Source Code'
    }),
    extensionId: 'insertSourceCode',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp32', 'arduinoEsp8266','intermediateKit','iotAiKit','arduinoNano_arduinoUno'],
    iconURL: `asset/insertSourceCode.png`,
    description: formatMessage({
        id: 'insertSourceCode.description',
        default: 'Insert custom Arduino source code into the program.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['other'],
});

module.exports = insertSourceCode;
