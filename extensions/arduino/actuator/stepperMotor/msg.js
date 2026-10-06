/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        STEPPER_CATEGORY: 'Stepper Motor',
        STEPPER_INIT: 'init stepper motor dir pin %1 step pin %2 steps/rev %3',
        STEPPER_ROTATE: 'rotate stepper direction %1 speed (µs) %2 steps %3'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        STEPPER_CATEGORY: '步进电机',
        STEPPER_INIT: '初始化步进电机 方向引脚 %1 步进引脚 %2 每圈步数 %3',
        STEPPER_ROTATE: '旋转步进电机 方向 %1 速度(微秒) %2 步数 %3'
    });

    return Blockly;
}
exports = addMsg;
