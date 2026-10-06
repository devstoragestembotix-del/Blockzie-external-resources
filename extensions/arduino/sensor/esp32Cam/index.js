const esp32Cam = formatMessage => ({
    name: formatMessage({
        id: 'esp32Cam.name',
        default: 'ESP32-CAM'
    }),
    extensionId: 'esp32Cam',
    supportDevice: [
        // 'esp32Cam',
        // 'arduinoEsp32'
        // Hide on Zappie for now:
        // 'zappie',
        // 'zappieKit_arduinoEsp32',
        // 'zappiekit_arduinosp32',
        // 'zappiekit'
    ],
    iconURL: 'asset/esp32cam.png',
    description: formatMessage({
        id: 'esp32Cam.description',
        default: 'Read a live camera stream from the ESP32-CAM module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['sensor', 'vision', 'camera'],
});

module.exports = esp32Cam;
