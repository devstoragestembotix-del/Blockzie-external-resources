/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    const withRefresh = code => `${code}oled.display();\n`;

    const oledFontIncludes = {
        FreeSerif9pt7b: '#include <Fonts/FreeSerif9pt7b.h>',
        FreeSerif12pt7b: '#include <Fonts/FreeSerif12pt7b.h>',
        FreeSans9pt7b: '#include <Fonts/FreeSans9pt7b.h>',
        FreeSans12pt7b: '#include <Fonts/FreeSans12pt7b.h>',
        FreeMono9pt7b: '#include <Fonts/FreeMono9pt7b.h>',
        FreeMono12pt7b: '#include <Fonts/FreeMono12pt7b.h>',
        FreeSerifBold9pt7b: '#include <Fonts/FreeSerifBold9pt7b.h>',
        FreeSansBold9pt7b: '#include <Fonts/FreeSansBold9pt7b.h>'
    };

    const baseOledIncludes = '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>';

    function ensureOled (options) {
        const opts = options || {};
        const w = opts.w || '128';
        const h = opts.h || '64';
        const addr = opts.addr || '0x3c';
        const power = opts.power || 'SSD1306_SWITCHCAPVCC';
        const altAddr = addr === '0x3d' ? '0x3c' : '0x3d';
        const force = !!opts.force;

        let includes = Blockly.Arduino.includes_.oled_init || baseOledIncludes;
        if (includes.indexOf('Adafruit_GFX.h') < 0) {
            includes = `${baseOledIncludes}\n${includes}`;
        }
        Blockly.Arduino.includes_.oled_init = includes;

        if (force || !Blockly.Arduino.definitions_.oled_init) {
            Blockly.Arduino.definitions_.oled_init =
                `Adafruit_SSD1306 oled(${w}, ${h}, &Wire, -1, 100000UL, 100000UL);`;
        }

        if (force || !Blockly.Arduino.setups_.oled_init) {
            Blockly.Arduino.setups_.oled_init = `
Wire.begin();
Wire.setClock(100000L);
delay(100);
if (!oled.begin(${power}, ${addr})) {
  delay(50);
  oled.begin(${power}, ${altAddr});
}
oled.clearDisplay();
oled.setTextSize(1);
oled.setTextColor(SSD1306_WHITE);
oled.cp437(true);
oled.setCursor(0, 0);
oled.display();
`;
        }
    }

    Blockly.Arduino.oled_init = function (block) {
        const w = Blockly.Arduino.valueToCode(block, 'W', Blockly.Arduino.ORDER_ATOMIC) || '128';
        const h = Blockly.Arduino.valueToCode(block, 'H', Blockly.Arduino.ORDER_ATOMIC) || '64';
        const addr = block.getFieldValue('ADDR') || '0x3c';
        const power = block.getFieldValue('POWER') || 'SSD1306_SWITCHCAPVCC';

        ensureOled({w, h, addr, power, force: true});
        return '';
    };

    Blockly.Arduino.oled_drawPixel = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.drawPixel(${x}, ${y}, ${colour});\n`);
    };

    Blockly.Arduino.oled_drawLine = function (block) {
        ensureOled();
        const x0 = Blockly.Arduino.valueToCode(block, 'X0', Blockly.Arduino.ORDER_ATOMIC);
        const y0 = Blockly.Arduino.valueToCode(block, 'Y0', Blockly.Arduino.ORDER_ATOMIC);
        const x1 = Blockly.Arduino.valueToCode(block, 'X1', Blockly.Arduino.ORDER_ATOMIC);
        const y1 = Blockly.Arduino.valueToCode(block, 'Y1', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.drawLine(${x0}, ${y0}, ${x1}, ${y1}, ${colour});\n`);
    };

    Blockly.Arduino.oled_drawRect = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        const w = Blockly.Arduino.valueToCode(block, 'W', Blockly.Arduino.ORDER_ATOMIC);
        const h = Blockly.Arduino.valueToCode(block, 'H', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.drawRect(${x}, ${y}, ${w}, ${h}, ${colour});\n`);
    };

    Blockly.Arduino.oled_fillRect = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        const w = Blockly.Arduino.valueToCode(block, 'W', Blockly.Arduino.ORDER_ATOMIC);
        const h = Blockly.Arduino.valueToCode(block, 'H', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.fillRect(${x}, ${y}, ${w}, ${h}, ${colour});\n`);
    };

    Blockly.Arduino.oled_drawCircle = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        const r = Blockly.Arduino.valueToCode(block, 'R', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.drawCircle(${x}, ${y}, ${r}, ${colour});\n`);
    };

    Blockly.Arduino.oled_fillCircle = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        const r = Blockly.Arduino.valueToCode(block, 'R', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.fillCircle(${x}, ${y}, ${r}, ${colour});\n`);
    };

    Blockly.Arduino.oled_drawRoundRect = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        const w = Blockly.Arduino.valueToCode(block, 'W', Blockly.Arduino.ORDER_ATOMIC);
        const h = Blockly.Arduino.valueToCode(block, 'H', Blockly.Arduino.ORDER_ATOMIC);
        const r = Blockly.Arduino.valueToCode(block, 'R', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.drawRoundRect(${x}, ${y}, ${w}, ${h}, ${r}, ${colour});\n`);
    };

    Blockly.Arduino.oled_fillRoundRect = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        const w = Blockly.Arduino.valueToCode(block, 'W', Blockly.Arduino.ORDER_ATOMIC);
        const h = Blockly.Arduino.valueToCode(block, 'H', Blockly.Arduino.ORDER_ATOMIC);
        const r = Blockly.Arduino.valueToCode(block, 'R', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(`oled.fillRoundRect(${x}, ${y}, ${w}, ${h}, ${r}, ${colour});\n`);
    };

    Blockly.Arduino.oled_drawTriangle = function (block) {
        ensureOled();
        const x0 = Blockly.Arduino.valueToCode(block, 'X0', Blockly.Arduino.ORDER_ATOMIC);
        const y0 = Blockly.Arduino.valueToCode(block, 'Y0', Blockly.Arduino.ORDER_ATOMIC);
        const x1 = Blockly.Arduino.valueToCode(block, 'X1', Blockly.Arduino.ORDER_ATOMIC);
        const y1 = Blockly.Arduino.valueToCode(block, 'Y1', Blockly.Arduino.ORDER_ATOMIC);
        const x2 = Blockly.Arduino.valueToCode(block, 'X2', Blockly.Arduino.ORDER_ATOMIC);
        const y2 = Blockly.Arduino.valueToCode(block, 'Y2', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(
            `oled.drawTriangle(${x0}, ${y0}, ${x1}, ${y1}, ${x2}, ${y2}, ${colour});\n`
        );
    };

    Blockly.Arduino.oled_fillTriangle = function (block) {
        ensureOled();
        const x0 = Blockly.Arduino.valueToCode(block, 'X0', Blockly.Arduino.ORDER_ATOMIC);
        const y0 = Blockly.Arduino.valueToCode(block, 'Y0', Blockly.Arduino.ORDER_ATOMIC);
        const x1 = Blockly.Arduino.valueToCode(block, 'X1', Blockly.Arduino.ORDER_ATOMIC);
        const y1 = Blockly.Arduino.valueToCode(block, 'Y1', Blockly.Arduino.ORDER_ATOMIC);
        const x2 = Blockly.Arduino.valueToCode(block, 'X2', Blockly.Arduino.ORDER_ATOMIC);
        const y2 = Blockly.Arduino.valueToCode(block, 'Y2', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR');

        return withRefresh(
            `oled.fillTriangle(${x0}, ${y0}, ${x1}, ${y1}, ${x2}, ${y2}, ${colour});\n`
        );
    };

    Blockly.Arduino.oled_setTextSize = function (block) {
        ensureOled();
        const size = Blockly.Arduino.valueToCode(block, 'SIZE', Blockly.Arduino.ORDER_ATOMIC) || '1';

        return `oled.setTextSize(${size});\n`;
    };

    Blockly.Arduino.oled_setTextColor = function (block) {
        ensureOled();
        const colour = block.getFieldValue('COLOUR') || 'SSD1306_WHITE';
        // Background is required for dark text to be visible on monochrome OLED.
        let bgColor = block.getFieldValue('BGCOLOR');
        if (!bgColor) {
            bgColor = (colour === 'SSD1306_BLACK') ? 'SSD1306_WHITE' : 'SSD1306_BLACK';
        }

        return `oled.setTextColor(${colour}, ${bgColor});\n`;
    };

    Blockly.Arduino.oled_setFont = function (block) {
        ensureOled();
        const font = block.getFieldValue('FONT');

        if (font === 'default') {
            return 'oled.setFont();\n';
        }

        // Keep font include AFTER Adafruit_GFX in the same includes entry.
        const fontInc = oledFontIncludes[font];
        let includes = Blockly.Arduino.includes_.oled_init || baseOledIncludes;
        if (includes.indexOf('Adafruit_GFX.h') < 0) {
            includes = `${baseOledIncludes}\n${includes}`;
        }
        if (fontInc && includes.indexOf(fontInc) < 0) {
            includes = `${includes}\n${fontInc}`;
        }
        Blockly.Arduino.includes_.oled_init = includes;
        delete Blockly.Arduino.includes_[`oled_font_${font}`];

        return `oled.setFont(&${font});\n`;
    };

    Blockly.Arduino.oled_setText = function (block) {
        ensureOled();
        const size = block.getFieldValue('SIZE');
        const colour = block.getFieldValue('COLOUR');
        const bgColor = block.getFieldValue('BGCOLOR');

        return `oled.setTextSize(${size});\noled.setTextColor(${colour}, ${bgColor});\n`;
    };

    Blockly.Arduino.oled_setCursor = function (block) {
        ensureOled();
        const x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        const y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);

        return `oled.setCursor(${x}, ${y});\n`;
    };

    Blockly.Arduino.oled_print = function (block) {
        ensureOled();
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);
        const colour = block.getFieldValue('COLOUR') || 'SSD1306_WHITE';
        const bgColor = block.getFieldValue('BGCOLOR') || 'SSD1306_BLACK';
        const eol = block.getFieldValue('EOL');
        const setColor = `oled.setTextColor(${colour}, ${bgColor});\n`;

        if (eol === 'warp') {
            return withRefresh(`${setColor}oled.println(${data});\n`);
        }
        return withRefresh(`${setColor}oled.print(${data});\n`);
    };

    Blockly.Arduino.oled_printLine = function (block) {
        ensureOled();
        const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);

        return withRefresh(`oled.println(${data});\n`);
    };

    Blockly.Arduino.oled_clear = function () {
        ensureOled();
        return withRefresh('oled.clearDisplay();\n');
    };

    Blockly.Arduino.oled_refresh = function () {
        ensureOled();
        return 'oled.display();\n';
    };

    Blockly.Arduino.oled_setInvert = function (block) {
        ensureOled();
        const state = block.getFieldValue('STATE');

        return withRefresh(`oled.invertDisplay(${state});\n`);
    };

    Blockly.Arduino.oled_startScroll = function (block) {
        ensureOled();
        const type = block.getFieldValue('TYPE');
        const y0 = block.getFieldValue('Y0');
        const y1 = block.getFieldValue('Y1');

        if (type === '0') {
            return `oled.startscrollright(${y0}, ${y1});\n`;
        } else if (type === '1') {
            return `oled.startscrollleft(${y0}, ${y1});\n`;
        } else if (type === '2') {
            return `oled.startscrolldiagright(${y0}, ${y1});\n`;
        }
        return `oled.startscrolldiagleft(${y0}, ${y1});\n`;
    };

    Blockly.Arduino.oled_stopScroll = function () {
        ensureOled();
        return 'oled.stopscroll();\n';
    };

    return Blockly;
}

exports = addGenerator;
