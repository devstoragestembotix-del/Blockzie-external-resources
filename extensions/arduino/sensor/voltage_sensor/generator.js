/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {
    function voltagePinExpr (pinVal) {
        const s = String(pinVal == null ? '' : pinVal).trim();
        if (/^A\d+$/i.test(s)) {
            return s.toUpperCase();
        }
        const m = s.match(/(\d+)/);
        return m ? m[1] : 'A6';
    }

    function voltageEnsure (pin, adcRef) {
        const pinExpr = pin ? voltagePinExpr(pin) : '';
        const refExpr = adcRef ? String(adcRef) : '';

        Blockly.Arduino.definitions_.voltagesensor_vars = `
#if defined(ARDUINO_ARCH_ESP32)
#ifndef VOLTAGE_ADC_MAX
#define VOLTAGE_ADC_MAX 4095
#endif
int voltageAdcPin = 33;
float voltageAdcRef = 3.3f;
#else
#ifndef VOLTAGE_ADC_MAX
#define VOLTAGE_ADC_MAX 1023
#endif
int voltageAdcPin = A6;
float voltageAdcRef = 5.0f;
#endif
`;

        Blockly.Arduino.definitions_.voltagesensor_func = `
int readVoltageRaw() {
  (void)analogRead(voltageAdcPin);
  delay(5);
  long sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogRead(voltageAdcPin);
    delay(2);
  }
  return (int)(sum / 16);
}

float readVoltageVout() {
  return ((float)readVoltageRaw()) * (voltageAdcRef / (float)VOLTAGE_ADC_MAX);
}
`;

        if (pinExpr) {
            Blockly.Arduino.setups_.voltagesensor_pin = `voltageAdcPin = ${pinExpr};`;
        }
        if (refExpr) {
            Blockly.Arduino.setups_.voltagesensor_ref = `voltageAdcRef = ${refExpr}f;`;
        }

        Blockly.Arduino.setups_.voltagesensor_adc = `
#if defined(ARDUINO_ARCH_ESP32)
analogReadResolution(12);
analogSetAttenuation(ADC_11db);
analogSetPinAttenuation(voltageAdcPin, ADC_11db);
#else
analogReference(DEFAULT);
#endif
`;
    }

    Blockly.Arduino.voltagesensor_init = function (block) {
        const pin = block.getFieldValue('PIN');
        const adcRef = block.getFieldValue('ADCREF');
        voltageEnsure(pin, adcRef);
        return `voltageAdcPin = ${voltagePinExpr(pin)};\nvoltageAdcRef = ${adcRef}f;\n`;
    };

    Blockly.Arduino.voltagesensor_readVout = function () {
        voltageEnsure();
        return ['readVoltageVout()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.voltagesensor_readRaw = function () {
        voltageEnsure();
        return ['readVoltageRaw()', Blockly.Arduino.ORDER_ATOMIC];
    };

    return Blockly;
}

module.exports = addGenerator;
