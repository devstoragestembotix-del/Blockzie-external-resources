/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

/**
 * Flyout pin dropdowns sometimes store labels like "IO36" instead of "36".
 * #define must expand to a valid Arduino pin expression (numeric or A0-style).
 * @param {string} pinVal Raw field value from CLK/DT dropdown.
 * @returns {string}
 */
function normalizeArduinoPin(pinVal) {
  const s = String(pinVal == null ? '' : pinVal).trim();
  if (/^A\d+$/i.test(s)) {
    return s;
  }
  const m = s.match(/(\d+)/);
  return m ? m[1] : s;
}

function addGenerator(Blockly) {

  function ensureRotaryEncoderPins () {
    if (!Blockly.Arduino.definitions_.rotaryencoder_pins) {
      Blockly.Arduino.definitions_.rotaryencoder_pins = `
#if defined(ARDUINO_ARCH_ESP32)
#define ENC_CLK 36
#define ENC_DT  39
#else
#define ENC_CLK A4
#define ENC_DT  A5
#endif
`;
    }
  }

  function ensureRotaryEncoderCore () {
    ensureRotaryEncoderPins();

    if (!Blockly.Arduino.definitions_.rotaryencoder_vars) {
      Blockly.Arduino.definitions_.rotaryencoder_vars = `
#ifndef IRAM_ATTR
#define IRAM_ATTR
#endif

#if defined(ARDUINO_ARCH_AVR)
  #if (ENC_CLK == 2) || (ENC_CLK == 3)
    #define ROTARYENCODER_USE_EXTI 1
  #else
    #define ROTARYENCODER_USE_EXTI 0
  #endif
  #if !ROTARYENCODER_USE_EXTI
    #define ROTARYENCODER_USE_PCINT 1
  #else
    #define ROTARYENCODER_USE_PCINT 0
  #endif
#else
  #define ROTARYENCODER_USE_EXTI 1
  #define ROTARYENCODER_USE_PCINT 0
#endif

volatile long encoderCount = 0;
volatile int8_t encoderDir = 0;
volatile uint8_t encoderPrevState = 0;
volatile int8_t encoderAcc = 0;
volatile uint32_t encoderLastStepUs = 0;
volatile int32_t encoderSpeedMilliSps = 0;

static inline uint8_t rotaryEncoderReadState() {
  uint8_t clk = (uint8_t)digitalRead(ENC_CLK);
  uint8_t dt  = (uint8_t)digitalRead(ENC_DT);
  return (uint8_t)((clk << 1) | dt);
}

static inline void rotaryEncoderApplyDelta(int8_t delta) {
  if (delta == 0) return;
  encoderAcc += delta;
  if (encoderAcc >= 4) {
    uint32_t now = micros();
    if (encoderLastStepUs != 0) {
      uint32_t dt = (uint32_t)(now - encoderLastStepUs);
      if (dt > 80UL && dt < 400000UL) {
        int32_t inst = (int32_t)(1000000000LL / (int64_t)dt);
        int32_t sm = encoderSpeedMilliSps;
        encoderSpeedMilliSps = (int32_t)(((int64_t)sm * 6 + (int64_t)inst * 4) / 10);
      }
    }
    encoderLastStepUs = now;
    encoderCount++;
    encoderDir = 1;
    encoderAcc = 0;
  } else if (encoderAcc <= -4) {
    uint32_t now = micros();
    if (encoderLastStepUs != 0) {
      uint32_t dt = (uint32_t)(now - encoderLastStepUs);
      if (dt > 80UL && dt < 400000UL) {
        int32_t inst = -(int32_t)(1000000000LL / (int64_t)dt);
        int32_t sm = encoderSpeedMilliSps;
        encoderSpeedMilliSps = (int32_t)(((int64_t)sm * 6 + (int64_t)inst * 4) / 10);
      }
    }
    encoderLastStepUs = now;
    encoderCount--;
    encoderDir = -1;
    encoderAcc = 0;
  }
}

static void rotaryEncoderTick() {
#if !ROTARYENCODER_USE_EXTI && !ROTARYENCODER_USE_PCINT
  const uint8_t state = rotaryEncoderReadState();
  const uint8_t idx = (uint8_t)((encoderPrevState << 2) | state);
  static const int8_t tbl[16] = {
    0, -1,  1,  0,
    1,  0,  0, -1,
   -1,  0,  0,  1,
    0,  1, -1,  0
  };
  rotaryEncoderApplyDelta(tbl[idx]);
  encoderPrevState = state;
#endif
}

static long rotaryEncoderGetCount() {
  rotaryEncoderTick();
  noInterrupts();
  long c = encoderCount;
  interrupts();
  return c;
}

static String rotaryEncoderGetDirection() {
  rotaryEncoderTick();
  noInterrupts();
  int8_t d = encoderDir;
  interrupts();
  if (d > 0) return "Clockwise";
  if (d < 0) return "Anticlockwise";
  return "NONE";
}

static void rotaryEncoderResetCount() {
  noInterrupts();
  encoderCount = 0;
  encoderDir = 0;
  encoderAcc = 0;
  encoderLastStepUs = 0;
  encoderSpeedMilliSps = 0;
  interrupts();
}

static float rotaryEncoderGetSpeed() {
  rotaryEncoderTick();
  uint32_t now = micros();
  noInterrupts();
  uint32_t last = encoderLastStepUs;
  int32_t sm = encoderSpeedMilliSps;
  interrupts();
  if (last == 0 || (uint32_t)(now - last) > 250000UL) {
    return 0.0f;
  }
  return (float)sm / 1000.0f;
}
`;
    }

    if (!Blockly.Arduino.definitions_.rotaryencoder_isr) {
      Blockly.Arduino.definitions_.rotaryencoder_isr = `
void IRAM_ATTR encoderISR() {
  const uint8_t state = rotaryEncoderReadState();
  const uint8_t idx = (uint8_t)((encoderPrevState << 2) | state);
  static const int8_t tbl[16] = {
    0, -1,  1,  0,
    1,  0,  0, -1,
   -1,  0,  0,  1,
    0,  1, -1,  0
  };
  rotaryEncoderApplyDelta(tbl[idx]);
  encoderPrevState = state;
}

#if ROTARYENCODER_USE_PCINT
static void rotaryEncoderEnablePinChange(uint8_t pin) {
  *digitalPinToPCMSK(pin) |= bit(digitalPinToPCMSKbit(pin));
  PCIFR = 0;
  *digitalPinToPCICR(pin) |= _BV(digitalPinToPCICRbit(pin));
}
ISR(PCINT0_vect) { encoderISR(); }
ISR(PCINT1_vect) { encoderISR(); }
ISR(PCINT2_vect) { encoderISR(); }
#endif
`;
    }

    if (!Blockly.Arduino.setups_.rotaryencoder_setup) {
      Blockly.Arduino.setups_.rotaryencoder_setup = `
#if defined(ARDUINO_ARCH_ESP32)
  pinMode(ENC_CLK, (ENC_CLK >= 34 && ENC_CLK <= 39) ? INPUT : INPUT_PULLUP);
  pinMode(ENC_DT, (ENC_DT >= 34 && ENC_DT <= 39) ? INPUT : INPUT_PULLUP);
#else
  pinMode(ENC_CLK, INPUT_PULLUP);
  pinMode(ENC_DT, INPUT_PULLUP);
#endif
#if ROTARYENCODER_USE_EXTI
  attachInterrupt(digitalPinToInterrupt(ENC_CLK), encoderISR, CHANGE);
#if !defined(ARDUINO_ARCH_AVR)
  attachInterrupt(digitalPinToInterrupt(ENC_DT), encoderISR, CHANGE);
#endif
#endif
#if ROTARYENCODER_USE_PCINT
  rotaryEncoderEnablePinChange(ENC_CLK);
  rotaryEncoderEnablePinChange(ENC_DT);
#endif
encoderPrevState = rotaryEncoderReadState();
`;
    }
  }

  // ================================
  // INIT
  // ================================
  Blockly.Arduino.rotaryencoder_init = function (block) {
    const clkPin = normalizeArduinoPin(block.getFieldValue('CLK_PIN'));
    const dtPin = normalizeArduinoPin(block.getFieldValue('DT_PIN'));

    Blockly.Arduino.definitions_.rotaryencoder_pins = `
#define ENC_CLK ${clkPin}
#define ENC_DT  ${dtPin}
`;

    delete Blockly.Arduino.definitions_.rotaryencoder_vars;
    delete Blockly.Arduino.definitions_.rotaryencoder_isr;
    delete Blockly.Arduino.setups_.rotaryencoder_setup;
    ensureRotaryEncoderCore();
    return '';
  };

  // ================================
  // GET COUNT
  // ================================
  Blockly.Arduino.rotaryencoder_getCount = function () {
    ensureRotaryEncoderCore();
    return ['rotaryEncoderGetCount()', Blockly.Arduino.ORDER_ATOMIC];
  };

  // ================================
  // RESET COUNT
  // ================================
  Blockly.Arduino.rotaryencoder_resetCount = function () {
    ensureRotaryEncoderCore();
    return 'rotaryEncoderResetCount();\n';
  };

  // ================================
  // DIRECTION
  // ================================
  Blockly.Arduino.rotaryencoder_direction = function () {
    ensureRotaryEncoderCore();
    return ['rotaryEncoderGetDirection()', Blockly.Arduino.ORDER_ATOMIC];
  };

  // ================================
  // SPEED (steps per second, signed)
  // ================================
  Blockly.Arduino.rotaryencoder_speed = function () {
    ensureRotaryEncoderCore();
    return ['rotaryEncoderGetSpeed()', Blockly.Arduino.ORDER_ATOMIC];
  };

  return Blockly;
}

module.exports = addGenerator;
