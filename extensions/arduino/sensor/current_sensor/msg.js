/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg(Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {
        CURRENTSENSOR_CATEGORY: 'Current Sensor',
        CURRENTSENSOR_INIT: 'init Current Sensor at pin %1 model %2',
        CURRENTSENSOR_READAMPS: 'Current Sensor read Amps',
        CURRENTSENSOR_READMILLIAMPS: 'Current Sensor read milliAmps',
        CURRENTSENSOR_READRAW: 'Current Sensor raw value'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        CURRENTSENSOR_CATEGORY: '电流传感器',
        CURRENTSENSOR_INIT: '初始化 电流传感器 引脚 %1 型号 %2',
        CURRENTSENSOR_READAMPS: '电流传感器 读取安培',
        CURRENTSENSOR_READMILLIAMPS: '电流传感器 读取毫安',
        CURRENTSENSOR_READRAW: '电流传感器 原始值'
    });

    return Blockly;
}

module.exports = addMsg;
