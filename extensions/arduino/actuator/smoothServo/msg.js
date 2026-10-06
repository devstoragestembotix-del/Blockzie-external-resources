function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        SMOOTHSERVO_CATEGORY: 'Smooth Servo',
        SMOOTHSERVO_ATTACH: 'attach servo pin %1',
        SMOOTHSERVO_WRITE: 'set servo pin %1 angle %2',
        SMOOTHSERVO_SMOOTH: 'smooth move servo pin %1 to %2 every %3 ms'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        SMOOTHSERVO_CATEGORY: '平滑舵机',
        SMOOTHSERVO_ATTACH: '连接舵机 引脚 %1',
        SMOOTHSERVO_WRITE: '设置舵机 引脚 %1 角度 %2',
        SMOOTHSERVO_SMOOTH: '平滑移动舵机 引脚 %1 到 %2 每隔 %3 毫秒'
    });

    return Blockly;
}

exports = addMsg;
