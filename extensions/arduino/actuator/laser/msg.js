/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        LASER_CATEGORY: 'Laser',
        LASER_INIT: 'init Laser port %1 signal pin %2 (OUTPUT)',
        LASER_SETSTATE: 'set Laser port %1 %2',
        LASER_ONFORSECS: 'Laser ON port %1 for %2 seconds',
        LASER_PULSEMS: 'Laser port %1 pulse for %2 ms',
        LASER_SETPOWER: 'Laser port %1 set PWM power %2 (0-255)',
        LASER_BLINKEVERY: 'Laser port %1 blink every %2 ms',
        LASER_BLINKEVERY_TOOLTIP: 'One on/off cycle. Put inside a forever loop for continuous blinking.',
        LASER_BLINKTIMES: 'Laser port %1 blink %2 times every %3 ms',
        LASER_SOS: 'Laser port %1 SOS signal',
        LASER_SETBRIGHTNESSPCT: 'set Laser port %1 brightness to %2 %',
        LASER_FADE: 'fade Laser port %1 from %2 to %3 in %4 sec',
        LASER_ISON: 'is Laser port %1 ON?',
        LASER_GETPWM: 'get Laser port %1 current PWM value'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        LASER_CATEGORY: '激光',
        LASER_INIT: '初始化 激光 端口 %1 信号引脚 %2（输出）',
        LASER_SETSTATE: '设置 激光 端口 %1 %2',
        LASER_ONFORSECS: '激光 端口 %1 开启 %2 秒',
        LASER_PULSEMS: '激光 端口 %1 脉冲 %2 毫秒',
        LASER_SETPOWER: '激光 端口 %1 设置PWM功率 %2（0-255）',
        LASER_BLINKEVERY: '激光 端口 %1 每 %2 毫秒闪烁一次',
        LASER_BLINKEVERY_TOOLTIP: '一次开/关循环。放在重复执行中以持续闪烁。',
        LASER_BLINKTIMES: '激光 端口 %1 闪烁 %2 次 间隔 %3 毫秒',
        LASER_SOS: '激光 端口 %1 SOS信号',
        LASER_SETBRIGHTNESSPCT: '设置 激光 端口 %1 亮度为 %2 %',
        LASER_FADE: '激光 端口 %1 从 %2 渐变到 %3 用时 %4 秒',
        LASER_ISON: '激光 端口 %1 是否开启？',
        LASER_GETPWM: '获取 激光 端口 %1 当前PWM值'
    });

    return Blockly;
}

module.exports = addMsg;
