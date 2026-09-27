/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    const ensureVars = function () {
        Blockly.Arduino.includes_.tcs34725_init = `#include <Wire.h>\n#include <Adafruit_TCS34725.h>`;
        Blockly.Arduino.definitions_.tcs34725_vars = `
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);
uint16_t tcs_r = 0, tcs_g = 0, tcs_b = 0, tcs_c = 0;
uint16_t tcs_colorTemp = 0, tcs_lux = 0;
`;
        Blockly.Arduino.definitions_.tcs34725_helpers = `
void tcs34725_update() {
  tcs.getRawData(&tcs_r, &tcs_g, &tcs_b, &tcs_c);
  tcs_colorTemp = tcs.calculateColorTemperature_dn40(tcs_r, tcs_g, tcs_b, tcs_c);
  tcs_lux = tcs.calculateLux(tcs_r, tcs_g, tcs_b);
}

String tcs34725_detectColour() {
  tcs34725_update();

  if (tcs_c < 50) {
    return String("BLACK");
  }

  float r = (float)tcs_r / tcs_c * 255.0;
  float g = (float)tcs_g / tcs_c * 255.0;
  float b = (float)tcs_b / tcs_c * 255.0;

  if (r > 180 && g > 180 && b > 180) {
    return String("WHITE");
  }
  if (r > 120 && g > 100 && b < 100 && (r - b) > 40 && (g - b) > 30) {
    return String("YELLOW");
  }
  if (r >= g && r >= b && (r - g) > 15) {
    return String("RED");
  }
  if (g >= r && g >= b && (g - r) > 15) {
    return String("GREEN");
  }
  if (b >= r && b >= g && (b - r) > 15) {
    return String("BLUE");
  }
  if (g >= r && g >= b) {
    return String("GREEN");
  }
  if (r >= g && r >= b) {
    return String("RED");
  }
  return String("BLUE");
}

int tcs34725_getChannel(char channel) {
  tcs34725_update();
  if (channel == 'R') return tcs_r;
  if (channel == 'G') return tcs_g;
  if (channel == 'B') return tcs_b;
  return tcs_c;
}

int tcs34725_getColorTemp() {
  tcs34725_update();
  return tcs_colorTemp;
}

int tcs34725_getLux() {
  tcs34725_update();
  return tcs_lux;
}
`;
    };

    Blockly.Arduino.tcs34725_connect = function (block) {
        ensureVars();
        const sda = block.getFieldValue('SDA') || '21';
        const scl = block.getFieldValue('SCL') || '22';

        // AI & Robotics ESP32: SDA=21, SCL=22
        // AI & IoT Nano: SDA=A4, SCL=A5 (Wire default)
        return `#if defined(ARDUINO_ARCH_ESP32)
Wire.begin(${sda}, ${scl});
#else
Wire.begin();
#endif
tcs.begin();
tcs.setInterrupt(false);
`;
    };

    Blockly.Arduino.tcs34725_setLed = function (block) {
        const state = block.getFieldValue('STATE');
        const flag = state === 'ON' ? 'false' : 'true';
        ensureVars();
        return `tcs.setInterrupt(${flag});\n`;
    };

    Blockly.Arduino.tcs34725_readRGB = function () {
        ensureVars();
        return `tcs34725_update();\n`;
    };

    Blockly.Arduino.tcs34725_color = function (block) {
        const channel = block.getFieldValue('CHANNEL');
        ensureVars();
        return [`tcs34725_getChannel('${channel}')`, Blockly.Arduino.ORDER_FUNCTION_CALL];
    };

    Blockly.Arduino.tcs34725_colorTemp = function () {
        ensureVars();
        return [`tcs34725_getColorTemp()`, Blockly.Arduino.ORDER_FUNCTION_CALL];
    };

    Blockly.Arduino.tcs34725_lux = function () {
        ensureVars();
        return [`tcs34725_getLux()`, Blockly.Arduino.ORDER_FUNCTION_CALL];
    };

    Blockly.Arduino.tcs34725_isColour = function (block) {
        const colour = block.getFieldValue('COLOUR');
        ensureVars();
        return [`(tcs34725_detectColour() == String("${colour}"))`, Blockly.Arduino.ORDER_EQUALITY];
    };

    Blockly.Arduino.tcs34725_getColourName = function () {
        ensureVars();
        return [`tcs34725_detectColour()`, Blockly.Arduino.ORDER_FUNCTION_CALL];
    };

    return Blockly;
}

exports = addGenerator;
