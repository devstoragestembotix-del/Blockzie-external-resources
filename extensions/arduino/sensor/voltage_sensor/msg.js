/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        VOLTAGESENSOR_CATEGORY: 'Voltage Sensor',
        VOLTAGESENSOR_INIT: 'init Voltage Sensor at pin %1 ADC ref %2',
        VOLTAGESENSOR_READVOUT: 'Voltage Sensor read Vout (V)',
        VOLTAGESENSOR_READRAW: 'Voltage Sensor raw value'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        VOLTAGESENSOR_CATEGORY: '电压传感器',
        VOLTAGESENSOR_INIT: '初始化 电压传感器 引脚 %1 参考电压 %2',
        VOLTAGESENSOR_READVOUT: '电压传感器 读取 Vout (V)',
        VOLTAGESENSOR_READRAW: '电压传感器 原始值'
    });

    return Blockly;
}

module.exports = addMsg;
