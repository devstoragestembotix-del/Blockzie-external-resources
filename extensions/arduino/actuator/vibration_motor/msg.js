/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        VIBRATIONMOTOR_CATEGORY: 'Vibration Motor',
        VIBRATIONMOTOR_INIT: 'init Vibration Motor signal pin %1 (OUTPUT)',
        VIBRATIONMOTOR_ON: 'Vibration Motor ON pin %1',
        VIBRATIONMOTOR_OFF: 'Vibration Motor OFF pin %1',
        VIBRATIONMOTOR_SETPOWER: 'Vibration Motor pin %1 set PWM power %2 (0-255)',
        VIBRATIONMOTOR_VIBRATEMS: 'Vibration Motor pin %1 vibrate for %2 ms'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        VIBRATIONMOTOR_CATEGORY: '振动马达',
        VIBRATIONMOTOR_INIT: '初始化 振动马达 信号引脚 %1（输出）',
        VIBRATIONMOTOR_ON: '振动马达 开启 引脚 %1',
        VIBRATIONMOTOR_OFF: '振动马达 关闭 引脚 %1',
        VIBRATIONMOTOR_SETPOWER: '振动马达 引脚 %1 设置PWM功率 %2（0-255）',
        VIBRATIONMOTOR_VIBRATEMS: '振动马达 引脚 %1 振动 %2 毫秒'
    });

    return Blockly;
}

module.exports = addMsg;
