/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        LCD_CATEGORY: 'LCD',
        LCD_CONFIG: 'configure LCD %1 type %2 with address %3',
        LCD_CONFIG_STANDARD: 'configure LCD %1 type to %2 with pins: RS %3 E %4 DB4 %5 DB5 %6 DB6 %7 DB7 %8',
        LCD_CLEAR_SCREEN: 'clear lcd screen',
        LCD_BACKLIGHT_CONTROL: 'set lcd backlight %1',
        LCD_SET_POSITION: 'set cursor column %1 row %2',
        LCD_PRINT_TEXT: 'lcd print text %1',
        LCD_STATE_ON: 'on',
        LCD_STATE_OFF: 'off',
        LCD_ACTION_CONTROL: 'on LCD %1 %2',
        LCD_ACTION_CLEAR: 'clear the screen',
        LCD_ACTION_BACKLIGHT_ON: 'turn on the backlight',
        LCD_ACTION_BACKLIGHT_OFF: 'turn off the backlight',
        LCD_ACTION_DISPLAY_ON: 'turn on the display',
        LCD_ACTION_DISPLAY_OFF: 'turn off the display',
        LCD_ACTION_CURSOR_ON: 'turn on the cursor',
        LCD_ACTION_CURSOR_OFF: 'turn off the cursor',
        LCD_ACTION_BLINK_ON: 'turn on cursor blinking',
        LCD_ACTION_BLINK_OFF: 'turn off cursor blinking',
        LCD_ACTION_AUTOSCROLL_ON: 'turn on autoscrolling',
        LCD_ACTION_AUTOSCROLL_OFF: 'turn off autoscrolling',
        LCD_ACTION_SCROLL_LEFT: 'scroll the display to the left',
        LCD_ACTION_SCROLL_RIGHT: 'scroll the display to the right',
        LCD_ACTION_LTR: 'set print direction left to right',
        LCD_ACTION_RTL: 'set print direction right to left'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        LCD_CATEGORY: 'LCD',
        LCD_CONFIG: '配置LCD %1 类型 %2 地址 %3',
        LCD_CONFIG_STANDARD: '配置LCD %1 类型为 %2 并使用引脚: RS %3 E %4 DB4 %5 DB5 %6 DB6 %7 DB7 %8',
        LCD_CLEAR_SCREEN: '清除 lcd 屏幕',
        LCD_BACKLIGHT_CONTROL: '设置 lcd 背光 %1',
        LCD_SET_POSITION: '设置光标 列 %1 行 %2',
        LCD_PRINT_TEXT: 'lcd 打印文字 %1',
        LCD_STATE_ON: '开',
        LCD_STATE_OFF: '关',
        LCD_ACTION_CONTROL: '在LCD %1 执行 %2',
        LCD_ACTION_CLEAR: '清除屏幕',
        LCD_ACTION_BACKLIGHT_ON: '打开背光',
        LCD_ACTION_BACKLIGHT_OFF: '关闭背光',
        LCD_ACTION_DISPLAY_ON: '打开显示屏',
        LCD_ACTION_DISPLAY_OFF: '关闭显示屏',
        LCD_ACTION_CURSOR_ON: '打开光标',
        LCD_ACTION_CURSOR_OFF: '关闭光标',
        LCD_ACTION_BLINK_ON: '打开光标闪烁',
        LCD_ACTION_BLINK_OFF: '关闭光标闪烁',
        LCD_ACTION_AUTOSCROLL_ON: '打开自动滚动',
        LCD_ACTION_AUTOSCROLL_OFF: '关闭自动滚动',
        LCD_ACTION_SCROLL_LEFT: '向左滚动显示内容',
        LCD_ACTION_SCROLL_RIGHT: '向右滚动显示内容',
        LCD_ACTION_LTR: '设置打印方向从左到右',
        LCD_ACTION_RTL: '设置打印方向从右到左'
    });

    return Blockly;
}

exports = addMsg;
