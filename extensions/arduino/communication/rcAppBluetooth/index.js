const rcAppBluetooth = formatMessage => ({
    name: formatMessage({
        id: 'rcAppBluetooth.name',
        default: 'Pick and Place'
    }),
    extensionId: 'rcAppBluetooth',
    supportDevice: [
        'arduinoNano',
        'arduinoNano_arduinoUno',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/pick_place.png',
    description: formatMessage({
        id: 'rcAppBluetooth.description',
        default: 'Control the Pick and Place robot over Bluetooth.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['communication', 'bluetooth']
});

module.exports = rcAppBluetooth;
