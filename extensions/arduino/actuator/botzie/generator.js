/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

const ZAPPIE_KIT_IDS = ['zappie', 'zappiekit_arduinosp32', 'zappiekit'];
const ESP32_KIT_IDS = ['zappie', 'arduinoesp32', 'intermediatekit'];
const NANO_KIT_IDS = ['arduinonano', 'iotaikit', 'iotaikitnew', 'arduinonano_arduinouno'];

// MX1508 DC motors — Zappie / AI & Robotics (INA1=27, INB1=25, INA2=26, INB2=32)
const MX1508_ESP32_PROFILE = {
    LEFT_A: 27,
    LEFT_B: 25,
    RIGHT_A: 26,
    RIGHT_B: 32,
    TRIG: 17,
    ECHO: 16,
    LINE_LEFT: 35,
    LINE_RIGHT: 34,
    BUZZER: 4,
    OBSTACLE_CM: 20
};

const ROBOTICS_4WD_ESP32_PROFILE = {
    FL1: 2,
    FL2: 13,
    FR1: 18,
    FR2: 12,
    BL1: 15,
    BL2: 23,
    BR1: 19,
    BR2: 27,
    LEFT_A: 15,
    LEFT_B: 23,
    RIGHT_A: 19,
    RIGHT_B: 27,
    TRIG: 17,
    ECHO: 16,
    LINE_LEFT: 35,
    LINE_RIGHT: 34,
    BUZZER: 4,
    OBSTACLE_CM: 20
};

const BOTZIE_ESP32_PROFILES = {
    zappie: Object.assign({}, MX1508_ESP32_PROFILE),
    intermediatekit: Object.assign({}, ROBOTICS_4WD_ESP32_PROFILE),
    default: {
        LEFT_A: 15,
        LEFT_B: 23,
        RIGHT_A: 19,
        RIGHT_B: 27,
        TRIG: 16,
        ECHO: 17,
        LINE_LEFT: 32,
        LINE_RIGHT: 33,
        BUZZER: 25,
        OBSTACLE_CM: 20
    }
};

const BOTZIE_NANO_PROFILES = {
    iotaikit: {
        FL_A: 'A0',
        FL_B: 3,
        FR_A: 'A1',
        FR_B: 5,
        BL_A: 'A2',
        BL_B: 6,
        BR_A: 'A3',
        BR_B: 9,
        LEFT_IN1: 'A0',
        LEFT_IN2: 3,
        LEFT_EN: 3,
        RIGHT_IN1: 'A1',
        RIGHT_IN2: 5,
        RIGHT_EN: 5,
        BT_RX: 2,
        BT_TX: 13,
        ESP_RX: 13,
        ESP_TX: 2,
        TRIG: 12,
        ECHO: 8,
        LINE_LEFT: 'A6',
        LINE_RIGHT: 'A7',
        BUZZER: 4,
        OBSTACLE_CM: 20
    },
    default: {
        FL_A: 'A0',
        FL_B: 3,
        FR_A: 'A1',
        FR_B: 5,
        BL_A: 'A2',
        BL_B: 6,
        BR_A: 'A3',
        BR_B: 9,
        LEFT_IN1: 'A0',
        LEFT_IN2: 3,
        LEFT_EN: 3,
        RIGHT_IN1: 'A1',
        RIGHT_IN2: 5,
        RIGHT_EN: 5,
        BT_RX: 2,
        BT_TX: 13,
        ESP_RX: 13,
        ESP_TX: 2,
        TRIG: 12,
        ECHO: 8,
        LINE_LEFT: 'A6',
        LINE_RIGHT: 'A7',
        BUZZER: 4,
        OBSTACLE_CM: 20
    }
};


function botzieDeviceIdMatchesList (deviceId, ids) {
    const id = String(deviceId || '').toLowerCase();
    if (!id) {
        return false;
    }
    return ids.some((kitId) => id === kitId || id.includes(kitId));
}

function botzieGetDeviceIdFromGlobals () {
    const parts = [];
    try {
        if (typeof window === 'undefined') {
            return '';
        }
        const w = window;
        if (w.Blockzie) {
            parts.push(w.Blockzie.deviceId, w.Blockzie.deviceType);
            if (w.Blockzie.device) {
                parts.push(w.Blockzie.device.deviceId, w.Blockzie.device.id, w.Blockzie.device.type);
            }
        }
        if (w.openBlock) {
            parts.push(w.openBlock.deviceId, w.openBlock.deviceType);
        }
        if (w.vm && w.vm.runtime) {
            const rt = w.vm.runtime;
            parts.push(rt.deviceId, rt.deviceType, rt._deviceId);
            if (rt.device) {
                parts.push(rt.device.deviceId, rt.device.id, rt.device.type);
            }
        }
        if (w.store && typeof w.store.getState === 'function') {
            const state = w.store.getState();
            const device = (state && (state.device ||
                (state.gui && state.gui.device) ||
                (state.scratchGui && state.scratchGui.device))) || null;
            if (device) {
                parts.push(device.deviceId, device.id, device.type, device.name);
            }
        }
    } catch (e) {
        // ignore
    }
    return parts.filter(Boolean).map((v) => String(v).toLowerCase()).join(' ');
}

function botzieGetUIDeviceLabel () {
    if (typeof document === 'undefined') {
        return '';
    }
    try {
        const els = document.querySelectorAll('button, span, div, p, label, a');
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (el.children && el.children.length > 4) {
                continue;
            }
            const text = (el.textContent || '').trim();
            if (/^zappie(\s+kit)?$/i.test(text)) {
                return 'zappie';
            }
            if (/^ai\s*&\s*robotics(\s+kit)?$/i.test(text)) {
                return 'intermediatekit';
            }
            if (/^ai\s*&\s*iot(\s+kit)?$/i.test(text)) {
                return 'iotaikit';
            }
        }
    } catch (e) {
        // ignore
    }
    return '';
}

function botzieGetWorkspaceDeviceId (Blockly) {
    try {
        const ws = Blockly.getMainWorkspace && Blockly.getMainWorkspace();
        if (ws) {
            const fromWs = String(
                ws.deviceId || ws.deviceType ||
                (typeof ws.getDeviceId === 'function' ? ws.getDeviceId() : '') ||
                (ws.options && (ws.options.deviceId || ws.options.deviceType)) ||
                (ws.device && (ws.device.deviceId || ws.device.id || ws.device.type)) ||
                (ws.target && (ws.target.deviceId || ws.target.id)) ||
                ''
            ).toLowerCase();
            if (fromWs) {
                return fromWs;
            }
        }
        if (typeof Blockly !== 'undefined') {
            const fromBlockly = String(
                (Blockly.Device && (Blockly.Device.deviceId || Blockly.Device.id)) ||
                Blockly.deviceId ||
                ''
            ).toLowerCase();
            if (fromBlockly) {
                return fromBlockly;
            }
        }
        const fromGlobals = botzieGetDeviceIdFromGlobals();
        if (fromGlobals) {
            return fromGlobals;
        }
    } catch (e) {
        return '';
    }
    return '';
}

function botzieIsZappieKit (Blockly) {
    const uiLabel = botzieGetUIDeviceLabel();
    if (uiLabel === 'intermediatekit' || uiLabel === 'iotaikit') {
        return false;
    }
    if (uiLabel === 'zappie') {
        return true;
    }
    const deviceId = botzieGetWorkspaceDeviceId(Blockly);
    if (deviceId) {
        if (deviceId.includes('zappiekit') ||
            botzieDeviceIdMatchesList(deviceId, ZAPPIE_KIT_IDS)) {
            return true;
        }
        if (/\bzappie\b/.test(deviceId)) {
            return true;
        }
    }
    return false;
}

function botzieIsIntermediateKit (Blockly) {
    if (botzieGetUIDeviceLabel() === 'intermediatekit') {
        return true;
    }
    const deviceId = botzieGetWorkspaceDeviceId(Blockly);
    return deviceId.includes('intermediatekit') || deviceId.includes('intermediate');
}

function botzieIsIotAiKit (Blockly) {
    if (botzieGetUIDeviceLabel() === 'iotaikit') {
        return true;
    }
    const deviceId = botzieGetWorkspaceDeviceId(Blockly);
    return deviceId.includes('iotaikit');
}

function isEsp32Kit (Blockly) {
    if (botzieIsZappieKit(Blockly) || botzieIsIntermediateKit(Blockly)) {
        return true;
    }
    const deviceId = botzieGetWorkspaceDeviceId(Blockly);
    if (botzieDeviceIdMatchesList(deviceId, ESP32_KIT_IDS)) {
        return true;
    }
    if (botzieDeviceIdMatchesList(deviceId, NANO_KIT_IDS) || botzieIsIotAiKit(Blockly)) {
        return false;
    }
    return true;
}

function getKitProfileKey (Blockly) {
    if (botzieIsZappieKit(Blockly)) {
        return 'zappie';
    }
    if (botzieIsIntermediateKit(Blockly)) {
        return 'intermediatekit';
    }
    if (botzieIsIotAiKit(Blockly)) {
        return 'iotaikit';
    }
    const deviceId = botzieGetWorkspaceDeviceId(Blockly);
    if (botzieDeviceIdMatchesList(deviceId, ['zappie'])) {
        return 'zappie';
    }
    if (botzieDeviceIdMatchesList(deviceId, ['intermediatekit'])) {
        return 'intermediatekit';
    }
    if (botzieDeviceIdMatchesList(deviceId, NANO_KIT_IDS)) {
        return deviceId.includes('iotaikit') ? 'iotaikit' : 'default';
    }
    return 'default';
}

function resolveBotzieProfile (Blockly) {
    const profiles = isEsp32Kit(Blockly) ? BOTZIE_ESP32_PROFILES : BOTZIE_NANO_PROFILES;
    const key = getKitProfileKey(Blockly);
    return profiles[key] || profiles.default;
}

function kitFlagDefines (Blockly) {
    if (botzieIsIotAiKit(Blockly)) {
        return '#define BOTZIE_KIT_IOT 1\n';
    }
    if (botzieIsIntermediateKit(Blockly)) {
        return '#define BOTZIE_KIT_ROBOTICS 1\n';
    }
    if (botzieIsZappieKit(Blockly)) {
        return '#define BOTZIE_KIT_ZAPPIE 1\n';
    }
    return '';
}

function buildEsp32PinDefines (profile, Blockly) {
    const flags = kitFlagDefines(Blockly);
    const roboticsPins = profile.FL1 != null ? `
#define BOTZIE_MOTOR_FL1 ${profile.FL1}
#define BOTZIE_MOTOR_FL2 ${profile.FL2}
#define BOTZIE_MOTOR_FR1 ${profile.FR1}
#define BOTZIE_MOTOR_FR2 ${profile.FR2}
#define BOTZIE_MOTOR_BL1 ${profile.BL1}
#define BOTZIE_MOTOR_BL2 ${profile.BL2}
#define BOTZIE_MOTOR_BR1 ${profile.BR1}
#define BOTZIE_MOTOR_BR2 ${profile.BR2}
` : '';
    return `${flags}${roboticsPins}
#define BOTZIE_LEFT_A ${profile.LEFT_A}
#define BOTZIE_LEFT_B ${profile.LEFT_B}
#define BOTZIE_RIGHT_A ${profile.RIGHT_A}
#define BOTZIE_RIGHT_B ${profile.RIGHT_B}
#define BOTZIE_TRIG_PIN ${profile.TRIG}
#define BOTZIE_ECHO_PIN ${profile.ECHO}
#define BOTZIE_LINE_LEFT_PIN ${profile.LINE_LEFT}
#define BOTZIE_LINE_RIGHT_PIN ${profile.LINE_RIGHT}
#define BOTZIE_BUZZER_PIN ${profile.BUZZER}
#define BOTZIE_OBSTACLE_CM ${profile.OBSTACLE_CM}
#define BOTZIE_FRAME_START "$$$$"
#define BOTZIE_FRAME_END "####"
`;
}

function buildNanoPinDefines (profile, Blockly) {
    const flags = kitFlagDefines(Blockly);
    const iotPins = botzieIsIotAiKit(Blockly) ? `
#define BOTZIE_DHT_PIN 4
#define BOTZIE_IOT_LED_D10 10
#define BOTZIE_IOT_LED_D7 7
#define BOTZIE_IOT_LED_D5 8
#define BOTZIE_IOT_LED_D6 12
#define BOTZIE_IOT_LED_D11 11
` : '';
    const flA = profile.FL_A != null ? profile.FL_A : profile.LEFT_IN1;
    const flB = profile.FL_B != null ? profile.FL_B : profile.LEFT_IN2;
    const frA = profile.FR_A != null ? profile.FR_A : profile.RIGHT_IN1;
    const frB = profile.FR_B != null ? profile.FR_B : profile.RIGHT_IN2;
    const blA = profile.BL_A != null ? profile.BL_A : flA;
    const blB = profile.BL_B != null ? profile.BL_B : flB;
    const brA = profile.BR_A != null ? profile.BR_A : frA;
    const brB = profile.BR_B != null ? profile.BR_B : frB;
    return `${flags}${iotPins}
#define BOTZIE_FL_A ${flA}
#define BOTZIE_FL_B ${flB}
#define BOTZIE_FR_A ${frA}
#define BOTZIE_FR_B ${frB}
#define BOTZIE_BL_A ${blA}
#define BOTZIE_BL_B ${blB}
#define BOTZIE_BR_A ${brA}
#define BOTZIE_BR_B ${brB}
#define BOTZIE_LEFT_IN1 ${profile.LEFT_IN1}
#define BOTZIE_LEFT_IN2 ${profile.LEFT_IN2}
#define BOTZIE_LEFT_EN ${profile.LEFT_EN}
#define BOTZIE_RIGHT_IN1 ${profile.RIGHT_IN1}
#define BOTZIE_RIGHT_IN2 ${profile.RIGHT_IN2}
#define BOTZIE_RIGHT_EN ${profile.RIGHT_EN}
#define BOTZIE_BT_RX ${profile.BT_RX}
#define BOTZIE_BT_TX ${profile.BT_TX}
#define BOTZIE_ESP_RX_PIN ${profile.ESP_RX}
#define BOTZIE_ESP_TX_PIN ${profile.ESP_TX}
#define BOTZIE_TRIG_PIN ${profile.TRIG}
#define BOTZIE_ECHO_PIN ${profile.ECHO}
#define BOTZIE_LINE_LEFT_PIN ${profile.LINE_LEFT}
#define BOTZIE_LINE_RIGHT_PIN ${profile.LINE_RIGHT}
#define BOTZIE_BUZZER_PIN ${profile.BUZZER}
#define BOTZIE_OBSTACLE_CM ${profile.OBSTACLE_CM}
#define BOTZIE_FRAME_START "$$$$"
#define BOTZIE_FRAME_END "####"
`;
}

const BOTZIE_BLE_SERVICE_UUID = 'd804b643-6ce7-4e81-9f8a-ce0f699085eb';
const BOTZIE_BLE_COMMAND_UUID = 'c8659211-af91-4ad3-a995-a58d6fd26145';
const BOTZIE_BLE_HW_VERSION_UUID = 'c8659212-af91-4ad3-a995-a58d6fd26145';

