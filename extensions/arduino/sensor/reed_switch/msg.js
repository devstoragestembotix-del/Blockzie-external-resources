/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg(Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {
        REEDSWITCH_CATEGORY: 'Reed Switch',
        REEDSWITCH_INIT: 'init Reed Switch at pin %1',
        REEDSWITCH_READ: 'Reed Switch detected magnet?',
        REEDSWITCH_READRAW: 'Reed Switch raw value'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        REEDSWITCH_CATEGORY: '干簧管开关',
        REEDSWITCH_INIT: '初始化 干簧管 引脚 %1',
        REEDSWITCH_READ: '干簧管 检测到磁铁?',
        REEDSWITCH_READRAW: '干簧管 原始值'
    });

    return Blockly;
}

module.exports = addMsg;
