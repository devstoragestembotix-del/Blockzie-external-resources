const vibrationMotor = formatMessage => ({
    name: formatMessage({
        id: 'vibrationmotor.name',
        default: 'Vibration Motor'
    }),
    extensionId: 'vibrationmotor',
    supportDevice: [
        'arduinoNano',
        'arduinoEsp32',
        'intermediateKit',
        'iotAiKit',
        'iotAiKitnew'
    ],
    iconURL: 'asset/vibrationmotor.png',
    description: formatMessage({
        id: 'vibrationmotor.description',
        default: 'Control on, off, power, and pulse with the vibration motor module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['actuator', 'motor', 'pwm', 'haptic'],
});

module.exports = vibrationMotor;
