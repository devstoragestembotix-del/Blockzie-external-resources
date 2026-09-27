// /* eslint-disable func-style */
// /* eslint-disable require-jsdoc */
// function addMsg (Blockly) {
//     Object.assign(Blockly.ScratchMsgs.locales.en, {
//         STEMBOTIXLCD_CATEGORY: 'STEMBOTIXLCD',
//         STEMBOTIXLCD_INIT: 'init stembotixLCD pin DE %1 CSN %2 RST %3',
//         STEMBOTIXLCD_SENDSTRING: 'Display text %1 on STEMbotix LCD',
//         STEMBOTIXLCD_TYPE: 'Select LCD Type %1'
        
//     });
//     Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
//         STEMBOTIXLCD_CATEGORY: 'STEMBOTIXLCD',
//         STEMBOTIXLCD_INIT: '初始化 stembotixLCD 引脚 DE %1 CSN %2 RST %3',
//         STEMBOTIXLCD_SENDSTRING: '在STEMbotix LCD上显示文本 %1',
//         STEMBOTIXLCD_TYPE: '选择 LCD 类型 %1'
//     });
//     return Blockly;
// }

// exports = addMsg;


// /* eslint-disable func-style */
// /* eslint-disable require-jsdoc */
// function addMsg (Blockly) {
//     Object.assign(Blockly.ScratchMsgs.locales.en, {
//         SDISPLAY_CATEGORY: 'SDISPLAY',
//         SDISPLAY_INIT: 'init sdisplay pin DE %1 CSN %2 RST %3',
//         SDISPLAY_SENDSTRING: 'Display text %1 on sdisplay',
//         SDISPLAY_TYPE: 'Select LCD Type %1',
//         SDISPLAY_SET_TEXT_COLOR: 'Set text color on sdisplay to %1',
//         SDISPLAY_SET_TEXT_SIZE: 'Set text size on sdisplay to %1',
//         SDISPLAY_SET_CURSOR: 'Set cursor on sdisplay to X: %1 Y: %2',
//         SDISPLAY_PRINT_MESSAGE: 'Print message %1 on sdisplay',
//         SDISPLAY_FILL_SCREEN: 'Fill sdisplay screen with color %1',
//         SDISPLAY_SET_ROTATION: 'Set rotation on sdisplay to %1',
//         SDISPLAY_CLEAR_DISPLAY: 'Clear sdisplay display'

//     });
    
//     Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
//         SDISPLAY_CATEGORY: 'SDISPLAY',
//         SDISPLAY_INIT: '初始化 sdisplay 引脚 DE %1 CSN %2 RST %3',
//         SDISPLAY_SENDSTRING: '在sdisplay上显示文本 %1',
//         SDISPLAY_TYPE: '选择 LCD 类型 %1',
//         SDISPLAY_SET_TEXT_COLOR: '设置 sdisplay 的文本颜色为 %1',
//         SDISPLAY_SET_TEXT_SIZE: '设置 sdisplay 的文本大小为 %1',
//         SDISPLAY_SET_CURSOR: '设置 sdisplay 的光标为 X: %1 Y: %2',
//         SDISPLAY_PRINT_MESSAGE: '在 sdisplay 上打印消息 %1',
//         SDISPLAY_FILL_SCREEN: '用颜色 %1 填充 sdisplay 屏幕',
//         SDISPLAY_SET_ROTATION: '将 sdisplay 的旋转设置为 %1',
//         SDISPLAY_CLEAR_DISPLAY: '清除 sdisplay 显示屏'
//     });
    
//     return Blockly;
// }

// exports = addMsg;


function addMsg(Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        SDISPLAY_CATEGORY: 'SDISPLAY',
        SDISPLAY_INIT: 'init sdisplay pin DE %1 CSN %2 RST %3',
        SDISPLAY_SENDSTRING: 'Display text %1 on sdisplay',
        SDISPLAY_TYPE: 'Select LCD Type %1',
        SDISPLAY_SET_TEXT_COLOR: 'Set text color on sdisplay to %1',
        SDISPLAY_SET_TEXT_SIZE: 'Set text size on sdisplay to %1',
        SDISPLAY_SET_CURSOR: 'Set cursor on sdisplay to X: %1 Y: %2',
        SDISPLAY_FILL_SCREEN: 'Fill sdisplay screen with color %1',
        SDISPLAY_SET_ROTATION: 'Set rotation on sdisplay to %1',
        SDISPLAY_CLEAR_DISPLAY: 'Clear sdisplay display',
        SDISPLAY_SHOW_IMAGE: 'Show image %1 on display at x: %2 y: %3',
        SDISPLAY_SHOW_EMOJI: 'Show emoji %1 at x %2 y %3',

    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        SDISPLAY_CATEGORY: 'SDISPLAY',
        SDISPLAY_INIT: '初始化 sdisplay 引脚 DE %1 CSN %2 RST %3',
        SDISPLAY_SENDSTRING: '在 sdisplay 上显示文本 %1',
        SDISPLAY_TYPE: '选择 LCD 类型 %1',
        SDISPLAY_SET_TEXT_COLOR: '设置 sdisplay 的文本颜色为 %1',
        SDISPLAY_SET_TEXT_SIZE: '设置 sdisplay 的文本大小为 %1',
        SDISPLAY_SET_CURSOR: '设置 sdisplay 的光标为 X: %1 Y: %2',
        SDISPLAY_FILL_SCREEN: '用颜色 %1 填充 sdisplay 屏幕',
        SDISPLAY_SET_ROTATION: '将 sdisplay 的旋转设置为 %1',
        SDISPLAY_CLEAR_DISPLAY: '清除 sdisplay 显示屏',
        SDISPLAY_SHOW_IMAGE: '在显示屏上显示图像 %1 在 x: %2 y: %3',
        SDISPLAY_SHOW_EMOJI: '在 x: %2 y: %3 显示表情符号 %1'
     
    });

    return Blockly;
}

exports = addMsg;
