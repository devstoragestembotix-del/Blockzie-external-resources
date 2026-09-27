/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

function addGenerator (Blockly) {
    const order = Blockly.Arduino.ORDER_ATOMIC || 0;

    function rgbledNormalizePin (pinVal) {
        const s = String(pinVal == null ? '' : pinVal).trim();
        if (/^A\d+$/i.test(s)) {
            return s;
        }
        const m = s.match(/(\d+)/);
        return m ? m[1] : s;
    }

    function rgbledPortId (port) {
        return `p${String(port).replace(/[^0-9]/g, '') || '1'}`;
    }

    function rgbledReadExistingPin (defText) {
        const m = String(defText || '').match(/Adafruit_NeoPixel\s+rgbled_px_\w+\(1,\s*([^,]+),/);
        return m ? String(m[1]).trim() : '';
    }

    function rgbledEnsure (port, explicitPin) {
        const id = rgbledPortId(port);
        const objKey = `rgbled_px_${id}`;
        let pin = '5';
        if (explicitPin != null && String(explicitPin).trim() !== '') {
            pin = rgbledNormalizePin(explicitPin);
        } else {
            pin = rgbledReadExistingPin(Blockly.Arduino.definitions_[objKey]) || '5';
        }

        Blockly.Arduino.includes_.rgbled_neopixel = '#include <Adafruit_NeoPixel.h>';
        Blockly.Arduino.definitions_[objKey] =
            `Adafruit_NeoPixel rgbled_px_${id}(1, ${pin}, NEO_GRB + NEO_KHZ800);`;

        if (!Blockly.Arduino.definitions_[`rgbled_rgb_${id}`]) {
            Blockly.Arduino.definitions_[`rgbled_rgb_${id}`] =
                `uint8_t rgbled_r_${id} = 0, rgbled_g_${id} = 0, rgbled_b_${id} = 0;`;
            Blockly.Arduino.definitions_[`rgbled_apply_${id}`] = `
void rgbled_apply_${id}() {
  rgbled_px_${id}.setPixelColor(0, rgbled_px_${id}.Color(rgbled_r_${id}, rgbled_g_${id}, rgbled_b_${id}));
  rgbled_px_${id}.show();
}`;
            Blockly.Arduino.setups_[`rgbled_begin_${id}`] = `rgbled_px_${id}.begin();`;
        }
        return id;
    }

    function rgbledChannelVar (id, channel) {
        if (channel === 'G') return `rgbled_g_${id}`;
        if (channel === 'B') return `rgbled_b_${id}`;
        return `rgbled_r_${id}`;
    }

    function rgbledColorCode (block, fieldName) {
        const raw = Blockly.Arduino.valueToCode(block, fieldName, order) || '0xff0000';
        return String(raw).replace(/'/g, '').replace('#', '0x');
    }

    function rgbledSyncFromHex (id, hexExpr) {
        return (
            `rgbled_r_${id} = (uint8_t)((${hexExpr}) >> 16);\n` +
            `rgbled_g_${id} = (uint8_t)((${hexExpr}) >> 8);\n` +
            `rgbled_b_${id} = (uint8_t)(${hexExpr});\n`
        );
    }

    function rgbledSetRgb (id, r, g, b) {
        return (
            `rgbled_r_${id} = (uint8_t)constrain((${r}), 0, 255);\n` +
            `rgbled_g_${id} = (uint8_t)constrain((${g}), 0, 255);\n` +
            `rgbled_b_${id} = (uint8_t)constrain((${b}), 0, 255);\n` +
            `rgbled_apply_${id}();\n`
        );
    }

    function rgbledReadRgb (block) {
        return {
            r: Blockly.Arduino.valueToCode(block, 'R', order) || '0',
            g: Blockly.Arduino.valueToCode(block, 'G', order) || '0',
            b: Blockly.Arduino.valueToCode(block, 'B', order) || '0'
        };
    }

    Blockly.Arduino.rgbled_init = function (block) {
        const port = block.getFieldValue('PORT');
        const pin = rgbledNormalizePin(block.getFieldValue('PIN'));
        rgbledEnsure(port, pin);
        return '';
    };

    Blockly.Arduino.rgbled_lightUp = function (block) {
        const port = block.getFieldValue('PORT');
        const hex = rgbledColorCode(block, 'COLOR');
        const id = rgbledEnsure(port);
        return rgbledSyncFromHex(id, hex) + `rgbled_apply_${id}();\n`;
    };

    Blockly.Arduino.rgbled_lightUpForSecs = function (block) {
        const port = block.getFieldValue('PORT');
        const hex = rgbledColorCode(block, 'COLOR');
        const secs = Blockly.Arduino.valueToCode(block, 'SECS', order) || '1';
        const id = rgbledEnsure(port);
        return (
            rgbledSyncFromHex(id, hex) +
            `rgbled_apply_${id}();\n` +
            `delay((unsigned long)((${secs}) * 1000));\n` +
            `rgbled_r_${id} = 0;\nrgbled_g_${id} = 0;\nrgbled_b_${id} = 0;\n` +
            `rgbled_apply_${id}();\n`
        );
    };

    Blockly.Arduino.rgbled_setColor = function (block) {
        const port = block.getFieldValue('PORT');
        const { r, g, b } = rgbledReadRgb(block);
        const id = rgbledEnsure(port);
        return rgbledSetRgb(id, r, g, b);
    };

    Blockly.Arduino.rgbled_lightOff = function (block) {
        const port = block.getFieldValue('PORT');
        const id = rgbledEnsure(port);
        return (
            `rgbled_r_${id} = 0;\nrgbled_g_${id} = 0;\nrgbled_b_${id} = 0;\n` +
            `rgbled_apply_${id}();\n`
        );
    };

    Blockly.Arduino.rgbled_setChannel = function (block) {
        const port = block.getFieldValue('PORT');
        const channel = block.getFieldValue('CHANNEL');
        const value = Blockly.Arduino.valueToCode(block, 'VALUE', order) || '0';
        const id = rgbledEnsure(port);
        const ch = rgbledChannelVar(id, channel);
        return `${ch} = (uint8_t)constrain((${value}), 0, 255);\nrgbled_apply_${id}();\n`;
    };

    Blockly.Arduino.rgbled_changeChannel = function (block) {
        const port = block.getFieldValue('PORT');
        const channel = block.getFieldValue('CHANNEL');
        const delta = Blockly.Arduino.valueToCode(block, 'DELTA', order) || '0';
        const id = rgbledEnsure(port);
        const ch = rgbledChannelVar(id, channel);
        return `${ch} = (uint8_t)constrain((int)${ch} + (int)(${delta}), 0, 255);\nrgbled_apply_${id}();\n`;
    };

    Blockly.Arduino.rgbled_getChannel = function (block) {
        const port = block.getFieldValue('PORT');
        const channel = block.getFieldValue('CHANNEL');
        const id = rgbledEnsure(port);
        const code = rgbledChannelVar(id, channel);
        return [code, order];
    };

    return Blockly;
}

module.exports = addGenerator;
