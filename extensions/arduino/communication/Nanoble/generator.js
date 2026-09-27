function addGenerator(Blockly) {

    // ============================================================
    // BLE CONNECTION CORE
    // ============================================================
    Blockly.Arduino.nano_ble_connection = function (block) {

        const rxPin = Blockly.Arduino.valueToCode(block, 'RX', Blockly.Arduino.ORDER_ATOMIC) || '10';
        const txPin = Blockly.Arduino.valueToCode(block, 'TX', Blockly.Arduino.ORDER_ATOMIC) || '11';
        const baud  = Blockly.Arduino.valueToCode(block, 'BAUD', Blockly.Arduino.ORDER_ATOMIC) || '9600';

        // ================= INCLUDES =================
        Blockly.Arduino.includes_['software_serial'] = `#include <SoftwareSerial.h>`;
        Blockly.Arduino.includes_['servo'] = `#include <Servo.h>`;
        Blockly.Arduino.includes_['dht'] = `#include <DHT.h>`;
        Blockly.Arduino.includes_['tm1637'] = `#include <TM1637Display.h>`;
        Blockly.Arduino.includes_['neopixel'] = `#include <Adafruit_NeoPixel.h>`;
        Blockly.Arduino.includes_['wire'] = `#include <Wire.h>`;
        Blockly.Arduino.includes_['lcd'] = `#include <LiquidCrystal_I2C.h>`;
        Blockly.Arduino.includes_['tcs34725'] = `#include <Adafruit_TCS34725.h>`;
        Blockly.Arduino.includes_['math'] = `#include <math.h>`;

        // ================= GLOBAL DEFINITIONS =================
        Blockly.Arduino.definitions_['ble_serial'] =
`SoftwareSerial BLESerial(${rxPin}, ${txPin});`;

        Blockly.Arduino.definitions_['ble_buffer'] =
`String inputBuffer = "";
unsigned long lastReadTime = 0;
const unsigned long flushTimeout = 10;`;

        Blockly.Arduino.definitions_['ble_globals'] =
`Servo servoObj;
DHT* dht1 = NULL;
TM1637Display* display4 = NULL;
Adafruit_NeoPixel* ledMatrix = NULL;
LiquidCrystal_I2C* lcdI2c = NULL;
Adafruit_TCS34725* colourSensor = NULL;
long duration;
int distanceCm;

int parseArduinoPin(const char* pinText) {
  if (pinText == NULL || pinText[0] == 0) return -1;
  if (pinText[0] == 'A' || pinText[0] == 'a') {
    int analogIndex = atoi(pinText + 1);
    return A0 + analogIndex;
  }
  if (pinText[0] == 'D' || pinText[0] == 'd') return atoi(pinText + 1);
  return atoi(pinText);
}

// ---------- TM1637 advanced state ----------
uint8_t tmSegments[4] = {0, 0, 0, 0};
uint8_t tmDots = 0;
int tmLastNumber = 0;
int tmLastLength = 4;
int tmLastPosition = 0;
bool tmLastLeadingZeros = false;
bool tmHasLastNumber = false;

uint8_t tmSegmentForChar(char c) {
  if (c >= '0' && c <= '9') return display4->encodeDigit(c - '0');
  switch ((char)toupper((int)c)) {
    case 'A': return 0x77; case 'B': return 0x7C; case 'C': return 0x39;
    case 'D': return 0x5E; case 'E': return 0x79; case 'F': return 0x71;
    case 'G': return 0x3D; case 'H': return 0x76; case 'I': return 0x30;
    case 'J': return 0x1E; case 'L': return 0x38; case 'N': return 0x54;
    case 'O': return 0x3F; case 'P': return 0x73; case 'R': return 0x50;
    case 'S': return 0x6D; case 'T': return 0x78; case 'U': return 0x3E;
    case '-': return 0x40; case '_': return 0x08;
  }
  return 0;
}

uint8_t tmParseSegment(String expression) {
  expression.trim();
  if (expression.indexOf("SEG_") >= 0) {
    expression.replace(" ", "");
    String tokens = "|" + expression + "|";
    uint8_t result = 0;
    if (tokens.indexOf("|SEG_A|") >= 0) result |= 0x01;
    if (tokens.indexOf("|SEG_B|") >= 0) result |= 0x02;
    if (tokens.indexOf("|SEG_C|") >= 0) result |= 0x04;
    if (tokens.indexOf("|SEG_D|") >= 0) result |= 0x08;
    if (tokens.indexOf("|SEG_E|") >= 0) result |= 0x10;
    if (tokens.indexOf("|SEG_F|") >= 0) result |= 0x20;
    if (tokens.indexOf("|SEG_G|") >= 0) result |= 0x40;
    if (tokens.indexOf("|SEG_DP|") >= 0) result |= 0x80;
    return result;
  }
  return (uint8_t)strtol(expression.c_str(), NULL, 0);
}

// ---------- RGB LEDs (one WS2812/NeoPixel per pin) ----------
#define RGBLED_MAX 4
struct RgbLedEntry {
  int pin;
  uint8_t r, g, b;
  Adafruit_NeoPixel* strip;
};
RgbLedEntry rgbLeds[RGBLED_MAX];
int rgbLedCount = 0;

RgbLedEntry* rgbLedGet(int pin, bool createIfMissing) {
  for (int i = 0; i < rgbLedCount; i++) {
    if (rgbLeds[i].pin == pin) return &rgbLeds[i];
  }
  if (!createIfMissing || rgbLedCount >= RGBLED_MAX) return NULL;
  RgbLedEntry* item = &rgbLeds[rgbLedCount++];
  item->pin = pin;
  item->r = item->g = item->b = 0;
  item->strip = new Adafruit_NeoPixel(1, pin, NEO_GRB + NEO_KHZ800);
  item->strip->begin();
  item->strip->show();
  return item;
}

void rgbLedApply(RgbLedEntry* item) {
  item->strip->setPixelColor(0, item->strip->Color(item->r, item->g, item->b));
  item->strip->show();
}

// ---------- Current and voltage sensors ----------
int currentPin = -1;
float currentSensitivity = 0.185f;
float currentZeroPoint = 2.5f;
int voltagePin = -1;
float voltageReference = 5.0f;

float readCurrentAmpsBle() {
  long sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(currentPin);
    delay(2);
  }
  float voltage = (sum / 100.0f) * (5.0f / 1023.0f);
  return (voltage - currentZeroPoint) / currentSensitivity;
}

float readVoltageBle() {
  long sum = 0;
  for (int i = 0; i < 8; i++) {
    sum += analogRead(voltagePin);
    delay(2);
  }
  return (sum / 8.0f) * (voltageReference / 1023.0f);
}

// ---------- Rotary encoder (loop polling works on all Nano pins) ----------
int encClkPin = -1, encDtPin = -1, encSwPin = -1;
long encCount = 0;
int8_t encDirection = 0;
uint8_t encPreviousState = 0;
int8_t encAccumulator = 0;
unsigned long encLastStepUs = 0;
float encSpeed = 0;
bool encButtonListening = false;
bool encButtonPrevious = false;

void encoderPoll() {
  if (encClkPin < 0 || encDtPin < 0) return;
  uint8_t state = (digitalRead(encClkPin) << 1) | digitalRead(encDtPin);
  uint8_t index = (encPreviousState << 2) | state;
  static const int8_t transitions[16] = {
    0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0
  };
  encAccumulator += transitions[index];
  encPreviousState = state;
  if (encAccumulator >= 4 || encAccumulator <= -4) {
    int8_t direction = encAccumulator > 0 ? 1 : -1;
    unsigned long now = micros();
    if (encLastStepUs != 0 && now != encLastStepUs) {
      encSpeed = direction * (1000000.0f / (now - encLastStepUs));
    }
    encLastStepUs = now;
    encCount += direction;
    encDirection = direction;
    encAccumulator = 0;
  }
}

bool encoderButtonPressed() {
  return encSwPin >= 0 && digitalRead(encSwPin) == LOW;
}

// ---------- PS2 joystick (up to 8) ----------
#define JOYSTICK_MAX 8
int joystickXPin[JOYSTICK_MAX] = {-1,-1,-1,-1,-1,-1,-1,-1};
int joystickYPin[JOYSTICK_MAX] = {-1,-1,-1,-1,-1,-1,-1,-1};
int joystickSwPin[JOYSTICK_MAX] = {-1,-1,-1,-1,-1,-1,-1,-1};
int joystickCenterX[JOYSTICK_MAX] = {511,511,511,511,511,511,511,511};
int joystickCenterY[JOYSTICK_MAX] = {511,511,511,511,511,511,511,511};
int joystickDeadzone[JOYSTICK_MAX] = {40,40,40,40,40,40,40,40};
int joystickLowThreshold[JOYSTICK_MAX] = {200,200,200,200,200,200,200,200};
int joystickHighThreshold[JOYSTICK_MAX] = {800,800,800,800,800,800,800,800};
bool joystickListening[JOYSTICK_MAX] = {false,false,false,false,false,false,false,false};
bool joystickPreviousPressed[JOYSTICK_MAX] = {false,false,false,false,false,false,false,false};

bool joystickValid(int no) {
  return no >= 0 && no < JOYSTICK_MAX &&
    joystickXPin[no] >= 0 && joystickYPin[no] >= 0 && joystickSwPin[no] >= 0;
}

bool joystickButtonPressed(int no) {
  return joystickValid(no) && digitalRead(joystickSwPin[no]) == LOW;
}

String joystickDirection(int no) {
  int dx = analogRead(joystickXPin[no]) - joystickCenterX[no];
  int dy = analogRead(joystickYPin[no]) - joystickCenterY[no];
  int ax = abs(dx), ay = abs(dy);
  if (ax <= joystickDeadzone[no] && ay <= joystickDeadzone[no]) return "CENTER";
  if (ay >= ax && ay >= joystickLowThreshold[no]) return dy < 0 ? "UP" : "DOWN";
  if (ax > ay && ax >= joystickLowThreshold[no]) return dx > 0 ? "RIGHT" : "LEFT";
  return "CENTER";
}

float joystickAngle(int no) {
  int dx = analogRead(joystickXPin[no]) - joystickCenterX[no];
  int dy = analogRead(joystickYPin[no]) - joystickCenterY[no];
  if (abs(dx) <= joystickDeadzone[no] && abs(dy) <= joystickDeadzone[no]) return -1;
  float angle = atan2((float)dy, (float)dx) * 180.0f / PI;
  return angle < 0 ? angle + 360.0f : angle;
}

float joystickMagnitude(int no) {
  float dx = analogRead(joystickXPin[no]) - joystickCenterX[no];
  float dy = analogRead(joystickYPin[no]) - joystickCenterY[no];
  return sqrt(dx * dx + dy * dy);
}

// ---------- I2C LCD ----------
bool lcdReady = false;
bool lcdInitBle(int address, int columns, int rows) {
  if (lcdI2c != NULL) delete lcdI2c;
  Wire.begin();
  lcdI2c = new LiquidCrystal_I2C(address, columns, rows);
  lcdI2c->init();
  lcdI2c->backlight();
  lcdI2c->clear();
  lcdReady = true;
  return true;
}

// ---------- TCS34725 colour sensor ----------
uint16_t colourR = 0, colourG = 0, colourB = 0, colourClear = 0;
void colourUpdate() {
  if (colourSensor != NULL) {
    colourSensor->getRawData(&colourR, &colourG, &colourB, &colourClear);
  }
}

String colourName() {
  colourUpdate();
  if (colourClear < 50) return "BLACK";
  float r = (float)colourR / colourClear * 255.0f;
  float g = (float)colourG / colourClear * 255.0f;
  float b = (float)colourB / colourClear * 255.0f;
  if (r > 180 && g > 180 && b > 180) return "WHITE";
  if (r > 120 && g > 100 && b < 100 && r - b > 40 && g - b > 30) return "YELLOW";
  if (r >= g && r >= b) return "RED";
  if (g >= r && g >= b) return "GREEN";
  return "BLUE";
}

// ---------- 5x7 NeoPixel LED matrix ----------
const uint8_t matrixCharacters[38][5] PROGMEM = {
  {0x3E,0x51,0x49,0x45,0x3E},{0x00,0x42,0x7F,0x40,0x00},
  {0x62,0x51,0x49,0x49,0x46},{0x22,0x41,0x49,0x49,0x36},
  {0x18,0x14,0x12,0x7F,0x10},{0x2F,0x49,0x49,0x49,0x31},
  {0x3E,0x49,0x49,0x49,0x30},{0x01,0x71,0x09,0x05,0x03},
  {0x36,0x49,0x49,0x49,0x36},{0x06,0x49,0x49,0x49,0x3E},
  {0x7E,0x09,0x09,0x09,0x7E},{0x7F,0x49,0x49,0x49,0x36},
  {0x3E,0x41,0x41,0x41,0x22},{0x7F,0x41,0x41,0x22,0x1C},
  {0x7F,0x49,0x49,0x49,0x41},{0x7F,0x09,0x09,0x09,0x01},
  {0x3E,0x41,0x49,0x49,0x7A},{0x7F,0x08,0x08,0x08,0x7F},
  {0x00,0x41,0x7F,0x41,0x00},{0x20,0x40,0x41,0x3F,0x01},
  {0x7F,0x08,0x14,0x22,0x41},{0x7F,0x40,0x40,0x40,0x40},
  {0x7F,0x02,0x0C,0x02,0x7F},{0x7F,0x04,0x08,0x10,0x7F},
  {0x3E,0x41,0x41,0x41,0x3E},{0x7F,0x09,0x09,0x09,0x06},
  {0x3E,0x41,0x51,0x21,0x5E},{0x7F,0x09,0x19,0x29,0x46},
  {0x46,0x49,0x49,0x49,0x31},{0x01,0x01,0x7F,0x01,0x01},
  {0x3F,0x40,0x40,0x40,0x3F},{0x1F,0x20,0x40,0x20,0x1F},
  {0x7F,0x20,0x18,0x20,0x7F},{0x63,0x14,0x08,0x14,0x63},
  {0x07,0x08,0x70,0x08,0x07},{0x61,0x51,0x49,0x45,0x43},
  {0x1C,0x3E,0x7C,0x3E,0x1C},{0x20,0x4C,0x40,0x4C,0x20}
};

void matrixShowCharacter(char character, uint32_t colour) {
  if (ledMatrix == NULL) return;
  int characterIndex = -1;
  if (character >= '0' && character <= '9') characterIndex = character - '0';
  else if (character >= 'A' && character <= 'Z') characterIndex = 10 + character - 'A';
  else if (character == '*') characterIndex = 36;
  else if (character == ':') characterIndex = 37;
  if (characterIndex < 0) return;
  ledMatrix->clear();
  for (int x = 0; x < 5; x++) {
    uint8_t column = pgm_read_byte(&matrixCharacters[characterIndex][x]);
    for (int y = 0; y < 7; y++) {
      if (column & (1 << y)) ledMatrix->setPixelColor(y * 5 + x, colour);
    }
  }
  ledMatrix->show();
}

// ---------- Two-pin fan module ----------
int fanPin1 = -1, fanPin2 = -1;`;

        // ================= SETUP =================
        Blockly.Arduino.setups_['ble_setup'] =
`Serial.begin(${baud});
BLESerial.begin(${baud});
Serial.println("Bluetooth Ready");`;

        // ================= LOOP =================
        Blockly.Arduino.loops_['ble_loop'] =
`while (BLESerial.available()) {
  char c = BLESerial.read();
  if (c == '\\n' || c == '\\r') {
    if (inputBuffer.length() > 0) {
      handleCommand(inputBuffer);
      inputBuffer = "";
    }
  } else {
    inputBuffer += c;
    lastReadTime = millis();
  }
}

if (inputBuffer.length() > 0 && millis() - lastReadTime > flushTimeout) {
  handleCommand(inputBuffer);
  inputBuffer = "";
}
encoderPoll();`;

        // ================= COMMAND HANDLER =================
        Blockly.Arduino.definitions_['ble_handler'] = `

void sendResponse(const String &msg) {
  BLESerial.println(msg);
  Serial.println(msg);
}

void handleCommand(String rxData) {

  rxData.trim();
  if (rxData.length() == 0) return;

  Serial.print("CMD: ");
  Serial.println(rxData);

  int pin, value, model, num, bright, trig, echo, dio, clk;
  char mode[12], state[12];

  // ---------- DIGITAL WRITE ----------
  if (sscanf(rxData.c_str(), "%d%s", &pin, state) == 2) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, strcmp(state, "HIGH") == 0 ? HIGH : LOW);
    sendResponse("OK");
    return;
  }

  // ---------- PIN MODE ----------
  if (rxData.startsWith("pinMode")) {
    if (sscanf(rxData.c_str(), "pinMode %d %s", &pin, mode) == 2) {
      if (strcmp(mode, "OUTPUT") == 0) pinMode(pin, OUTPUT);
      else if (strcmp(mode, "INPUT_PULLUP") == 0) pinMode(pin, INPUT_PULLUP);
      else pinMode(pin, INPUT);
      sendResponse("OK");
    }
    return;
  }

  // ---------- PWM ----------
  if (rxData.startsWith("PWM")) {
    if (sscanf(rxData.c_str(), "PWM %d %d", &pin, &value) == 2) {
      analogWrite(pin, value);
      sendResponse("OK");
    }
    return;
  }

  // ---------- SERVO ----------
  if (rxData.startsWith("SERVO")) {
    if (sscanf(rxData.c_str(), "SERVO %d %d", &pin, &value) == 2) {
      servoObj.attach(pin);
      servoObj.write(value);
      sendResponse("OK");
    }
    return;
  }

  // ---------- DIGITAL READ ----------
  if (rxData.startsWith("digitalRead")) {
    if (sscanf(rxData.c_str(), "digitalRead %d", &pin) == 1) {
      sendResponse(String(digitalRead(pin)));
    }
    return;
  }

  // ---------- ANALOG READ ----------
  if (rxData.startsWith("analogRead")) {
    if (sscanf(rxData.c_str(), "analogRead %d", &pin) == 1) {
      sendResponse(String(analogRead(pin)));
    }
    return;
  }

  // ---------- DHT ----------
  if (rxData.startsWith("DHT_INIT")) {
    if (sscanf(rxData.c_str(), "DHT_INIT %d %d", &pin, &model) == 2) {
      if (dht1 != NULL) delete dht1;
      dht1 = new DHT(pin, model);
      dht1->begin();
      sendResponse("OK");
    }
    return;
  }

  if (rxData.startsWith("DHT_TEMP")) {
    if (dht1 == NULL) { sendResponse("ERR:DHT_NOT_INIT"); return; }
    sendResponse(String(dht1->readTemperature()));
    return;
  }

  if (rxData.startsWith("DHT_HUM")) {
    if (dht1 == NULL) { sendResponse("ERR:DHT_NOT_INIT"); return; }
    sendResponse(String(dht1->readHumidity()));
    return;
  }

  // ---------- ULTRASONIC ----------
  if (rxData.startsWith("ULTRA")) {
    if (sscanf(rxData.c_str(), "ULTRA %d %d", &trig, &echo) == 2) {

      pinMode(trig, OUTPUT);
      pinMode(echo, INPUT);

      digitalWrite(trig, LOW);
      delayMicroseconds(2);
      digitalWrite(trig, HIGH);
      delayMicroseconds(10);
      digitalWrite(trig, LOW);

      duration = pulseIn(echo, HIGH, 30000);

      if (duration == 0) {
        sendResponse("ERR:TIMEOUT");
      } else {
        distanceCm = duration * 0.034 / 2;
        sendResponse(String(distanceCm));
      }
    }
    return;
  }

  // ---------- TM1637 ----------
  if (rxData.startsWith("TM1637_INIT")) {
    if (sscanf(rxData.c_str(), "TM1637_INIT %d %d", &clk, &dio) == 2) {
      if (display4 != NULL) delete display4;
      display4 = new TM1637Display(clk, dio);
      display4->setBrightness(7);
      display4->clear();
      memset(tmSegments, 0, sizeof(tmSegments));
      tmDots = 0;
      tmHasLastNumber = false;
      sendResponse("OK");
    }
    return;
  }

  if (rxData.startsWith("TM1637_NUMBER_DOTS")) {
    int number, length, position, dots, leadingZeros;
    if (sscanf(rxData.c_str(), "TM1637_NUMBER_DOTS %d %d %d %i %d",
        &number, &length, &position, &dots, &leadingZeros) == 5 && display4 != NULL) {
      length = constrain(length, 1, 4);
      position = constrain(position, 0, 3);
      if (position + length > 4) length = 4 - position;
      tmDots = (uint8_t)dots;
      display4->showNumberDecEx(number, tmDots, leadingZeros != 0, length, position);
      tmLastNumber = number;
      tmLastLength = length;
      tmLastPosition = position;
      tmLastLeadingZeros = leadingZeros != 0;
      tmHasLastNumber = true;
      sendResponse("OK");
    } else sendResponse("ERR:DISPLAY_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TM1637_NUMBER_EX")) {
    int number, length, position, leadingZeros;
    if (sscanf(rxData.c_str(), "TM1637_NUMBER_EX %d %d %d %d",
        &number, &length, &position, &leadingZeros) == 4 && display4 != NULL) {
      length = constrain(length, 1, 4);
      position = constrain(position, 0, 3);
      if (position + length > 4) length = 4 - position;
      display4->showNumberDecEx(number, tmDots, leadingZeros != 0, length, position);
      tmLastNumber = number;
      tmLastLength = length;
      tmLastPosition = position;
      tmLastLeadingZeros = leadingZeros != 0;
      tmHasLastNumber = true;
      sendResponse("OK");
    } else sendResponse("ERR:DISPLAY_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TM1637_NUMBER")) {
    int number;
    if (sscanf(rxData.c_str(), "TM1637_NUMBER %d", &number) == 1 && display4 != NULL) {
      display4->showNumberDecEx(number, tmDots, false, 4, 0);
      tmLastNumber = number;
      tmLastLength = 4;
      tmLastPosition = 0;
      tmLastLeadingZeros = false;
      tmHasLastNumber = true;
      sendResponse("OK");
    } else sendResponse("ERR:DISPLAY_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TM1637_STRING")) {
    char text[10];
    if (sscanf(rxData.c_str(), "TM1637_STRING %9s", text) == 1 && display4 != NULL) {
      display4->clear();
      int length = min(4, (int)strlen(text));
      for (int i = 0; i < length; i++) {
        uint8_t segment = tmSegmentForChar(text[i]);
        tmSegments[i] = segment;
        display4->setSegments(&segment, 1, i);
      }
      tmHasLastNumber = false;
      sendResponse("OK");
    } else sendResponse("ERR:DISPLAY_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TM1637_SEGMENTS")) {
    int length, position, consumed = 0;
    if (sscanf(rxData.c_str(), "TM1637_SEGMENTS %d %d %n",
        &length, &position, &consumed) == 2 && consumed > 0 && display4 != NULL) {
      uint8_t segments[4] = {0, 0, 0, 0};
      String expressions = rxData.substring(consumed);
      int count = 0;
      while (expressions.length() > 0 && count < 4) {
        int comma = expressions.indexOf(',');
        String item = comma >= 0 ? expressions.substring(0, comma) : expressions;
        segments[count++] = tmParseSegment(item);
        if (comma < 0) break;
        expressions = expressions.substring(comma + 1);
      }
      length = constrain(length, 1, min(4, count));
      position = constrain(position, 0, 3);
      if (position + length > 4) length = 4 - position;
      display4->setSegments(segments, length, position);
      for (int i = 0; i < length; i++) tmSegments[position + i] = segments[i];
      tmHasLastNumber = false;
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("TM1637_BIT")) {
    int rawSegment, position;
    if (sscanf(rxData.c_str(), "TM1637_BIT %i %d", &rawSegment, &position) == 2 &&
        display4 != NULL && position >= 0 && position < 4) {
      uint8_t segment = (uint8_t)rawSegment;
      tmSegments[position] = segment;
      display4->setSegments(&segment, 1, position);
      tmHasLastNumber = false;
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("TM1637_DIGIT")) {
    int digit, position;
    if (sscanf(rxData.c_str(), "TM1637_DIGIT %d %d", &digit, &position) == 2 && display4 != NULL) {
      position = constrain(position, 0, 3);
      uint8_t segment = display4->encodeDigit(constrain(digit, 0, 9));
      tmSegments[position] = segment;
      display4->setSegments(&segment, 1, position);
      tmHasLastNumber = false;
      sendResponse("OK");
    } else sendResponse("ERR:DISPLAY_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TM1637_POINT") || rxData.startsWith("TM1637_COLON")) {
    char pointState[10];
    int parsed = rxData.startsWith("TM1637_POINT")
      ? sscanf(rxData.c_str(), "TM1637_POINT %9s", pointState)
      : sscanf(rxData.c_str(), "TM1637_COLON %9s", pointState);
    if (parsed == 1 && display4 != NULL) {
      bool enabled = strcmp(pointState, "true") == 0 || strcmp(pointState, "on") == 0 ||
        strcmp(pointState, "ON") == 0 || strcmp(pointState, "1") == 0;
      tmDots = enabled ? 0x40 : 0;
      if (tmHasLastNumber) {
        display4->showNumberDecEx(
          tmLastNumber, tmDots, tmLastLeadingZeros, tmLastLength, tmLastPosition
        );
      }
      sendResponse("OK");
    } else sendResponse("ERR:DISPLAY_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TM1637_SHOW")) {
    int number;
    if (sscanf(rxData.c_str(), "TM1637_SHOW %d", &number) == 1) {
      if (display4 == NULL) { sendResponse("ERR:DISPLAY_NOT_INIT"); return; }
      display4->showNumberDecEx(number, tmDots, false, 4, 0);
      tmLastNumber = number;
      tmLastLength = 4;
      tmLastPosition = 0;
      tmLastLeadingZeros = false;
      tmHasLastNumber = true;
      sendResponse("OK");
    }
    return;
  }

  if (rxData.startsWith("TM1637_BRIGHTNESS")) {
    int brightness;
    if (sscanf(rxData.c_str(), "TM1637_BRIGHTNESS %d", &brightness) == 1) {
      if (display4 == NULL) { sendResponse("ERR:DISPLAY_NOT_INIT"); return; }
      brightness = constrain(brightness, 0, 7);
      display4->setBrightness(brightness);
      sendResponse("OK");
    }
    return;
  }

  if (rxData.startsWith("TM1637_CLEAR")) {
    if (display4 == NULL) { sendResponse("ERR:DISPLAY_NOT_INIT"); return; }
    display4->clear();
    memset(tmSegments, 0, sizeof(tmSegments));
    tmHasLastNumber = false;
    sendResponse("OK");
    return;
  }

  // ---------- NEOPIXEL ----------
  if (rxData.startsWith("LED_INIT")) {
    if (sscanf(rxData.c_str(), "LED_INIT %d %d %d", &pin, &num, &bright) == 3) {
      if (ledMatrix != NULL) delete ledMatrix;
      ledMatrix = new Adafruit_NeoPixel(num, pin, NEO_GRB + NEO_KHZ800);
      ledMatrix->begin();
      ledMatrix->setBrightness(bright);
      ledMatrix->show();
      sendResponse("OK");
    }
    return;
  }

  if (rxData.startsWith("LEDMATRIX_INIT")) {
    if (sscanf(rxData.c_str(), "LEDMATRIX_INIT %d %d %d", &pin, &num, &bright) == 3) {
      if (ledMatrix != NULL) delete ledMatrix;
      ledMatrix = new Adafruit_NeoPixel(constrain(num, 1, 256), pin, NEO_GRB + NEO_KHZ800);
      ledMatrix->begin();
      ledMatrix->setBrightness(constrain(bright, 0, 255));
      ledMatrix->show();
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("LEDMATRIX_PIXEL")) {
    int x, y, r, g, b;
    if (sscanf(rxData.c_str(), "LEDMATRIX_PIXEL %d %d %d %d %d", &x, &y, &r, &g, &b) == 5 &&
        ledMatrix != NULL && x >= 0 && x < 5 && y >= 0 && y < 7) {
      ledMatrix->setPixelColor(y * 5 + x, ledMatrix->Color(
        constrain(r, 0, 255), constrain(g, 0, 255), constrain(b, 0, 255)
      ));
      ledMatrix->show();
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("LEDMATRIX_DIGIT") || rxData.startsWith("LED_SHOW_DIGIT")) {
    int digit;
    int parsed = rxData.startsWith("LEDMATRIX_DIGIT")
      ? sscanf(rxData.c_str(), "LEDMATRIX_DIGIT %d", &digit)
      : sscanf(rxData.c_str(), "LED_SHOW_DIGIT %d", &digit);
    if (parsed == 1 && ledMatrix != NULL) {
      matrixShowCharacter('0' + constrain(digit, 0, 9), ledMatrix->Color(255, 255, 0));
      sendResponse("OK");
    } else sendResponse("ERR:LED_NOT_INIT");
    return;
  }

  if (rxData.startsWith("LEDMATRIX_CHAR") || rxData.startsWith("LED_SHOW_CHAR")) {
    char character;
    int parsed = rxData.startsWith("LEDMATRIX_CHAR")
      ? sscanf(rxData.c_str(), "LEDMATRIX_CHAR %c", &character)
      : sscanf(rxData.c_str(), "LED_SHOW_CHAR %c", &character);
    if (parsed == 1 && ledMatrix != NULL) {
      matrixShowCharacter(toupper(character), ledMatrix->Color(0, 255, 0));
      sendResponse("OK");
    } else sendResponse("ERR:LED_NOT_INIT");
    return;
  }

  if (rxData.startsWith("LEDMATRIX_SYMBOL") || rxData.startsWith("LED_SHOW_SYMBOL")) {
    char symbol[10];
    int parsed = rxData.startsWith("LEDMATRIX_SYMBOL")
      ? sscanf(rxData.c_str(), "LEDMATRIX_SYMBOL %9s", symbol)
      : sscanf(rxData.c_str(), "LED_SHOW_SYMBOL %9s", symbol);
    if (parsed == 1 && ledMatrix != NULL) {
      char symbolCode = (strcmp(symbol, "Heart") == 0 || strcmp(symbol, "HEART") == 0) ? '*' : ':';
      matrixShowCharacter(symbolCode, ledMatrix->Color(255, 0, 0));
      sendResponse("OK");
    } else sendResponse("ERR:LED_NOT_INIT");
    return;
  }

  if (rxData.startsWith("LEDMATRIX_CUSTOM") || rxData.startsWith("LED_CUSTOM")) {
    if (ledMatrix == NULL) { sendResponse("ERR:LED_NOT_INIT"); return; }
    int firstSpace = rxData.indexOf(' ');
    if (firstSpace < 0) { sendResponse("ERR:INVALID_FORMAT"); return; }
    String pattern = rxData.substring(firstSpace + 1);
    pattern.trim();
    ledMatrix->clear();
    int count = min((int)ledMatrix->numPixels(), min(35, (int)pattern.length()));
    for (int i = 0; i < count; i++) {
      if (pattern[i] == '1') ledMatrix->setPixelColor(i, ledMatrix->Color(0, 255, 0));
    }
    ledMatrix->show();
    sendResponse("OK");
    return;
  }

  if (rxData.startsWith("LEDMATRIX_CLEAR") || rxData.startsWith("LED_CLEAR")) {
    if (ledMatrix == NULL) { sendResponse("ERR:LED_NOT_INIT"); return; }
    ledMatrix->clear();
    ledMatrix->show();
    sendResponse("OK");
    return;
  }

  if (rxData.startsWith("LED_SET")) {
    int index, r, g, b;
    if (sscanf(rxData.c_str(), "LED_SET %d %d %d %d", &index, &r, &g, &b) == 4) {
      if (ledMatrix == NULL) { sendResponse("ERR:LED_NOT_INIT"); return; }
      ledMatrix->setPixelColor(index, ledMatrix->Color(r, g, b));
      ledMatrix->show();
      sendResponse("OK");
    }
    return;
  }

  // ---------- RGB LED ----------
  if (rxData.startsWith("RGBLED_INIT")) {
    int portOrPin, rgbPin;
    int count = sscanf(rxData.c_str(), "RGBLED_INIT %d %d", &portOrPin, &rgbPin);
    if (count == 1) rgbPin = portOrPin;
    if (count >= 1 && rgbLedGet(rgbPin, true) != NULL) sendResponse("OK");
    else sendResponse("ERR:INIT_FAILED");
    return;
  }

  if (rxData.startsWith("RGBLED_SET_CHANNEL")) {
    int rgbPin, channelValue;
    char channel[2];
    if (sscanf(rxData.c_str(), "RGBLED_SET_CHANNEL %d %1s %d", &rgbPin, channel, &channelValue) == 3) {
      RgbLedEntry* item = rgbLedGet(rgbPin, true);
      channelValue = constrain(channelValue, 0, 255);
      if (channel[0] == 'R') item->r = channelValue;
      else if (channel[0] == 'G') item->g = channelValue;
      else if (channel[0] == 'B') item->b = channelValue;
      else { sendResponse("ERR:INVALID_CHANNEL"); return; }
      rgbLedApply(item);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("RGBLED_CHANGE_CHANNEL")) {
    int rgbPin, delta;
    char channel[2];
    if (sscanf(rxData.c_str(), "RGBLED_CHANGE_CHANNEL %d %1s %d", &rgbPin, channel, &delta) == 3) {
      RgbLedEntry* item = rgbLedGet(rgbPin, true);
      if (channel[0] == 'R') item->r = constrain((int)item->r + delta, 0, 255);
      else if (channel[0] == 'G') item->g = constrain((int)item->g + delta, 0, 255);
      else if (channel[0] == 'B') item->b = constrain((int)item->b + delta, 0, 255);
      else { sendResponse("ERR:INVALID_CHANNEL"); return; }
      rgbLedApply(item);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("RGBLED_GET_CHANNEL")) {
    int rgbPin;
    char channel[2];
    if (sscanf(rxData.c_str(), "RGBLED_GET_CHANNEL %d %1s", &rgbPin, channel) == 2) {
      RgbLedEntry* item = rgbLedGet(rgbPin, false);
      if (item == NULL) { sendResponse("ERR:RGBLED_NOT_INIT"); return; }
      if (channel[0] == 'R') sendResponse(String(item->r));
      else if (channel[0] == 'G') sendResponse(String(item->g));
      else if (channel[0] == 'B') sendResponse(String(item->b));
      else sendResponse("ERR:INVALID_CHANNEL");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("RGBLED_SET_FOR")) {
    int rgbPin, r, g, b;
    char secondsText[16];
    if (sscanf(rxData.c_str(), "RGBLED_SET_FOR %d %d %d %d %15s",
        &rgbPin, &r, &g, &b, secondsText) == 5) {
      RgbLedEntry* item = rgbLedGet(rgbPin, true);
      item->r = constrain(r, 0, 255);
      item->g = constrain(g, 0, 255);
      item->b = constrain(b, 0, 255);
      rgbLedApply(item);
      delay((unsigned long)(String(secondsText).toFloat() * 1000.0f));
      item->r = item->g = item->b = 0;
      rgbLedApply(item);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("RGBLED_HEX")) {
    int rgbPin;
    char colourText[16];
    if (sscanf(rxData.c_str(), "RGBLED_HEX %d %15s", &rgbPin, colourText) == 2) {
      char* start = colourText[0] == '#' ? colourText + 1 : colourText;
      unsigned long colour = strtoul(start, NULL, 16);
      RgbLedEntry* item = rgbLedGet(rgbPin, true);
      item->r = (colour >> 16) & 0xFF;
      item->g = (colour >> 8) & 0xFF;
      item->b = colour & 0xFF;
      rgbLedApply(item);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("RGBLED_SET")) {
    int rgbPin, r, g, b;
    if (sscanf(rxData.c_str(), "RGBLED_SET %d %d %d %d", &rgbPin, &r, &g, &b) == 4) {
      RgbLedEntry* item = rgbLedGet(rgbPin, true);
      item->r = constrain(r, 0, 255);
      item->g = constrain(g, 0, 255);
      item->b = constrain(b, 0, 255);
      rgbLedApply(item);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("RGBLED_OFF")) {
    int rgbPin;
    if (sscanf(rxData.c_str(), "RGBLED_OFF %d", &rgbPin) == 1) {
      RgbLedEntry* item = rgbLedGet(rgbPin, false);
      if (item == NULL) { sendResponse("ERR:RGBLED_NOT_INIT"); return; }
      item->r = item->g = item->b = 0;
      rgbLedApply(item);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  // ---------- CURRENT SENSOR (ACS712) ----------
  if (rxData.startsWith("CURRENT_INIT")) {
    char currentPinText[8], sensitivityText[16];
    if (sscanf(rxData.c_str(), "CURRENT_INIT %7s %15s", currentPinText, sensitivityText) == 2) {
      currentPin = parseArduinoPin(currentPinText);
      float sensitivity = String(sensitivityText).toFloat();
      currentSensitivity = sensitivity > 1.0f ? sensitivity / 1000.0f : sensitivity;
      if (currentSensitivity <= 0) currentSensitivity = 0.185f;
      pinMode(currentPin, INPUT);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("CURRENT_READ_MILLIAMPS")) {
    if (currentPin < 0) sendResponse("ERR:CURRENT_NOT_INIT");
    else sendResponse(String(readCurrentAmpsBle() * 1000.0f));
    return;
  }

  if (rxData.startsWith("CURRENT_READ_AMPS")) {
    if (currentPin < 0) sendResponse("ERR:CURRENT_NOT_INIT");
    else sendResponse(String(readCurrentAmpsBle()));
    return;
  }

  if (rxData.startsWith("CURRENT_READ_RAW")) {
    if (currentPin < 0) sendResponse("ERR:CURRENT_NOT_INIT");
    else sendResponse(String(analogRead(currentPin)));
    return;
  }

  if (rxData.startsWith("CURRENT_READ")) {
    char readPinText[8];
    if (sscanf(rxData.c_str(), "CURRENT_READ %7s", readPinText) == 1) {
      int readPin = parseArduinoPin(readPinText);
      sendResponse(String(analogRead(readPin)));
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  // ---------- VOLTAGE SENSOR ----------
  if (rxData.startsWith("VOLTAGE_INIT")) {
    char voltagePinText[8], referenceText[16];
    if (sscanf(rxData.c_str(), "VOLTAGE_INIT %7s %15s", voltagePinText, referenceText) == 2) {
      voltagePin = parseArduinoPin(voltagePinText);
      voltageReference = String(referenceText).toFloat();
      if (voltageReference <= 0) voltageReference = 5.0f;
      pinMode(voltagePin, INPUT);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("VOLTAGE_READ_V")) {
    if (voltagePin < 0) sendResponse("ERR:VOLTAGE_NOT_INIT");
    else sendResponse(String(readVoltageBle()));
    return;
  }

  if (rxData.startsWith("VOLTAGE_READ_RAW")) {
    if (voltagePin < 0) sendResponse("ERR:VOLTAGE_NOT_INIT");
    else sendResponse(String(analogRead(voltagePin)));
    return;
  }

  if (rxData.startsWith("VOLTAGE_READ")) {
    char readPinText[8];
    if (sscanf(rxData.c_str(), "VOLTAGE_READ %7s", readPinText) == 1) {
      int readPin = parseArduinoPin(readPinText);
      sendResponse(String(analogRead(readPin)));
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  // ---------- ROTARY ENCODER ----------
  if (rxData.startsWith("ENCODER_INIT")) {
    char clkText[8], dtText[8], swText[8];
    if (sscanf(rxData.c_str(), "ENCODER_INIT %7s %7s %7s", clkText, dtText, swText) == 3) {
      encClkPin = parseArduinoPin(clkText);
      encDtPin = parseArduinoPin(dtText);
      encSwPin = parseArduinoPin(swText);
      pinMode(encClkPin, INPUT_PULLUP);
      pinMode(encDtPin, INPUT_PULLUP);
      pinMode(encSwPin, INPUT_PULLUP);
      encCount = 0;
      encDirection = 0;
      encAccumulator = 0;
      encLastStepUs = 0;
      encSpeed = 0;
      encPreviousState = (digitalRead(encClkPin) << 1) | digitalRead(encDtPin);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("ENCODER_GET_COUNT")) {
    if (encClkPin < 0) sendResponse("ERR:ENCODER_NOT_INIT");
    else { encoderPoll(); sendResponse(String(encCount)); }
    return;
  }

  if (rxData.startsWith("ENCODER_RESET")) {
    encCount = 0;
    encDirection = 0;
    encSpeed = 0;
    sendResponse("OK");
    return;
  }

  if (rxData.startsWith("ENCODER_GET_DIRECTION")) {
    if (encClkPin < 0) sendResponse("ERR:ENCODER_NOT_INIT");
    else if (encLastStepUs == 0 || micros() - encLastStepUs > 250000UL) sendResponse("stopped");
    else sendResponse(encDirection > 0 ? "clockwise" : "anticlockwise");
    return;
  }

  if (rxData.startsWith("ENCODER_GET_SPEED")) {
    if (encClkPin < 0) sendResponse("ERR:ENCODER_NOT_INIT");
    else if (encLastStepUs == 0 || micros() - encLastStepUs > 250000UL) sendResponse("0");
    else sendResponse(String(encSpeed));
    return;
  }

  if (rxData.startsWith("ENCODER_BUTTON_CONNECT") ||
      rxData.startsWith("ENCODER_BUTTON_LISTEN")) {
    if (encSwPin < 0) sendResponse("ERR:ENCODER_NOT_INIT");
    else {
      encButtonListening = true;
      encButtonPrevious = encoderButtonPressed();
      sendResponse("OK");
    }
    return;
  }

  if (rxData.startsWith("ENCODER_BUTTON_STATE")) {
    if (encSwPin < 0) sendResponse("ERR:ENCODER_NOT_INIT");
    else sendResponse(String(digitalRead(encSwPin)));
    return;
  }

  if (rxData.startsWith("ENCODER_BUTTON_PRESSED")) {
    if (encSwPin < 0) sendResponse("ERR:ENCODER_NOT_INIT");
    else sendResponse(encoderButtonPressed() ? "1" : "0");
    return;
  }

  if (rxData.startsWith("ENCODER_BUTTON_EVENT")) {
    if (!encButtonListening) sendResponse("ERR:NOT_LISTENING");
    else {
      bool pressed = encoderButtonPressed();
      bool event = pressed && !encButtonPrevious;
      encButtonPrevious = pressed;
      sendResponse(event ? "1" : "0");
    }
    return;
  }

  // ---------- PS2 JOYSTICK ----------
  if (rxData.startsWith("JOYSTICK_INIT")) {
    int no;
    char xPinText[8], yPinText[8], swPinText[8];
    if (sscanf(rxData.c_str(), "JOYSTICK_INIT %d %7s %7s %7s",
        &no, xPinText, yPinText, swPinText) == 4 &&
        no >= 0 && no < JOYSTICK_MAX) {
      int xPin = parseArduinoPin(xPinText);
      int yPin = parseArduinoPin(yPinText);
      int swPin = parseArduinoPin(swPinText);
      joystickXPin[no] = xPin;
      joystickYPin[no] = yPin;
      joystickSwPin[no] = swPin;
      pinMode(xPin, INPUT);
      pinMode(yPin, INPUT);
      pinMode(swPin, INPUT_PULLUP);
      delay(30);
      long sumX = 0, sumY = 0;
      for (int i = 0; i < 8; i++) {
        sumX += analogRead(xPin);
        sumY += analogRead(yPin);
        delay(5);
      }
      joystickCenterX[no] = sumX / 8;
      joystickCenterY[no] = sumY / 8;
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_AXIS")) {
    int no, mapped;
    char axis[2];
    if (sscanf(rxData.c_str(), "JOYSTICK_AXIS %d %1s %d", &no, axis, &mapped) == 3 &&
        joystickValid(no)) {
      int result = analogRead(axis[0] == 'Y' ? joystickYPin[no] : joystickXPin[no]);
      if (mapped) result = map(constrain(result, 0, 1023), 0, 1023, 0, 100);
      sendResponse(String(result));
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_DIRECTION_IS")) {
    int no;
    char expected[10];
    if (sscanf(rxData.c_str(), "JOYSTICK_DIRECTION_IS %d %9s", &no, expected) == 2 &&
        joystickValid(no)) {
      String target(expected);
      target.toUpperCase();
      sendResponse(joystickDirection(no) == target ? "1" : "0");
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_DIRECTION")) {
    int no;
    if (sscanf(rxData.c_str(), "JOYSTICK_DIRECTION %d", &no) == 1 && joystickValid(no)) {
      sendResponse(joystickDirection(no));
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_ANGLE")) {
    int no;
    if (sscanf(rxData.c_str(), "JOYSTICK_ANGLE %d", &no) == 1 && joystickValid(no)) {
      sendResponse(String(joystickAngle(no)));
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_MAGNITUDE")) {
    int no;
    if (sscanf(rxData.c_str(), "JOYSTICK_MAGNITUDE %d", &no) == 1 && joystickValid(no)) {
      sendResponse(String(joystickMagnitude(no)));
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_BUTTON_STATE")) {
    int no;
    if (sscanf(rxData.c_str(), "JOYSTICK_BUTTON_STATE %d", &no) == 1 && joystickValid(no)) {
      sendResponse(String(digitalRead(joystickSwPin[no])));
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_BUTTON_PRESSED")) {
    int no;
    if (sscanf(rxData.c_str(), "JOYSTICK_BUTTON_PRESSED %d", &no) == 1 && joystickValid(no)) {
      sendResponse(joystickButtonPressed(no) ? "1" : "0");
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_DEADZONE")) {
    int no, deadzone;
    if (sscanf(rxData.c_str(), "JOYSTICK_DEADZONE %d %d", &no, &deadzone) == 2 && joystickValid(no)) {
      joystickDeadzone[no] = max(0, deadzone);
      sendResponse("OK");
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_THRESHOLDS")) {
    int no, low, high;
    if (sscanf(rxData.c_str(), "JOYSTICK_THRESHOLDS %d %d %d", &no, &low, &high) == 3 &&
        joystickValid(no)) {
      joystickLowThreshold[no] = max(0, low);
      joystickHighThreshold[no] = max(low, high);
      sendResponse("OK");
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_BUTTON_LISTEN")) {
    int no;
    if (sscanf(rxData.c_str(), "JOYSTICK_BUTTON_LISTEN %d", &no) == 1 && joystickValid(no)) {
      joystickListening[no] = true;
      joystickPreviousPressed[no] = joystickButtonPressed(no);
      sendResponse("OK");
    } else sendResponse("ERR:JOYSTICK_NOT_INIT");
    return;
  }

  if (rxData.startsWith("JOYSTICK_BUTTON_EVENT")) {
    int no;
    if (sscanf(rxData.c_str(), "JOYSTICK_BUTTON_EVENT %d", &no) == 1 &&
        joystickValid(no) && joystickListening[no]) {
      bool pressed = joystickButtonPressed(no);
      bool event = pressed && !joystickPreviousPressed[no];
      joystickPreviousPressed[no] = pressed;
      sendResponse(event ? "1" : "0");
    } else sendResponse("ERR:NOT_LISTENING");
    return;
  }

  // ---------- 1602/2004 I2C LCD ----------
  if (rxData.startsWith("LCD_INIT_EX")) {
    int address, columns, rows, sda, scl;
    if (sscanf(rxData.c_str(), "LCD_INIT_EX %i %d %d %d %d",
        &address, &columns, &rows, &sda, &scl) == 5 && columns > 0 && rows > 0) {
      lcdInitBle(address, columns, rows);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("LCD_INIT_I2C")) {
    int no, address, chip;
    if (sscanf(rxData.c_str(), "LCD_INIT_I2C %d %i %d", &no, &address, &chip) == 3) {
      lcdInitBle(address, chip == 2004 ? 20 : 16, chip == 2004 ? 4 : 2);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("LCD_CURSOR")) {
    int no, column, row;
    if (sscanf(rxData.c_str(), "LCD_CURSOR %d %d %d", &no, &column, &row) == 3 && lcdReady) {
      lcdI2c->setCursor(column, row);
      sendResponse("OK");
    } else sendResponse("ERR:LCD_NOT_INIT");
    return;
  }

  if (rxData.startsWith("LCD_PRINT_NUMBER")) {
    int no;
    char numberText[24];
    if (sscanf(rxData.c_str(), "LCD_PRINT_NUMBER %d %23s", &no, numberText) == 2 && lcdReady) {
      lcdI2c->print(String(numberText).toFloat());
      sendResponse("OK");
    } else sendResponse("ERR:LCD_NOT_INIT");
    return;
  }

  if (rxData.startsWith("LCD_PRINT_CHAR")) {
    int no, characterCode;
    if (sscanf(rxData.c_str(), "LCD_PRINT_CHAR %d %d", &no, &characterCode) == 2 && lcdReady) {
      lcdI2c->write((uint8_t)characterCode);
      sendResponse("OK");
    } else sendResponse("ERR:LCD_NOT_INIT");
    return;
  }

  if (rxData.startsWith("LCD_PRINT")) {
    if (!lcdReady) { sendResponse("ERR:LCD_NOT_INIT"); return; }
    int firstSpace = rxData.indexOf(' ');
    String rest = firstSpace >= 0 ? rxData.substring(firstSpace + 1) : "";
    rest.trim();
    int secondSpace = rest.indexOf(' ');
    String text = secondSpace >= 0 ? rest.substring(secondSpace + 1) : rest;
    lcdI2c->print(text);
    sendResponse("OK");
    return;
  }

  if (rxData.startsWith("LCD_CLEAR")) {
    if (!lcdReady) sendResponse("ERR:LCD_NOT_INIT");
    else { lcdI2c->clear(); sendResponse("OK"); }
    return;
  }

  if (rxData.startsWith("LCD_BACKLIGHT")) {
    int no, enabled;
    if (sscanf(rxData.c_str(), "LCD_BACKLIGHT %d %d", &no, &enabled) == 2 && lcdReady) {
      if (enabled) lcdI2c->backlight(); else lcdI2c->noBacklight();
      sendResponse("OK");
    } else sendResponse("ERR:LCD_NOT_INIT");
    return;
  }

  if (rxData.startsWith("LCD_ACTION")) {
    int no;
    char action[20];
    if (sscanf(rxData.c_str(), "LCD_ACTION %d %19s", &no, action) == 2 && lcdReady) {
      if (strcmp(action, "home") == 0) lcdI2c->home();
      else if (strcmp(action, "display") == 0) lcdI2c->display();
      else if (strcmp(action, "noDisplay") == 0) lcdI2c->noDisplay();
      else if (strcmp(action, "cursor") == 0) lcdI2c->cursor();
      else if (strcmp(action, "noCursor") == 0) lcdI2c->noCursor();
      else if (strcmp(action, "blink") == 0) lcdI2c->blink();
      else if (strcmp(action, "noBlink") == 0) lcdI2c->noBlink();
      else if (strcmp(action, "scrollLeft") == 0) lcdI2c->scrollDisplayLeft();
      else if (strcmp(action, "scrollRight") == 0) lcdI2c->scrollDisplayRight();
      else { sendResponse("ERR:INVALID_ACTION"); return; }
      sendResponse("OK");
    } else sendResponse("ERR:LCD_NOT_INIT");
    return;
  }

  // ---------- TCS34725 COLOUR SENSOR ----------
  if (rxData.startsWith("TCS34725_INIT")) {
    if (colourSensor == NULL) {
      Wire.begin();
      colourSensor = new Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);
    }
    if (colourSensor->begin()) {
      colourSensor->setInterrupt(false);
      sendResponse("OK");
    } else sendResponse("ERR:INIT_FAILED");
    return;
  }

  if (rxData.startsWith("TCS34725_READ")) {
    if (colourSensor == NULL) sendResponse("ERR:COLOUR_NOT_INIT");
    else { colourUpdate(); sendResponse("OK"); }
    return;
  }

  if (rxData.startsWith("TCS34725_LED")) {
    char ledState[8];
    if (sscanf(rxData.c_str(), "TCS34725_LED %7s", ledState) == 1 && colourSensor != NULL) {
      bool enabled = strcmp(ledState, "ON") == 0 || strcmp(ledState, "on") == 0 ||
        strcmp(ledState, "1") == 0;
      colourSensor->setInterrupt(!enabled);
      sendResponse("OK");
    } else sendResponse("ERR:COLOUR_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TCS34725_COLOR_TEMP")) {
    if (colourSensor == NULL) sendResponse("ERR:COLOUR_NOT_INIT");
    else {
      colourUpdate();
      sendResponse(String(colourSensor->calculateColorTemperature_dn40(
        colourR, colourG, colourB, colourClear
      )));
    }
    return;
  }

  if (rxData.startsWith("TCS34725_LUX")) {
    if (colourSensor == NULL) sendResponse("ERR:COLOUR_NOT_INIT");
    else {
      colourUpdate();
      sendResponse(String(colourSensor->calculateLux(colourR, colourG, colourB)));
    }
    return;
  }

  if (rxData.startsWith("TCS34725_GET_NAME")) {
    if (colourSensor == NULL) sendResponse("ERR:COLOUR_NOT_INIT");
    else sendResponse(colourName());
    return;
  }

  if (rxData.startsWith("TCS34725_GET_COLOR")) {
    char colourChannel[2];
    if (sscanf(rxData.c_str(), "TCS34725_GET_COLOR %1s", colourChannel) == 1 &&
        colourSensor != NULL) {
      colourUpdate();
      if (colourChannel[0] == 'R') sendResponse(String(colourR));
      else if (colourChannel[0] == 'G') sendResponse(String(colourG));
      else if (colourChannel[0] == 'B') sendResponse(String(colourB));
      else sendResponse(String(colourClear));
    } else sendResponse("ERR:COLOUR_NOT_INIT");
    return;
  }

  if (rxData.startsWith("TCS34725_IS_COLOR")) {
    char expectedColour[10];
    if (sscanf(rxData.c_str(), "TCS34725_IS_COLOR %9s", expectedColour) == 1 &&
        colourSensor != NULL) {
      String target(expectedColour);
      target.toUpperCase();
      sendResponse(colourName() == target ? "1" : "0");
    } else sendResponse("ERR:COLOUR_NOT_INIT");
    return;
  }

  // ---------- FAN MODULE ----------
  if (rxData.startsWith("FAN_INIT")) {
    if (sscanf(rxData.c_str(), "FAN_INIT %d %d", &fanPin1, &fanPin2) == 2) {
      pinMode(fanPin1, OUTPUT);
      pinMode(fanPin2, OUTPUT);
      digitalWrite(fanPin1, LOW);
      digitalWrite(fanPin2, LOW);
      sendResponse("OK");
    } else sendResponse("ERR:INVALID_FORMAT");
    return;
  }

  if (rxData.startsWith("FAN_ROTATE") || rxData.startsWith("FAN_DIRECTION")) {
    char direction[16];
    int parsed = rxData.startsWith("FAN_ROTATE")
      ? sscanf(rxData.c_str(), "FAN_ROTATE %15s", direction)
      : sscanf(rxData.c_str(), "FAN_DIRECTION %15s", direction);
    if (parsed == 1 && fanPin1 >= 0) {
      if (strcmp(direction, "Clockwise") == 0 || strcmp(direction, "CLOCKWISE") == 0 ||
          strcmp(direction, "CW") == 0) {
        digitalWrite(fanPin1, HIGH);
        digitalWrite(fanPin2, LOW);
      } else if (strcmp(direction, "Anticlockwise") == 0 ||
                 strcmp(direction, "ANTICLOCKWISE") == 0 || strcmp(direction, "CCW") == 0) {
        digitalWrite(fanPin1, LOW);
        digitalWrite(fanPin2, HIGH);
      } else {
        digitalWrite(fanPin1, LOW);
        digitalWrite(fanPin2, LOW);
      }
      sendResponse("OK");
    } else sendResponse("ERR:FAN_NOT_INIT");
    return;
  }

  sendResponse("ERR:UNKNOWN_CMD");
}
`;

        return '';
    };

    return Blockly;
}

exports = addGenerator;
