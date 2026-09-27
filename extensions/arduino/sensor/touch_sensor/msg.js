/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        TOUCHSENSOR_CATEGORY: 'Touch Sensor',
        TOUCHSENSOR_INIT: 'init Touch Sensor at pin %1',
        TOUCHSENSOR_READ: 'Touch Sensor touched?',
        TOUCHSENSOR_READRAW: 'Touch Sensor raw value'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        TOUCHSENSOR_CATEGORY: '触摸传感器',
        TOUCHSENSOR_INIT: '初始化 触摸传感器 引脚 %1',
        TOUCHSENSOR_READ: '触摸传感器 被触摸？',
        TOUCHSENSOR_READRAW: '触摸传感器 原始值'
    });

    return Blockly;
}

module.exports = addMsg;
