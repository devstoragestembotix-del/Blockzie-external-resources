/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg (Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {
        PS2JOYSTICK_CATEGORY: 'Joystick',
        JOYSTICK_CATEGORY: 'Joystick',
        PS2JOYSTICK_INIT: 'init joystick %1 %2 %3',
        PS2JOYSTICK_INIT_X: 'init joystick %1 X %2',
        PS2JOYSTICK_INIT_Y: 'init joystick %1 Y %2',
        PS2JOYSTICK_AXISVALUE: 'joystick %1 %2 %3',
        PS2JOYSTICK_MODE_RAW: 'raw',
        PS2JOYSTICK_MODE_0_100: '0-100',
        PS2JOYSTICK_DIRECTION: 'joystick %1 direction',
        PS2JOYSTICK_DIRECTIONIS: 'joystick %1 %2 ?',
        PS2JOYSTICK_DIR_UP: 'upward',
        PS2JOYSTICK_DIR_DOWN: 'downward',
        PS2JOYSTICK_DIR_LEFT: 'left',
        PS2JOYSTICK_DIR_RIGHT: 'right',
        PS2JOYSTICK_DIR_CENTER: 'center',
        PS2JOYSTICK_SETDEADZONE: 'set joystick %1 deadzone %2',
        PS2JOYSTICK_SETTHRESHOLDS: 'set joystick %1 thresholds low %2 high %3',
        PS2JOYSTICK_ANGLE: 'joystick %1 angle (deg)',
        PS2JOYSTICK_MAGNITUDE: 'joystick %1 magnitude',
        PS2JOYSTICK_CONTINUOUS_SERVO: 'continuous joystick servo pin %1 analog %2 min %3 max %4 deadzone %5 speed %6',
        PS2JOYSTICK_HOLD_TO_MOVE: 'hold-to-move joystick servo %1 analog %2 low %3 high %4 min %5 max %6 step %7 %8',
        PS2JOYSTICK_HOLD_NORMAL: 'normal',
        PS2JOYSTICK_HOLD_INVERT: 'invert'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        PS2JOYSTICK_CATEGORY: '摇杆',
        JOYSTICK_CATEGORY: '摇杆',
        PS2JOYSTICK_INIT: '初始化 摇杆 %1 %2 %3',
        PS2JOYSTICK_INIT_X: '初始化 摇杆 %1 X轴 %2',
        PS2JOYSTICK_INIT_Y: '初始化 摇杆 %1 Y轴 %2',
        PS2JOYSTICK_AXISVALUE: '摇杆 %1 %2 %3',
        PS2JOYSTICK_MODE_RAW: '原始',
        PS2JOYSTICK_MODE_0_100: '0-100',
        PS2JOYSTICK_DIRECTION: '摇杆 %1 方向',
        PS2JOYSTICK_DIRECTIONIS: '摇杆 %1 %2 ?',
        PS2JOYSTICK_DIR_UP: '上',
        PS2JOYSTICK_DIR_DOWN: '下',
        PS2JOYSTICK_DIR_LEFT: '左',
        PS2JOYSTICK_DIR_RIGHT: '右',
        PS2JOYSTICK_DIR_CENTER: '中',
        PS2JOYSTICK_SETDEADZONE: '设置 摇杆 %1 死区 %2',
        PS2JOYSTICK_SETTHRESHOLDS: '设置 摇杆 %1 阈值 低 %2 高 %3',
        PS2JOYSTICK_ANGLE: '摇杆 %1 角度 (度)',
        PS2JOYSTICK_MAGNITUDE: '摇杆 %1 幅度',
        PS2JOYSTICK_CONTINUOUS_SERVO: '连续摇杆舵机 引脚 %1 模拟 %2 最小 %3 最大 %4 死区 %5 速度 %6',
        PS2JOYSTICK_HOLD_TO_MOVE: '按住移动 摇杆舵机 %1 模拟 %2 低 %3 高 %4 最小 %5 最大 %6 步进 %7 %8',
        PS2JOYSTICK_HOLD_NORMAL: '正常',
        PS2JOYSTICK_HOLD_INVERT: '反向'
    });

    return Blockly;
}

exports = addMsg;
