/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    // Nano AI & IoT red module: INITR_GREENTAB works on hardware (not 144GREENTAB).
    const SDISPLAY_DEFAULT_INIT = 'INITR_GREENTAB';
    // Matches working Nano AI & IoT wiring (user-verified).
    const SDISPLAY_AI_KIT_PINS = {dc: 8, csn: 10, rst: 0, bl: '-1'};

    function sdisplayBitmapCode (bitmap, x, y) {
        if (bitmap === 'image_ottobot') {
            // Solid fills like the S logo: one color per shape, no outline pass.
            return (
                `sdisplay.fillScreen(ST77XX_BLACK);\n` +
                `sdisplay.drawBitmap(${x}, ${y}, image_stembot_blue, IMAGE_WIDTH, IMAGE_HEIGHT, STEMBOTIX_BLUE);\n` +
                `sdisplay.drawBitmap(${x}, ${y}, image_stembot_orange, IMAGE_WIDTH, IMAGE_HEIGHT, STEMBOTIX_ORANGE);\n` +
                `sdisplay.drawBitmap(${x}, ${y}, image_stembot_white, IMAGE_WIDTH, IMAGE_HEIGHT, ST77XX_WHITE);\n`
            );
        }
        if (bitmap === 'image_stembotix') {
            return (
                `sdisplay.fillScreen(ST77XX_BLACK);\n` +
                `sdisplay.drawBitmap(${x}, ${y}, image_stembotix_orange, IMAGE_WIDTH, IMAGE_HEIGHT, STEMBOTIX_ORANGE);\n` +
                `sdisplay.drawBitmap(${x}, ${y}, image_stembotix_blue, IMAGE_WIDTH, IMAGE_HEIGHT, STEMBOTIX_BLUE);\n`
            );
        }

        var drawColor = 'ST77XX_WHITE';
        if (bitmap === 'image_smiley' || bitmap === 'epd_bitmap_sad') {
            drawColor = 'ST77XX_YELLOW';
        } else if (bitmap === 'epd_bitmap_angry') {
            // Same as smile: 1-bit filled circle with feature holes. 0xF800 is real red on this panel.
            drawColor = '0xF800';
        }
        return (
            `sdisplay.fillScreen(ST77XX_BLACK);\n` +
            `sdisplay.drawBitmap(${x}, ${y}, ${bitmap}, IMAGE_WIDTH, IMAGE_HEIGHT, ${drawColor});\n`
        );
    }

    function sdisplayInitCode (initType) {
        var code;
        if (initType === 'INITB') {
            code = 'sdisplay.initB();\n';
        } else {
            code = `sdisplay.initR(${initType});\n`;
        }
        return code +
            'sdisplay.setRotation(1);\n' +
            'delay(150);\n';
    }

    // blocks.js uses ST77XX_* names; older bundled Adafruit_ST7735.h only defines ST7735_*.
    function sdisplayEnsureColorDefines () {
        Blockly.Arduino.definitions_.sdisplay_colors = `#ifndef ST77XX_BLACK
#define ST77XX_BLACK 0x0000
#define ST77XX_WHITE 0xFFFF
#define ST77XX_RED 0xF800
#define ST77XX_GREEN 0x07E0
#define ST77XX_BLUE 0x001F
#define ST77XX_CYAN 0x07FF
#define ST77XX_MAGENTA 0xF81F
#define ST77XX_YELLOW 0xFFE0
#define ST77XX_ORANGE 0xFC00
#endif
`;
    }

    function sdisplayApplyPins (dc, csn, rst, bl) {
        Blockly.Arduino.sdisplayPins_ = {dc: dc, csn: csn, rst: rst, bl: bl};
        var pinDefs =
            `#define TFT_CSN ${csn}\n` +
            `#define TFT_RST ${rst}\n` +
            `#define TFT_DC ${dc}\n`;
        if (bl && bl !== '-1') {
            pinDefs += `#define TFT_BL ${bl}\n`;
        }
        Blockly.Arduino.definitions_.sdisplay_pins = pinDefs;
        // Hardware SPI on Nano (MOSI=11, SCK=13) — same as working 3-arg constructor.
        Blockly.Arduino.definitions_.sdisplay_object =
            'Adafruit_ST7735 sdisplay(TFT_CSN, TFT_DC, TFT_RST);\n';
    }

    function sdisplaySetupPreamble (bl) {
        if (!bl || bl === '-1') {
            return '';
        }
        return (
            'pinMode(TFT_BL, OUTPUT);\n' +
            'digitalWrite(TFT_BL, HIGH);\n'
        );
    }

    // One setup entry — same order as working hand-written sketch.
    function sdisplayEnsureHardware (initType) {
        const pins = Blockly.Arduino.sdisplayPins_ || SDISPLAY_AI_KIT_PINS;
        var panelInit = initType || Blockly.Arduino.sdisplayInitType_;
        if (!panelInit) {
            panelInit = SDISPLAY_DEFAULT_INIT;
        }
        const bl = pins.bl != null ? pins.bl : SDISPLAY_AI_KIT_PINS.bl;

        Blockly.Arduino.includes_.sdisplay_gfx = '#include <Adafruit_GFX.h>';
        Blockly.Arduino.includes_.sdisplay_st7735 = '#include <Adafruit_ST7735.h>';
        Blockly.Arduino.includes_.sdisplay_spi = '#include <SPI.h>';
        sdisplayEnsureColorDefines();
        sdisplayApplyPins(pins.dc, pins.csn, pins.rst, bl);

        // Do not Serial.begin here: default RST is pin 0 (Nano RX). UART
        // setup on the same pin makes TFT reset/init fail.
        var setupCode = '';
        var preamble = sdisplaySetupPreamble(bl);
        if (preamble) {
            setupCode += preamble;
        }
        setupCode += 'SPI.begin();\n' + sdisplayInitCode(panelInit);

        Blockly.Arduino.setups_.sdisplay_setup = setupCode;

        delete Blockly.Arduino.setups_.sdisplay_spi;
        delete Blockly.Arduino.setups_.sdisplay_panel;
    }

    // Blockly.Arduino.stembotixLCD_init = function (block) {
    //     const de = block.getFieldValue('DE');
    //     const csn = block.getFieldValue('CSN');
    //     // const id = Blockly.Arduino.valueToCode(block, 'RST', Blockly.Arduino.ORDER_ATOMIC);
    //     const rst = block.getFieldValue('RST');

    //     Blockly.Arduino.includes_.stembotixLCD_init = `#include <Adafruit_GFX.h>\n#include <Adafruit_ST7735.h>\n#include <SPI.h>`;
    //     // Blockly.Arduino.definitions_.stembotixLCD_init = `Openblock_nrf stembotixLCD;`;
    //     // Blockly.Arduino.definitions_.stembotixLCD_init = `Blockzie stembotixLCD;`;

    //     return `stembotixLCD.init(${rst}, ${de}, ${csn});\n`;
    // };

    Blockly.Arduino.sdisplay_init = function (block) {
        const csn = block.getFieldValue('CSN');
        const rst = block.getFieldValue('RST');
        const dc = block.getFieldValue('DE');

        sdisplayApplyPins(dc, csn, rst, '-1');
        if (!Blockly.Arduino.sdisplayInitType_) {
            Blockly.Arduino.sdisplayInitType_ = SDISPLAY_DEFAULT_INIT;
        }
        sdisplayEnsureHardware(Blockly.Arduino.sdisplayInitType_);

        return '';
    };
    
    // Blockly.Arduino.stembotixLCD_sendString = function (block) {
    //     const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);
    //     // const id = Blockly.Arduino.valueToCode(block, 'ID', Blockly.Arduino.ORDER_ATOMIC);

    //     return `stembotixLCD.sendString(${data});\n`;
    // };

    Blockly.Arduino.sdisplay_sendString = function (block) {
        sdisplayEnsureHardware();
        var data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC) || '""';
    
        return `sdisplay.print(${data});\n`;
    };
    
    Blockly.Arduino.sdisplay_type = function (block) {
        const initType = block.getFieldValue('TYPE') || SDISPLAY_DEFAULT_INIT;
        Blockly.Arduino.sdisplayInitType_ = initType;
        sdisplayEnsureHardware(initType);
        return '';
    };

    Blockly.Arduino['sdisplay_setTextColor'] = function (block) {
        sdisplayEnsureHardware();
        var color = block.getFieldValue('COLOR');
        var code = 'sdisplay.setTextColor(' + color + ');\n';
        return code;
    };
    
    Blockly.Arduino['sdisplay_setTextSize'] = function (block) {
        sdisplayEnsureHardware();
        var size = Blockly.Arduino.valueToCode(block, 'SIZE', Blockly.Arduino.ORDER_ATOMIC) || '1';
        var code = 'sdisplay.setTextSize(' + size + ');\n';
        return code;
    };
    
    Blockly.Arduino['sdisplay_setCursor'] = function (block) {
        sdisplayEnsureHardware();
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || '0';
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || '0';
        var code = 'sdisplay.setCursor(' + x + ', ' + y + ');\n';
        return code;
    };

    Blockly.Arduino['sdisplay_fillScreen'] = function (block) {
        sdisplayEnsureHardware();
        var color = block.getFieldValue('COLOR');
        // Convert the selected color into a suitable Arduino value (like a predefined color constant)
        var code = 'sdisplay.fillScreen(' + color + ');\n';
        return code;
    };

    Blockly.Arduino['sdisplay_setRotation'] = function (block) {
        sdisplayEnsureHardware();
        var rotation = block.getFieldValue('ROTATION');
        var code = 'sdisplay.setRotation(' + rotation + ');\n';
        return code;
    };

    Blockly.Arduino['sdisplay_clearDisplay'] = function (block) {
        sdisplayEnsureHardware();
        var code = 'sdisplay.fillScreen(ST77XX_BLACK);\n';
        return code;
    };

    Blockly.Arduino['sdisplay_showImage'] = function (block) {
        sdisplayEnsureHardware();
        Blockly.Arduino.includes_.sdisplay_image = '#include <image_data.h>';
        var image = block.getFieldValue('IMAGE');
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || '0';
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || '0';
        return sdisplayBitmapCode(image, x, y);
    };
    
    Blockly.Arduino['sdisplay_showEmoji'] = function (block) {
        sdisplayEnsureHardware();
        Blockly.Arduino.includes_.sdisplay_image = '#include <image_data.h>';
        var emoji = block.getFieldValue('EMOJI');
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || '0';
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || '0';
        return sdisplayBitmapCode(emoji, x, y);
    };

    // Blockly.Arduino['sdisplay_showEmoji'] = function(block) {
    //     var dropdown_emoji = block.getFieldValue('EMOJI');
    //     var size = block.getFieldValue('SIZE');
    //     var value_x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || '0';
    //     var value_y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || '0';
    //     var color = block.getFieldValue('COLOR');
    //     var background = block.getFieldValue('BACKGROUND');   // <-- dropdown value direct lo

    //     var code = 'displayEmoji(' + dropdown_emoji + ', ' + value_x + ', ' + value_y + ', ' +
    //                 size + ', ' + color + ', ' + background + ');\n';
    //     return code;
    // };


    Blockly.Arduino['sdisplay_drawLine'] = function(block) {
        sdisplayEnsureHardware();
        var x1 = Blockly.Arduino.valueToCode(block, 'X1', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y1 = Blockly.Arduino.valueToCode(block, 'Y1', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var x2 = Blockly.Arduino.valueToCode(block, 'X2', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y2 = Blockly.Arduino.valueToCode(block, 'Y2', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var color = block.getFieldValue('COLOR');

        var code = `sdisplay.drawLine(${x1}, ${y1}, ${x2}, ${y2}, ${color});\n`;
        return code;
    };

        // Rectangle
    Blockly.Arduino['sdisplay_rectangle'] = function (block) {
        sdisplayEnsureHardware();
        var mode = block.getFieldValue('MODE');
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var w = Blockly.Arduino.valueToCode(block, 'W', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var h = Blockly.Arduino.valueToCode(block, 'H', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var color = block.getFieldValue('COLOR');

        var code = (mode === 'FILL')
            ? `sdisplay.fillRect(${x}, ${y}, ${w}, ${h}, ${color});\n`
            : `sdisplay.drawRect(${x}, ${y}, ${w}, ${h}, ${color});\n`;
        return code;
    };

    // Round Rectangle
    Blockly.Arduino['sdisplay_roundrect'] = function (block) {
        sdisplayEnsureHardware();
        var mode = block.getFieldValue('MODE');
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var w = Blockly.Arduino.valueToCode(block, 'W', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var h = Blockly.Arduino.valueToCode(block, 'H', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var r = Blockly.Arduino.valueToCode(block, 'R', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var color = block.getFieldValue('COLOR');

        var code = (mode === 'FILL')
            ? `sdisplay.fillRoundRect(${x}, ${y}, ${w}, ${h}, ${r}, ${color});\n`
            : `sdisplay.drawRoundRect(${x}, ${y}, ${w}, ${h}, ${r}, ${color});\n`;
        return code;
    };

    // Circle
    Blockly.Arduino['sdisplay_circle'] = function (block) {
        sdisplayEnsureHardware();
        var mode = block.getFieldValue('MODE');
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var r = Blockly.Arduino.valueToCode(block, 'R', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var color = block.getFieldValue('COLOR');

        var code = (mode === 'FILL')
            ? `sdisplay.fillCircle(${x}, ${y}, ${r}, ${color});\n`
            : `sdisplay.drawCircle(${x}, ${y}, ${r}, ${color});\n`;
        return code;
    };

    // Adafruit_GFX has no fillEllipse/drawEllipse — use helper functions.
    function sdisplayEnsureEllipseHelpers () {
        Blockly.Arduino.includes_.sdisplay_math = '#include <math.h>';
        Blockly.Arduino.definitions_.sdisplay_ellipse_fn = `
void sdisplayFillEllipse(int16_t cx, int16_t cy, int16_t rx, int16_t ry, uint16_t color) {
  if (rx < 1) rx = 1;
  if (ry < 1) ry = 1;
  long rx2 = (long)rx * rx;
  long ry2 = (long)ry * ry;
  for (int16_t dx = -rx; dx <= rx; dx++) {
    for (int16_t dy = -ry; dy <= ry; dy++) {
      if ((long)dx * dx * ry2 + (long)dy * dy * rx2 <= rx2 * ry2) {
        sdisplay.drawPixel(cx + dx, cy + dy, color);
      }
    }
  }
}

void sdisplayDrawEllipse(int16_t cx, int16_t cy, int16_t rx, int16_t ry, uint16_t color) {
  if (rx < 1) rx = 1;
  if (ry < 1) ry = 1;
  for (int16_t deg = 0; deg < 360; deg++) {
    float r = deg * 0.0174532925f;
    sdisplay.drawPixel(cx + (int16_t)(rx * cos(r) + 0.5f), cy + (int16_t)(ry * sin(r) + 0.5f), color);
  }
}
`;
    }

    Blockly.Arduino['sdisplay_ellipse'] = function (block) {
        sdisplayEnsureHardware();
        sdisplayEnsureEllipseHelpers();
        var mode = block.getFieldValue('MODE');
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var xl = Blockly.Arduino.valueToCode(block, 'XL', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var yl = Blockly.Arduino.valueToCode(block, 'YL', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var color = block.getFieldValue('COLOR');

        var code = (mode === 'FILL')
            ? `sdisplayFillEllipse(${x}, ${y}, ${xl}, ${yl}, ${color});\n`
            : `sdisplayDrawEllipse(${x}, ${y}, ${xl}, ${yl}, ${color});\n`;
        return code;
    };

    // Triangle
    Blockly.Arduino['sdisplay_triangle'] = function (block) {
        sdisplayEnsureHardware();
        var mode = block.getFieldValue('MODE');
        var x1 = Blockly.Arduino.valueToCode(block, 'X1', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y1 = Blockly.Arduino.valueToCode(block, 'Y1', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var x2 = Blockly.Arduino.valueToCode(block, 'X2', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y2 = Blockly.Arduino.valueToCode(block, 'Y2', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var x3 = Blockly.Arduino.valueToCode(block, 'X3', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y3 = Blockly.Arduino.valueToCode(block, 'Y3', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var color = block.getFieldValue('COLOR');

        var code = (mode === 'FILL')
            ? `sdisplay.fillTriangle(${x1}, ${y1}, ${x2}, ${y2}, ${x3}, ${y3}, ${color});\n`
            : `sdisplay.drawTriangle(${x1}, ${y1}, ${x2}, ${y2}, ${x3}, ${y3}, ${color});\n`;
        return code;
    };

    return Blockly;
}

exports = addGenerator;
