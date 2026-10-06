const nanoBleExtension = formatMessage => ({
    name: formatMessage({
        id: 'nanoBle.name',
        default: 'Nano Bluetooth'
    }),
    extensionId: 'nanoBle',
    supportDevice: ['arduinoNano', 'iotAiKit', 'arduinoNano_arduinoUno'],
    iconURL: 'asset/nano_ble.png',
    description: formatMessage({
        id: 'nanoBle.description',
        default: 'Connect the Arduino Nano over Bluetooth with an HC-05 or HM-10 module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['communication'],
});

module.exports = nanoBleExtension;
