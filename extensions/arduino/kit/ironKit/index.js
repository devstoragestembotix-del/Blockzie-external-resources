const ironKit = () => ({
    name: 'Iron Kit',
    extensionId: 'ironKit',
    supportDevice: ['ironKit_arduinoUno'],
    hide: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['kit'],
});

module.exports = ironKit;
