/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg(Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {
        LEDMATRIX_CATEGORY: 'LED Matrix',
        LEDMATRIX_INIT: 'init LED Matrix at pin %1 with %2 leds brightness %3',
        LEDMATRIX_SHOWDIGIT: 'show digit %1 on LED Matrix',
        LEDMATRIX_SHOWCHAR: 'show letter %1 on LED Matrix',
        LEDMATRIX_SHOWSYMBOL: 'show symbol %1 on LED Matrix',
        LEDMATRIX_DRAWCUSTOM: 'draw custom 7x5 pattern'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        LEDMATRIX_CATEGORY: 'LED点阵',
        LEDMATRIX_INIT: '初始化 LED 矩阵 引脚 %1 数量 %2 亮度 %3',
        LEDMATRIX_SHOWDIGIT: '显示数字 %1',
        LEDMATRIX_SHOWCHAR: '显示字母 %1',
        LEDMATRIX_SHOWSYMBOL: '显示符号 %1',
        LEDMATRIX_DRAWCUSTOM: '绘制自定义7x5图案'
    });

    return Blockly;
}

exports = addMsg;