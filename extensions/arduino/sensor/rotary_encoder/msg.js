/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg(Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {
        ROTARYENCODER_CATEGORY: 'Rotary Encoder',
        ROTARYENCODER_INIT: 'init Rotary Encoder CLK %1 DT %2',
        ROTARYENCODER_GETCOUNT: 'Rotary Encoder count',
        ROTARYENCODER_RESETCOUNT: 'reset Rotary Encoder count',
        ROTARYENCODER_DIRECTION: 'Rotary Encoder direction',
        ROTARYENCODER_SPEED: 'Rotary Encoder speed (steps/s)'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        ROTARYENCODER_CATEGORY: '旋转编码器',
        ROTARYENCODER_INIT: '初始化 旋转编码器 CLK %1 DT %2',
        ROTARYENCODER_GETCOUNT: '旋转编码器 计数',
        ROTARYENCODER_RESETCOUNT: '重置 旋转编码器 计数',
        ROTARYENCODER_DIRECTION: '旋转编码器 方向',
        ROTARYENCODER_SPEED: '旋转编码器 速度 (步/秒)'
    });

    return Blockly;
}

module.exports = addMsg;
