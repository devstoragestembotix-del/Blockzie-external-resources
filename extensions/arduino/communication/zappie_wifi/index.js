const zappieWifiExtension = formatMessage => ({
    name: formatMessage({
        id: 'zappiewifi.name',
        default: 'Zappie WiFi'
    }),
    extensionId: 'zappiewifi',
    supportDevice: ['zappie'],
    iconURL: 'asset/wifi.png',
    description: formatMessage({
        id: 'zappiewifi.description',
        default: 'Connect Zappie to WiFi for command and sensor communication.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['communication']
});

module.exports = zappieWifiExtension;
