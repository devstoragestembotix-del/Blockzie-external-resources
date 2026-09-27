/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        RGBLED_CATEGORY: 'RGB LED',
        RGBLED_INIT: 'init RGB LED port %1 at pin %2',
        RGBLED_LIGHTUPFOR: 'RGB LED %1 lights up %2 for %3 secs',
        RGBLED_LIGHTUP: 'RGB LED %1 lights up %2',
        RGBLED_SETCOLOR: 'RGB LED %1 sets color to R: %2 G: %3 B: %4',
        RGBLED_LIGHTOFF: 'RGB LED %1 lights off',
        RGBLED_SETCHANNEL: 'RGB LED %1 sets %2 value to %3',
        RGBLED_CHANGECHANNEL: 'RGB LED %1 changes %2 value by %3',
        RGBLED_GETCHANNEL: 'RGB LED %1 \'s %2 value'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        RGBLED_CATEGORY: 'RGB LED',
        RGBLED_INIT: '初始化 RGB LED 端口 %1 引脚 %2',
        RGBLED_LIGHTUPFOR: 'RGB LED %1 亮 %2 持续 %3 秒',
        RGBLED_LIGHTUP: 'RGB LED %1 亮 %2',
        RGBLED_SETCOLOR: 'RGB LED %1 设置颜色 R: %2 G: %3 B: %4',
        RGBLED_LIGHTOFF: 'RGB LED %1 关闭',
        RGBLED_SETCHANNEL: 'RGB LED %1 设置 %2 值为 %3',
        RGBLED_CHANGECHANNEL: 'RGB LED %1 将 %2 改变 %3',
        RGBLED_GETCHANNEL: 'RGB LED %1 的 %2 值'
    });

    return Blockly;
}

module.exports = addMsg;
