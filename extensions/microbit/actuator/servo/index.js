const servo = formatMessage => ({
    name: formatMessage({
        id: 'servo.name',
        default: 'Servo',
        description: 'Name of servo'
    }),
    extensionId: 'servo',
    type: 'microbit',
    supportDevice: ['microbit', 'microbitV2'],
    // author: 'STEMbotix',
    iconURL: `asset/servo.png`,
    description: formatMessage({
        id: 'servo.description',
        default: 'Control servo angle on the micro:bit.',
        description: 'Description of servo'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['actuator'],
});

module.exports = servo;
