const stepperMotor = formatMessage => ({
    name: formatMessage({
        id: 'steppermotor.name',
        default: 'Stepper Motor'
    }),
    extensionId: 'steppermotor',
    supportDevice: [
        'arduinoNano', 'arduinoUno', 'arduinoMega2560', 'arduinoEsp32', 'arduinoNano_arduinoUno', 'iotAiKit', 'iotAiKitnew', 'intermediateKit' ],
    iconURL: 'asset/steppermotor.png', // ✅ make sure this image exists in /asset folder
    description: formatMessage({
        id: 'steppermotor.description',
        default: 'Control direction, speed, and steps with the stepper motor module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    tags: ['actuator', 'motor', 'stepper', 'motion'],
});

module.exports = stepperMotor;
