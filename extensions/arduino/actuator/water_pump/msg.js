/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        WATERPUMP_CATEGORY: 'Water Pump',
        WATERPUMP_INIT: 'init Water Pump signal pin %1 (OUTPUT)',
        WATERPUMP_SETSTATE: 'Water Pump pin %1 set %2',
        WATERPUMP_ONFORSECS: 'Turn Water Pump ON pin %1 for %2 seconds',
        WATERPUMP_SETSPEEDPCT: 'set Water Pump pin %1 speed to %2 %'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        WATERPUMP_CATEGORY: '水泵',
        WATERPUMP_INIT: '初始化 水泵 信号引脚 %1（输出）',
        WATERPUMP_SETSTATE: '水泵 引脚 %1 设为 %2',
        WATERPUMP_ONFORSECS: '水泵 引脚 %1 开启 %2 秒',
        WATERPUMP_SETSPEEDPCT: '水泵 引脚 %1 速度设为 %2 %'
    });

    return Blockly;
}

module.exports = addMsg;