function buildBotzieLedServoLib () {
    return `
void botzieReply(const String &msg);
void botzieSendStream(const String &msg);

#define BOTZIE_MAX_LEDS 8
#define BOTZIE_MAX_SERVO_COUNT 6
#if defined(ARDUINO_ARCH_ESP32)
#define BOTZIE_SERVO_MIN_US 500
#else
#define BOTZIE_SERVO_MIN_US 544
#define BOTZIE_SW_PWM_STEPS 20
#define BOTZIE_SW_PWM_TICK_US 500
#endif
#define BOTZIE_SERVO_MAX_US 2400
#define BOTZIE_SERVO_STOP_US 1500
#define BOTZIE_RADAR_MIN_ANGLE 0
#define BOTZIE_RADAR_MAX_ANGLE 180
#define BOTZIE_RADAR_STEP 2
#define BOTZIE_RADAR_MAX_CM 200

struct BotzieLedEntry {
  uint8_t pin;
  bool state;
  uint8_t brightness;
  bool hasHardwarePwm;
};

struct BotzieServoEntry {
  uint8_t pin;
  int angle;
  uint16_t maxAngle;
  bool attached;
};

BotzieLedEntry botzieLeds[BOTZIE_MAX_LEDS];
uint8_t botzieLedCount = 0;
Servo botzieServoPwm[BOTZIE_MAX_SERVO_COUNT];
BotzieServoEntry botzieServoReg[BOTZIE_MAX_SERVO_COUNT];
uint8_t botzieServoCount = 0;
Servo botzieRadarServo;
bool botzieRadarServoAttached = false;
int botzieRadarServoAttachedPin = -1;
String botzieLastReply = "";
int botzieTrigPin = BOTZIE_TRIG_PIN;
int botzieEchoPin = BOTZIE_ECHO_PIN;
int botzieRadarServoPin = -1;
bool botzieRadarOn = false;
int botzieRadarAngle = BOTZIE_RADAR_MIN_ANGLE;
bool botzieRadarForward = true;
int botzieRadarBeepCm = 25;
unsigned long botzieRadarLastMs = 0;
#if !defined(ARDUINO_ARCH_ESP32)
uint8_t botzieSwPwmPhase = 0;
uint32_t botzieSwPwmLastUs = 0;
#endif

int botzieParsePinNumber(String pinText) {
  pinText.trim();
  pinText.toUpperCase();
  if (pinText.length() == 0) return -1;
  if (pinText.startsWith("A")) {
    return A0 + pinText.substring(1).toInt();
  }
  if (pinText.startsWith("D")) pinText = pinText.substring(1);
  if (pinText.length() == 0) return -1;
  for (unsigned int i = 0; i < pinText.length(); i++) {
    if (!isDigit(pinText[i])) return -1;
  }
  return pinText.toInt();
}

bool botzieIsMotorPin(int pin) {
#if defined(BOTZIE_KIT_IOT)
  (void)pin;
  return false;
#elif defined(BOTZIE_KIT_ROBOTICS)
  return pin == BOTZIE_MOTOR_FL1 || pin == BOTZIE_MOTOR_FL2 ||
         pin == BOTZIE_MOTOR_FR1 || pin == BOTZIE_MOTOR_FR2 ||
         pin == BOTZIE_MOTOR_BL1 || pin == BOTZIE_MOTOR_BL2 ||
         pin == BOTZIE_MOTOR_BR1 || pin == BOTZIE_MOTOR_BR2;
#elif defined(ARDUINO_ARCH_ESP32)
  return pin == BOTZIE_LEFT_A || pin == BOTZIE_LEFT_B ||
         pin == BOTZIE_RIGHT_A || pin == BOTZIE_RIGHT_B;
#else
  return pin == BOTZIE_LEFT_IN1 || pin == BOTZIE_LEFT_IN2 || pin == BOTZIE_LEFT_EN ||
         pin == BOTZIE_RIGHT_IN1 || pin == BOTZIE_RIGHT_IN2 || pin == BOTZIE_RIGHT_EN;
#endif
}

bool botzieIsEsp32OutputPin(int pin) {
  switch (pin) {
    case 4: case 5:
    case 13: case 14: case 16: case 17: case 18: case 19:
    case 21: case 22: case 23:
    case 25: case 26: case 27:
    case 32: case 33:
      return true;
    default:
      return false;
  }
}

bool botzieIsLedPinOk(int pin) {
  if (pin < 0 || botzieIsMotorPin(pin)) return false;
#if defined(ARDUINO_ARCH_ESP32)
  return botzieIsEsp32OutputPin(pin);
#else
  return pin <= 19 && pin != BOTZIE_BT_RX && pin != BOTZIE_BT_TX;
#endif
}

bool botzieIsServoPinOk(int pin) {
  return botzieIsLedPinOk(pin);
}

#if !defined(ARDUINO_ARCH_ESP32)
bool botzieIsHwPwmPin(uint8_t pin) {
  switch (pin) {
    case 3: case 5: case 6: case 9: case 10: case 11: return true;
    default: return false;
  }
}
#endif

int botziePercentToDuty(int percent) {
  int clamped = constrain(percent, 0, 100);
  if (clamped <= 0) return 0;
  float t = clamped / 100.0f;
  int duty = (int)(255.0f * t * t + 0.5f);
  if (duty < 28) duty = 28;
  return constrain(duty, 0, 255);
}

#if defined(ARDUINO_ARCH_ESP32)
void botzieEsp32LedWrite(uint8_t index, uint8_t pin, uint32_t duty) {
  uint8_t ch = 4 + (index % 4);
  static bool attached[BOTZIE_MAX_LEDS] = {false};
  static uint8_t attachedPin[BOTZIE_MAX_LEDS] = {0};
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  if (!attached[index] || attachedPin[index] != pin) {
    if (attached[index]) ledcDetach(attachedPin[index]);
    ledcAttach(pin, 5000, 8);
    attached[index] = true;
    attachedPin[index] = pin;
  }
  ledcWrite(pin, duty);
#else
  if (!attached[index] || attachedPin[index] != pin) {
    if (attached[index]) ledcDetachPin(attachedPin[index]);
    ledcSetup(ch, 5000, 8);
    ledcAttachPin(pin, ch);
    attached[index] = true;
    attachedPin[index] = pin;
  }
  ledcWrite(ch, duty);
#endif
}
#endif

void botzieApplyLed(uint8_t index) {
  if (index >= botzieLedCount) return;
  BotzieLedEntry& led = botzieLeds[index];
  int duty = led.state ? botziePercentToDuty(led.brightness) : 0;
#if defined(ARDUINO_ARCH_ESP32)
  botzieEsp32LedWrite(index, led.pin, (uint32_t)duty);
#else
  if (led.hasHardwarePwm) analogWrite(led.pin, duty);
  else if (!led.state || led.brightness == 0) digitalWrite(led.pin, LOW);
#endif
}

int botzieLedIndexForPin(int pin) {
  if (!botzieIsLedPinOk(pin)) return -1;
  for (uint8_t i = 0; i < botzieLedCount; i++) {
    if (botzieLeds[i].pin == (uint8_t)pin) return i;
  }
  if (botzieLedCount >= BOTZIE_MAX_LEDS) return -1;
  uint8_t index = botzieLedCount++;
  botzieLeds[index].pin = (uint8_t)pin;
  botzieLeds[index].state = false;
  botzieLeds[index].brightness = 60;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
#if defined(ARDUINO_ARCH_ESP32)
  botzieLeds[index].hasHardwarePwm = true;
  botzieEsp32LedWrite(index, (uint8_t)pin, 0);
#else
  botzieLeds[index].hasHardwarePwm = botzieIsHwPwmPin((uint8_t)pin);
  analogWrite(pin, 0);
#endif
  return index;
}

void botzieSetLedBrightness(uint8_t index, int nextBrightness) {
  if (index >= botzieLedCount) return;
  int pct = constrain(nextBrightness, 0, 100);
  botzieLeds[index].brightness = pct;
  botzieLeds[index].state = pct > 0;
  botzieApplyLed(index);
  botzieLastReply = "brightness:D" + String(botzieLeds[index].pin) + ":" + String(botzieLeds[index].brightness);
  botzieReply(botzieLastReply);
}

void botzieSetLedState(uint8_t index, bool nextState) {
  if (index >= botzieLedCount) return;
  botzieLeds[index].state = nextState;
  botzieApplyLed(index);
  botzieLastReply = "led:D" + String(botzieLeds[index].pin) + ":" + String(nextState ? 1 : 0);
  botzieReply(botzieLastReply);
}

void botzieAllLedsOff() {
  for (uint8_t i = 0; i < botzieLedCount; i++) {
    botzieLeds[i].state = false;
    botzieApplyLed(i);
  }
}

bool botzieHandleLedCommand(const String &incoming) {
  String low = incoming;
  low.trim();
  low.toLowerCase();
  if (low == "list") {
    String out = "leds:" + String(botzieLedCount);
    for (uint8_t i = 0; i < botzieLedCount; i++) {
      out += ";D" + String(botzieLeds[i].pin) + "=" + String(botzieLeds[i].state ? 1 : 0) +
             "@" + String(botzieLeds[i].brightness);
    }
    botzieLastReply = out;
    botzieReply(out);
    return true;
  }
  if (!low.startsWith("led:")) return false;
  String payload = low.substring(4);
  int firstSep = payload.indexOf(':');
  if (firstSep < 0) return true;
  int index = botzieLedIndexForPin(botzieParsePinNumber(payload.substring(0, firstSep)));
  if (index < 0) {
    botzieLastReply = String("err:pin:") + payload.substring(0, firstSep);
    botzieReply(botzieLastReply);
    return true;
  }
  String stateText = payload.substring(firstSep + 1);
  if (stateText.startsWith("brightness:")) {
    botzieSetLedBrightness((uint8_t)index, stateText.substring(11).toInt());
    return true;
  }
  bool nextState = stateText == "on" || stateText == "1" || stateText == "true";
  botzieSetLedState((uint8_t)index, nextState);
  return true;
}

int botzieAngleToMicros(int angle, uint16_t maxAngle) {
  if (maxAngle >= 360) {
    if (angle <= 0) return BOTZIE_SERVO_STOP_US;
    if (angle <= 180) return (int)map((long)angle, 0, 180, (long)BOTZIE_SERVO_STOP_US, (long)BOTZIE_SERVO_MIN_US);
    return (int)map((long)angle, 180, 360, (long)BOTZIE_SERVO_STOP_US, (long)BOTZIE_SERVO_MAX_US);
  }
  return (int)map((long)angle, 0, (long)maxAngle, (long)BOTZIE_SERVO_MIN_US, (long)BOTZIE_SERVO_MAX_US);
}

void botzieWriteServoAngle(uint8_t index, int angle) {
  BotzieServoEntry& entry = botzieServoReg[index];
#if defined(ARDUINO_ARCH_ESP32)
  botzieServoPwm[index].writeMicroseconds(botzieAngleToMicros(angle, entry.maxAngle));
#else
  if (entry.maxAngle >= 360) {
    botzieServoPwm[index].writeMicroseconds(botzieAngleToMicros(angle, entry.maxAngle));
  } else {
    botzieServoPwm[index].write(constrain(angle, 0, 180));
  }
#endif
}

#if defined(ARDUINO_ARCH_ESP32)
bool botzieServoTimersReady = false;
void botzieEnsureServoTimers() {
  if (botzieServoTimersReady) return;
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  botzieServoTimersReady = true;
}
#endif

void botzieEnsureServoAttached(uint8_t index) {
  if (index >= botzieServoCount) return;
  BotzieServoEntry& entry = botzieServoReg[index];
  if (entry.attached) return;
#if defined(ARDUINO_ARCH_ESP32)
  botzieEnsureServoTimers();
  botzieServoPwm[index].setPeriodHertz(50);
#endif
  botzieServoPwm[index].attach(entry.pin, BOTZIE_SERVO_MIN_US, BOTZIE_SERVO_MAX_US);
  entry.attached = true;
}

void botzieStopContinuousServo(uint8_t index) {
  botzieEnsureServoAttached(index);
  botzieServoPwm[index].writeMicroseconds(BOTZIE_SERVO_STOP_US);
  delay(30);
  botzieServoPwm[index].detach();
  botzieServoReg[index].attached = false;
  botzieServoReg[index].angle = 0;
}

int botzieServoIndexForPin(int pin) {
  if (!botzieIsServoPinOk(pin)) return -1;
  for (uint8_t i = 0; i < botzieServoCount; i++) {
    if (botzieServoReg[i].pin == (uint8_t)pin) return i;
  }
  if (botzieServoCount >= BOTZIE_MAX_SERVO_COUNT) return -1;
  uint8_t index = botzieServoCount++;
  botzieServoReg[index].pin = (uint8_t)pin;
  botzieServoReg[index].angle = 90;
  botzieServoReg[index].maxAngle = 180;
  botzieServoReg[index].attached = false;
  botzieEnsureServoAttached(index);
  botzieWriteServoAngle(index, 90);
  delay(30);
  return index;
}

void botzieSetServoRange(uint8_t index, int requestedMax) {
  if (index >= botzieServoCount) return;
  uint16_t normalized = (requestedMax >= 360) ? 360 : 180;
  BotzieServoEntry& entry = botzieServoReg[index];
  entry.maxAngle = normalized;
  entry.angle = constrain(entry.angle, 0, (int)normalized);
  if (normalized >= 360 && entry.angle <= 0) {
    botzieStopContinuousServo(index);
  } else {
    botzieEnsureServoAttached(index);
    botzieWriteServoAngle(index, entry.angle);
  }
  botzieLastReply = "range:D" + String(entry.pin) + ":" + String(normalized);
  botzieReply(botzieLastReply);
}

void botzieMoveServo(uint8_t index, int angle) {
  if (index >= botzieServoCount) return;
  BotzieServoEntry& entry = botzieServoReg[index];
  angle = constrain(angle, 0, (int)entry.maxAngle);
  if (entry.maxAngle >= 360 && angle <= 0) {
    botzieStopContinuousServo(index);
    botzieLastReply = "ok:servo:D" + String(entry.pin) + ":0";
    botzieReply(botzieLastReply);
    return;
  }
  botzieEnsureServoAttached(index);
#if defined(ARDUINO_ARCH_ESP32)
  botzieWriteServoAngle(index, angle);
  entry.angle = angle;
  botzieLastReply = "servo:D" + String(entry.pin) + ":" + String(angle);
  botzieReply(botzieLastReply);
#else
  if (entry.maxAngle >= 360) {
    botzieWriteServoAngle(index, angle);
    entry.angle = angle;
    delay(80);
    botzieLastReply = "ok:servo:D" + String(entry.pin) + ":" + String(angle);
    botzieReply(botzieLastReply);
    return;
  }
  int from = entry.angle;
  int dir = (angle > from) ? 1 : -1;
  if (from == angle) {
    botzieWriteServoAngle(index, angle);
  } else {
    for (int a = from; a != angle; ) {
      int next = a + dir;
      if ((dir > 0 && next > angle) || (dir < 0 && next < angle)) next = angle;
      botzieWriteServoAngle(index, next);
      a = next;
      delay(12);
    }
  }
  entry.angle = angle;
  delay(80);
  botzieLastReply = "ok:servo:D" + String(entry.pin) + ":" + String(angle);
  botzieReply(botzieLastReply);
#endif
}

bool botzieHandleServoCommand(const String &incoming) {
  String low = incoming;
  low.trim();
  low.toLowerCase();
  if (!low.startsWith("servo:")) return false;
  String payload = low.substring(6);
  int sep = payload.indexOf(':');
  if (sep < 0) {
    if (botzieServoCount == 0) {
      botzieLastReply = "err:need pin";
      botzieReply(botzieLastReply);
      return true;
    }
    botzieMoveServo(0, payload.toInt());
    return true;
  }
  int pin = botzieParsePinNumber(payload.substring(0, sep));
  String rest = payload.substring(sep + 1);
  int index = botzieServoIndexForPin(pin);
  if (index < 0) {
    botzieLastReply = "err:pin:" + payload.substring(0, sep);
    botzieReply(botzieLastReply);
    return true;
  }
  if (rest.startsWith("range:")) {
    botzieSetServoRange((uint8_t)index, rest.substring(6).toInt());
    return true;
  }
  if (rest == "stop") {
    botzieMoveServo((uint8_t)index, 0);
    return true;
  }
  botzieMoveServo((uint8_t)index, rest.toInt());
  return true;
}

void botzieBuzzerBeep(int ms) {
#if defined(BOTZIE_KIT_IOT)
  (void)ms;
  return;
#endif
  if (botzieRadarServoPin == BOTZIE_BUZZER_PIN) return;
  ms = constrain(ms, 8, 120);
  pinMode(BOTZIE_BUZZER_PIN, OUTPUT);
  digitalWrite(BOTZIE_BUZZER_PIN, HIGH);
  delay((unsigned long)ms);
  digitalWrite(BOTZIE_BUZZER_PIN, LOW);
}

void botzieDetachRadarServo() {
  if (!botzieRadarServoAttached) return;
  botzieRadarServo.detach();
  botzieRadarServoAttached = false;
  botzieRadarServoAttachedPin = -1;
}

void botzieAttachRadarServo() {
  if (botzieRadarServoPin < 0) return;
  if (botzieRadarServoAttached && botzieRadarServoAttachedPin == botzieRadarServoPin) return;
  botzieDetachRadarServo();
  for (uint8_t i = 0; i < botzieServoCount; i++) {
    if (botzieServoReg[i].pin == (uint8_t)botzieRadarServoPin && botzieServoReg[i].attached) {
      botzieServoPwm[i].detach();
      botzieServoReg[i].attached = false;
    }
  }
#if defined(ARDUINO_ARCH_ESP32)
  botzieEnsureServoTimers();
  botzieRadarServo.setPeriodHertz(50);
#endif
  botzieRadarServo.attach((uint8_t)botzieRadarServoPin, BOTZIE_SERVO_MIN_US, BOTZIE_SERVO_MAX_US);
  botzieRadarServo.write(botzieRadarAngle);
  botzieRadarServoAttached = true;
  botzieRadarServoAttachedPin = botzieRadarServoPin;
}

void botzieApplyUltrasonicPins() {
  if (botzieTrigPin < 0 || botzieEchoPin < 0) return;
  pinMode((uint8_t)botzieTrigPin, OUTPUT);
  pinMode((uint8_t)botzieEchoPin, INPUT);
  digitalWrite((uint8_t)botzieTrigPin, LOW);
}

long botzieReadDistanceCm() {
  if (botzieTrigPin < 0 || botzieEchoPin < 0) return -1;
  digitalWrite((uint8_t)botzieTrigPin, LOW);
  delayMicroseconds(2);
  digitalWrite((uint8_t)botzieTrigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite((uint8_t)botzieTrigPin, LOW);
  long duration = pulseIn((uint8_t)botzieEchoPin, HIGH, 30000UL);
  if (duration <= 0) return -1;
  long cm = (long)(duration * 0.0343 / 2);
  if (cm <= 0 || cm > BOTZIE_RADAR_MAX_CM) return BOTZIE_RADAR_MAX_CM;
  return cm;
}

bool botzieRadarPinsReady() {
  return botzieTrigPin >= 0 && botzieEchoPin >= 0 && botzieRadarServoPin >= 0;
}

void botzieSetRadarServoPin(int pin) {
  if (!botzieIsServoPinOk(pin)) return;
  if (pin == botzieRadarServoPin && botzieRadarServoAttached) return;
  botzieDetachRadarServo();
  botzieRadarServoPin = pin;
  botzieRadarAngle = BOTZIE_RADAR_MIN_ANGLE;
  botzieRadarForward = true;
  if (botzieRadarOn) botzieAttachRadarServo();
}

bool botzieHandleRadarCommand(const String &incoming) {
  String low = incoming;
  low.trim();
  low.toLowerCase();
  if (low == "start") low = "radar:on";
  if (!low.startsWith("radar:")) return false;
  String payload = low.substring(6);
  if (payload == "on" || payload == "start" || payload == "1") {
    botzieRadarOn = true;
    botzieRadarLastMs = 0;
    botzieAttachRadarServo();
    botzieLastReply = "radar:on";
    botzieReply(botzieLastReply);
    return true;
  }
  if (payload == "off" || payload == "0") {
    botzieRadarOn = false;
    digitalWrite(BOTZIE_BUZZER_PIN, LOW);
    botzieLastReply = "radar:off";
    botzieReply(botzieLastReply);
    return true;
  }
  if (payload.startsWith("beep:")) {
    botzieRadarBeepCm = constrain(payload.substring(5).toInt(), 5, 100);
    botzieLastReply = "radar:beep:" + String(botzieRadarBeepCm);
    botzieReply(botzieLastReply);
    return true;
  }
  if (payload.startsWith("trig:")) {
    int pin = botzieParsePinNumber(payload.substring(5));
    if (pin >= 0) {
      botzieTrigPin = pin;
      botzieApplyUltrasonicPins();
      botzieLastReply = String("radar:trig:D") + String(botzieTrigPin);
      botzieReply(botzieLastReply);
    }
    return true;
  }
  if (payload.startsWith("echo:")) {
    int pin = botzieParsePinNumber(payload.substring(5));
    if (pin >= 0) {
      botzieEchoPin = pin;
      botzieApplyUltrasonicPins();
      botzieLastReply = String("radar:echo:D") + String(botzieEchoPin);
      botzieReply(botzieLastReply);
    }
    return true;
  }
  if (payload.startsWith("servo:") || payload.startsWith("pin:")) {
    int skip = payload.startsWith("servo:") ? 6 : 4;
    int pin = botzieParsePinNumber(payload.substring(skip));
    botzieSetRadarServoPin(pin);
    botzieLastReply = String("radar:servo:D") + String(botzieRadarServoPin);
    botzieReply(botzieLastReply);
    return true;
  }
  return true;
}

void botzieRadarTick() {
  if (!botzieRadarOn || !botzieRadarPinsReady()) return;
  unsigned long now = millis();
  if (now - botzieRadarLastMs < 15) return;
  botzieRadarLastMs = now;
  botzieAttachRadarServo();
  botzieRadarServo.write(botzieRadarAngle);
  long dist = botzieReadDistanceCm();
  if (dist < 0) dist = BOTZIE_RADAR_MAX_CM;
  String stream = String(botzieRadarAngle) + "," + String(dist) + ";";
  botzieLastReply = stream;
  botzieSendStream(stream);
  if (dist > 0 && dist <= botzieRadarBeepCm) {
    botzieBuzzerBeep(map(constrain((int)dist, 1, 50), 1, 50, 70, 12));
  }
  if (botzieRadarForward) {
    botzieRadarAngle += BOTZIE_RADAR_STEP;
    if (botzieRadarAngle >= BOTZIE_RADAR_MAX_ANGLE) {
      botzieRadarAngle = BOTZIE_RADAR_MAX_ANGLE;
      botzieRadarForward = false;
    }
  } else {
    botzieRadarAngle -= BOTZIE_RADAR_STEP;
    if (botzieRadarAngle <= BOTZIE_RADAR_MIN_ANGLE) {
      botzieRadarAngle = BOTZIE_RADAR_MIN_ANGLE;
      botzieRadarForward = true;
    }
  }
}

#define BOTZIE_MAP_MAX 24
String botzieMapCmd[BOTZIE_MAP_MAX];
uint8_t botzieMapAct[BOTZIE_MAP_MAX];
uint8_t botzieMapCount = 0;

void botzieRegisterCommand(const String &key, uint8_t act) {
  String k = key;
  k.trim();
  k.toLowerCase();
  if (k.length() == 0 || act == 0 || botzieMapCount >= BOTZIE_MAP_MAX) return;
  for (uint8_t i = 0; i < botzieMapCount; i++) {
    if (botzieMapCmd[i] == k) {
      botzieMapAct[i] = act;
      return;
    }
  }
  botzieMapCmd[botzieMapCount] = k;
  botzieMapAct[botzieMapCount] = act;
  botzieMapCount++;
}

uint8_t botzieLookupMapped(const String &low) {
  for (uint8_t i = 0; i < botzieMapCount; i++) {
    if (low == botzieMapCmd[i]) return botzieMapAct[i];
  }
  return 0;
}

#if !defined(ARDUINO_ARCH_ESP32)
void botzieServiceSoftwarePwm() {
  uint32_t now = micros();
  if ((uint32_t)(now - botzieSwPwmLastUs) < BOTZIE_SW_PWM_TICK_US) return;
  botzieSwPwmLastUs = now;
  botzieSwPwmPhase = (botzieSwPwmPhase + 1) % BOTZIE_SW_PWM_STEPS;
  for (uint8_t i = 0; i < botzieLedCount; i++) {
    if (botzieLeds[i].hasHardwarePwm) continue;
    uint8_t steps = (uint16_t)botzieLeds[i].brightness * BOTZIE_SW_PWM_STEPS / 100;
    bool on = botzieLeds[i].state && botzieSwPwmPhase < steps;
    digitalWrite(botzieLeds[i].pin, on ? HIGH : LOW);
  }
}
#endif
`;
}

