/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        TILTSENSOR_CATEGORY: 'Tilt Sensor',
        TILTSENSOR_INIT: 'init Tilt Sensor at pin %1',
        TILTSENSOR_READ: 'Tilt Sensor tilt detected?',
        TILTSENSOR_READRAW: 'Tilt Sensor raw value'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        TILTSENSOR_CATEGORY: '倾斜传感器',
        TILTSENSOR_INIT: '初始化 倾斜传感器 引脚 %1',
        TILTSENSOR_READ: '倾斜传感器 检测到倾斜？',
        TILTSENSOR_READRAW: '倾斜传感器 原始值'
    });

    return Blockly;
}

module.exports = addMsg;
