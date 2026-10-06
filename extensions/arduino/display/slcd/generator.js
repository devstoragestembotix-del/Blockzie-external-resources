function addGenerator (Blockly) {
    Blockly.Arduino.lcd_config = function (block) {
        const type = block.getFieldValue('TYPE');
        const address = block.getFieldValue('ADDRESS');
        const index = block.getFieldValue('LCD_INDEX') || '0'; // default index 0

        if (type === 'I2C_MCP23008') {
            Blockly.Arduino.includes_.lcd_config = `#include <Adafruit_LiquidCrystal.h>`;
            Blockly.Arduino.definitions_[`lcd_${index}`] = `Adafruit_LiquidCrystal lcd${index}(${address}, 16, 2);`;
            Blockly.Arduino.setups_[`lcd_${index}_begin`] = `lcd${index}.begin(16, 2);`;
        } else if (type === 'I2C_PCF8574') {
            Blockly.Arduino.includes_.lcd_config = `#include <LiquidCrystal_I2C.h>`;
            Blockly.Arduino.definitions_[`lcd_${index}`] = `LiquidCrystal_I2C lcd${index}(${address}, 16, 2);`;
            Blockly.Arduino.setups_[`lcd_${index}_begin`] = `lcd${index}.begin(16, 2);`;
        }

        return '';
    };

    Blockly.Arduino.lcd_config_standard = function (block) {
        const rs = block.getFieldValue('RS');
        const e = block.getFieldValue('E');
        const db4 = block.getFieldValue('DB4');
        const db5 = block.getFieldValue('DB5');
        const db6 = block.getFieldValue('DB6');
        const db7 = block.getFieldValue('DB7');
        const index = block.getFieldValue('LCD_INDEX') || '0';

        Blockly.Arduino.includes_['lcd'] = '#include <LiquidCrystal.h>';
        Blockly.Arduino.definitions_[`lcd_${index}`] =
            `LiquidCrystal lcd${index}(${rs}, ${e}, ${db4}, ${db5}, ${db6}, ${db7});`;
        Blockly.Arduino.setups_[`lcd_${index}_begin`] = `lcd${index}.begin(16, 2);`;

        return '';
    };

    Blockly.Arduino.lcd_clear_screen = function (block) {
        const index = block.getFieldValue('LCD_INDEX') || '0';
        return `lcd${index}.clear();\n`;
    };

    Blockly.Arduino.lcd_backlight_control = function (block) {
        const state = block.getFieldValue('STATE');
        const index = block.getFieldValue('LCD_INDEX') || '0';
        return state === 'on' ? `lcd${index}.backlight();\n` : `lcd${index}.noBacklight();\n`;
    };

    Blockly.Arduino.lcd_set_position = function (block) {
        const column = Blockly.Arduino.valueToCode(block, 'COLUMN', Blockly.Arduino.ORDER_ATOMIC);
        const row = Blockly.Arduino.valueToCode(block, 'ROW', Blockly.Arduino.ORDER_ATOMIC);
        const index = block.getFieldValue('LCD_INDEX') || '0';
        return `lcd${index}.setCursor(${column}, ${row});\n`;
    };

    Blockly.Arduino.lcd_print_text = function (block) {
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC);
        const index = block.getFieldValue('LCD_INDEX') || '0';
        return `lcd${index}.print(${text});\n`;
    };

    Blockly.Arduino.lcd_action_control = function (block) {
        const action = block.getFieldValue('ACTION');
        const index = block.getFieldValue('LCD_INDEX') || '0';

        const actionsMap = {
            CLEAR: `lcd${index}.clear();`,
            BACKLIGHT_ON: `lcd${index}.backlight();`,
            BACKLIGHT_OFF: `lcd${index}.noBacklight();`,
            DISPLAY_ON: `lcd${index}.display();`,
            DISPLAY_OFF: `lcd${index}.noDisplay();`,
            CURSOR_ON: `lcd${index}.cursor();`,
            CURSOR_OFF: `lcd${index}.noCursor();`,
            BLINK_ON: `lcd${index}.blink();`,
            BLINK_OFF: `lcd${index}.noBlink();`,
            AUTOSCROLL_ON: `lcd${index}.autoscroll();`,
            AUTOSCROLL_OFF: `lcd${index}.noAutoscroll();`,
            SCROLL_LEFT: `lcd${index}.scrollDisplayLeft();`,
            SCROLL_RIGHT: `lcd${index}.scrollDisplayRight();`,
            LTR: `lcd${index}.leftToRight();`,
            RTL: `lcd${index}.rightToLeft();`
        };

        const code = actionsMap[action] || '';
        return `${code}\n`;
    };

    return Blockly;
}

exports = addGenerator;
