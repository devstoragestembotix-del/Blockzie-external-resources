const visionCore = formatMessage => ({
    name: formatMessage({
        id: 'visionCore.name',
        default: 'Vision Core'
    }),
    extensionId: 'visionCore',
    // Hidden for now. To re-enable, restore:
    // ['zappie', 'zappieKit_arduinoEsp32', 'zappiekit_arduinosp32', 'zappiekit', 'arduinoEsp32']
    supportDevice: [],
    iconURL: 'asset/visioncore.png',
    description: formatMessage({
        id: 'visionCore.description',
        default: 'Read camera vision data for line follow, colour track, and object follow.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['sensor', 'vision', 'robot'],
});

module.exports = visionCore;
