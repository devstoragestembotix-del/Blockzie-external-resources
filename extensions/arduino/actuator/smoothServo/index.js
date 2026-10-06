const smoothServo = formatMessage => ({
    name: formatMessage({
        id: 'smoothServo.name',
        default: 'Smooth Servo'
    }),
    extensionId: 'smoothServo',
    supportDevice: [
        'arduinoNano',
        'arduinoNano_arduinoUno',
        'arduinoUno',
        'iotAiKit',
        'iotAiKitnew',
        'intermediateKit',
        'arduinoEsp32',
        'ottoRobot',
        'ottoRobotnew'
    ],
    iconURL: 'asset/smooth_servo.png',
    description: formatMessage({
        id: 'smoothServo.description',
        default: 'Control servo angle from 0 to 180 degrees with smooth motion.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['actuator', 'servo']
});

module.exports = smoothServo;