function addGenerator (Blockly) {
    const order = Blockly.Arduino.ORDER_ATOMIC || 0;

    function ensureBotzieEsp32 (Blockly) {
        if (Blockly.Arduino.definitions_.botzie_pins) {
            return;
        }
        const profile = resolveBotzieProfile(Blockly);
        Blockly.Arduino.includes_.botzie_ble = '#include <BLEDevice.h>\n#include <BLEServer.h>\n#include <BLEUtils.h>\n#include <esp_gap_ble_api.h>\n#include <ESP32Servo.h>\n#include "driver/dac.h"\n#include <string.h>';
        Blockly.Arduino.definitions_.botzie_pins = buildEsp32PinDefines(profile, Blockly);
        Blockly.Arduino.definitions_.botzie_vars = `
#if defined(BOTZIE_USE_CLASSIC)
BluetoothSerial SerialBT;
#endif
BLEServer* botzieBleServer = nullptr;
BLECharacteristic* botzieBleCommandCharacteristic = nullptr;
#define BOTZIE_CMD_Q 16
#define BOTZIE_CMD_LEN 160
char botzieCmdQ[BOTZIE_CMD_Q][BOTZIE_CMD_LEN];
volatile uint8_t botzieQHead = 0;
volatile uint8_t botzieQTail = 0;
bool botzieBleConnected = false;
bool botzieClassicEnabled = false;
bool botzieBleEnabled = false;
int botzieMotorSpeed = 200;
int botzieLeftSpeed = 200;
int botzieRightSpeed = 200;
String botzieLastCommand = "";
String botzieInputBuffer = "";
unsigned long botzieLastReadMs = 0;
const unsigned long botzieFlushMs = 15;
bool botzieWifiEnabled = false;
bool botzieWifiApMode = false;
char botzieBleName[32] = "Botzie";
char botzieMotionCmd = 'n';
unsigned long botzieLastCmdMs = 0;
unsigned long botzieSteerStartMs = 0;
String botzieWifiDriveCmd = "none";
String botzieLastMovement = "";
bool botzieWifiPaused = false;
unsigned long botzieTelemTickMs = 0;
unsigned long botzieTotalMoveMs = 0;
float botzieTotalDistance = 0.0f;
String botzieTelemMode = "manual";
String botzieTelemDirection = "stop";
String botzieTelemCommand = "stop";
float botzieTelemAngle = 0.0f;
static const float BOTZIE_DISTANCE_SCALE = 0.35f;
`;
        Blockly.Arduino.definitions_.botzie_motor_helpers = `
#if defined(ARDUINO_ARCH_ESP32)
static bool botzieIsBootStrapPin(uint8_t pin) {
  return pin == 0 || pin == 2 || pin == 12 || pin == 15;
}
static uint8_t botzieRoboticsChannel(uint8_t pin) {
#if defined(BOTZIE_KIT_ROBOTICS)
  if (pin == BOTZIE_MOTOR_FL1) return 0;
  if (pin == BOTZIE_MOTOR_FL2) return 1;
  if (pin == BOTZIE_MOTOR_FR1) return 2;
  if (pin == BOTZIE_MOTOR_FR2) return 3;
  if (pin == BOTZIE_MOTOR_BL1) return 4;
  if (pin == BOTZIE_MOTOR_BL2) return 5;
  if (pin == BOTZIE_MOTOR_BR1) return 6;
  if (pin == BOTZIE_MOTOR_BR2) return 7;
#endif
  return pin % 16;
}
static void botzieEsp32PwmWrite(uint8_t pin, uint32_t val) {
  if (botzieIsBootStrapPin(pin)) {
    digitalWrite(pin, val > 0 ? HIGH : LOW);
    return;
  }
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  ledcWrite(pin, val);
#else
  ledcWrite(botzieRoboticsChannel(pin), val);
#endif
}
void botzieAttachMotors() {
  dac_output_disable(DAC_CHANNEL_1);
  dac_output_disable(DAC_CHANNEL_2);
  pinMode(0, INPUT_PULLUP);
#if defined(BOTZIE_KIT_ROBOTICS)
  const uint8_t pins[8] = {
    BOTZIE_MOTOR_FL1, BOTZIE_MOTOR_FL2, BOTZIE_MOTOR_FR1, BOTZIE_MOTOR_FR2,
    BOTZIE_MOTOR_BL1, BOTZIE_MOTOR_BL2, BOTZIE_MOTOR_BR1, BOTZIE_MOTOR_BR2
  };
  for (int i = 0; i < 8; i++) {
    uint8_t pin = pins[i];
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
    if (botzieIsBootStrapPin(pin)) continue;
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    ledcAttach(pin, 500, 8);
    ledcWrite(pin, 0);
#else
    ledcSetup((uint8_t)i, 500, 8);
    ledcAttachPin(pin, (uint8_t)i);
    ledcWrite((uint8_t)i, 0);
#endif
  }
#else
  const uint8_t pins[4] = {BOTZIE_LEFT_A, BOTZIE_LEFT_B, BOTZIE_RIGHT_A, BOTZIE_RIGHT_B};
  for (int i = 0; i < 4; i++) {
    uint8_t pin = pins[i];
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    ledcAttach(pin, 5000, 8);
    ledcWrite(pin, 0);
#else
    uint8_t ch = pin % 16;
    ledcSetup(ch, 5000, 8);
    ledcAttachPin(pin, ch);
    ledcWrite(ch, 0);
#endif
  }
#endif
}
static void botzieDriveSide(uint8_t pinIna, uint8_t pinInb, int speed, bool forward) {
  speed = constrain(abs(speed), 0, 255);
  if (speed == 0) {
    botzieEsp32PwmWrite(pinIna, 0);
    botzieEsp32PwmWrite(pinInb, 0);
    return;
  }
  if (forward) {
    botzieEsp32PwmWrite(pinIna, 0);
    botzieEsp32PwmWrite(pinInb, (uint32_t)speed);
  } else {
    botzieEsp32PwmWrite(pinIna, (uint32_t)speed);
    botzieEsp32PwmWrite(pinInb, 0);
  }
}
#endif
`;
        Blockly.Arduino.definitions_.botzie_led_servo = buildBotzieLedServoLib();
        Blockly.Arduino.definitions_.botzie_functions = `
void botzieReply(const String &msg);

String botzieNormalizeCmd(const String &cmdRaw) {
  String cmd;
  for (unsigned int i = 0; i < cmdRaw.length(); i++) {
    char c = cmdRaw.charAt(i);
    if (c == '\\0' || c == '\\r' || c == '\\n') continue;
    if ((unsigned char)c < 32) continue;
    cmd += c;
  }
  cmd.trim();
  return cmd;
}

void botzieTracePrefix() {
  Serial.print(botzieBleName);
  Serial.print(" : ");
}

void botzieLogAppBytes(const char* src, const char* data, size_t len) {
  Serial.print("APP ");
  Serial.print(src);
  Serial.print(": ");
  if (data == NULL || len == 0) {
    Serial.println("(empty)");
    return;
  }
  for (size_t i = 0; i < len; i++) {
    char c = data[i];
    if (c == '\\r') Serial.print("[CR]");
    else if (c == '\\n') Serial.print("[LF]");
    else if ((unsigned char)c >= 32 && (unsigned char)c < 127) Serial.print(c);
    else {
      Serial.print('[');
      Serial.print((unsigned char)c, HEX);
      Serial.print(']');
    }
  }
  Serial.println();
}

void botzieTraceRx(const String &cmdRaw) {
  botzieLogAppBytes("CMD", cmdRaw.c_str(), cmdRaw.length());
}

void botzieTraceTx(const String &msg) {
  if (msg.startsWith("ERR:")) return;
  botzieTracePrefix();
  Serial.println(msg);
}

bool botzieHandleTerminalInput(const String &cmdRaw) {
  String cmd = botzieNormalizeCmd(cmdRaw);
  if (cmd.length() == 0) return false;
  String lower = cmd;
  lower.toLowerCase();
  if (lower.startsWith("log:")) {
    String text = cmd.substring(4);
    text.trim();
    botzieTracePrefix();
    Serial.println(text);
    botzieReply(String("LOG:") + text);
    return true;
  }
  if (lower.startsWith("terminal ") || lower.startsWith("term ")) {
    int sp = cmd.indexOf(' ');
    String text = cmd.substring(sp + 1);
    text.trim();
    botzieTracePrefix();
    Serial.println(text);
    botzieReply(String("LOG:") + text);
    return true;
  }
  if (lower.startsWith("graph,")) {
    botzieTracePrefix();
    Serial.println(cmd);
    botzieReply(cmd);
    return true;
  }
  return false;
}

bool botzieHandleBlockzieBleProtocol(const String &cmdRaw) {
  String cmd = botzieNormalizeCmd(cmdRaw);
  if (cmd.length() == 0) return true;
  if (cmd.equalsIgnoreCase("READY") || cmd.equalsIgnoreCase("PING")) {
    botzieReply("OK");
    return true;
  }
  if (cmd.startsWith("READ_ANALOG")) {
    int pin = 0;
    if (sscanf(cmd.c_str(), "READ_ANALOG %d", &pin) == 1) {
      botzieReply(String("ANALOG_VALUE ") + String(analogRead(pin)));
      return true;
    }
  }
  int pin = 0;
  int val = 0;
  char mode[16];
  if (sscanf(cmd.c_str(), "SET_PIN_MODE %d %15s", &pin, mode) == 2) {
    if (!strcmp(mode, "OUTPUT")) pinMode(pin, OUTPUT);
    else if (!strcmp(mode, "INPUT_PULLUP")) pinMode(pin, INPUT_PULLUP);
    else pinMode(pin, INPUT);
    botzieReply("Command Executed");
    return true;
  }
  if (sscanf(cmd.c_str(), "SET_DIGITAL_OUTPUT %d %d", &pin, &val) == 2) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, val ? HIGH : LOW);
    botzieReply("Command Executed");
    return true;
  }
  if (sscanf(cmd.c_str(), "SET_PWM_OUTPUT %d %d", &pin, &val) == 2) {
    int index = botzieLedIndexForPin(pin);
    if (index >= 0) botzieSetLedBrightness((uint8_t)index, map(constrain(val, 0, 255), 0, 255, 0, 100));
    botzieReply("Command Executed");
    return true;
  }
  if (sscanf(cmd.c_str(), "SET_SERVO_OUTPUT %d %d", &pin, &val) == 2) {
    int index = botzieServoIndexForPin(pin);
    if (index >= 0) botzieMoveServo((uint8_t)index, val);
    botzieReply("Command Executed");
    return true;
  }
  if (cmd.startsWith("DIGITAL_READ")) {
    if (sscanf(cmd.c_str(), "DIGITAL_READ %d", &pin) == 1) {
      botzieReply(String("DIGITAL_VALUE ") + String(digitalRead(pin)));
    }
    return true;
  }
  if (sscanf(cmd.c_str(), "DIGITAL_WRITE %d %d", &pin, &val) == 2) {
    digitalWrite(pin, val ? HIGH : LOW);
    botzieReply("Command Executed");
    return true;
  }
  if (cmd.startsWith("TM1637_")) {
    botzieReply("Command Executed");
    return true;
  }
  return false;
}

void botzieHandleCommand(const String &cmdRaw);

void botzieEnqueueCommand(const String &cmdRaw) {
  String n = botzieNormalizeCmd(cmdRaw);
  if (n.length() == 0 || n.length() >= BOTZIE_CMD_LEN) return;
  uint8_t next = (uint8_t)((botzieQHead + 1) % BOTZIE_CMD_Q);
  if (next == botzieQTail) botzieQTail = (uint8_t)((botzieQTail + 1) % BOTZIE_CMD_Q);
  n.toCharArray(botzieCmdQ[botzieQHead], BOTZIE_CMD_LEN);
  botzieQHead = next;
}

void botzieDrainCommandQueue() {
  while (botzieQTail != botzieQHead) {
    String c = String(botzieCmdQ[botzieQTail]);
    botzieQTail = (uint8_t)((botzieQTail + 1) % BOTZIE_CMD_Q);
    botzieHandleCommand(c);
  }
}

bool botzieLooksLikeCompleteCommand(const String &buf) {
  if (buf.length() == 0 || buf.length() >= 160) return false;
  String peek = buf;
  peek.toLowerCase();
  if (botzieLookupMapped(peek)) return true;
  return peek.startsWith("led:") || peek.startsWith("servo:") || peek.startsWith("radar:") ||
         peek.startsWith("joy,") || peek.startsWith("set_") || peek.startsWith("speed:") ||
         peek.startsWith("protocol:") ||
         peek == "connect" || peek == "list" || peek == "start" || peek == "stop" ||
         peek == "idle" || peek == "forward" || peek == "backward" || peek == "left" ||
         peek == "right" || peek == "u" || peek == "d" || peek == "l" || peek == "r" ||
         peek == "n" || peek == "c" || peek == "g" || peek == "a" || peek == "f" || peek == "b" ||
         peek == "cmd_f" || peek == "cmd_b" || peek == "resume";
}

void botzieIngestBleBytes(const char* data, size_t len) {
  if (data == NULL || len == 0) return;
  // Ignore notify-echo / app telemetry frames — they disconnect BLE on ESP32.
  if (len >= 4 && data[0] == '$' && data[1] == '$') return;
  botzieLogAppBytes("BLE", data, len);
  for (size_t i = 0; i < len; i++) {
    char ch = data[i];
    if (ch == '\\n' || ch == '\\r') {
      if (botzieInputBuffer.length() > 0) {
        if (!botzieInputBuffer.startsWith("$$$$")) botzieEnqueueCommand(botzieInputBuffer);
        botzieInputBuffer = "";
      }
    } else if ((unsigned char)ch >= 32) {
      botzieInputBuffer += ch;
      if (botzieInputBuffer.length() > 160) botzieInputBuffer = "";
    }
  }
  if (botzieInputBuffer.startsWith("$$$$")) {
    botzieInputBuffer = "";
    return;
  }
  if (botzieLooksLikeCompleteCommand(botzieInputBuffer)) {
    botzieEnqueueCommand(botzieInputBuffer);
    botzieInputBuffer = "";
  }
}

class BotzieBleServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    botzieBleConnected = true;
    botzieAllLedsOff();
    botzieTracePrefix();
    Serial.println("BLE Connected");
  }

  void onDisconnect(BLEServer* pServer) override {
    botzieBleConnected = false;
    botzieTracePrefix();
    Serial.println("BLE Disconnected");
    BLEDevice::startAdvertising();
  }
};

class BotzieBleCommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) override {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    String rxData = pCharacteristic->getValue();
    botzieIngestBleBytes(rxData.c_str(), rxData.length());
#else
    std::string rxData = pCharacteristic->getValue();
    botzieIngestBleBytes(rxData.c_str(), rxData.size());
#endif
  }
};

void botzieStartBle(const char* name) {
  if (name && name[0] != '\\0') {
    strncpy(botzieBleName, name, sizeof(botzieBleName) - 1);
  } else {
    strncpy(botzieBleName, "Botzie", sizeof(botzieBleName) - 1);
  }
  botzieBleName[sizeof(botzieBleName) - 1] = '\\0';

  if (botzieBleEnabled) {
    BLEDevice::deinit(true);
    botzieBleServer = nullptr;
    botzieBleCommandCharacteristic = nullptr;
    botzieBleConnected = false;
    botzieBleEnabled = false;
    delay(100);
  }

  BLEDevice::init(botzieBleName);
  esp_ble_gap_set_device_name(botzieBleName);
  botzieBleServer = BLEDevice::createServer();
  botzieBleServer->setCallbacks(new BotzieBleServerCallbacks());
  BLEService *service = botzieBleServer->createService("${BOTZIE_BLE_SERVICE_UUID}");
  botzieBleCommandCharacteristic = service->createCharacteristic(
    "${BOTZIE_BLE_COMMAND_UUID}",
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_WRITE_NR
  );
  botzieBleCommandCharacteristic->setCallbacks(new BotzieBleCommandCallbacks());
  botzieBleCommandCharacteristic->setValue("READY");
  BLECharacteristic *versionChar = service->createCharacteristic(
    "${BOTZIE_BLE_HW_VERSION_UUID}",
    BLECharacteristic::PROPERTY_READ
  );
  uint8_t hardwareVersion[3] = {1, 2, 0};
  versionChar->setValue(hardwareVersion, sizeof(hardwareVersion));
  service->start();
  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  BLEAdvertisementData advertisementData;
  advertisementData.setFlags(0x06);
  advertisementData.setName(botzieBleName);
  advertisementData.setCompleteServices(BLEUUID("${BOTZIE_BLE_SERVICE_UUID}"));
  advertising->setAdvertisementData(advertisementData);
  BLEAdvertisementData scanResponseData;
  scanResponseData.setName(botzieBleName);
  advertising->setScanResponseData(scanResponseData);
  advertising->setScanResponse(true);
  advertising->setMinPreferred(0x06);
  advertising->setMaxPreferred(0x12);
  BLEDevice::startAdvertising();
  botzieBleEnabled = true;
  botzieTracePrefix();
  Serial.println("BLE Ready");
}

void botzieSetLeftRightSpeed(int left, int right) {
  botzieLeftSpeed = constrain(left, 0, 255);
  botzieRightSpeed = constrain(right, 0, 255);
}

#if defined(BOTZIE_KIT_ROBOTICS)
static void botzieWritePair(uint8_t a, uint8_t b, int va, int vb) {
  botzieEsp32PwmWrite(a, (uint32_t)constrain(va, 0, 255));
  botzieEsp32PwmWrite(b, (uint32_t)constrain(vb, 0, 255));
}

void botzieApplyRoboticsMotion(char cmd) {
  int s = constrain(botzieMotorSpeed, 0, 255);
  // Same 2-pin format as Zappie: DriveSide(A, B, speed, forward).
  if (cmd == 'n' || s == 0) {
    botzieDriveSide(BOTZIE_MOTOR_FL1, BOTZIE_MOTOR_FL2, 0, true);
    botzieDriveSide(BOTZIE_MOTOR_FR1, BOTZIE_MOTOR_FR2, 0, true);
    botzieDriveSide(BOTZIE_MOTOR_BL1, BOTZIE_MOTOR_BL2, 0, true);
    botzieDriveSide(BOTZIE_MOTOR_BR1, BOTZIE_MOTOR_BR2, 0, true);
    return;
  }
  bool fl = true, fr = true, bl = true, br = true;
  if (cmd == 'd') { fl = fr = bl = br = false; }
  else if (cmd == 'l') { fl = false; bl = false; fr = true; br = true; }
  else if (cmd == 'r') { fl = true; bl = true; fr = false; br = false; }
  else if (cmd == 'c' || cmd == 'W') { fl = true; bl = true; fr = false; br = false; }
  else if (cmd == 'g' || cmd == 'E') { fl = false; bl = false; fr = true; br = true; }
  botzieDriveSide(BOTZIE_MOTOR_FL1, BOTZIE_MOTOR_FL2, s, fl);
  botzieDriveSide(BOTZIE_MOTOR_FR1, BOTZIE_MOTOR_FR2, s, fr);
  botzieDriveSide(BOTZIE_MOTOR_BL1, BOTZIE_MOTOR_BL2, s, bl);
  botzieDriveSide(BOTZIE_MOTOR_BR1, BOTZIE_MOTOR_BR2, s, br);
}

bool botzieIsMovingCmd(char cmd) {
  return cmd == 'u' || cmd == 'd' || cmd == 'l' || cmd == 'r' || cmd == 'c' || cmd == 'g';
}

void botzieUpdateTelemIntegrals(unsigned long nowMs) {
  if (botzieTelemTickMs == 0) {
    botzieTelemTickMs = nowMs;
    return;
  }
  unsigned long deltaMs = nowMs - botzieTelemTickMs;
  botzieTelemTickMs = nowMs;
  // Ignore wrap/glitch spikes (BLE crash used to jump duration to ~2^32 ms).
  if (deltaMs == 0 || deltaMs > 2000) return;
  if (!botzieIsMovingCmd(botzieMotionCmd) || botzieMotorSpeed == 0) return;
  botzieTotalMoveMs += deltaMs;
  botzieTotalDistance += (botzieMotorSpeed / 255.0f) * (deltaMs / 1000.0f) * 100.0f * BOTZIE_DISTANCE_SCALE;
}

String botzieMotionLabel(char cmd) {
  switch (cmd) {
    case 'u': return "forward";
    case 'd': return "backward";
    case 'l': return "left";
    case 'r': return "right";
    case 'c': return "rotateCW";
    case 'g': return "rotateACW";
    default: return "stop";
  }
}

String botzieBuildTelemetryPacket() {
  String packet = BOTZIE_FRAME_START;
  packet += "mode=" + botzieTelemMode;
  packet += ",cmd=" + botzieTelemCommand;
  packet += ",dir=" + botzieTelemDirection;
  packet += ",speed=" + String(botzieMotorSpeed);
  packet += ",angle=" + String(botzieTelemAngle, 1);
  packet += ",distance=" + String(botzieTotalDistance, 1);
  packet += ",duration=" + String(botzieTotalMoveMs / 1000.0f, 1);
  packet += BOTZIE_FRAME_END;
  return packet;
}

void botzieNotifyTelemetry() {
  // Serial-only. BLE notify of this packet echoes into onWrite and crashes the radio.
}

char botzieNormalizeMotionChar(String value) {
  value.trim();
  value.toLowerCase();
  if (value == "u" || value == "forward") return 'u';
  if (value == "d" || value == "backward" || value == "reverse") return 'd';
  if (value == "l" || value == "left") return 'l';
  if (value == "r" || value == "right") return 'r';
  if (value == "c" || value == "rotatecw" || value == "clockwise" || value == "rcw") return 'c';
  if (value == "g" || value == "a" || value == "rotateacw" || value == "rotateccw" ||
      value == "anticlockwise" || value == "racw") return 'g';
  return 'n';
}

void botzieHandleMotionChar(char cmd) {
  unsigned long nowMs = millis();
  botzieUpdateTelemIntegrals(nowMs);
  if (cmd == 'n' || cmd == 's' || cmd == 'i') {
    botzieTelemDirection = "stop";
    botzieTelemAngle = 0.0f;
    botzieMotionCmd = 'n';
    botzieTelemCommand = "stop";
    botzieWifiDriveCmd = "none";
    botzieApplyRoboticsMotion('n');
    botzieLastCmdMs = nowMs;
    return;
  }
  botzieMotionCmd = cmd;
  botzieTelemCommand = botzieMotionLabel(cmd);
  botzieTelemDirection = botzieTelemCommand;
  botzieApplyRoboticsMotion(cmd);
  botzieLastCmdMs = nowMs;
}

void botzieSetSpeedFromLevel(int level) {
  switch (level) {
    case 0: botzieMotorSpeed = 0; break;
    case 1: botzieMotorSpeed = 50; break;
    case 2: botzieMotorSpeed = 100; break;
    case 3: botzieMotorSpeed = 150; break;
    case 4: botzieMotorSpeed = 200; break;
    case 5: botzieMotorSpeed = 250; break;
    default: return;
  }
  botzieLeftSpeed = botzieMotorSpeed;
  botzieRightSpeed = botzieMotorSpeed;
  if (botzieWifiEnabled) {
    if (botzieWifiDriveCmd != "none" && !botzieWifiPaused) {
      botzieApplyRoboticsMotion(botzieNormalizeMotionChar(botzieWifiDriveCmd == "cw" ? String("c") :
        (botzieWifiDriveCmd == "acw" ? String("g") : botzieWifiDriveCmd)));
    }
  } else if (botzieIsMovingCmd(botzieMotionCmd)) {
    botzieApplyRoboticsMotion(botzieMotionCmd);
  }
}

String botzieExtractField(const String &body, const String &key) {
  String needle = key + "=";
  int start = body.indexOf(needle);
  if (start < 0) return "";
  start += needle.length();
  int end = body.indexOf(',', start);
  if (end < 0) end = body.length();
  String value = body.substring(start, end);
  value.trim();
  return value;
}

bool botzieHandleFramedCommand(const String &incoming) {
  if (!incoming.startsWith(BOTZIE_FRAME_START) || !incoming.endsWith(BOTZIE_FRAME_END)) return false;
  // Telemetry echo (distance=/duration=) is not a drive command.
  if (incoming.indexOf("distance=") >= 0 || incoming.indexOf("duration=") >= 0) return true;
  String body = incoming.substring(4, incoming.length() - 4);
  body.trim();
  String cmdField = botzieExtractField(body, "cmd");
  String modeField = botzieExtractField(body, "mode");
  String angleField = botzieExtractField(body, "angle");
  String dirField = botzieExtractField(body, "dir");
  if (modeField.length()) botzieTelemMode = modeField;
  if (angleField.length()) botzieTelemAngle = angleField.toFloat();
  if (dirField.length()) botzieTelemDirection = dirField;
  botzieHandleMotionChar(botzieNormalizeMotionChar(cmdField));
  return true;
}

void botzieApplyWifiDrive() {
  if (botzieWifiPaused || botzieMotorSpeed == 0) {
    botzieApplyRoboticsMotion('n');
    return;
  }
  if (botzieWifiDriveCmd == "forward") botzieApplyRoboticsMotion('u');
  else if (botzieWifiDriveCmd == "backward") botzieApplyRoboticsMotion('d');
  else if (botzieWifiDriveCmd == "cw") botzieApplyRoboticsMotion('c');
  else if (botzieWifiDriveCmd == "acw") botzieApplyRoboticsMotion('g');
  else if (botzieWifiDriveCmd == "left") {
    if (millis() - botzieSteerStartMs < 150) botzieApplyRoboticsMotion('W');
    else botzieApplyRoboticsMotion('u');
  } else if (botzieWifiDriveCmd == "right") {
    if (millis() - botzieSteerStartMs < 150) botzieApplyRoboticsMotion('E');
    else botzieApplyRoboticsMotion('u');
  } else {
    botzieApplyRoboticsMotion('n');
  }
}

void botzieRoboticsTick() {
  unsigned long nowMs = millis();
  botzieUpdateTelemIntegrals(nowMs);
  if (botzieWifiEnabled) {
    if (!botzieWifiPaused && (nowMs - botzieLastCmdMs) < 200) {
      botzieApplyWifiDrive();
    } else {
      botzieApplyRoboticsMotion('n');
    }
  }
}

bool botzieHandleRoboticsAppCommand(String cmd) {
  cmd.trim();
  if (cmd.length() == 0) return true;
  if (botzieHandleFramedCommand(cmd)) return true;
  String low = cmd;
  low.toLowerCase();
  botzieTelemMode = "manual";
  botzieTelemAngle = 0.0f;

  if (low.length() == 1 && low[0] >= '1' && low[0] <= '5') {
    botzieSetSpeedFromLevel(low[0] - '0');
    botzieLastCmdMs = millis();
    return true;
  }
  if (low.startsWith("speed:")) {
    int level = low.substring(6).toInt();
    level = constrain(level, 0, 5);
    if (level == 0) botzieHandleMotionChar('n');
    else {
      botzieSetSpeedFromLevel(level);
      botzieLastCmdMs = millis();
    }
    return true;
  }
  if (low == "forward") low = "u";
  else if (low == "backward" || low == "reverse") low = "d";
  else if (low == "left") low = "l";
  else if (low == "right") low = "r";
  else if (low == "rotatecw" || low == "clockwise" || low == "rcw") low = "c";
  else if (low == "rotateacw" || low == "rotateccw" || low == "anticlockwise" || low == "racw") low = "g";
  else if (low == "resume" || low == "start" || low == "go") {
    if (botzieMotionCmd == 'n') botzieMotionCmd = 'u';
    botzieHandleMotionChar(botzieMotionCmd);
    return true;
  } else if (low == "stop" || low == "idle" || low == "halt" || low == "brake" || low == "n") {
    botzieHandleMotionChar('n');
    return true;
  }
  if (low.length() == 1) {
    char ch = low[0];
    if (ch == 'u' || ch == 'd' || ch == 'l' || ch == 'r' || ch == 'c' || ch == 'g' ||
        ch == 'a' || ch == 'n' || ch == 's' || ch == 'i') {
      if (ch == 'a') ch = 'g';
      botzieHandleMotionChar(ch);
      return true;
    }
  }
  return false;
}

void botzieNoteWifiDrive(const String &cmd) {
  botzieWifiPaused = false;
  botzieWifiDriveCmd = cmd;
  botzieLastMovement = cmd;
  botzieLastCmdMs = millis();
  if (cmd == "left" || cmd == "right") botzieSteerStartMs = millis();
  char motion = 'n';
  if (cmd == "forward") motion = 'u';
  else if (cmd == "backward") motion = 'd';
  else if (cmd == "left") motion = 'l';
  else if (cmd == "right") motion = 'r';
  else if (cmd == "cw") motion = 'c';
  else if (cmd == "acw") motion = 'g';
  botzieMotionCmd = motion;
  botzieTelemCommand = botzieMotionLabel(motion);
  botzieTelemDirection = botzieTelemCommand;
  botzieTelemMode = "manual";
  botzieApplyWifiDrive();
}
#endif

void botzieMoveForward() {
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieHandleMotionChar('u');
#elif defined(ARDUINO_ARCH_ESP32)
  botzieDriveSide(BOTZIE_LEFT_A, BOTZIE_LEFT_B, botzieLeftSpeed, true);
  botzieDriveSide(BOTZIE_RIGHT_A, BOTZIE_RIGHT_B, botzieRightSpeed, true);
#endif
}

void botzieMoveBackward() {
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieHandleMotionChar('d');
#elif defined(ARDUINO_ARCH_ESP32)
  botzieDriveSide(BOTZIE_LEFT_A, BOTZIE_LEFT_B, botzieLeftSpeed, false);
  botzieDriveSide(BOTZIE_RIGHT_A, BOTZIE_RIGHT_B, botzieRightSpeed, false);
#endif
}

void botzieTurnLeft() {
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieHandleMotionChar('l');
#elif defined(ARDUINO_ARCH_ESP32)
  botzieDriveSide(BOTZIE_LEFT_A, BOTZIE_LEFT_B, botzieLeftSpeed, false);
  botzieDriveSide(BOTZIE_RIGHT_A, BOTZIE_RIGHT_B, botzieRightSpeed, true);
#endif
}

void botzieTurnRight() {
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieHandleMotionChar('r');
#elif defined(ARDUINO_ARCH_ESP32)
  botzieDriveSide(BOTZIE_LEFT_A, BOTZIE_LEFT_B, botzieLeftSpeed, true);
  botzieDriveSide(BOTZIE_RIGHT_A, BOTZIE_RIGHT_B, botzieRightSpeed, false);
#endif
}

void botzieStopMotors() {
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieHandleMotionChar('n');
#elif defined(ARDUINO_ARCH_ESP32)
  botzieDriveSide(BOTZIE_LEFT_A, BOTZIE_LEFT_B, 0, true);
  botzieDriveSide(BOTZIE_RIGHT_A, BOTZIE_RIGHT_B, 0, true);
#endif
}

void botzieRotateCW() {
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieHandleMotionChar('c');
#else
  botzieTurnRight();
#endif
}

void botzieRotateCCW() {
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieHandleMotionChar('g');
#else
  botzieTurnLeft();
#endif
}

void botzieSetSpeedPercent(int pct) {
#if defined(BOTZIE_KIT_ROBOTICS)
  int level = constrain((pct + 10) / 20, 0, 5);
  botzieSetSpeedFromLevel(level);
#else
  pct = constrain(pct, 0, 100);
  botzieMotorSpeed = map(pct, 0, 100, 0, 255);
  botzieLeftSpeed = botzieMotorSpeed;
  botzieRightSpeed = botzieMotorSpeed;
#endif
}

bool botzieObstacleDetected() {
  return botzieObstacleWithinCm(BOTZIE_OBSTACLE_CM);
}

bool botzieObstacleWithinCm(int cm) {
  long d = botzieReadDistanceCm();
  return (d > 0 && d < cm);
}

int botzieReadLineLeft() {
  return analogRead(BOTZIE_LINE_LEFT_PIN);
}

int botzieReadLineRight() {
  return analogRead(BOTZIE_LINE_RIGHT_PIN);
}

void botzieReply(const String &msg) {
  if (msg.startsWith("ERR:")) {
    return;
  }
  if (msg.startsWith("$$$$") || msg.indexOf("distance=") >= 0) {
    return;
  }
  botzieTraceTx(msg);
#if defined(ARDUINO_ARCH_ESP32)
#if defined(BOTZIE_USE_CLASSIC)
  if (botzieClassicEnabled && SerialBT.hasClient()) SerialBT.println(msg);
#endif
  // Never BLE-notify on the write characteristic (echo loop / ld_fm assert).
#endif
}

void botzieSendStream(const String &msg) {
#if defined(ARDUINO_ARCH_ESP32)
#if defined(BOTZIE_USE_CLASSIC)
  if (botzieClassicEnabled && SerialBT.hasClient()) SerialBT.print(msg);
#endif
#endif
}

void botzieLog(const String &msg) {
  botzieReply(String("LOG:") + msg);
}

void botzieGraph(const String &label, float value) {
  botzieReply(String("GRAPH,") + label + String(",") + String(value, 2));
}

void botzieApplyMapped(uint8_t act) {
  if (act == 1) botzieMoveForward();
  else if (act == 2) botzieMoveBackward();
  else if (act == 3) botzieTurnLeft();
  else if (act == 4) botzieTurnRight();
  else if (act == 5) botzieStopMotors();
  else if (act == 6) botzieRotateCW();
  else if (act == 7) botzieRotateCCW();
  else if (act == 8) botzieMoveForward();
}

void botzieHandleJoystick(int x, int y) {
  x = constrain(x, -100, 100);
  y = constrain(y, -100, 100);
  int left = map(y + x, -200, 200, -255, 255);
  int right = map(y - x, -200, 200, -255, 255);
  botzieLeftSpeed = abs(left);
  botzieRightSpeed = abs(right);
#if defined(ARDUINO_ARCH_ESP32)
  botzieDriveSide(BOTZIE_LEFT_A, BOTZIE_LEFT_B, botzieLeftSpeed, left >= 0);
  botzieDriveSide(BOTZIE_RIGHT_A, BOTZIE_RIGHT_B, botzieRightSpeed, right >= 0);
#endif
}

void botzieHandleCommand(const String &cmdRaw) {
  botzieTraceRx(cmdRaw);
  if (botzieHandleTerminalInput(cmdRaw)) {
    return;
  }
  if (botzieHandleBlockzieBleProtocol(cmdRaw)) {
    return;
  }

  String cmd = botzieNormalizeCmd(cmdRaw);
  if (cmd.length() == 0) return;
  String cmdLower = cmd;
  cmdLower.toLowerCase();
  botzieLastCommand = cmdLower;

  if (cmdLower == "connect") {
    botzieAllLedsOff();
    botzieLastReply = String("connected:") + String(botzieBleName);
    botzieReply(botzieLastReply);
    return;
  }
  if (cmdLower == "list" || cmdLower.startsWith("led:")) {
    botzieHandleLedCommand(cmdLower);
    return;
  }
  if (botzieHandleServoCommand(cmdLower)) return;
  if (botzieHandleRadarCommand(cmdLower)) return;

  if (cmdLower.startsWith("joy,")) {
    int c1 = cmdLower.indexOf(',');
    int c2 = cmdLower.indexOf(',', c1 + 1);
    if (c2 > c1) {
      int x = cmdLower.substring(c1 + 1, c2).toInt();
      int y = cmdLower.substring(c2 + 1).toInt();
      botzieHandleJoystick(x, y);
      return;
    }
  }

  uint8_t mapped = botzieLookupMapped(cmdLower);
  if (mapped) {
    botzieApplyMapped(mapped);
    return;
  }

#if defined(BOTZIE_KIT_ROBOTICS)
  if (botzieHandleRoboticsAppCommand(cmd)) return;
#endif

  if (cmdLower == "forward" || cmdLower == "u" || cmdLower == "f" || cmdLower == "cmd_f") botzieMoveForward();
  else if (cmdLower == "backward" || cmdLower == "back" || cmdLower == "d" || cmdLower == "b") botzieMoveBackward();
  else if (cmdLower == "left" || cmdLower == "l") botzieTurnLeft();
  else if (cmdLower == "right" || cmdLower == "r") botzieTurnRight();
  else if (cmdLower == "stop" || cmdLower == "n" || cmdLower == "cmd_b" ||
           cmdLower == "idle" || cmdLower == "halt" || cmdLower == "brake") botzieStopMotors();
  else if (cmdLower == "rotatecw" || cmdLower == "rotate_cw" || cmdLower == "c") botzieRotateCW();
  else if (cmdLower == "rotateccw" || cmdLower == "rotateacw" ||
           cmdLower == "rotate_acw" || cmdLower == "rotate_ccw" || cmdLower == "a" || cmdLower == "g") botzieRotateCCW();
  else if (cmdLower == "resume") botzieMoveForward();
  else if (cmd.equalsIgnoreCase("gear up")) botzieMotorSpeed = min(botzieMotorSpeed + 20, 255);
  else if (cmd.equalsIgnoreCase("gear down")) botzieMotorSpeed = max(botzieMotorSpeed - 20, 50);
  else if (cmdLower == "distance") botzieReply(String(botzieReadDistanceCm()));
}

void botzieDispatchLine(const String &line) {
  botzieHandleCommand(line);
}

#if defined(ARDUINO_ARCH_ESP32)
#if defined(BOTZIE_USE_CLASSIC)
void botzieProcessBluetooth() {
  while (SerialBT.available()) {
    char c = (char)SerialBT.read();
    if (c == '\\n' || c == '\\r') {
      if (botzieInputBuffer.length() > 0) {
        botzieDispatchLine(botzieInputBuffer);
        botzieInputBuffer = "";
      }
    } else {
      botzieInputBuffer += c;
      botzieLastReadMs = millis();
    }
  }
  if (botzieInputBuffer.length() > 0 && millis() - botzieLastReadMs > botzieFlushMs) {
    botzieDispatchLine(botzieInputBuffer);
    botzieInputBuffer = "";
  }
}
#endif
#endif

void botzieProcessWireless() {
#if defined(ARDUINO_ARCH_ESP32)
  botzieDrainCommandQueue();
#if defined(BOTZIE_USE_CLASSIC)
  if (botzieClassicEnabled) {
    botzieProcessBluetooth();
  }
#endif
  botzieRadarTick();
#if defined(BOTZIE_KIT_ROBOTICS)
  botzieRoboticsTick();
#endif
#endif
}

void botzieDisconnect() {
#if defined(ARDUINO_ARCH_ESP32)
#if defined(BOTZIE_USE_CLASSIC)
  if (botzieClassicEnabled) {
    if (SerialBT.hasClient()) SerialBT.disconnect();
    SerialBT.end();
    botzieClassicEnabled = false;
  }
#endif
  if (botzieBleEnabled) {
    if (botzieBleServer != nullptr) {
      botzieBleServer->disconnect(0);
    }
    BLEDevice::deinit(true);
    botzieBleServer = nullptr;
    botzieBleCommandCharacteristic = nullptr;
    botzieBleConnected = false;
    botzieBleEnabled = false;
  }
#endif
  botzieStopMotors();
  botzieLastCommand = "";
  botzieInputBuffer = "";
}
`;
    }

    function ensureBotzieNano (Blockly) {
        if (Blockly.Arduino.definitions_.botzie_pins) {
            return;
        }
        const profile = resolveBotzieProfile(Blockly);
        Blockly.Arduino.includes_.botzie_softserial = `#define _SS_MAX_RX_BUFF 128
#include <SoftwareSerial.h>
#include <Servo.h>
#include <string.h>
#include <stdio.h>${botzieIsIotAiKit(Blockly) ? '\n#include <DHT.h>' : ''}`;
        Blockly.Arduino.definitions_.botzie_pins = buildNanoPinDefines(profile, Blockly);
        Blockly.Arduino.definitions_.botzie_bt_serial = `
#ifndef BOTZIE_USE_ESP01
SoftwareSerial BotzieBT(BOTZIE_BT_RX, BOTZIE_BT_TX);
#else
SoftwareSerial BotzieEsp(BOTZIE_ESP_RX_PIN, BOTZIE_ESP_TX_PIN);
#endif
`;
        Blockly.Arduino.definitions_.botzie_vars = `
int botzieMotorSpeed = 200;
int botzieLeftSpeed = 200;
int botzieRightSpeed = 200;
String botzieLastCommand = "";
String botzieInputBuffer = "";
unsigned long botzieLastReadMs = 0;
const unsigned long botzieFlushMs = 15;
bool botzieWifiEnabled = false;
bool botzieWifiApMode = false;
char botzieBleName[32] = "Botzie";
#if defined(BOTZIE_KIT_IOT)
DHT botzieDht(BOTZIE_DHT_PIN, DHT11);
bool botzieDhtTelem = true;
bool botzieLedTelem = true;
int botzieIotSpeedLevel = 0;
unsigned long botzieIotLastSend = 0;
const unsigned long BOTZIE_IOT_SEND_MS = 2000;
static const uint8_t BOTZIE_BT_CHUNK = 20;
static const uint8_t BOTZIE_BT_CHUNK_DELAY = 8;
#endif
`;
        Blockly.Arduino.definitions_.botzie_led_servo = buildBotzieLedServoLib();
        Blockly.Arduino.definitions_.botzie_functions = `
#if defined(BOTZIE_USE_ESP01)
void botzieEspSendStr(const char* s);
void botzieProcessEsp01();
#endif
void botzieReply(const String &msg);
void botzieSetSpeedPercent(int pct);
bool botzieHandleLedCommand(const String &low);
bool botzieHandleServoCommand(const String &low);

String botzieNormalizeCmd(const String &cmdRaw) {
  String cmd;
  for (unsigned int i = 0; i < cmdRaw.length(); i++) {
    char c = cmdRaw.charAt(i);
    if (c == '\\0' || c == '\\r' || c == '\\n') continue;
    if ((unsigned char)c < 32) continue;
    cmd += c;
  }
  cmd.trim();
  return cmd;
}

void botzieNanoPinWrite(uint8_t pin, uint32_t val) {
  val = constrain(val, 0, 255);
  pinMode(pin, OUTPUT);
  if (pin == 3 || pin == 5 || pin == 6 || pin == 9 || pin == 10 || pin == 11) analogWrite(pin, val);
  else digitalWrite(pin, val > 0 ? HIGH : LOW);
}

void botzieDriveSideNano(uint8_t pinA, uint8_t pinB, int speed, bool forward) {
  speed = constrain(abs(speed), 0, 255);
  if (speed == 0) {
    botzieNanoPinWrite(pinA, 0);
    botzieNanoPinWrite(pinB, 0);
    return;
  }
  if (forward) {
    botzieNanoPinWrite(pinA, 0);
    botzieNanoPinWrite(pinB, speed);
  } else {
    botzieNanoPinWrite(pinA, speed);
    botzieNanoPinWrite(pinB, 0);
  }
}

void botzieDriveFour(uint8_t flA, uint8_t flB, uint8_t frA, uint8_t frB,
                     uint8_t blA, uint8_t blB, uint8_t brA, uint8_t brB,
                     int speed, bool flF, bool frF, bool blF, bool brF) {
  botzieDriveSideNano(flA, flB, speed, flF);
  botzieDriveSideNano(frA, frB, speed, frF);
  botzieDriveSideNano(blA, blB, speed, blF);
  botzieDriveSideNano(brA, brB, speed, brF);
}

void botzieSetLeftRightSpeed(int left, int right) {
  botzieLeftSpeed = constrain(left, 0, 255);
  botzieRightSpeed = constrain(right, 0, 255);
}

void botzieMoveForward() {
  int s = botzieLeftSpeed;
  botzieDriveFour(BOTZIE_FL_A, BOTZIE_FL_B, BOTZIE_FR_A, BOTZIE_FR_B,
                  BOTZIE_BL_A, BOTZIE_BL_B, BOTZIE_BR_A, BOTZIE_BR_B,
                  s, true, true, true, true);
}

void botzieMoveBackward() {
  int s = botzieLeftSpeed;
  botzieDriveFour(BOTZIE_FL_A, BOTZIE_FL_B, BOTZIE_FR_A, BOTZIE_FR_B,
                  BOTZIE_BL_A, BOTZIE_BL_B, BOTZIE_BR_A, BOTZIE_BR_B,
                  s, false, false, false, false);
}

void botzieTurnLeft() {
  int s = botzieLeftSpeed;
  botzieDriveFour(BOTZIE_FL_A, BOTZIE_FL_B, BOTZIE_FR_A, BOTZIE_FR_B,
                  BOTZIE_BL_A, BOTZIE_BL_B, BOTZIE_BR_A, BOTZIE_BR_B,
                  s, false, true, false, true);
}

void botzieTurnRight() {
  int s = botzieLeftSpeed;
  botzieDriveFour(BOTZIE_FL_A, BOTZIE_FL_B, BOTZIE_FR_A, BOTZIE_FR_B,
                  BOTZIE_BL_A, BOTZIE_BL_B, BOTZIE_BR_A, BOTZIE_BR_B,
                  s, true, false, true, false);
}

void botzieStopMotors() {
  botzieDriveFour(BOTZIE_FL_A, BOTZIE_FL_B, BOTZIE_FR_A, BOTZIE_FR_B,
                  BOTZIE_BL_A, BOTZIE_BL_B, BOTZIE_BR_A, BOTZIE_BR_B,
                  0, true, true, true, true);
}

void botzieRotateCW() { botzieTurnRight(); }
void botzieRotateCCW() { botzieTurnLeft(); }

#if defined(BOTZIE_KIT_IOT)
void botzieBtWritePaced(const String& payload) {
  unsigned int len = payload.length();
  for (unsigned int i = 0; i < len; i += BOTZIE_BT_CHUNK) {
    unsigned int end = (i + BOTZIE_BT_CHUNK < len) ? (i + BOTZIE_BT_CHUNK) : len;
    BotzieBT.print(payload.substring(i, end));
    if (end < len) delay(BOTZIE_BT_CHUNK_DELAY);
  }
}

int botzieIotPinForKey(const String& key) {
  if (key == "d10") return BOTZIE_IOT_LED_D10;
  if (key == "d7") return BOTZIE_IOT_LED_D7;
  if (key == "d5") return BOTZIE_IOT_LED_D5;
  if (key == "d6") return BOTZIE_IOT_LED_D6;
  return BOTZIE_IOT_LED_D11;
}

String botzieIotNormalizeLedKey(String cmd) {
  cmd.trim();
  cmd.toLowerCase();
  if (cmd == "u" || cmd.indexOf("d10") >= 0 || cmd.indexOf("forward") >= 0) return "d10";
  if (cmd == "l" || cmd.indexOf("d7") >= 0 || cmd.indexOf("left") >= 0) return "d7";
  if (cmd == "r" || cmd.indexOf("d5") >= 0 || cmd.indexOf("right") >= 0) return "d5";
  if (cmd == "d" || cmd == "b" || cmd.indexOf("d6") >= 0 || cmd.indexOf("backward") >= 0) return "d6";
  if (cmd == "a" || cmd.indexOf("d11") >= 0 || cmd.indexOf("aux") >= 0) return "d11";
  return "";
}

void botzieIotSendProtocolStatus() {
  if (botzieDhtTelem && botzieLedTelem) botzieReply("PROTOCOL:dht_led");
  else if (botzieDhtTelem) botzieReply("PROTOCOL:dht");
  else if (botzieLedTelem) botzieReply("PROTOCOL:led");
  else botzieReply("PROTOCOL:none");
}

String botzieIotTelemetryPacket(float temperature, float humidity) {
  String packet = BOTZIE_FRAME_START;
  bool hasField = false;
  if (botzieDhtTelem) {
    packet += "temp=" + String(temperature, 2);
    packet += ",humidity=" + String(humidity, 2);
    hasField = true;
  }
  if (botzieLedTelem) {
    if (hasField) packet += ",";
    int i10 = botzieLedIndexForPin(BOTZIE_IOT_LED_D10);
    int i7 = botzieLedIndexForPin(BOTZIE_IOT_LED_D7);
    int i5 = botzieLedIndexForPin(BOTZIE_IOT_LED_D5);
    int i6 = botzieLedIndexForPin(BOTZIE_IOT_LED_D6);
    int i11 = botzieLedIndexForPin(BOTZIE_IOT_LED_D11);
    packet += "led_d10=" + String((i10 >= 0 && botzieLeds[i10].state) ? 1 : 0);
    packet += ",led_d7=" + String((i7 >= 0 && botzieLeds[i7].state) ? 1 : 0);
    packet += ",led_d5=" + String((i5 >= 0 && botzieLeds[i5].state) ? 1 : 0);
    packet += ",led_d6=" + String((i6 >= 0 && botzieLeds[i6].state) ? 1 : 0);
    packet += ",led_d11=" + String((i11 >= 0 && botzieLeds[i11].state) ? 1 : 0);
  }
  packet += BOTZIE_FRAME_END;
  return packet;
}

void botzieIotSendTelemetry() {
  if (!botzieDhtTelem && !botzieLedTelem) {
    botzieReply("ERROR:NO_TELEMETRY_ENABLED");
    return;
  }
  float humidity = 0;
  float temperature = 0;
  if (botzieDhtTelem) {
    humidity = botzieDht.readHumidity();
    temperature = botzieDht.readTemperature();
    if (isnan(humidity) || isnan(temperature)) {
      botzieReply("ERROR:DHT");
      if (botzieLedTelem) {
        bool restore = botzieDhtTelem;
        botzieDhtTelem = false;
        botzieReply(botzieIotTelemetryPacket(0, 0));
        botzieDhtTelem = restore;
      }
      return;
    }
  }
  botzieReply(botzieIotTelemetryPacket(temperature, humidity));
}

void botzieIotHandleLed(const String& rawCmd) {
  if (!botzieLedTelem) {
    botzieReply("ERR:LED_DISABLED");
    return;
  }
  String cmd = rawCmd;
  cmd.trim();
  cmd.toLowerCase();
  String key = botzieIotNormalizeLedKey(cmd);
  if (key.length() == 0) {
    botzieReply("ERR:UNKNOWN_CMD");
    return;
  }
  int pin = botzieIotPinForKey(key);
  int index = botzieLedIndexForPin(pin);
  if (index < 0) {
    botzieReply("err:pin");
    return;
  }
  bool nextState = false;
  if (cmd.endsWith("_on")) nextState = true;
  else if (cmd.endsWith("_off")) nextState = false;
  else nextState = !botzieLeds[index].state;
  botzieSetLedState((uint8_t)index, nextState);
}

String botzieIotExtractCommand(String cmd) {
  cmd.trim();
  cmd.toLowerCase();
  if (cmd.startsWith(BOTZIE_FRAME_START)) {
    int startIndex = cmd.indexOf("cmd=");
    if (startIndex >= 0) {
      startIndex += 4;
      int endIndex = cmd.indexOf(',', startIndex);
      int frameEndIndex = cmd.indexOf(BOTZIE_FRAME_END, startIndex);
      if (endIndex < 0 || (frameEndIndex >= 0 && frameEndIndex < endIndex)) endIndex = frameEndIndex;
      if (endIndex < 0) endIndex = cmd.length();
      String extracted = cmd.substring(startIndex, endIndex);
      extracted.trim();
      return extracted;
    }
  }
  int separatorIndex = cmd.indexOf('=');
  if (separatorIndex < 0) separatorIndex = cmd.indexOf(':');
  if (separatorIndex > 0) {
    String key = cmd.substring(0, separatorIndex);
    String value = cmd.substring(separatorIndex + 1);
    key.trim();
    value.trim();
    if (key == "led_d10" || key == "led_d7" || key == "led_d5" || key == "led_d6" || key == "led_d11") {
      if (value == "1" || value == "on" || value == "true") return key + "_on";
      if (value == "0" || value == "off" || value == "false") return key + "_off";
    }
  }
  return cmd;
}

bool botzieHandleIotAppCommand(String cmd) {
  cmd = botzieIotExtractCommand(cmd);
  cmd.trim();
  cmd.toLowerCase();
  if (cmd.length() == 0) return true;
  if (cmd == "protocol?" || cmd == "protocol:status") {
    botzieIotSendProtocolStatus();
    return true;
  }
  if (cmd == "protocol:dht" || cmd == "protocol=dht") {
    botzieDhtTelem = true;
    botzieLedTelem = false;
    botzieIotSendProtocolStatus();
    return true;
  }
  if (cmd == "protocol:led" || cmd == "protocol=led") {
    botzieDhtTelem = false;
    botzieLedTelem = true;
    botzieIotSendProtocolStatus();
    return true;
  }
  if (cmd == "protocol:dht_led" || cmd == "protocol=dht_led" ||
      cmd == "protocol:dht+led" || cmd == "protocol=dht+led") {
    botzieDhtTelem = true;
    botzieLedTelem = true;
    botzieIotSendProtocolStatus();
    return true;
  }
  if (cmd == "forward") cmd = "u";
  else if (cmd == "backward" || cmd == "reverse") cmd = "d";
  else if (cmd == "left") cmd = "l";
  else if (cmd == "right") cmd = "r";
  else if (cmd == "cmd_f") cmd = "u";
  else if (cmd == "cmd_b" || cmd == "stop" || cmd == "idle" || cmd == "halt" || cmd == "brake") cmd = "n";
  if (cmd == "u" || cmd == "f") { botzieMoveForward(); return true; }
  if (cmd == "d" || cmd == "b") { botzieMoveBackward(); return true; }
  if (cmd == "l") { botzieTurnLeft(); return true; }
  if (cmd == "r") { botzieTurnRight(); return true; }
  if (cmd == "n" || cmd == "s") { botzieStopMotors(); return true; }
  if (cmd == "c" || cmd == "rotatecw" || cmd == "clockwise") { botzieRotateCW(); return true; }
  if (cmd == "g" || cmd == "a" || cmd == "rotateacw" || cmd == "anticlockwise") { botzieRotateCCW(); return true; }
  if (cmd == "resume" || cmd == "start") { botzieMoveForward(); return true; }
  if (cmd.startsWith("speed:")) {
    int level = cmd.substring(6).toInt();
    botzieIotSpeedLevel = constrain(level, 0, 5);
    botzieSetSpeedPercent(botzieIotSpeedLevel * 20);
    return true;
  }
  if (botzieIotNormalizeLedKey(cmd).length() == 0) return false;
  botzieIotHandleLed(cmd);
  return true;
}

void botzieIotBegin() {
  botzieLedIndexForPin(BOTZIE_IOT_LED_D10);
  botzieLedIndexForPin(BOTZIE_IOT_LED_D7);
  botzieLedIndexForPin(BOTZIE_IOT_LED_D5);
  botzieLedIndexForPin(BOTZIE_IOT_LED_D6);
  botzieLedIndexForPin(BOTZIE_IOT_LED_D11);
  if (botzieDhtTelem) botzieDht.begin();
  Serial.println("Botzie IoT ready");
}

void botzieIotTick() {
}
#endif

void botzieSetSpeedPercent(int pct) {
  pct = constrain(pct, 0, 100);
  botzieMotorSpeed = map(pct, 0, 100, 0, 255);
  botzieLeftSpeed = botzieMotorSpeed;
  botzieRightSpeed = botzieMotorSpeed;
}

bool botzieObstacleDetected() {
  return botzieObstacleWithinCm(BOTZIE_OBSTACLE_CM);
}

bool botzieObstacleWithinCm(int cm) {
  long d = botzieReadDistanceCm();
  return (d > 0 && d < cm);
}

int botzieReadLineLeft() { return analogRead(BOTZIE_LINE_LEFT_PIN); }
int botzieReadLineRight() { return analogRead(BOTZIE_LINE_RIGHT_PIN); }

void botzieReply(const String &msg) {
  if (msg.startsWith("$$$$") || msg.indexOf("distance=") >= 0) {
    return;
  }
  Serial.println(msg);
#if !defined(BOTZIE_USE_ESP01)
#if defined(BOTZIE_KIT_IOT)
  botzieBtWritePaced(msg);
  botzieBtWritePaced("\\n");
#else
  BotzieBT.println(msg);
#endif
#endif
}

void botzieSendStream(const String &msg) {
  Serial.print(msg);
#if !defined(BOTZIE_USE_ESP01)
#if defined(BOTZIE_KIT_IOT)
  botzieBtWritePaced(msg);
#else
  BotzieBT.print(msg);
#endif
#endif
}

void botzieLog(const String &msg) {
  botzieReply(String("LOG:") + msg);
}

void botzieGraph(const String &label, float value) {
  botzieReply(String("GRAPH,") + label + String(",") + String(value, 2));
}

void botzieApplyMapped(uint8_t act) {
  if (act == 1) botzieMoveForward();
  else if (act == 2) botzieMoveBackward();
  else if (act == 3) botzieTurnLeft();
  else if (act == 4) botzieTurnRight();
  else if (act == 5) botzieStopMotors();
  else if (act == 6) botzieRotateCW();
  else if (act == 7) botzieRotateCCW();
  else if (act == 8) botzieMoveForward();
}

void botzieHandleJoystick(int x, int y) {
  x = constrain(x, -100, 100);
  y = constrain(y, -100, 100);
  int left = map(y + x, -200, 200, -255, 255);
  int right = map(y - x, -200, 200, -255, 255);
  botzieLeftSpeed = abs(left);
  botzieRightSpeed = abs(right);
  botzieDriveSideNano(BOTZIE_FL_A, BOTZIE_FL_B, botzieLeftSpeed, left >= 0);
  botzieDriveSideNano(BOTZIE_BL_A, BOTZIE_BL_B, botzieLeftSpeed, left >= 0);
  botzieDriveSideNano(BOTZIE_FR_A, BOTZIE_FR_B, botzieRightSpeed, right >= 0);
  botzieDriveSideNano(BOTZIE_BR_A, BOTZIE_BR_B, botzieRightSpeed, right >= 0);
}

void botzieHandleCommand(const String &cmdRaw) {
  String cmd = botzieNormalizeCmd(cmdRaw);
  if (cmd.length() == 0) return;
  Serial.print("APP BT: ");
  Serial.println(cmd);
  String cmdLower = cmd;
  cmdLower.toLowerCase();
  botzieLastCommand = cmdLower;

  if (cmdLower == "connect") {
    botzieAllLedsOff();
    botzieLastReply = String("connected:") + String(botzieBleName);
    botzieReply(botzieLastReply);
    return;
  }
  if (cmdLower == "list" || cmdLower.startsWith("led:")) {
    botzieHandleLedCommand(cmdLower);
    return;
  }
  if (botzieHandleServoCommand(cmdLower)) return;
  if (botzieHandleRadarCommand(cmdLower)) return;
#if defined(BOTZIE_KIT_IOT)
  if (botzieHandleIotAppCommand(cmd)) return;
#endif

  if (cmdLower.startsWith("joy,")) {
    int c1 = cmdLower.indexOf(',');
    int c2 = cmdLower.indexOf(',', c1 + 1);
    if (c2 > c1) {
      int x = cmdLower.substring(c1 + 1, c2).toInt();
      int y = cmdLower.substring(c2 + 1).toInt();
      botzieHandleJoystick(x, y);
      return;
    }
  }

  uint8_t mapped = botzieLookupMapped(cmdLower);
  if (mapped) {
    botzieApplyMapped(mapped);
    return;
  }

  if (cmdLower == "forward" || cmdLower == "u" || cmdLower == "f" || cmdLower == "cmd_f") botzieMoveForward();
  else if (cmdLower == "backward" || cmdLower == "back" || cmdLower == "d" || cmdLower == "b") botzieMoveBackward();
  else if (cmdLower == "left" || cmdLower == "l") botzieTurnLeft();
  else if (cmdLower == "right" || cmdLower == "r") botzieTurnRight();
  else if (cmdLower == "stop" || cmdLower == "n" || cmdLower == "cmd_b" ||
           cmdLower == "idle" || cmdLower == "halt" || cmdLower == "brake") botzieStopMotors();
  else if (cmdLower == "rotatecw" || cmdLower == "rotate_cw" || cmdLower == "c") botzieRotateCW();
  else if (cmdLower == "rotateccw" || cmdLower == "rotateacw" ||
           cmdLower == "rotate_acw" || cmdLower == "rotate_ccw" || cmdLower == "a") botzieRotateCCW();
  else if (cmdLower == "resume") botzieMoveForward();
  else if (cmd.equalsIgnoreCase("gear up")) botzieMotorSpeed = min(botzieMotorSpeed + 20, 255);
  else if (cmd.equalsIgnoreCase("gear down")) botzieMotorSpeed = max(botzieMotorSpeed - 20, 50);
  else if (cmdLower == "distance") botzieReply(String(botzieReadDistanceCm()));
}

void botzieDispatchLine(const String &line) {
  botzieHandleCommand(line);
}

void botzieProcessBluetooth() {
#if !defined(BOTZIE_USE_ESP01)
  while (BotzieBT.available()) {
    char c = (char)BotzieBT.read();
    if (c == '\\n' || c == '\\r') {
      if (botzieInputBuffer.length() > 0) {
        botzieDispatchLine(botzieInputBuffer);
        botzieInputBuffer = "";
      }
    } else {
      botzieInputBuffer += c;
      botzieLastReadMs = millis();
    }
  }
  if (botzieInputBuffer.length() > 0 && millis() - botzieLastReadMs > botzieFlushMs) {
    botzieDispatchLine(botzieInputBuffer);
    botzieInputBuffer = "";
  }
#endif
}

void botzieProcessWireless() {
#if defined(BOTZIE_USE_ESP01)
  botzieProcessEsp01();
#else
  botzieProcessBluetooth();
#endif
  botzieRadarTick();
  botzieServiceSoftwarePwm();
#if defined(BOTZIE_KIT_IOT)
  botzieIotTick();
#endif
}

void botzieDisconnect() {
#if defined(BOTZIE_USE_ESP01)
  if (botzieWifiEnabled) {
    botzieEspSendStr("AT+CIPSERVER=0");
    botzieEspSendStr("AT+CWQAP");
    botzieWifiEnabled = false;
  }
#else
  BotzieBT.end();
#endif
  botzieStopMotors();
  botzieLastCommand = "";
  botzieInputBuffer = "";
}
`;
    }

    function ensureBotzieBase (Blockly) {
        if (isEsp32Kit(Blockly)) {
            ensureBotzieEsp32(Blockly);
        } else {
            ensureBotzieNano(Blockly);
        }
        if (!Blockly.Arduino.loops_['00_botzie_wireless']) {
            Blockly.Arduino.loops_['00_botzie_wireless'] = 'botzieProcessWireless();\n';
        }
    }

    function ensureBotzieSetup (Blockly) {
        ensureBotzieBase(Blockly);
        if (isEsp32Kit(Blockly)) {
            if (botzieIsIntermediateKit(Blockly)) {
                Blockly.Arduino.setups_.botzie_pins = `
botzieAttachMotors();
botzieApplyUltrasonicPins();
pinMode(BOTZIE_LINE_LEFT_PIN, INPUT);
pinMode(BOTZIE_LINE_RIGHT_PIN, INPUT);
pinMode(BOTZIE_BUZZER_PIN, OUTPUT);
digitalWrite(BOTZIE_BUZZER_PIN, LOW);
Serial.begin(115200);
delay(1500);
Serial.println("Botzie AI & Robotics 4WD FL(2,13) FR(18,12) BL(15,23) BR(19,27)");
`;
            } else {
                Blockly.Arduino.setups_.botzie_pins = `
botzieAttachMotors();
botzieApplyUltrasonicPins();
pinMode(BOTZIE_LINE_LEFT_PIN, INPUT);
pinMode(BOTZIE_LINE_RIGHT_PIN, INPUT);
pinMode(BOTZIE_BUZZER_PIN, OUTPUT);
digitalWrite(BOTZIE_BUZZER_PIN, LOW);
Serial.begin(115200);
delay(1500);
Serial.println("Botzie motors 27/25 + 26/32");
`;
            }
        } else {
            Blockly.Arduino.setups_.botzie_pins = `
botzieApplyUltrasonicPins();
pinMode(BOTZIE_LINE_LEFT_PIN, INPUT);
pinMode(BOTZIE_LINE_RIGHT_PIN, INPUT);
#if !defined(BOTZIE_KIT_IOT)
pinMode(BOTZIE_BUZZER_PIN, OUTPUT);
digitalWrite(BOTZIE_BUZZER_PIN, LOW);
#endif
Serial.begin(9600);
delay(1500);
#if defined(BOTZIE_KIT_IOT)
botzieIotBegin();
botzieStopMotors();
#endif
`;
        }
    }

    Blockly.Arduino.botzie_setup = function () {
        ensureBotzieSetup(Blockly);
        return '';
    };

    Blockly.Arduino.botzie_connect_bluetooth = function (block) {
        ensureBotzieBase(Blockly);
        let name = Blockly.Arduino.valueToCode(block, 'NAME', order) || '"Botzie"';
        name = name.trim();
        if (!name.startsWith('"')) {
            name = `"${name.replace(/^"|"$/g, '')}"`;
        }
        const mode = block.getFieldValue('MODE') || 'BLE';
        if (isEsp32Kit(Blockly)) {
            if (mode === 'CLASSIC') {
                Blockly.Arduino.includes_.botzie_0_classic = '#define BOTZIE_USE_CLASSIC 1\n#include "BluetoothSerial.h"';
                Blockly.Arduino.setups_.botzie_bt = `
strncpy(botzieBleName, ${name}, sizeof(botzieBleName) - 1);
botzieBleName[sizeof(botzieBleName) - 1] = '\\0';
SerialBT.begin(botzieBleName);
botzieClassicEnabled = true;
Serial.print("Classic Ready: ");
Serial.println(botzieBleName);
`;
            } else {
                Blockly.Arduino.setups_.botzie_bt = `
strncpy(botzieBleName, ${name}, sizeof(botzieBleName) - 1);
botzieBleName[sizeof(botzieBleName) - 1] = '\\0';
botzieStartBle(botzieBleName);
Serial.print("BLE Ready: ");
Serial.println(botzieBleName);
`;
            }
        } else {
            Blockly.Arduino.setups_.botzie_bt = `
#if !defined(BOTZIE_USE_ESP01)
strncpy(botzieBleName, ${name}, sizeof(botzieBleName) - 1);
botzieBleName[sizeof(botzieBleName) - 1] = '\\0';
BotzieBT.begin(9600);
delay(400);
#if !defined(BOTZIE_KIT_IOT)
BotzieBT.print("AT+NAME=");
BotzieBT.print(botzieBleName);
BotzieBT.print("\\r\\n");
delay(400);
BotzieBT.print("AT+NAME");
BotzieBT.print(botzieBleName);
delay(400);
while (BotzieBT.available()) BotzieBT.read();
#endif
Serial.print("Botzie Bluetooth Ready: ");
Serial.println(botzieBleName);
#else
Serial.println("Botzie ESP-01 WiFi uses D13/D2 — Bluetooth skipped (pin D2 shared)");
#endif
`;
        }
        return '';
    };

    Blockly.Arduino.botzie_connect_wifi = function (block) {
        ensureBotzieBase(Blockly);
        const mode = block.getFieldValue('MODE') || 'STA';
        const ssid = Blockly.Arduino.valueToCode(block, 'SSID', order) || '"Botzie"';
        const password = Blockly.Arduino.valueToCode(block, 'PASSWORD', order) || '"12345678"';

        if (!isEsp32Kit(Blockly)) {
            Blockly.Arduino.includes_.botzie_esp01_flag = '#define BOTZIE_USE_ESP01 1';
            Blockly.Arduino.definitions_.botzie_esp01_wifi = `
#define BOTZIE_ESP_RESP_MAX 160
char botzieEspResp[BOTZIE_ESP_RESP_MAX];

void botzieEspSendStr(const char* s) {
  if (s == NULL) return;
  for (int i = 0; s[i] != '\\0'; i++) {
    BotzieEsp.write((uint8_t)s[i]);
    delay(2);
  }
  BotzieEsp.write('\\r'); delay(2);
  BotzieEsp.write('\\n'); delay(40);
}

void botzieEspFlush() {
  while (BotzieEsp.available()) BotzieEsp.read();
}

int botzieEspReadToBuf(unsigned long timeout) {
  int n = 0;
  botzieEspResp[0] = '\\0';
  unsigned long start = millis();
  while (millis() - start < timeout) {
    while (BotzieEsp.available()) {
      char c = (char)BotzieEsp.read();
      if (n < BOTZIE_ESP_RESP_MAX - 1) {
        botzieEspResp[n++] = c;
        botzieEspResp[n] = '\\0';
      }
    }
    if (strstr(botzieEspResp, "OK") || strstr(botzieEspResp, "ERROR") ||
        strstr(botzieEspResp, "FAIL") || strstr(botzieEspResp, "WIFI GOT IP") ||
        strstr(botzieEspResp, ">") || strstr(botzieEspResp, "SEND OK")) {
      delay(40);
      while (BotzieEsp.available()) {
        char c = (char)BotzieEsp.read();
        if (n < BOTZIE_ESP_RESP_MAX - 1) {
          botzieEspResp[n++] = c;
          botzieEspResp[n] = '\\0';
        }
      }
      break;
    }
  }
  return n;
}

bool botzieEspSendAT(const char* cmd, const char* expect, unsigned long timeout) {
  botzieEspFlush();
  botzieEspSendStr(cmd);
  botzieEspReadToBuf(timeout);
  return (expect == NULL) || (strstr(botzieEspResp, expect) != NULL);
}

void botzieEspHttpOk(int linkId) {
  const char* resp = "HTTP/1.1 200 OK\\r\\nContent-Length: 2\\r\\nConnection: close\\r\\n\\r\\nOK";
  char at[28];
  snprintf(at, sizeof(at), "AT+CIPSEND=%d,%d", linkId, (int)strlen(resp));
  botzieEspSendAT(at, ">", 800);
  for (int i = 0; resp[i] != '\\0'; i++) {
    BotzieEsp.write((uint8_t)resp[i]);
    delay(2);
  }
  delay(80);
  snprintf(at, sizeof(at), "AT+CIPCLOSE=%d", linkId);
  botzieEspSendAT(at, NULL, 400);
}

void botzieEspCopyQueryVal(const char* q, const char* key, char* out, int outMax) {
  out[0] = '\\0';
  if (q == NULL || key == NULL) return;
  const char* p = strstr(q, key);
  if (!p) return;
  p += strlen(key);
  int i = 0;
  while (p[i] && p[i] != '&' && p[i] != ' ' && p[i] != '\\r' && p[i] != '\\n' && i < outMax - 1) {
    out[i] = p[i];
    i++;
  }
  out[i] = '\\0';
}

void botzieEspHandleQuery(char* uri) {
  if (uri == NULL || uri[0] == '\\0') return;
  Serial.print("APP WIFI: ");
  Serial.println(uri);
  if (uri[0] == '/') uri++;
  if (strncmp(uri, "connect", 7) == 0 || strncmp(uri, "ping", 4) == 0) {
    return;
  }
  char* q = strchr(uri, '?');
  if (strncmp(uri, "speed", 5) == 0) {
    int level = 3;
    if (q) {
      char* lv = strstr(q, "level=");
      if (lv) level = atoi(lv + 6);
    }
    botzieSetSpeedPercent(constrain(level * 20, 0, 100));
    return;
  }
  if (strncmp(uri, "command", 7) == 0 && q) {
    char* cmdp = strstr(q, "cmd=");
    if (cmdp) {
      cmdp += 4;
      char* end = cmdp;
      while (*end && *end != '&' && *end != ' ' && *end != '\\r' && *end != '\\n') end++;
      char saved = *end;
      *end = '\\0';
      botzieHandleCommand(String(cmdp));
      *end = saved;
    }
    return;
  }
  if (strncmp(uri, "led", 3) == 0) {
    char pin[8]; char st[12]; char br[8];
    botzieEspCopyQueryVal(q, "pin=", pin, sizeof(pin));
    botzieEspCopyQueryVal(q, "state=", st, sizeof(st));
    botzieEspCopyQueryVal(q, "brightness=", br, sizeof(br));
    if (pin[0] && br[0]) botzieHandleCommand(String("led:") + pin + ":brightness:" + br);
    if (pin[0] && st[0]) botzieHandleCommand(String("led:") + pin + ":" + st);
    return;
  }
  if (strncmp(uri, "servo", 5) == 0) {
    char pin[8]; char ang[8]; char rng[8];
    botzieEspCopyQueryVal(q, "pin=", pin, sizeof(pin));
    botzieEspCopyQueryVal(q, "angle=", ang, sizeof(ang));
    botzieEspCopyQueryVal(q, "range=", rng, sizeof(rng));
    if (pin[0] && rng[0]) botzieHandleCommand(String("servo:") + pin + ":range:" + rng);
    if (pin[0] && ang[0]) botzieHandleCommand(String("servo:") + pin + ":" + ang);
    else if (pin[0] && !rng[0]) botzieHandleCommand(String("servo:") + pin + ":90");
    return;
  }
  if (strncmp(uri, "radar", 5) == 0) {
    char st[12]; char bp[8]; char pn[8]; char tr[8]; char ec[8]; char sv[8];
    botzieEspCopyQueryVal(q, "state=", st, sizeof(st));
    botzieEspCopyQueryVal(q, "beep=", bp, sizeof(bp));
    botzieEspCopyQueryVal(q, "pin=", pn, sizeof(pn));
    botzieEspCopyQueryVal(q, "trig=", tr, sizeof(tr));
    botzieEspCopyQueryVal(q, "echo=", ec, sizeof(ec));
    botzieEspCopyQueryVal(q, "servo=", sv, sizeof(sv));
    if (tr[0]) botzieHandleCommand(String("radar:trig:") + tr);
    if (ec[0]) botzieHandleCommand(String("radar:echo:") + ec);
    if (st[0]) botzieHandleCommand(String("radar:") + st);
    if (sv[0]) botzieHandleCommand(String("radar:servo:") + sv);
    else if (pn[0]) botzieHandleCommand(String("radar:servo:") + pn);
    if (bp[0]) botzieHandleCommand(String("radar:beep:") + bp);
    if (!st[0] && !bp[0] && !pn[0] && !tr[0] && !ec[0] && !sv[0]) botzieHandleCommand(String("radar:on"));
    return;
  }
  if (q) *q = '\\0';
  if (uri[0]) botzieHandleCommand(String(uri));
}

void botzieEspHandleHttp(int linkId, char* payload) {
  char uri[64];
  uri[0] = '\\0';
  bool isPost = false;
  char* line = strstr(payload, "GET ");
  if (!line) {
    line = strstr(payload, "POST ");
    isPost = line != NULL;
    if (line) line += 5;
  } else {
    line += 4;
  }
  if (line) {
    while (*line == ' ') line++;
    int i = 0;
    while (*line && *line != ' ' && *line != '\\r' && *line != '\\n' && i < 63) {
      uri[i++] = *line++;
    }
    uri[i] = '\\0';
  }
  if (isPost) {
    char* body = strstr(payload, "\\r\\n\\r\\n");
    if (body && body[4]) {
      body += 4;
      char tmp[64];
      int i = 0;
      while (body[i] && body[i] != '\\r' && body[i] != '\\n' && i < 63) {
        tmp[i] = body[i];
        i++;
      }
      tmp[i] = '\\0';
      if (tmp[0]) botzieHandleCommand(String(tmp));
    } else if (uri[0]) {
      botzieEspHandleQuery(uri);
    }
  } else if (uri[0]) {
    botzieEspHandleQuery(uri);
  }
  botzieEspHttpOk(linkId);
}

void botzieProcessEsp01() {
  static char buf[180];
  static uint8_t len = 0;
  while (BotzieEsp.available()) {
    char c = (char)BotzieEsp.read();
    if (len < sizeof(buf) - 1) {
      buf[len++] = c;
      buf[len] = '\\0';
    } else {
      len = 0;
      buf[0] = '\\0';
    }
    if ((strstr(buf, "GET ") || strstr(buf, "POST ")) &&
        (strstr(buf, " HTTP/") || strstr(buf, "\\r\\n\\r\\n"))) {
      int linkId = 0;
      char* ipd = strstr(buf, "+IPD,");
      if (ipd) sscanf(ipd, "+IPD,%d,", &linkId);
      botzieEspHandleHttp(linkId, buf);
      len = 0;
      buf[0] = '\\0';
    }
  }
}

bool botzieEspInit() {
  Serial.println(F("[Botzie] ESP-01 init (D13 RX / D2 TX)"));
  BotzieEsp.begin(9600);
  BotzieEsp.listen();
  delay(2000);
  botzieEspFlush();
  for (int i = 0; i < 5; i++) {
    if (botzieEspSendAT("AT", "OK", 3000)) {
      Serial.println(F("[Botzie] ESP-01 ready"));
      botzieEspSendAT("ATE0", "OK", 1000);
      return true;
    }
    delay(400);
  }
  Serial.println(F("[Botzie] ESP-01 not responding — check 3.3V / D13 / D2"));
  return false;
}

void botzieEspStartWifi(bool apMode, const char* ssid, const char* pass) {
  if (!botzieEspInit()) return;
  char cmd[96];
  if (apMode) {
    botzieEspSendAT("AT+CWMODE=2", "OK", 2000);
    delay(200);
    if (pass && strlen(pass) >= 8) {
      snprintf(cmd, sizeof(cmd), "AT+CWSAP=\\"%s\\",\\"%s\\",1,4", ssid, pass);
    } else {
      snprintf(cmd, sizeof(cmd), "AT+CWSAP=\\"%s\\",\\"\\",1,0", ssid);
    }
    botzieEspSendAT(cmd, "OK", 4000);
    botzieWifiApMode = true;
  } else {
    botzieEspSendAT("AT+CWMODE=1", "OK", 2000);
    delay(200);
    snprintf(cmd, sizeof(cmd), "AT+CWJAP=\\"%s\\",\\"%s\\"", ssid, pass);
    bool joined = botzieEspSendAT(cmd, "WIFI GOT IP", 20000);
    if (!joined && strstr(botzieEspResp, "OK") == NULL) {
      Serial.println(F("[Botzie] ESP-01 join failed (SSID/password)"));
      return;
    }
    botzieWifiApMode = false;
  }
  botzieEspSendAT("AT+CIPMUX=1", "OK", 2000);
  botzieEspSendAT("AT+CIPSERVER=1,80", "OK", 2000);
  botzieWifiEnabled = true;
  Serial.print(F("[Botzie] ESP-01 WiFi "));
  Serial.println(apMode ? F("AP") : F("STA"));
  Serial.print(F("[Botzie] name/SSID: "));
  Serial.println(ssid);
  if (apMode) {
    Serial.println(F("[Botzie] Join hotspot, IP 192.168.4.1"));
  } else {
    botzieEspSendAT("AT+CIFSR", NULL, 2500);
    Serial.print(F("[Botzie] CIFSR "));
    Serial.println(botzieEspResp);
  }
}
`;
            Blockly.Arduino.setups_.botzie_wifi = `
botzieEspStartWifi(${mode === 'AP' ? 'true' : 'false'}, ${ssid}, ${password});
`;
            Blockly.Arduino.loops_['00_botzie_wireless'] = 'botzieProcessWireless();\n';
            return '';
        }

        Blockly.Arduino.includes_.botzie_wifi = '#include <WiFi.h>\n#include <WebServer.h>\n#include <DNSServer.h>';
        Blockly.Arduino.definitions_.botzie_webserver = 'WebServer botzieServer(80);\nDNSServer botzieDns;\nbool botzieDnsOn = false;';
        Blockly.Arduino.definitions_.botzie_wifi_handlers = `
void botzieSendCors() {
  botzieServer.sendHeader("Access-Control-Allow-Origin", "*");
  botzieServer.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  botzieServer.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void botzieSendPlain(int code, const String &msg) {
  botzieSendCors();
  botzieServer.send(code, "text/plain", msg);
}

void botzieLogHttp() {
  Serial.print("APP WIFI: ");
  Serial.print(botzieServer.method() == HTTP_POST ? "POST " : "GET ");
  Serial.print(botzieServer.uri());
  for (int i = 0; i < botzieServer.args(); i++) {
    Serial.print(i == 0 ? " " : " ");
    Serial.print(botzieServer.argName(i));
    Serial.print("=");
    Serial.print(botzieServer.arg(i));
  }
  Serial.println();
}

void botzieHandleHttpOptions() {
  botzieSendCors();
  botzieServer.send(204);
}

void botzieHandleHttpCmd() {
  botzieLogHttp();
  String body = botzieServer.hasArg("plain") ? botzieServer.arg("plain") : botzieServer.arg("cmd");
  body.trim();
  if (body.length() > 0) {
    botzieHandleCommand(body);
    botzieSendPlain(200, botzieLastReply.length() ? botzieLastReply : "OK");
  } else {
    botzieSendPlain(400, "ERR:EMPTY");
  }
}

void botzieHandleHttpConnect() {
  botzieLogHttp();
  botzieAllLedsOff();
  botzieTracePrefix();
  Serial.println("WiFi app connected");
  botzieSendPlain(200, "OK");
}

void botzieHandleHttpPing() {
  botzieLogHttp();
  botzieSendPlain(200, "OK");
}

void botzieHandleHttpSpeed() {
  botzieLogHttp();
  if (botzieServer.hasArg("level")) {
    int level = botzieServer.arg("level").toInt();
#if defined(BOTZIE_KIT_ROBOTICS)
    botzieSetSpeedFromLevel(constrain(level, 0, 5));
    botzieSendPlain(200, String("SPEED:") + String(botzieMotorSpeed));
    return;
#else
    int pct = constrain(level * 20, 0, 100);
    botzieSetSpeedPercent(pct);
#endif
  }
  botzieSendPlain(200, "OK");
}

String botzieHttpPathCommand() {
  String uri = botzieServer.uri();
  if (uri.length() > 0 && uri.charAt(0) == '/') uri = uri.substring(1);
  int qIdx = uri.indexOf('?');
  if (qIdx >= 0) uri = uri.substring(0, qIdx);
  uri.trim();
  return uri;
}

void botzieHandleHttpDrive() {
  botzieLogHttp();
  String uri = botzieHttpPathCommand();
  if (uri.length() == 0) {
    botzieSendPlain(404, "ERR:NOT_FOUND");
    return;
  }
#if defined(BOTZIE_KIT_ROBOTICS)
  String low = uri;
  low.toLowerCase();
  if (low == "cmd_b") {
    botzieWifiPaused = true;
    botzieWifiDriveCmd = "none";
    botzieApplyRoboticsMotion('n');
    botzieLastCmdMs = 0;
    botzieTelemCommand = "stop";
    botzieTelemDirection = "stop";
  } else if (low == "cmd_f") {
    if (botzieLastMovement.length() && botzieMotorSpeed > 0) {
      botzieNoteWifiDrive(botzieLastMovement);
    }
  } else if (low == "idle" || low == "stop" || low == "halt" || low == "brake") {
    botzieWifiDriveCmd = "none";
    botzieWifiPaused = false;
    botzieApplyRoboticsMotion('n');
    botzieLastCmdMs = 0;
    botzieTelemCommand = "stop";
    botzieTelemDirection = "stop";
  } else if (low == "rotatecw") botzieNoteWifiDrive("cw");
  else if (low == "rotateacw") botzieNoteWifiDrive("acw");
  else if (low == "forward" || low == "backward" || low == "left" || low == "right") botzieNoteWifiDrive(low);
  else botzieHandleCommand(uri);
  botzieSendPlain(200, botzieBuildTelemetryPacket());
  return;
#else
  botzieHandleCommand(uri);
  botzieSendPlain(200, botzieLastReply.length() ? botzieLastReply : "OK");
#endif
}

void botzieHandleHttpGeneric() {
  botzieLogHttp();
  String uri = botzieHttpPathCommand();
  if (uri.length() == 0) {
    botzieSendPlain(404, "ERR:NOT_FOUND");
    return;
  }
  botzieHandleCommand(uri);
  botzieSendPlain(200, botzieLastReply.length() ? botzieLastReply : "OK");
}

void botzieHandleHttpLed() {
  botzieLogHttp();
  if (!botzieServer.hasArg("pin")) {
    botzieSendPlain(400, "Missing pin");
    return;
  }
  String pin = botzieServer.arg("pin");
  if (botzieServer.hasArg("brightness")) {
    botzieHandleLedCommand(String("led:") + pin + ":brightness:" + botzieServer.arg("brightness"));
  }
  if (botzieServer.hasArg("state")) {
    botzieHandleLedCommand(String("led:") + pin + ":" + botzieServer.arg("state"));
  }
  botzieSendPlain(200, botzieLastReply.length() ? botzieLastReply : "OK");
}

void botzieHandleHttpServo() {
  botzieLogHttp();
  int pin = -1;
  if (botzieServer.hasArg("pin")) {
    pin = botzieParsePinNumber(botzieServer.arg("pin"));
  } else if (botzieServer.hasArg("index")) {
    int maybePin = botzieServer.arg("index").toInt();
    pin = maybePin >= 2 ? maybePin : -1;
  } else if (botzieServer.hasArg("servo")) {
    int maybePin = botzieServer.arg("servo").toInt();
    pin = maybePin >= 2 ? maybePin : -1;
  }
  if (pin < 0) {
    botzieSendPlain(400, "Missing pin");
    return;
  }
  int index = botzieServoIndexForPin(pin);
  if (index < 0) {
    botzieSendPlain(400, "Invalid pin");
    return;
  }
  if (botzieServer.hasArg("range")) {
    botzieSetServoRange((uint8_t)index, botzieServer.arg("range").toInt());
  }
  int angle = botzieServer.hasArg("angle") ? botzieServer.arg("angle").toInt() : 90;
  botzieMoveServo((uint8_t)index, angle);
  botzieSendPlain(200, botzieLastReply.length() ? botzieLastReply : "OK");
}

void botzieHandleHttpRadar() {
  botzieLogHttp();
  if (botzieServer.hasArg("trig")) {
    botzieHandleRadarCommand(String("radar:trig:") + botzieServer.arg("trig"));
  }
  if (botzieServer.hasArg("echo")) {
    botzieHandleRadarCommand(String("radar:echo:") + botzieServer.arg("echo"));
  }
  if (botzieServer.hasArg("servo")) {
    botzieHandleRadarCommand(String("radar:servo:") + botzieServer.arg("servo"));
  }
  if (botzieServer.hasArg("state")) {
    botzieHandleRadarCommand(String("radar:") + botzieServer.arg("state"));
  }
  if (botzieServer.hasArg("pin")) {
    botzieHandleRadarCommand(String("radar:servo:") + botzieServer.arg("pin"));
  }
  if (botzieServer.hasArg("beep")) {
    botzieHandleRadarCommand(String("radar:beep:") + botzieServer.arg("beep"));
  }
  if (!botzieServer.hasArg("state") && !botzieServer.hasArg("pin") && !botzieServer.hasArg("beep") &&
      !botzieServer.hasArg("trig") && !botzieServer.hasArg("echo") && !botzieServer.hasArg("servo")) {
    botzieHandleRadarCommand("radar:on");
  }
  botzieSendPlain(200, botzieLastReply.length() ? botzieLastReply : "OK");
}

void botzieRegisterCarControlRoutes() {
  botzieServer.on("/cmd", HTTP_POST, botzieHandleHttpCmd);
  botzieServer.on("/command", HTTP_OPTIONS, botzieHandleHttpOptions);
  botzieServer.on("/command", HTTP_GET, []() {
    botzieLogHttp();
    if (!botzieServer.hasArg("cmd")) {
      botzieSendPlain(400, "Missing cmd");
      return;
    }
    botzieHandleCommand(botzieServer.arg("cmd"));
    botzieSendPlain(200, botzieLastReply.length() ? botzieLastReply : "OK");
  });
  botzieServer.on("/command", HTTP_POST, botzieHandleHttpCmd);
  botzieServer.on("/connect", HTTP_GET, botzieHandleHttpConnect);
  botzieServer.on("/ping", HTTP_GET, botzieHandleHttpPing);
  botzieServer.on("/speed", HTTP_GET, botzieHandleHttpSpeed);
  botzieServer.on("/led", HTTP_OPTIONS, botzieHandleHttpOptions);
  botzieServer.on("/led", HTTP_GET, botzieHandleHttpLed);
  botzieServer.on("/servo", HTTP_OPTIONS, botzieHandleHttpOptions);
  botzieServer.on("/servo", HTTP_GET, botzieHandleHttpServo);
  botzieServer.on("/radar", HTTP_OPTIONS, botzieHandleHttpOptions);
  botzieServer.on("/radar", HTTP_GET, botzieHandleHttpRadar);
  botzieServer.on("/cmd_f", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/cmd_b", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/left", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/right", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/forward", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/backward", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/stop", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/idle", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/halt", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/brake", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/rotateCW", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/rotateACW", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/rotatecw", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/rotateacw", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.on("/resume", HTTP_GET, botzieHandleHttpDrive);
  botzieServer.onNotFound(botzieHandleHttpGeneric);
}
`;
        if (mode === 'AP') {
            const roboticsAp = botzieIsIntermediateKit(Blockly);
            Blockly.Arduino.setups_.botzie_wifi = roboticsAp ? `
strncpy(botzieBleName, ${ssid}, sizeof(botzieBleName) - 1);
botzieBleName[sizeof(botzieBleName) - 1] = '\\0';
WiFi.persistent(false);
WiFi.mode(WIFI_AP);
WiFi.setSleep(false);
WiFi.softAPConfig(IPAddress(192, 168, 4, 1), IPAddress(192, 168, 4, 1), IPAddress(255, 255, 255, 0));
WiFi.softAP(botzieBleName, ${password}, 1, 0, 4);
delay(300);
botzieDns.start(53, "*", IPAddress(192, 168, 4, 1));
botzieDnsOn = true;
botzieMotorSpeed = 0;
botzieLeftSpeed = 0;
botzieRightSpeed = 0;
botzieTelemTickMs = millis();
botzieRegisterCarControlRoutes();
botzieServer.begin();
botzieWifiEnabled = true;
botzieWifiApMode = true;
botzieTracePrefix();
Serial.println("AP started (AI & Robotics)");
Serial.println("CarControl routes: /connect /speed /cmd_f /cmd_b /idle");
Serial.print("Botzie AP SSID: ");
Serial.println(WiFi.softAPSSID());
Serial.print("Botzie AP IP: ");
Serial.println(WiFi.softAPIP());
Serial.println("Phone: stay on this WiFi without internet");
` : `
strncpy(botzieBleName, ${ssid}, sizeof(botzieBleName) - 1);
botzieBleName[sizeof(botzieBleName) - 1] = '\\0';
WiFi.persistent(false);
WiFi.mode(WIFI_AP);
WiFi.setSleep(false);
WiFi.softAPConfig(IPAddress(192, 168, 4, 1), IPAddress(192, 168, 4, 1), IPAddress(255, 255, 255, 0));
if (strlen(${password}) >= 8) {
  WiFi.softAP(botzieBleName, ${password}, 1, 0, 4);
} else {
  WiFi.softAP(botzieBleName, NULL, 1, 0, 4);
}
botzieRegisterCarControlRoutes();
botzieServer.begin();
botzieWifiEnabled = true;
botzieWifiApMode = true;
botzieTracePrefix();
Serial.println("AP started (no internet is normal)");
Serial.println("CarControl routes: /connect /speed /cmd_f /cmd_b /idle");
Serial.print("Botzie AP SSID: ");
Serial.println(WiFi.softAPSSID());
Serial.print("Botzie AP IP: ");
Serial.println(WiFi.softAPIP());
Serial.println("Phone: stay on this WiFi without internet");
`;
        } else {
            Blockly.Arduino.setups_.botzie_wifi = `
strncpy(botzieBleName, ${ssid}, sizeof(botzieBleName) - 1);
botzieBleName[sizeof(botzieBleName) - 1] = '\\0';
WiFi.persistent(false);
WiFi.mode(WIFI_STA);
WiFi.setSleep(false);
WiFi.begin(${ssid}, ${password});
unsigned long botzieWifiStart = millis();
while (WiFi.status() != WL_CONNECTED && millis() - botzieWifiStart < 20000) {
  delay(250);
}
if (WiFi.status() != WL_CONNECTED) {
  botzieTracePrefix();
  Serial.println("WiFi join failed (check SSID/password)");
} else {
  unsigned long botzieDhcpStart = millis();
  while (WiFi.localIP()[0] == 0 && millis() - botzieDhcpStart < 15000) {
    delay(250);
  }
  botzieRegisterCarControlRoutes();
  botzieServer.begin();
  botzieWifiEnabled = true;
  botzieWifiApMode = false;
  botzieTracePrefix();
  Serial.println("WiFi connected");
  Serial.println("CarControl routes: /connect /speed /cmd_f /cmd_b /idle");
  Serial.print("Botzie WiFi IP: ");
  Serial.println(WiFi.localIP());
  if (WiFi.localIP()[0] == 0) {
    botzieTracePrefix();
    Serial.println("DHCP failed — no IP from router");
  } else {
    botzieTracePrefix();
    Serial.print("Use this IP in app: ");
    Serial.println(WiFi.localIP());
  }
}
`;
        }
        Blockly.Arduino.loops_['00_botzie_wireless'] = (Blockly.Arduino.loops_['00_botzie_wireless'] || 'botzieProcessWireless();\n') +
            'if (botzieWifiEnabled) botzieServer.handleClient();\n' +
            'if (botzieDnsOn) botzieDns.processNextRequest();\n';
        return '';
    };

    Blockly.Arduino.botzie_disconnect = function () {
        ensureBotzieBase(Blockly);
        let code = 'botzieDisconnect();\n';
        if (isEsp32Kit(Blockly) && Blockly.Arduino.setups_.botzie_wifi) {
            code += `if (botzieWifiEnabled) {
  botzieServer.stop();
  if (botzieWifiApMode) {
    WiFi.softAPdisconnect(true);
    botzieWifiApMode = false;
  } else {
    WiFi.disconnect(true);
  }
  botzieWifiEnabled = false;
}
`;
        }
        return code;
    };

    const moveBlocks = {
        botzie_move_forward: 'botzieMoveForward();\n',
        botzie_move_backward: 'botzieMoveBackward();\n',
        botzie_turn_left: 'botzieTurnLeft();\n',
        botzie_turn_right: 'botzieTurnRight();\n',
        botzie_stop: 'botzieStopMotors();\n',
        botzie_rotate_cw: 'botzieRotateCW();\n',
        botzie_rotate_ccw: 'botzieRotateCCW();\n'
    };
    Object.keys(moveBlocks).forEach(type => {
        Blockly.Arduino[type] = function () {
            ensureBotzieBase(Blockly);
            return moveBlocks[type];
        };
    });

    Blockly.Arduino.botzie_move_direction_speed = function (block) {
        ensureBotzieBase(Blockly);
        const dir = block.getFieldValue('DIR');
        const speed = Blockly.Arduino.valueToCode(block, 'SPEED', order) || '200';
        const map = {
            FORWARD: 'botzieMoveForward();\n',
            BACKWARD: 'botzieMoveBackward();\n',
            LEFT: 'botzieTurnLeft();\n',
            RIGHT: 'botzieTurnRight();\n'
        };
        return `botzieLeftSpeed = ${speed};\nbotzieRightSpeed = ${speed};\n${map[dir] || ''}`;
    };

    Blockly.Arduino.botzie_set_lr_speed = function (block) {
        ensureBotzieBase(Blockly);
        const left = Blockly.Arduino.valueToCode(block, 'LEFT', order) || '200';
        const right = Blockly.Arduino.valueToCode(block, 'RIGHT', order) || '200';
        return `botzieSetLeftRightSpeed(${left}, ${right});\n`;
    };

    Blockly.Arduino.botzie_set_speed_percent = function (block) {
        ensureBotzieBase(Blockly);
        const pct = Blockly.Arduino.valueToCode(block, 'PCT', order) || '70';
        return `botzieSetSpeedPercent(${pct});\n`;
    };

    Blockly.Arduino.botzie_increase_speed = function (block) {
        ensureBotzieBase(Blockly);
        const amt = Blockly.Arduino.valueToCode(block, 'AMT', order) || '10';
        return `botzieMotorSpeed = min(botzieMotorSpeed + ${amt}, 255);\nbotzieLeftSpeed = botzieMotorSpeed;\nbotzieRightSpeed = botzieMotorSpeed;\n`;
    };

    Blockly.Arduino.botzie_decrease_speed = function (block) {
        ensureBotzieBase(Blockly);
        const amt = Blockly.Arduino.valueToCode(block, 'AMT', order) || '10';
        return `botzieMotorSpeed = max(botzieMotorSpeed - ${amt}, 0);\nbotzieLeftSpeed = botzieMotorSpeed;\nbotzieRightSpeed = botzieMotorSpeed;\n`;
    };

    Blockly.Arduino.botzie_speed_value = function () {
        ensureBotzieBase(Blockly);
        return ['botzieMotorSpeed', order];
    };

    Blockly.Arduino.botzie_distance_cm = function () {
        ensureBotzieBase(Blockly);
        return ['botzieReadDistanceCm()', order];
    };

    Blockly.Arduino.botzie_obstacle_detected = function (block) {
        ensureBotzieBase(Blockly);
        const cm = Blockly.Arduino.valueToCode(block, 'CM', order) || '20';
        return [`botzieObstacleWithinCm(${cm})`, Blockly.Arduino.ORDER_UNARY_POSTFIX || order];
    };

    Blockly.Arduino.botzie_line_sensor_left = function () {
        ensureBotzieBase(Blockly);
        return ['botzieReadLineLeft()', order];
    };

    Blockly.Arduino.botzie_line_sensor_right = function () {
        ensureBotzieBase(Blockly);
        return ['botzieReadLineRight()', order];
    };

    Blockly.Arduino.botzie_send_terminal = function (block) {
        ensureBotzieBase(Blockly);
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', order) || '""';
        return `botzieLog(${text});\n`;
    };

    Blockly.Arduino.botzie_send_graph = function (block) {
        ensureBotzieBase(Blockly);
        const label = Blockly.Arduino.valueToCode(block, 'LABEL', order) || '"distance"';
        const value = Blockly.Arduino.valueToCode(block, 'VALUE', order) || '0';
        return `botzieGraph(String(${label}), (float)(${value}));\n`;
    };

    Blockly.Arduino.botzie_action_command = function (block) {
        ensureBotzieBase(Blockly);
        const action = block.getFieldValue('ACTION') || 'forward';
        const actId = {
            forward: 1,
            backward: 2,
            left: 3,
            right: 4,
            stop: 5,
            rotateCW: 6,
            rotateCCW: 7,
            resume: 8
        }[action] || 1;
        const cmd = Blockly.Arduino.valueToCode(block, 'CMD', order) || `"${action}"`;
        Blockly.Arduino.setups_.botzie_cmd_maps =
            (Blockly.Arduino.setups_.botzie_cmd_maps || '') +
            `botzieRegisterCommand(${cmd}, ${actId});\n`;
        return '';
    };

    Blockly.Arduino.botzie_command_is = function (block) {
        ensureBotzieBase(Blockly);
        const cmd = block.getFieldValue('CMD');
        let branch = Blockly.Arduino.statementToCode(block, 'STACK');
        branch = Blockly.Arduino.addLoopTrap(branch, block.id);
        Blockly.Arduino.loops_[`botzie_cmd_${cmd}_${block.id}`] =
            `if (botzieLastCommand == "${cmd}") {\n${branch}}\n`;
        return '';
    };

    Blockly.Arduino.botzie_received_command = function () {
        ensureBotzieBase(Blockly);
        return ['botzieLastCommand', order];
    };

    Blockly.Arduino.botzie_beep = function (block) {
        ensureBotzieBase(Blockly);
        const secs = Blockly.Arduino.valueToCode(block, 'SECS', order) || '1';
        return `digitalWrite(BOTZIE_BUZZER_PIN, HIGH);\ndelay((unsigned long)((${secs}) * 1000.0));\ndigitalWrite(BOTZIE_BUZZER_PIN, LOW);\n`;
    };

    return Blockly;
}

module.exports = addGenerator;
