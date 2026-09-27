/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        TCS34725_CATEGORY: 'Colour Sensor',
        TCS34725_CONNECT: 'init colour sensor SDA %1 SCL %2',
        TCS34725_SETLED: 'set colour sensor LED %1',
        TCS34725_LED_ON: 'ON',
        TCS34725_LED_OFF: 'OFF',
        TCS34725_READRGB: 'read RGB colour',
        TCS34725_COLOR: '%1 colour',
        TCS34725_CHANNEL_RED: 'red',
        TCS34725_CHANNEL_GREEN: 'green',
        TCS34725_CHANNEL_BLUE: 'blue',
        TCS34725_CHANNEL_CLEAR: 'clear',
        TCS34725_COLORTEMP: 'colour temperature',
        TCS34725_LUX: 'lux value',
        TCS34725_ISCOLOUR: 'is colour sensor detecting %1 ?',
        TCS34725_COLOUR_RED: 'RED',
        TCS34725_COLOUR_GREEN: 'GREEN',
        TCS34725_COLOUR_BLUE: 'BLUE',
        TCS34725_COLOUR_YELLOW: 'YELLOW',
        TCS34725_COLOUR_WHITE: 'WHITE',
        TCS34725_COLOUR_BLACK: 'BLACK',
        TCS34725_GETCOLOURNAME: 'detected colour name'
    });
    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        TCS34725_CATEGORY: '颜色传感器',
        TCS34725_CONNECT: '初始化颜色传感器 SDA %1 SCL %2',
        TCS34725_SETLED: '设置颜色传感器 LED %1',
        TCS34725_LED_ON: '开',
        TCS34725_LED_OFF: '关',
        TCS34725_READRGB: '读取 RGB 颜色',
        TCS34725_COLOR: '%1 颜色',
        TCS34725_CHANNEL_RED: '红',
        TCS34725_CHANNEL_GREEN: '绿',
        TCS34725_CHANNEL_BLUE: '蓝',
        TCS34725_CHANNEL_CLEAR: '透明/环境光',
        TCS34725_COLORTEMP: '色温',
        TCS34725_LUX: '光照度 lux',
        TCS34725_ISCOLOUR: '颜色传感器检测到 %1 吗？',
        TCS34725_COLOUR_RED: '红色',
        TCS34725_COLOUR_GREEN: '绿色',
        TCS34725_COLOUR_BLUE: '蓝色',
        TCS34725_COLOUR_YELLOW: '黄色',
        TCS34725_COLOUR_WHITE: '白色',
        TCS34725_COLOUR_BLACK: '黑色',
        TCS34725_GETCOLOURNAME: '检测到的颜色名称'
    });
    return Blockly;
}

exports = addMsg;
