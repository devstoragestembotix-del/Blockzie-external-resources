const dht = formatMessage => ({
    name: formatMessage({
        id: 'dht.name',
        default: 'DHT Sensor'
    }),
    extensionId: 'dht',
    supportDevice: ['arduinoUno', 'arduinoNano', 'arduinoMini', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp32', 'arduinoEsp8266','intermediateKit','iotAiKit','arduinoNano_arduinoUno'],
    iconURL: `asset/dht.png`,
    description: formatMessage({
        id: 'dht.description',
        default: 'Read temperature and humidity from the DHT11 or DHT22 module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['sensor'],
});

module.exports = dht;
