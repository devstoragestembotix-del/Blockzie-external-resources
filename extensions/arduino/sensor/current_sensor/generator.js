/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {
    function currentPinExpr (pinVal) {
        const s = String(pinVal == null ? '' : pinVal).trim();
        if (/^A\d+$/i.test(s)) {
            return s.toUpperCase();
        }
        const m = s.match(/(\d+)/);
        return m ? m[1] : 'A7';
    }

    function currentEnsure (pin, sensitivityVA) {
        const pinExpr = pin ? currentPinExpr(pin) : '';
        const sensExpr = (sensitivityVA !== undefined && sensitivityVA !== null && sensitivityVA !== '')
            ? String(sensitivityVA)
            : '';

        Blockly.Arduino.definitions_.currentsensor_vars = `
#if defined(ARDUINO_ARCH_ESP32)
#ifndef CURRENT_ADC_MAX
#define CURRENT_ADC_MAX 4095
#endif
#ifndef CURRENT_ADC_REF
#define CURRENT_ADC_REF 3.3f
#endif
int currentAdcPin = 32;
#else
#ifndef CURRENT_ADC_MAX
#define CURRENT_ADC_MAX 1023
#endif
#ifndef CURRENT_ADC_REF
#define CURRENT_ADC_REF 5.0f
#endif
int currentAdcPin = A7;
#endif
float currentSensitivity = 0.185f;
float currentZeroPoint = 2.5f;
`;

        Blockly.Arduino.definitions_.currentsensor_func = `
int readCurrentRaw() {
  (void)analogRead(currentAdcPin);
  delay(5);
  long sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogRead(currentAdcPin);
    delay(2);
  }
  return (int)(sum / 16);
}

float readCurrentVoltage() {
  return ((float)readCurrentRaw()) * (CURRENT_ADC_REF / (float)CURRENT_ADC_MAX);
}

float readCurrentAmps() {
  return (readCurrentVoltage() - currentZeroPoint) / currentSensitivity;
}

float readCurrentMilliAmps() {
  return readCurrentAmps() * 1000.0f;
}
`;

        if (pinExpr) {
            Blockly.Arduino.setups_.currentsensor_pin = `currentAdcPin = ${pinExpr};`;
        }
        if (sensExpr) {
            Blockly.Arduino.setups_.currentsensor_sens = `currentSensitivity = ${sensExpr}f;`;
        }

        Blockly.Arduino.setups_.currentsensor_adc = `
#if defined(ARDUINO_ARCH_ESP32)
analogReadResolution(12);
analogSetAttenuation(ADC_11db);
analogSetPinAttenuation(currentAdcPin, ADC_11db);
#else
analogReference(DEFAULT);
#endif
currentZeroPoint = CURRENT_ADC_REF / 2.0f;
`;
    }

    Blockly.Arduino.currentsensor_init = function (block) {
        const pin = block.getFieldValue('PIN');
        const sensitivityRaw = block.getFieldValue('MODEL');
        const sensitivityNum = Number(sensitivityRaw);
        const sensitivityVA = (Number.isFinite(sensitivityNum) && sensitivityNum > 1)
            ? (sensitivityNum / 1000.0)
            : sensitivityRaw;
        currentEnsure(pin, sensitivityVA);
        return `currentAdcPin = ${currentPinExpr(pin)};\ncurrentSensitivity = ${sensitivityVA}f;\ncurrentZeroPoint = CURRENT_ADC_REF / 2.0f;\n`;
    };

    Blockly.Arduino.currentsensor_readAmps = function () {
        currentEnsure();
        return ['readCurrentAmps()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.currentsensor_readRaw = function () {
        currentEnsure();
        return ['readCurrentRaw()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.currentsensor_readMilliAmps = function () {
        currentEnsure();
        return ['readCurrentMilliAmps()', Blockly.Arduino.ORDER_ATOMIC];
    };

    return Blockly;
}

module.exports = addGenerator;
