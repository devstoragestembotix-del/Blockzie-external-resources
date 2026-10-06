/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addMsg(Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        OTTO_CATEGORY: 'Humanoid Robot',
        OTTO_INIT: 'Humanoid Robot init (servos + ultrasonic + serial)',
        OTTO_READ_DISTANCE: 'Humanoid Robot ultrasonic distance (cm)',
        OTTO_HOME: 'Humanoid Robot home',
        OTTO_WALK: 'Humanoid Robot walk steps %1 time %2 direction %3',
        OTTO_MOONWALKER: 'Humanoid Robot moonwalker repeat %1 times with speed %2 and height %3 in direction %4',
        OTTO_JUMP: 'Humanoid Robot jump steps %1 time %2',
        OTTO_TURN: 'Humanoid Robot turn steps %1 time %2 direction %3',
        OTTO_SHAKE_LEG: 'Humanoid Robot shake leg steps %1 time %2 direction %3',
        OTTO_MOVE_COMMAND: 'Humanoid Robot send BLE command %1'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        OTTO_CATEGORY: 'STEMRobot',
        OTTO_INIT: 'STEMRobot 初始化（舵机+超声波+串口）',
        OTTO_READ_DISTANCE: 'STEMRobot 超声波距离（厘米）',
        OTTO_HOME: 'STEMRobot 复位',
        OTTO_WALK: 'STEMRobot 行走 步骤 %1 时间 %2 方向 %3',
        OTTO_MOONWALKER: 'STEMRobot 太空步重复 %1 次 速度 %2 高度 %3 方向 %4',
        OTTO_JUMP: 'STEMRobot 跳跃 步骤 %1 时间 %2',
        OTTO_TURN: 'STEMRobot 转向 步骤 %1 时间 %2 方向 %3',
        OTTO_SHAKE_LEG: 'STEMRobot 摇腿 步骤 %1 时间 %2 方向 %3',
        OTTO_MOVE_COMMAND: 'STEMRobot 发送 BLE 指令 %1'
    });

    return Blockly;
}

module.exports = addMsg;
