/**
 * Zappie V2 ESP32 WiFi firmware for Blockzie
 * Connection layer matches AI & Robotics (firmware/wifi): STA + WebServer /connect /control /disconnect.
 * Command payload is Zappie (CAR_MOVE, LEDMATRIX_*, ULTRASONIC_READ, PM_*, sensors, servo).
 *
 * GUI: Connect → Wi-Fi → enter the IP printed on Serial Monitor @ 115200
 * Default hotspot: STEMbotix 5G / shriji1234  (same as firmware/wifi/wifi.ino)
 *
 * Build: Arduino IDE → ESP32 Dev Module
 * Output: zappie_wifi.ino.bin (+ partitions.bin) → Blockzie Link firmwares/arduino/
 */
#ifndef PM_ENABLE_A2DP
#define PM_ENABLE_A2DP  0
#endif

#ifndef ARDUINO_ARCH_ESP32
#error Zappie WiFi firmware must be compiled for ESP32 (Tools > Board > ESP32 Arduino > ESP32 Dev Module).
#endif
 
 #include <Wire.h>
 #include <Adafruit_GFX.h>
 #include <Adafruit_SSD1306.h>
 #include <Adafruit_NeoPixel.h>
 #include <driver/i2s.h>
 #include <WiFi.h>
 #include <WebServer.h>
 #include <string.h>
#if defined(ARDUINO_ARCH_ESP32)
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#endif
 #if PM_ENABLE_A2DP && __has_include(<BluetoothA2DPSink.h>)
 #include <BluetoothA2DPSink.h>
 #define PM_HAS_A2DP 1
 #else
 #define PM_HAS_A2DP 0
 #endif
 
 #if __has_include(<esp_arduino_version.h>)
 #include <esp_arduino_version.h>
 #else
 #define ESP_ARDUINO_VERSION_MAJOR 2
 #endif
 
 // ---- Minimal Firmata-compatible serial layer (AI&Robotics style) ----
 #define START_SYSEX      0xF0
 #define END_SYSEX        0xF7
 #define STRING_DATA      0x71
 #define REPORT_VERSION   0xF9
 #define QUERY_FIRMWARE   0x79
 #define SYSTEM_RESET     0xFF
 #define CAPABILITY_QUERY 0x6B
 #define CAPABILITY_RESPONSE 0x6C
 #define ANALOG_MAPPING_QUERY 0x69
 #define ANALOG_MAPPING_RESPONSE 0x6A
 #define PIN_STATE_QUERY 0x6D
 #define PIN_STATE_RESPONSE 0x6E
 #define EXTENDED_ANALOG 0x6F
 #define SERVO_CONFIG 0x70
 #define SAMPLING_INTERVAL 0x7A
 #define SET_PIN_MODE     0xF4
 #define REPORT_ANALOG    0xC0
 #define REPORT_DIGITAL   0xD0
 #define ANALOG_MESSAGE   0xE0
 #define DIGITAL_MESSAGE  0x90
 
 #define FIRMATA_INPUT    0x00
 #define FIRMATA_OUTPUT   0x01
 #define FIRMATA_ANALOG   0x02
 #define FIRMATA_PWM      0x03
 #define FIRMATA_SERVO    0x04
 #define FIRMATA_IGNORE   0x7F
 
 #if PM_HAS_A2DP
 BluetoothA2DPSink pmA2dpSink;
 #endif
 bool pmA2dpStarted = false;
const char* ssid = "STEMbotix 5G"; // Replace with your hotspot name
const char* password = "shriji1234"; // Replace with your hotspot password
WebServer server(80);
 static char pmHttpReply[256];
 static bool pmWifiHttpBusy = false;
 
 uint8_t pmSerialInBuf[256];
 int pmSerialInLen = 0;
 bool pmSerialInSysex = false;
 uint8_t pmFirmataCmdBuf[3];
 uint8_t pmFirmataCmdLen = 0;
 uint8_t pmFirmataCmdNeed = 0;
 uint8_t pmFirmataPinMode[40];
 int pmFirmataPinState[40];
 
 // ---- V2 Zappie pin map (STEMbotix) ----
 #define PM_MATRIX_PIN     4
 #define PM_BTN_LEFT       39
 #define PM_BTN_RIGHT      36
 #define PM_LINE_LEFT      35
 #define PM_LINE_RIGHT     34
 #define PM_SERVO1         14
 #define PM_SERVO2         12
 #define PM_MOTOR_A_FWD    27
 #define PM_MOTOR_A_REV    25
 #define PM_MOTOR_B_FWD    26
 #define PM_MOTOR_B_REV    32
 #define PM_US_TRIG        16
 #define PM_US_ECHO        17
 #define PM_BUZZER         19
 #define PM_I2S_BCK        18
 #define PM_I2S_WS         19
 #define PM_I2S_MIC        23
 #define PM_I2S_SPK        5
 #define PM_IMU_SDA        21
 #define PM_IMU_SCL        22
 
 #define PM_OLED_W         128
 #define PM_OLED_H         64
 
 #define PM_FACE_LEDS      42
 #define PM_FACE_COLS      7
 #define PM_FACE_ROWS      6
 
 #define PM_LINE_THR_L_DEF 2000
 #define PM_LINE_THR_R_DEF 2000
 #define PM_LINE_BLACK_MAX 50
 #define PM_LINE_WHITE_MIN 100
#define PM_MIC_VOICE_MIN  800
#define PM_MIC_SILENCE    500
#define PM_MIC_GAIN       6
#define PM_TOUCH_THR      40
#define PM_BATTERY_PIN    33
#define PM_VIBRATION_PIN  15
#define PM_SOUND_ANA_THR  1800
#define PM_MPU_ADDR0      0x68
#define PM_MPU_ADDR1      0x69
 
 // Set 1 for Arduino Serial Monitor plain boot text. Keep 0 for Blockzie realtime.
 #ifndef PM_SERIAL_MONITOR_TEST
 #define PM_SERIAL_MONITOR_TEST 0
 #endif
 
 // Set 0 to disable USB debug prints (Serial Monitor @ 115200).
 #define PM_DEBUG_SERIAL   0
 
 #if PM_DEBUG_SERIAL
 void pmDebugLog(const char *tag, const String &msg) {
   Serial.print("[PM:");
   Serial.print(tag);
   Serial.print("] ");
   Serial.println(msg);
 }
 #else
 void pmDebugLog(const char *, const String &) {}
 #endif
 
 void handleZappieCommand(String cmd);
 void handleBlockzieCommand(String cmd);
 void handleSerialCommand(String cmd);
 void routeIncomingCommand(String cmd);
 void processSerialInput();
 bool isZappieAliasCommand(const String &cmd);
 
 // Reply buffer — Firmata needs stable char* (not temporary String.c_str()).
 static char pmReplyBuf[160];
 
 void sendFirmataReportVersion() {
   Serial.write(REPORT_VERSION);
   Serial.write(2);
   Serial.write(5);
 }
 
 void sendFirmataFirmwareResponse() {
   const char *name = "Zappie";
   Serial.write(START_SYSEX);
   Serial.write(QUERY_FIRMWARE);
   Serial.write(2);
   Serial.write(5);
   for (int i = 0; name[i] != '\0'; i++) {
     uint8_t c = (uint8_t)name[i];
     Serial.write(c & 0x7F);
     Serial.write((c >> 7) & 0x7F);
   }
   Serial.write(0);
   Serial.write(0);
   Serial.write(END_SYSEX);
 }
 
 bool pmFirmataPinExists(int pin) {
   return pin >= 0 && pin < 40;
 }
 
 int pmFirmataAnalogChannel(int pin) {
   switch (pin) {
     case 32: return 0;
     case 33: return 1;
     case 34: return 2;
     case 35: return 3;
     case 36: return 4;
     case 39: return 5;
     case 12: return 6;
     case 13: return 7;
     case 14: return 8;
     case 25: return 9;
     case 26: return 10;
     case 27: return 11;
     default: return FIRMATA_IGNORE;
   }
 }
 
 bool pmFirmataPinCanOutput(int pin) {
   if (!pmFirmataPinExists(pin)) return false;
   if (pin >= 34 && pin <= 39) return false;
   return pin != 6 && pin != 7 && pin != 8 && pin != 9 && pin != 10 && pin != 11;
 }
 
 void pmFirmataWrite7BitValue(int value) {
   Serial.write(value & 0x7F);
   Serial.write((value >> 7) & 0x7F);
 }
 
 void sendFirmataCapabilityResponse() {
   Serial.write(START_SYSEX);
   Serial.write(CAPABILITY_RESPONSE);
   for (int pin = 0; pin < 40; pin++) {
     Serial.write(FIRMATA_INPUT);
     Serial.write(1);
     if (pmFirmataPinCanOutput(pin)) {
       Serial.write(FIRMATA_OUTPUT);
       Serial.write(1);
       Serial.write(FIRMATA_PWM);
       Serial.write(8);
       Serial.write(FIRMATA_SERVO);
       Serial.write(14);
     }
     if (pmFirmataAnalogChannel(pin) != FIRMATA_IGNORE) {
       Serial.write(FIRMATA_ANALOG);
       Serial.write(12);
     }
     Serial.write(FIRMATA_IGNORE);
   }
   Serial.write(END_SYSEX);
   Serial.flush();
 }
 
 void sendFirmataAnalogMappingResponse() {
   Serial.write(START_SYSEX);
   Serial.write(ANALOG_MAPPING_RESPONSE);
   for (int pin = 0; pin < 40; pin++) {
     Serial.write(pmFirmataAnalogChannel(pin));
   }
   Serial.write(END_SYSEX);
   Serial.flush();
 }
 
 void sendFirmataPinStateResponse(uint8_t pin) {
   if (!pmFirmataPinExists(pin)) return;
   Serial.write(START_SYSEX);
   Serial.write(PIN_STATE_RESPONSE);
   Serial.write(pin);
   Serial.write(pmFirmataPinMode[pin]);
   pmFirmataWrite7BitValue(pmFirmataPinState[pin]);
   Serial.write(END_SYSEX);
   Serial.flush();
 }
 
 void sendFirmataHandshake() {
   sendFirmataReportVersion();
   sendFirmataFirmwareResponse();
   Serial.flush();
 }
 
 void sendResponse(const String &msg) {
   msg.toCharArray(pmReplyBuf, sizeof(pmReplyBuf));
   strncpy(pmHttpReply, pmReplyBuf, sizeof(pmHttpReply) - 1);
   pmHttpReply[sizeof(pmHttpReply) - 1] = '\0';
   // During POST /control, HTTP body is the GUI reply. Do not block the
   // radio with Firmata Serial.flush() — that is why LED/button looked dead on WiFi.
   if (pmWifiHttpBusy) return;
   Serial.write(START_SYSEX);
   Serial.write(STRING_DATA);
   for (char *p = pmReplyBuf; *p; p++) {
     uint8_t c = (uint8_t)*p;
     Serial.write(c & 0x7F);
     Serial.write((c >> 7) & 0x7F);
   }
   Serial.write(0);
   Serial.write(0);
   Serial.write(END_SYSEX);
   Serial.flush();
 }
 
 void sendErr(const char *code) {
   sendResponse(String("ERR:") + code);
 }
 
 bool pmHostCommandSeen = false;
 
 void routeIncomingCommand(String cmd) {
   cmd.trim();
   while (cmd.length() > 0 && (cmd.endsWith("\n") || cmd.endsWith("\r"))) {
     cmd.remove(cmd.length() - 1);
   }
   if (cmd.length() == 0) return;

   if (cmd == "GET_MILLIS" || cmd.startsWith("GET_MILLIS")) {
     sendResponse(String(millis()));
     return;
   }
   if (cmd.startsWith("GET_MAC") || cmd.startsWith("GET_BT_MAC") ||
       cmd == "MAC" || cmd.startsWith("MAC")) {
     sendResponse(String("WIFI:") + WiFi.localIP().toString() + ",MAC:" + WiFi.macAddress());
     return;
   }
 
   // Host is actively sending commands — stop the boot-time handshake resend
   // so response packets are never followed by an unsolicited handshake.
   pmHostCommandSeen = true;
 
   pmDebugLog("RX", cmd);
 
   // Zappie realtime: PM_* actions + SET_MOTOR_* / SET_LINE_* motor config.
   // Generic SET_PIN_MODE / SET_DIGITAL_OUTPUT / SET_SERVO_OUTPUT go to Blockzie handler.
   if (cmd.startsWith("PM_") ||
       cmd.startsWith("SET_MOTOR_") ||
       cmd.startsWith("SET_LINE_") ||
       isZappieAliasCommand(cmd)) {
     handleZappieCommand(cmd);
   } else if (cmd.startsWith("SERIAL_")) {
     handleSerialCommand(cmd);
   } else if (cmd.startsWith("SET_") || cmd.startsWith("READ_") ||
              cmd.startsWith("LEDMATRIX_") || cmd.startsWith("ULTRASONIC_") ||
              cmd.startsWith("US ") || cmd.startsWith("SMOOTH_SERVO")) {
     handleBlockzieCommand(cmd);
   } else {
     sendErr("UNKNOWN_CMD");
   }
 }
 
 void onFirmataString(char *str) {
   if (!str || str[0] == '\0') return;
   routeIncomingCommand(String(str));
 }
 
 // ---- NeoPixel face matrix ----
 Adafruit_NeoPixel pmFace(PM_FACE_LEDS, PM_MATRIX_PIN, NEO_GRB + NEO_KHZ800);
 bool pmFaceReady = false;
 
 int pmFaceIndex(int row, int col) {
   if (row < 0 || row >= PM_FACE_ROWS || col < 0 || col >= PM_FACE_COLS) return -1;
   col = PM_FACE_COLS - 1 - col;
   if (row % 2 == 0) return row * PM_FACE_COLS + col;
   return row * PM_FACE_COLS + (PM_FACE_COLS - 1 - col);
 }
 
 void pmFaceBegin() {
   if (pmFaceReady) return;
   pmFace.begin();
   pmFace.setBrightness(80);
   pmFace.clear();
   pmFace.show();
   pmFaceReady = true;
 }
 
 void pmFaceDrawPattern(const char *data, uint32_t color) {
   pmFaceBegin();
   pmFace.clear();
   for (int py = 0; py < 6; py++) {
     for (int px = 0; px < 7; px++) {
       int i = py * 7 + px;
       char ch = (data && data[i]) ? data[i] : '0';
       if (ch == '1') {
         int idx = pmFaceIndex(py, px);
         if (idx >= 0) pmFace.setPixelColor(idx, color);
       }
     }
   }
   pmFace.show();
 }
 
 bool pmPatternIsBinary(const String &pat) {
   for (unsigned int i = 0; i < pat.length(); i++) {
     char c = pat.charAt(i);
     if (c != '0' && c != '1') return false;
   }
   return pat.length() > 0;
 }
 
 void pmFaceDrawBinaryPattern(const String &pat, uint32_t color) {
   char buf[PM_FACE_LEDS + 1];
   for (int i = 0; i < PM_FACE_LEDS; i++) {
     buf[i] = (i < (int)pat.length() && pat.charAt(i) == '1') ? '1' : '0';
   }
   buf[PM_FACE_LEDS] = '\0';
   pmFaceDrawPattern(buf, color);
 }
 
 uint32_t pmMatrixColorForDigit(char d) {
   switch (d) {
     case '1': return pmFace.Color(255, 0, 0);
     case '2': return pmFace.Color(255, 196, 0);
     case '3': return pmFace.Color(0, 217, 223);
     case '4': return pmFace.Color(7, 28, 255);
     case '5': return pmFace.Color(0, 235, 23);
     case '6': return pmFace.Color(255, 152, 0);
     case '7': return pmFace.Color(0, 179, 60);
     case '8': return pmFace.Color(255, 0, 217);
     case '9': return pmFace.Color(255, 255, 255);
     default: return 0;
   }
 }
 
 void pmFaceDrawFullPattern(const char *data) {
   pmFaceBegin();
   pmFace.clear();
   for (int py = 0; py < PM_FACE_ROWS; py++) {
     for (int px = 0; px < PM_FACE_COLS; px++) {
       int i = py * PM_FACE_COLS + px;
       char d = data[i];
       if (d != '0' && d != '\0') {
         int idx = pmFaceIndex(py, px);
         if (idx >= 0) pmFace.setPixelColor(idx, pmMatrixColorForDigit(d));
       }
     }
   }
   pmFace.show();
 }
 
 void pmFaceShowDigit(int digit) {
   const char *patterns[10] = {
     "011111010000011000101100100110000010111110",
     "001100001110000011000001100000110000111100",
     "011111010000010000010000110001100001111111",
     "011111010000010000010000111000000101011110",
     "000110000111000101100100110011111110001100",
     "111111110000001111110000001000000101111110",
     "011111010000001000000111111010000010111110",
     "111111100000100000100000100000100000010000",
     "011111010000011000001011111010000010111110",
     "011111010000011000001011111100000100111110"
   };
   if (digit < 0) digit = 0;
   if (digit > 9) digit = 9;
   pmFaceDrawPattern(patterns[digit], pmFace.Color(255, 255, 0));
 }

 /* 5×6 uppercase — same glyphs as zappie_ble / scroll text+number block */
 const char *pmTextLetterUpper(char letter) {
   static const char *patterns[26] = {
     "011101000110001111111000110001",
     "111101000111110100011000111110",
     "011101000110000100001000101110",
     "111001001010001100011001011100",
     "111111000011110100001000011111",
     "111111000011110100001000010000",
     "011101000110000101111000101110",
     "100011000111111100011000110001",
     "011100010000100001000010001110",
     "001110001000010000101001001100",
     "100011001011100100101000110001",
     "100001000010000100001000011111",
     "100011101110101100011000110001",
     "100011100110101100111000110001",
     "011101000110001100011000101110",
     "111101000110001111101000010000",
     "011101000110001100011001001101",
     "111101000110001111101001010001",
     "011111000001110000010000111110",
     "111110010000100001000010000100",
     "100011000110001100011000101110",
     "100011000110001100010101000100",
     "100011000110001101011010101010",
     "100011000101010001000101010001",
     "100011000101010001000010000100",
     "111110000100010001000100011111"
   };
   if (letter < 'A' || letter > 'Z') return NULL;
   return patterns[letter - 'A'];
 }

 const char *pmTextLetterLower(char letter) {
   static const char *patterns[26] = {
     "000000111000001011111000101110",
     "100001000011110100011000111110",
     "000000111010000100001000001110",
     "000010000101111100011000101111",
     "000000111010001111111000001110",
     "001100100011100010000100001000",
     "000000111110001011110000101110",
     "100001000011110100011000110001",
     "001000000001100001000010001110",
     "000100000000110000100001001100",
     "100001000010010111001001010001",
     "011000010000100001000010001110",
     "000001101010101101011010110101",
     "000001111010001100011000110001",
     "000000111010001100011000101110",
     "000001111010001111101000010000",
     "000000111110001011110000100001",
     "000001011011001100001000010000",
     "000000111110000011100000111110",
     "010000100011100010000100000110",
     "000001000110001100011000101111",
     "000001000110001100010101000100",
     "000001000110001101011010101010",
     "000001000101010001000101010001",
     "000001000110001011110000101110",
     "000001111100010001000100011111"
   };
   if (letter < 'a' || letter > 'z') return NULL;
   return patterns[letter - 'a'];
 }

 const char *pmTextGlyph5x6(char ch) {
   if (ch >= 'a' && ch <= 'z') return pmTextLetterLower(ch);
   if (ch >= 'A' && ch <= 'Z') return pmTextLetterUpper(ch);
   return NULL;
 }

 char pmTextColorDigit(const String &name) {
   String n = name;
   n.replace(" ", "");
   n.replace("_", "");
   if (n.equalsIgnoreCase("Yellow")) return '2';
   if (n.equalsIgnoreCase("Cyan")) return '3';
   if (n.equalsIgnoreCase("Blue")) return '4';
   if (n.equalsIgnoreCase("Green")) return '5';
   if (n.equalsIgnoreCase("Orange")) return '6';
   if (n.equalsIgnoreCase("Darkgreen")) return '7';
   if (n.equalsIgnoreCase("Pink")) return '8';
   if (n.equalsIgnoreCase("White")) return '9';
   if (n.equalsIgnoreCase("Rainbow")) return 'R';
   return '1';
 }

 #define PM_GLYPH_COLS      5
 #define PM_SCROLL_SAFE_X   1
 #define PM_SCROLL_GAP      1
 #define PM_SCROLL_MAX_COLS 256

 void pmFaceGlyphToMatrix(const char *src5x6, char out42[PM_FACE_LEDS + 1], char onDigit) {
   for (int row = 0; row < PM_FACE_ROWS; row++) {
     for (int col = 0; col < PM_FACE_COLS; col++) {
       int gx = col - PM_SCROLL_SAFE_X;
       char bit = '0';
       if (src5x6 && gx >= 0 && gx < PM_GLYPH_COLS) {
         bit = (src5x6[row * PM_GLYPH_COLS + gx] == '1') ? onDigit : '0';
       }
       out42[row * PM_FACE_COLS + col] = bit;
     }
   }
   out42[PM_FACE_LEDS] = '\0';
 }

 void pmFaceShowLetter(char letter) {
   const char *src = pmTextGlyph5x6(letter);
   char buf[PM_FACE_LEDS + 1];
   if (!src) {
     for (int i = 0; i < PM_FACE_LEDS; i++) buf[i] = '0';
     buf[PM_FACE_LEDS] = '\0';
   } else {
     pmFaceGlyphToMatrix(src, buf, '1');
   }
   pmFaceDrawPattern(buf, pmFace.Color(0, 255, 0));
 }

 bool pmScrollColBlank(const char col[PM_FACE_ROWS]) {
   for (int r = 0; r < PM_FACE_ROWS; r++) {
     if (col[r] != '0') return false;
   }
   return true;
 }

 void pmScrollPushBlank(char ribbon[][PM_FACE_ROWS], int *len) {
   if (*len >= PM_SCROLL_MAX_COLS) return;
   for (int r = 0; r < PM_FACE_ROWS; r++) ribbon[*len][r] = '0';
   (*len)++;
 }

 void pmScrollPushColsTrimmed(char ribbon[][PM_FACE_ROWS], int *len, char cols[][PM_FACE_ROWS], int nCols) {
   int start = 0;
   int end = nCols - 1;
   while (start < end && pmScrollColBlank(cols[start])) start++;
   while (end > start && pmScrollColBlank(cols[end])) end--;
   for (int c = start; c <= end; c++) {
     if (*len >= PM_SCROLL_MAX_COLS) return;
     for (int r = 0; r < PM_FACE_ROWS; r++) ribbon[*len][r] = cols[c][r];
     (*len)++;
   }
 }

 void pmScrollColorizeCols(char cols[][PM_FACE_ROWS], int nCols, char digit) {
   for (int c = 0; c < nCols; c++) {
     for (int r = 0; r < PM_FACE_ROWS; r++) {
       if (cols[c][r] != '0') cols[c][r] = digit;
     }
   }
 }

 void pmScrollPushLetter(char ribbon[][PM_FACE_ROWS], int *len, char ch, char colorDigit) {
   const char *src = pmTextGlyph5x6(ch);
   if (!src) {
     for (int i = 0; i < 3; i++) pmScrollPushBlank(ribbon, len);
     return;
   }
   char cols[PM_GLYPH_COLS][PM_FACE_ROWS];
   for (int c = 0; c < PM_GLYPH_COLS; c++) {
     for (int r = 0; r < PM_FACE_ROWS; r++) {
       cols[c][r] = (src[r * PM_GLYPH_COLS + c] == '1') ? '1' : '0';
     }
   }
   pmScrollColorizeCols(cols, PM_GLYPH_COLS, colorDigit);
   pmScrollPushColsTrimmed(ribbon, len, cols, PM_GLYPH_COLS);
 }

 void pmScrollPushDigit(char ribbon[][PM_FACE_ROWS], int *len, char digitCh, char colorDigit) {
   static const char *digitPats[10] = {
     "011101000110001100011000101110",
     "001000110000100001000010001110",
     "011101000100001001100100011111",
     "011101000100110000011000101110",
     "000100011001010100101111100010",
     "111111000011110000011000101110",
     "011101000011110100011000101110",
     "111110000100010001000100001000",
     "011101000101110100011000101110",
     "011101000110001011110000101110"
   };
   if (digitCh < '0' || digitCh > '9') {
     pmScrollPushBlank(ribbon, len);
     return;
   }
   const char *src = digitPats[digitCh - '0'];
   char cols[PM_GLYPH_COLS][PM_FACE_ROWS];
   for (int c = 0; c < PM_GLYPH_COLS; c++) {
     for (int r = 0; r < PM_FACE_ROWS; r++) {
       cols[c][r] = (src[r * PM_GLYPH_COLS + c] == '1') ? '1' : '0';
     }
   }
   pmScrollColorizeCols(cols, PM_GLYPH_COLS, colorDigit);
   pmScrollPushColsTrimmed(ribbon, len, cols, PM_GLYPH_COLS);
 }

 int pmScrollBuildRibbon(const char *text, const String &colorName, char ribbon[][PM_FACE_ROWS]) {
   int len = 0;
   int rainbowLetter = 0;
   char solidDigit = pmTextColorDigit(colorName);
   bool isRainbow = (solidDigit == 'R');
   if (isRainbow) solidDigit = '1';
   for (int i = 0; i < PM_FACE_COLS; i++) pmScrollPushBlank(ribbon, &len);
   if (!text || text[0] == '\0') {
     for (int i = 0; i < PM_FACE_COLS; i++) pmScrollPushBlank(ribbon, &len);
     return len;
   }
   for (int i = 0; text[i] != '\0'; i++) {
     char ch = text[i];
     char colorDigit = solidDigit;
     if (ch == ' ' || ch == '\t' || ch == '\n') {
       for (int s = 0; s < 3; s++) pmScrollPushBlank(ribbon, &len);
     } else {
       if (isRainbow) {
         colorDigit = (char)('1' + (rainbowLetter % 8));
         rainbowLetter++;
       }
       if (ch >= '0' && ch <= '9') pmScrollPushDigit(ribbon, &len, ch, colorDigit);
       else pmScrollPushLetter(ribbon, &len, ch, colorDigit);
     }
     if (text[i + 1] != '\0' && ch != ' ' && text[i + 1] != ' ') {
       for (int g = 0; g < PM_SCROLL_GAP; g++) pmScrollPushBlank(ribbon, &len);
     }
   }
   for (int i = 0; i < PM_FACE_COLS; i++) pmScrollPushBlank(ribbon, &len);
   return len;
 }

 void pmScrollDrawWindow(char ribbon[][PM_FACE_ROWS], int ribbonLen, int offset) {
   char buf[PM_FACE_LEDS + 1];
   for (int row = 0; row < PM_FACE_ROWS; row++) {
     for (int col = 0; col < PM_FACE_COLS; col++) {
       int idx = offset + col;
       char bit = '0';
       if (idx >= 0 && idx < ribbonLen) bit = ribbon[idx][row];
       buf[row * PM_FACE_COLS + col] = bit;
     }
   }
   buf[PM_FACE_LEDS] = '\0';
   pmFaceDrawFullPattern(buf);
 }

 void pmFaceScrollText(const String &text, const String &colorName, int speedMs) {
   static char ribbon[PM_SCROLL_MAX_COLS][PM_FACE_ROWS];
   int ribbonLen = pmScrollBuildRibbon(text.c_str(), colorName, ribbon);
   if (ribbonLen < PM_FACE_COLS) ribbonLen = PM_FACE_COLS;
   if (speedMs < 20) speedMs = 20;
   if (speedMs > 500) speedMs = 500;
   int maxOffset = ribbonLen - PM_FACE_COLS;
   for (int offset = 0; offset <= maxOffset; offset++) {
     pmScrollDrawWindow(ribbon, ribbonLen, offset);
     if (offset < maxOffset) delay(speedMs);
   }
 }

 const char *pmEmojiPattern(const String &name) {
   if (name == "Heart") return "000000101000100010100000100000101000100010";
   if (name == "Happy") return "00000010100000000000000001000101110";
   if (name == "Sad") return "00000010100000000000000000111010001";
   if (name == "Yes") return "00000000010001001010010000010000000";
   if (name == "No") return "100000101000100010100000100000101000100010";
   if (name == "Star") return "000100001010100011100111111100111000101010";
   if (name == "ArrowUp") return "000100000111000111110000100000010000001000";
   if (name == "ArrowDown") return "000100000010000001000011111000111000001000";
   if (name == "ArrowLeft") return "000100000110000111111001100000010000000000";
   if (name == "ArrowRight") return "000100000011001111110000110000010000000000";
   return "00000010100000000000000001000101110";
 }
 
 uint32_t pmEmojiColor(const String &name) {
   if (name == "Heart") return pmFace.Color(255, 20, 147);
   if (name == "Sad") return pmFace.Color(0, 80, 255);
   if (name == "No") return pmFace.Color(255, 0, 0);
   if (name == "Star") return pmFace.Color(255, 180, 0);
   return pmFace.Color(0, 255, 0);
 }
 
 // ---- SSD1306 OLED (I2C IO21 SDA / IO22 SCL) ----
 Adafruit_SSD1306 pmOled(PM_OLED_W, PM_OLED_H, &Wire, -1);
 bool pmOledReady = false;
 
 bool pmOledBegin() {
   if (pmOledReady) return true;
   Wire.setTimeOut(50);
   Wire.begin(PM_IMU_SDA, PM_IMU_SCL);
   if (pmOled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
     pmOledReady = true;
   } else if (pmOled.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
     pmOledReady = true;
   }
   if (pmOledReady) {
     pmOled.clearDisplay();
     pmOled.setTextSize(1);
     pmOled.setTextColor(SSD1306_WHITE);
     pmOled.display();
   }
   return pmOledReady;
 }
 
 void pmOledClear() {
   if (!pmOledBegin()) return;
   pmOled.clearDisplay();
   pmOled.display();
 }
 
 void pmOledPrint(String text, int textSize, int x, int y, const char *hexColor) {
   if (!pmOledBegin()) return;
   pmOled.clearDisplay();
   (void)hexColor;
   pmOled.setTextColor(SSD1306_WHITE);
   pmOled.setTextSize(constrain(textSize, 1, 4));
   pmOled.setCursor(x, y);
   pmOled.println(text);
   pmOled.display();
 }

 // ---- MPU-6050 IMU (same I2C bus as OLED: IO21 SDA / IO22 SCL) ----
 uint8_t pmMpuAddr = PM_MPU_ADDR0;
 bool pmImuReady = false;
 int16_t pmImuAx = 0, pmImuAy = 0, pmImuAz = 0;
 int16_t pmImuGx = 0, pmImuGy = 0, pmImuGz = 0;
 int16_t pmImuTempRaw = 0;

 static int16_t pmImuRead16 () {
   int hi = Wire.read();
   int lo = Wire.read();
   return (int16_t)((hi << 8) | lo);
 }

 bool pmImuBegin () {
   if (pmImuReady) return true;
   Wire.setTimeOut(80);
   Wire.begin(PM_IMU_SDA, PM_IMU_SCL);
   for (int i = 0; i < 2; i++) {
     uint8_t addr = (i == 0) ? PM_MPU_ADDR0 : PM_MPU_ADDR1;
     Wire.beginTransmission(addr);
     Wire.write(0x6B);
     Wire.write(0x00);
     if (Wire.endTransmission() != 0) continue;
     delay(10);
     Wire.beginTransmission(addr);
     Wire.write(0x1C);
     Wire.write(0x00);
     Wire.endTransmission();
     Wire.beginTransmission(addr);
     Wire.write(0x1B);
     Wire.write(0x00);
     Wire.endTransmission();
     pmMpuAddr = addr;
     pmImuReady = true;
     return true;
   }
   return false;
 }

 bool pmImuRead () {
   if (!pmImuBegin()) return false;
   Wire.beginTransmission(pmMpuAddr);
   Wire.write(0x3B);
   if (Wire.endTransmission(false) != 0) {
     pmImuReady = false;
     return false;
   }
   if (Wire.requestFrom((int)pmMpuAddr, 14) < 14) return false;
   pmImuAx = pmImuRead16();
   pmImuAy = pmImuRead16();
   pmImuAz = pmImuRead16();
   pmImuTempRaw = pmImuRead16();
   pmImuGx = pmImuRead16();
   pmImuGy = pmImuRead16();
   pmImuGz = pmImuRead16();
   return true;
 }
 
 // ---- Motors MX1508 ----
 int pmLeftSpeed = 200;
 int pmRightSpeed = 200;
 bool pmMotorReady = false;
 // Runtime pins (defaults = V2 sheet). Remappable via CAR_MOVE / PM_MOTOR_PINS.
 int pmMotorAFwd = PM_MOTOR_A_FWD;
 int pmMotorARev = PM_MOTOR_A_REV;
 int pmMotorBFwd = PM_MOTOR_B_FWD;
 int pmMotorBRev = PM_MOTOR_B_REV;
 int8_t pmLedcChByPin[40];
 bool pmLedcChSetup[16];
 uint8_t pmNextLedcCh = 0;
 
 int pmLedcChannelForPin(int pin) {
   if (pin < 0 || pin >= 40) return 0;
   if (pmLedcChByPin[pin] < 0) {
     pmLedcChByPin[pin] = (int8_t)(pmNextLedcCh % 16);
     pmNextLedcCh++;
   }
   return pmLedcChByPin[pin];
 }
 
 void pmLedcAttachPin(int pin, int freq, int bits) {
   if (pin < 0 || pin >= 40) return;
 #if ESP_ARDUINO_VERSION_MAJOR >= 3
   ledcAttach(pin, freq, bits);
 #else
   int ch = pmLedcChannelForPin(pin);
   if (!pmLedcChSetup[ch]) {
     ledcSetup(ch, freq, bits);
     pmLedcChSetup[ch] = true;
   }
   ledcAttachPin(pin, ch);
 #endif
 }
 
 void pmLedcAttachPinOnChannel(int pin, int channel, int freq, int bits) {
   if (pin < 0 || pin >= 40) return;
   channel = constrain(channel, 0, 15);
   pmLedcChByPin[pin] = (int8_t)channel;
 #if ESP_ARDUINO_VERSION_MAJOR >= 3
   ledcAttachChannel(pin, freq, bits, channel);
 #else
   if (!pmLedcChSetup[channel]) {
     ledcSetup(channel, freq, bits);
     pmLedcChSetup[channel] = true;
   }
   ledcAttachPin(pin, channel);
 #endif
 }
 
 void pmLedcWritePin(int pin, int value) {
   if (pin < 0 || pin >= 40) return;
 #if ESP_ARDUINO_VERSION_MAJOR >= 3
   ledcWrite(pin, value);
 #else
   ledcWrite(pmLedcChannelForPin(pin), value);
 #endif
 }
 
 void pmLedcWriteTonePin(int pin, int freq) {
   if (pin < 0 || pin >= 40) return;
 #if ESP_ARDUINO_VERSION_MAJOR >= 3
   ledcWriteTone(pin, freq);
 #else
   ledcWriteTone(pmLedcChannelForPin(pin), freq);
 #endif
 }
 
 void pmLedcDetachPin(int pin) {
   if (pin < 0 || pin >= 40) return;
 #if ESP_ARDUINO_VERSION_MAJOR >= 3
   ledcDetach(pin);
 #else
   ledcDetachPin(pin);
 #endif
 }
 
 void pmSetMotorPins(int aFwd, int aRev, int bFwd, int bRev) {
   if (aFwd <= 0 || aRev <= 0 || bFwd <= 0 || bRev <= 0) return;
   if (pmMotorReady &&
       aFwd == pmMotorAFwd && aRev == pmMotorARev &&
       bFwd == pmMotorBFwd && bRev == pmMotorBRev) {
     return;
   }
   if (pmMotorReady) {
     pmLedcWritePin(pmMotorAFwd, 0);
     pmLedcWritePin(pmMotorARev, 0);
     pmLedcWritePin(pmMotorBFwd, 0);
     pmLedcWritePin(pmMotorBRev, 0);
     pmLedcDetachPin(pmMotorAFwd);
     pmLedcDetachPin(pmMotorARev);
     pmLedcDetachPin(pmMotorBFwd);
     pmLedcDetachPin(pmMotorBRev);
   }
   pmMotorAFwd = aFwd;
   pmMotorARev = aRev;
   pmMotorBFwd = bFwd;
   pmMotorBRev = bRev;
   pmMotorReady = false;
 }
 
 void pmMotorInit() {
   if (pmMotorReady) return;
   pmLedcAttachPin(pmMotorAFwd, 5000, 8);
   pmLedcAttachPin(pmMotorARev, 5000, 8);
   pmLedcAttachPin(pmMotorBFwd, 5000, 8);
   pmLedcAttachPin(pmMotorBRev, 5000, 8);
   pmMotorReady = true;
 }
 
 void pmLeftDrive(int dir, int spd) {
   pmMotorInit();
   spd = constrain(spd, 0, 255);
   // Zappie MX1508 board: REV GPIO = wheel forward (same as working serial sketch).
   // Dropdown swaps FWD/REV pins if that motor is soldered reversed.
   if (dir > 0) { pmLedcWritePin(pmMotorARev, spd); pmLedcWritePin(pmMotorAFwd, 0); }
   else if (dir < 0) { pmLedcWritePin(pmMotorAFwd, spd); pmLedcWritePin(pmMotorARev, 0); }
   else { pmLedcWritePin(pmMotorAFwd, 0); pmLedcWritePin(pmMotorARev, 0); }
 }
 
 void pmRightDrive(int dir, int spd) {
   pmMotorInit();
   spd = constrain(spd, 0, 255);
   if (dir > 0) { pmLedcWritePin(pmMotorBRev, spd); pmLedcWritePin(pmMotorBFwd, 0); }
   else if (dir < 0) { pmLedcWritePin(pmMotorBFwd, spd); pmLedcWritePin(pmMotorBRev, 0); }
   else { pmLedcWritePin(pmMotorBFwd, 0); pmLedcWritePin(pmMotorBRev, 0); }
 }
 
 void pmCarDir(const String &dir) {
   if (dir == "forward") {
     pmLeftDrive(1, pmLeftSpeed);
     pmRightDrive(1, pmRightSpeed);
   } else if (dir == "backward" || dir == "back") {
     pmLeftDrive(-1, pmLeftSpeed);
     pmRightDrive(-1, pmRightSpeed);
   } else if (dir == "left") {
     pmLeftDrive(-1, pmLeftSpeed);
     pmRightDrive(1, pmRightSpeed);
   } else if (dir == "right") {
     pmLeftDrive(1, pmLeftSpeed);
     pmRightDrive(-1, pmRightSpeed);
   } else {
     pmLeftDrive(0, 0);
     pmRightDrive(0, 0);
   }
 }
 
 // ---- Line sensors ----
 int pmLineThrL = PM_LINE_THR_L_DEF;
 int pmLineThrR = PM_LINE_THR_R_DEF;
 
 bool pmLineOnBlack(int pin, bool followBlack) {
   int v = (analogRead(pin) + analogRead(pin)) / 2;
   int thr = (pin == PM_LINE_LEFT) ? pmLineThrL : pmLineThrR;
   return followBlack ? (v < thr) : (v > thr);
 }
 
 // ---- Ultrasonic ----
 long pmUltrasonicCm(int trig, int echo) {
   if (trig <= 0) trig = PM_US_TRIG;
   if (echo <= 0) echo = PM_US_ECHO;
   pinMode(trig, OUTPUT);
   pinMode(echo, INPUT);
   digitalWrite(trig, LOW);
   delayMicroseconds(4);
   long best = 0;
   for (int i = 0; i < 3; i++) {
     digitalWrite(trig, LOW);
     delayMicroseconds(2);
     digitalWrite(trig, HIGH);
     delayMicroseconds(10);
     digitalWrite(trig, LOW);
     long dur = pulseIn(echo, HIGH, 25000);
     if (dur > 0) {
       long cm = dur / 58;
       if (cm >= 2 && cm < 400 && (best == 0 || cm < best)) best = cm;
     }
     delay(8);
   }
   return best;
 }
 
 // ---- Servo via LEDC (no ESP32Servo / esp32-hal-ledc.h) ----
 // 50 Hz, 16-bit. Pulse 500–2500 µs. Dedicated channels 14/15 so motor PWM
 // (5 kHz, 8-bit on channels 0–3) does not share an LEDC timer.
 #define PM_SERVO_FREQ_HZ  50
 #define PM_SERVO_BITS     16
 #define PM_SERVO_MIN_US   500
 #define PM_SERVO_MAX_US   2500
 #define PM_SERVO1_LEDC_CH 14
 #define PM_SERVO2_LEDC_CH 15
 
 bool pmServo14Attached = false;
 bool pmServo12Attached = false;
 
 static uint32_t pmServoDutyFromAngle(int angle) {
   angle = constrain(angle, 0, 180);
   uint32_t us = PM_SERVO_MIN_US +
       ((uint32_t)(PM_SERVO_MAX_US - PM_SERVO_MIN_US) * (uint32_t)angle) / 180UL;
   return (us * (1UL << PM_SERVO_BITS)) / 20000UL;
 }
 
 static void pmServoAttachPin(int pin, int channel) {
   pmLedcAttachPinOnChannel(pin, channel, PM_SERVO_FREQ_HZ, PM_SERVO_BITS);
 }
 
void pmServoWrite(int pin, int angle) {
  angle = constrain(angle, 0, 180);
  uint32_t duty = pmServoDutyFromAngle(angle);
  if (pin == PM_SERVO1) {
    if (!pmServo14Attached) {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
      ledcAttach(PM_SERVO1, PM_SERVO_FREQ_HZ, PM_SERVO_BITS);
#else
      pmServoAttachPin(PM_SERVO1, PM_SERVO1_LEDC_CH);
#endif
      pmServo14Attached = true;
    }
#if ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcWrite(PM_SERVO1, duty);
#else
    pmLedcWritePin(PM_SERVO1, (int)duty);
#endif
  } else if (pin == PM_SERVO2) {
    if (!pmServo12Attached) {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
      ledcAttach(PM_SERVO2, PM_SERVO_FREQ_HZ, PM_SERVO_BITS);
#else
      pmServoAttachPin(PM_SERVO2, PM_SERVO2_LEDC_CH);
#endif
      pmServo12Attached = true;
    }
#if ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcWrite(PM_SERVO2, duty);
#else
    pmLedcWritePin(PM_SERVO2, (int)duty);
#endif
  } else {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcAttach(pin, PM_SERVO_FREQ_HZ, PM_SERVO_BITS);
    ledcWrite(pin, duty);
#else
    pmLedcAttachPin(pin, PM_SERVO_FREQ_HZ, PM_SERVO_BITS);
    pmLedcWritePin(pin, (int)duty);
#endif
  }
}
 
 // ---- Buzzer tone ----
 bool pmI2sReady = false;

 void pmTone(int freq, int ms) {
   if (pmI2sReady) return;
   pmLedcAttachPin(PM_BUZZER, freq, 8);
   pmLedcWriteTonePin(PM_BUZZER, freq);
   if (ms > 0) {
     delay(ms);
     pmLedcWriteTonePin(PM_BUZZER, 0);
     pmLedcDetachPin(PM_BUZZER);
     digitalWrite(PM_BUZZER, LOW);
   }
 }
 
 bool handlePlainDiagnosticCommand(const char *line) {
   if (!line) return false;
   String cmd = String(line);
   cmd.trim();
   cmd.toUpperCase();
   // Serial Monitor tests: type PING or VERSION (any case) + Newline @ 115200.
   if (cmd == "PING" || cmd == "PM_PING" || cmd == "ZAPPIE?") {
     Serial.println("ZAPPIE_SERIAL_OK 115200");
     Serial.flush();
     return true;
   }
   if (cmd == "VERSION") {
     Serial.println("ZAPPIE_SERIAL_V1.0 FIRMATA_READY");
     Serial.flush();
     return true;
   }
   return false;
 }
 
 // ---- I2S mic (peak level) ----
 int pmI2sVoiceMin = PM_MIC_VOICE_MIN;
 int pmI2sSilenceMax = PM_MIC_SILENCE;
 int pmI2sGain = PM_MIC_GAIN;
 
 void pmMicBegin() {
   if (pmI2sReady) return;
#ifdef I2S_COMM_FORMAT_STAND_I2S
   const i2s_comm_format_t i2sFmt = I2S_COMM_FORMAT_STAND_I2S;
#else
   const i2s_comm_format_t i2sFmt = I2S_COMM_FORMAT_I2S;
#endif
   i2s_config_t cfg = {
     .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX | I2S_MODE_TX),
     .sample_rate = 16000,
     .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
     .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
     .communication_format = i2sFmt,
     .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
     .dma_buf_count = 8,
     .dma_buf_len = 64,
     .use_apll = false,
     .tx_desc_auto_clear = true,
     .fixed_mclk = 0
   };
#if ESP_ARDUINO_VERSION_MAJOR >= 3
   i2s_pin_config_t pins = {
     .mck_io_num = I2S_PIN_NO_CHANGE,
     .bck_io_num = PM_I2S_BCK,
     .ws_io_num = PM_I2S_WS,
     .data_out_num = PM_I2S_SPK,
     .data_in_num = PM_I2S_MIC
   };
#else
   i2s_pin_config_t pins = {
     .bck_io_num = PM_I2S_BCK,
     .ws_io_num = PM_I2S_WS,
     .data_out_num = PM_I2S_SPK,
     .data_in_num = PM_I2S_MIC
   };
#endif
   i2s_driver_install(I2S_NUM_0, &cfg, 0, NULL);
   i2s_set_pin(I2S_NUM_0, &pins);
   pmI2sReady = true;
 }
 
 int pmMicPeak() {
   pmMicBegin();
   int16_t buf[128];
   size_t n = 0;
   i2s_read(I2S_NUM_0, buf, sizeof(buf), &n, pdMS_TO_TICKS(30));
   int samples = n / 2;
   int16_t maxVal = 0;
   for (int i = 0; i < samples; i++) {
     int16_t v = abs(buf[i]);
     if (v > maxVal) maxVal = v;
   }
   return maxVal;
 }
 
 void pmMicPassOnce() {
   pmMicBegin();
   int16_t buf[256];
   size_t rd = 0, wr = 0;
   i2s_read(I2S_NUM_0, buf, sizeof(buf), &rd, pdMS_TO_TICKS(20));
   if (rd == 0) return;
   int samples = rd / 2;
   for (int i = 0; i < samples; i++) {
     int32_t v = (int32_t)buf[i] * pmI2sGain;
     if (v > 32767) v = 32767;
     if (v < -32768) v = -32768;
     buf[i] = (int16_t)v;
   }
   i2s_write(I2S_NUM_0, buf, rd, &wr, pdMS_TO_TICKS(20));
 }
 
 // ---- Dynamic sensor presets ----
 int pmSensorValue(const String &preset) {
   String key = preset;
   key.trim();
   key.toUpperCase();
   if (key.startsWith("LDR_")) {
     int pin = key.substring(4).toInt();
     if (pin > 0) return analogRead(pin);
   }
   if (key.startsWith("ADC_")) {
     int pin = key.substring(4).toInt();
     if (pin > 0) return analogRead(pin);
   }
   if (key.startsWith("TOUCH_")) {
     int pin = key.substring(6).toInt();
     if (pin > 0) return touchRead(pin);
   }
   if (key.startsWith("SOUND_") && key != "SOUND_A" && key != "SOUND_D") {
     int pin = key.substring(6).toInt();
     if (pin > 0) return analogRead(pin);
   }
   if (key == "LDR_L") return analogRead(PM_SERVO1);
   if (key == "LDR_R") return analogRead(13);
   if (key == "SOIL") return analogRead(33);
   if (key == "TOUCH") return touchRead(2);
   if (key == "LINE_35" || key == "LINE_L") return analogRead(PM_LINE_LEFT);
   if (key == "LINE_34" || key == "LINE_R") return analogRead(PM_LINE_RIGHT);
   if (key == "SOUND_A") return pmMicPeak();
   if (key == "BATTERY") return analogRead(PM_BATTERY_PIN);
   if (key == "IMU_AX" || key == "AX") { pmImuRead(); return pmImuAx; }
   if (key == "IMU_AY" || key == "AY") { pmImuRead(); return pmImuAy; }
   if (key == "IMU_AZ" || key == "AZ") { pmImuRead(); return pmImuAz; }
   if (key == "IMU_GX" || key == "GX") { pmImuRead(); return pmImuGx; }
   if (key == "IMU_GY" || key == "GY") { pmImuRead(); return pmImuGy; }
   if (key == "IMU_GZ" || key == "GZ") { pmImuRead(); return pmImuGz; }
   if (key == "IMU_TEMP") {
     pmImuRead();
     return (int)(pmImuTempRaw / 340.0 + 36.53);
   }
   return 0;
 }
 
 bool pmSensorActive(const String &preset) {
   String key = preset;
   key.trim();
   key.toUpperCase();
   if (key == "LINE_35" || key == "LINE_L") return analogRead(PM_LINE_LEFT) < pmLineThrL;
   if (key == "LINE_34" || key == "LINE_R") return analogRead(PM_LINE_RIGHT) < pmLineThrR;
   if (key == "SOUND_D" || key == "SOUND_A") return pmMicPeak() > pmI2sVoiceMin;
   if (key.startsWith("SOUND_")) {
     int pin = key.substring(6).toInt();
     if (pin > 0) return analogRead(pin) > PM_SOUND_ANA_THR;
   }
   if (key.startsWith("ADC_")) {
     int pin = key.substring(4).toInt();
     if (pin > 0) return analogRead(pin) > PM_SOUND_ANA_THR;
   }
   if (key.startsWith("DLOW_")) {
     int pin = key.substring(5).toInt();
     if (pin > 0) {
       pinMode(pin, INPUT_PULLUP);
       return digitalRead(pin) == LOW;
     }
   }
   if (key.startsWith("DHIGH_")) {
     int pin = key.substring(6).toInt();
     if (pin > 0) {
       pinMode(pin, INPUT);
       return digitalRead(pin) == HIGH;
     }
   }
   if (key.startsWith("TOUCH_")) {
     int pin = key.substring(6).toInt();
     if (pin > 0) return touchRead(pin) < PM_TOUCH_THR;
   }
   if (key == "FLAME") {
     pinMode(2, INPUT_PULLUP);
     return digitalRead(2) == LOW;
   }
   if (key == "VIBRATION") {
     pinMode(PM_VIBRATION_PIN, INPUT_PULLUP);
     return digitalRead(PM_VIBRATION_PIN) == LOW;
   }
   if (key == "TOUCH") return touchRead(2) < PM_TOUCH_THR;
   return false;
 }
 
 bool pmLineFollowRun = false;
 bool pmLineAvoidRun = false;
 bool pmAvoidRun = false;
 bool pmLightFollowRun = false;
 bool pmMicPassRun = false;
 int pmLineAvoidCm = 20;
 int pmAvoidCm = 20;
 int pmLightThr = 300;
 int pmLightMin = 200;
 float pmLightCorr = 3;
 String pmLineFollowColor = "black";

 static void pmStopAutoModes() {
   pmLineFollowRun = false;
   pmLineAvoidRun = false;
   pmAvoidRun = false;
   pmLightFollowRun = false;
 }

 void pmPidLineStep(const String &color, float kp) {
   (void)kp;
   pmLineFollowColor = color;
   bool followBlack = (color != "white");
   bool leftOn = pmLineOnBlack(PM_LINE_LEFT, followBlack);
   bool rightOn = pmLineOnBlack(PM_LINE_RIGHT, followBlack);
   if (leftOn && rightOn) {
     pmCarDir("forward");
   } else if (leftOn && !rightOn) {
     pmLeftDrive(0, 0);
     pmRightDrive(1, pmRightSpeed);
   } else if (!leftOn && rightOn) {
     pmLeftDrive(1, pmLeftSpeed);
     pmRightDrive(0, 0);
   } else {
     pmCarDir("stop");
   }
   delay(5);
 }

 static long pmUsOpenCm() {
   long d = pmUltrasonicCm(PM_US_TRIG, PM_US_ECHO);
   if (d <= 0 || d >= 999) return 400;
   return d;
 }

 static bool pmPathBlocked(int safeCm) {
   return pmUsOpenCm() <= safeCm;
 }

 static void pmDelayPump(unsigned long ms) {
   delay(ms);
 }

 void pmAvoidThink(int safeCm) {
   if (safeCm < 5) safeCm = 5;
   pmCarDir("stop");
   pmDelayPump(80);
   pmCarDir("backward");
   pmDelayPump(250);
   pmCarDir("stop");
   pmDelayPump(40);
   long rightDist;
   pmCarDir("right");
   pmDelayPump(280);
   pmCarDir("stop");
   pmDelayPump(40);
   rightDist = pmUsOpenCm();
   pmCarDir("left");
   pmDelayPump(560);
   pmCarDir("stop");
   pmDelayPump(40);
   long leftDist = pmUsOpenCm();
   pmCarDir("right");
   pmDelayPump(280);
   pmCarDir("stop");
   if (leftDist > safeCm && leftDist >= rightDist) {
     pmCarDir("left");
     pmDelayPump(280);
   } else if (rightDist > safeCm) {
     pmCarDir("right");
     pmDelayPump(280);
   } else {
     pmCarDir("backward");
     pmDelayPump(300);
   }
   pmCarDir("forward");
   pmDelayPump(120);
 }

 void pmAvoidObstacle(int safeCm) {
   static bool busy = false;
   if (busy) return;
   busy = true;
   if (safeCm < 5) safeCm = 5;
   if (!pmPathBlocked(safeCm)) {
     pmCarDir("forward");
     pmDelayPump(40);
   } else {
     pmAvoidThink(safeCm);
   }
   busy = false;
 }

 void pmLineAvoidStep(const String &color, float kp, int safeCm) {
   if (pmPathBlocked(safeCm)) {
     pmAvoidThink(safeCm);
     return;
   }
   pmPidLineStep(color, kp);
 }

 void pmFollowLight(int thr, int minLight, float corr) {
   int leftVal = analogRead(PM_SERVO1);
   int rightVal = (int)(analogRead(13) * corr);
   if (leftVal < minLight && rightVal < minLight) {
     pmCarDir("stop");
     delay(60);
     return;
   }
   int diff = leftVal - rightVal;
   if (abs(diff) <= thr) pmCarDir("forward");
   else if (diff > thr) {
     pmLeftDrive(0, 0);
     pmRightDrive(1, pmRightSpeed);
   } else {
     pmLeftDrive(1, pmLeftSpeed);
     pmRightDrive(0, 0);
   }
   delay(60);
 }
 
 // ---- Buttons (GPIO 36/39 are ESP32 input-only pins with no internal pull
// resistor, so pinMode(INPUT_PULLUP) is a no-op there — the board must supply
// an external pull-up. Debounce by requiring a consistent read across several
// closely-spaced samples so contact bounce / line noise near the press/release
// edge doesn't get reported as a spurious state.) ----
bool pmButtonPressed(int pin) {
  pinMode(pin, INPUT);
  delayMicroseconds(80);
  int d = digitalRead(pin);
  int a = analogRead(pin);
  return (d == LOW) || (a < 800);
}

// ---- Serial port helpers (Firmata string protocol) ----
 HardwareSerial *pmSerialPort(int port) {
   if (port == 0) return &Serial;
   if (port == 2) return &Serial2;
   return &Serial;
 }
 
 // ---- Blockzie-compatible pin commands (intermediateKit realtime) ----
 void handleBlockzieCommand(String cmd) {
   cmd.trim();
   if (cmd.startsWith("SET_PIN_MODE ")) {
     int pin;
     char mode[20] = {0};
     sscanf(cmd.c_str(), "SET_PIN_MODE %d %19s", &pin, mode);
     if (strcmp(mode, "OUTPUT") == 0) pinMode(pin, OUTPUT);
     else if (strcmp(mode, "INPUT_PULLUP") == 0) pinMode(pin, INPUT_PULLUP);
     else pinMode(pin, INPUT);
     sendResponse("OK");
   } else if (cmd.startsWith("SET_DIGITAL_OUTPUT ")) {
     String rest = cmd.substring(19);
     rest.trim();
     while (rest.length() > 0) {
       int pin;
       char level[8] = {0};
       int consumed = 0;
       if (sscanf(rest.c_str(), "%d %7s%n", &pin, level, &consumed) >= 2) {
         pinMode(pin, OUTPUT);
         digitalWrite(pin, (strcmp(level, "HIGH") == 0) ? HIGH : LOW);
         rest = rest.substring(consumed);
         rest.trim();
       } else break;
     }
     sendResponse("OK");
   } else if (cmd.startsWith("SET_PWM_OUTPUT ")) {
     int pin = 0, ch = 0, val = 0;
     int n = sscanf(cmd.c_str(), "SET_PWM_OUTPUT %d %d %d", &pin, &ch, &val);
     if (n < 3) {
       sscanf(cmd.c_str(), "SET_PWM_OUTPUT %d %d", &pin, &val);
       ch = pmLedcChannelForPin(pin);
     }
     pmLedcAttachPinOnChannel(pin, ch, 5000, 8);
     pmLedcWritePin(pin, constrain(val, 0, 255));
     sendResponse("OK");
   } else if (cmd.startsWith("SET_SERVO_OUTPUT ")) {
     int pin, angle;
     sscanf(cmd.c_str(), "SET_SERVO_OUTPUT %d %d", &pin, &angle);
     pmServoWrite(pin, angle);
     sendResponse("OK");
   } else if (cmd.startsWith("SMOOTH_SERVO")) {
     int pin, fromAng, toAng, stepMs;
     if (sscanf(cmd.c_str(), "SMOOTH_SERVO %d %d %d %d", &pin, &fromAng, &toAng, &stepMs) == 4) {
       fromAng = constrain(fromAng, 0, 180);
       toAng = constrain(toAng, 0, 180);
       stepMs = constrain(stepMs, 1, 200);
       int dir = (toAng >= fromAng) ? 1 : -1;
       for (int a = fromAng; a != toAng; a += dir) {
         pmServoWrite(pin, a);
         delay(stepMs);
       }
       pmServoWrite(pin, toAng);
     }
     sendResponse("OK");
   } else if (cmd.startsWith("READ_DIGITAL_PIN ")) {
     int pin = cmd.substring(17).toInt();
     pinMode(pin, INPUT);
     sendResponse(digitalRead(pin) == HIGH ? "1" : "0");
   } else if (cmd.startsWith("READ_ANALOG ")) {
     int pin = cmd.substring(12).toInt();
     sendResponse(String(analogRead(pin)));
   } else if (cmd.startsWith("LEDMATRIX_INIT ")) {
     int pin, num, brt;
     sscanf(cmd.c_str(), "LEDMATRIX_INIT %d %d %d", &pin, &num, &brt);
     pmFaceBegin();
     pmFace.setBrightness(constrain(brt, 0, 255));
     pmFace.clear();
     pmFace.show();
     sendResponse("OK");
   } else if (cmd == "LEDMATRIX_CLEAR") {
     pmFaceBegin();
     pmFace.clear();
     pmFace.show();
     sendResponse("OK");
   } else if (cmd.startsWith("LEDMATRIX_CUSTOM ")) {
     String pat = cmd.substring(17);
     pat.trim();
     char buf[PM_FACE_LEDS + 1];
     int n = pat.length();
     for (int i = 0; i < PM_FACE_LEDS; i++) buf[i] = (i < n) ? pat.charAt(i) : '0';
     buf[PM_FACE_LEDS] = '\0';
     pmFaceDrawFullPattern(buf);
     sendResponse("OK");
   } else if (cmd.startsWith("ULTRASONIC_READ ") || cmd.startsWith("US ")) {
     int trig = 0, echo = 0, inch = 0;
     if (cmd.startsWith("US ")) {
       sscanf(cmd.c_str(), "US %d %d", &trig, &echo);
     } else {
       sscanf(cmd.c_str(), "ULTRASONIC_READ %d %d %d", &trig, &echo, &inch);
     }
     if (trig <= 0) trig = PM_US_TRIG;
     if (echo <= 0) echo = PM_US_ECHO;
     long cm = pmUltrasonicCm(trig, echo);
     sendResponse(String(cm));
   } else if (cmd.startsWith("READ_TOUCH_PIN ")) {
     int pin = cmd.substring(15).toInt();
     sendResponse(String(touchRead(pin)));
   } else {
     sendErr("UNKNOWN_BLOCKZIE");
   }
 }
 
 void handleSerialCommand(String cmd) {
   if (cmd.startsWith("SERIAL_BEGIN ")) {
     int port, baud;
     sscanf(cmd.c_str(), "SERIAL_BEGIN %d %d", &port, &baud);
     // Serial0 is reserved for Blockzie realtime transport.
     if (port == 0) sendErr("SERIAL0_RESERVED");
     else {
       pmSerialPort(port)->begin(baud);
       sendResponse("OK");
     }
   } else if (cmd.startsWith("SERIAL_PRINT ")) {
     // SERIAL_PRINT <port> <text> <eol>
     int port;
     int sp1 = cmd.indexOf(' ', 13);
     if (sp1 > 0) {
       port = cmd.substring(13, sp1).toInt();
       int sp2 = cmd.lastIndexOf(' ');
       String text = cmd.substring(sp1 + 1, sp2);
       String eolStr = cmd.substring(sp2 + 1);
       if (port == 0) sendErr("SERIAL0_RESERVED");
       else {
         pmSerialPort(port)->print(text);
         if (eolStr == "warp") pmSerialPort(port)->println();
         sendResponse("OK");
         return;
       }
     }
     if (sp1 <= 0) sendErr("BAD_SERIAL_PRINT");
   } else if (cmd.startsWith("SERIAL_AVAILABLE ")) {
     int port = cmd.substring(17).toInt();
     if (port == 0) sendErr("SERIAL0_RESERVED");
     else sendResponse(String(pmSerialPort(port)->available()));
   } else if (cmd.startsWith("SERIAL_READ_BYTE ")) {
     int port = cmd.substring(17).toInt();
     if (port == 0) {
       sendErr("SERIAL0_RESERVED");
     } else if (pmSerialPort(port)->available() > 0) {
       sendResponse(String(pmSerialPort(port)->read()));
     } else {
       sendResponse("-1");
     }
   } else if (cmd.startsWith("SERIAL_READ_STRING ")) {
     int port = cmd.substring(19).toInt();
     if (port == 0) {
       sendErr("SERIAL0_RESERVED");
     } else {
       String s = "";
       while (pmSerialPort(port)->available()) {
         s += (char)pmSerialPort(port)->read();
       }
       sendResponse(s);
     }
   } else {
     sendErr("UNKNOWN_SERIAL");
   }
 }
 
 // ---- String command parser ----
 bool isZappieAliasCommand(const String &cmd) {
   return cmd.startsWith("CAR_MOVE ") ||
          cmd.startsWith("MP ") ||
          cmd.startsWith("SET_MOTOR_SPEED ") ||
          cmd.startsWith("SET_MOTOR_PINS ") ||
          cmd.startsWith("PID_LINE_STEP ") ||
          cmd.startsWith("AVOID_OBSTACLE ") ||
          cmd.startsWith("LINE_AVOID_STEP ") ||
          cmd.startsWith("FOLLOW_LIGHT ") ||
          cmd.startsWith("SENSOR_VALUE ") ||
          cmd.startsWith("SENSOR_ACTIVE ") ||
          cmd.startsWith("SET_LINE_THRESHOLD ") ||
          cmd.startsWith("LINE_CALIBRATE ") ||
          cmd.startsWith("LINE_LEFT_ON ") ||
          cmd.startsWith("LINE_RIGHT_ON ") ||
          cmd.startsWith("FACE_PIXEL ") ||
          cmd.startsWith("FACE_ROW ") ||
          cmd == "FACE_SHOW" ||
          cmd == "FACE_TEST_ALL" ||
          cmd.startsWith("FACE_LETTER ") ||
          cmd.startsWith("FACE_SCROLL_TEXT ") ||
          cmd.startsWith("FACE_DRAW_PATTERN ") ||
          cmd.startsWith("BUTTON_READ ") ||
          cmd.startsWith("TOUCH_READ ") ||
          cmd == "MIC_INIT" ||
          cmd == "MIC_PASS" ||
          cmd.startsWith("MIC_GAIN ") ||
          cmd.startsWith("MIC_VOICE ") ||
          cmd.startsWith("MIC_SILENCE ") ||
          cmd == "MIC_LEVEL" ||
          cmd.startsWith("TONE_PLAY ") ||
          cmd == "BEEP" ||
          cmd == "SPEAK" ||
          cmd.startsWith("BT_SPEAKER_START ") ||
          cmd == "OLED_INIT" ||
          cmd == "OLED_CLEAR" ||
          cmd.startsWith("OLED_PRINT ") ||
          cmd.startsWith("OLED_TEXT ") ||
          cmd == "IMU_INIT" ||
          cmd == "IMU_READ" ||
          cmd.startsWith("IMU_ACCEL") ||
          cmd.startsWith("IMU_GYRO") ||
          cmd.startsWith("SMOOTH_SERVO") ||
          cmd.startsWith("PM_SS ");
 }
 
 void normalizeZappieAlias(String &cmd) {
   if (cmd.startsWith("CAR_MOVE ")) cmd = "PM_CAR " + cmd.substring(9);
   else if (cmd.startsWith("MP ")) cmd = "PM_MOTOR_PINS " + cmd.substring(3);
   else if (cmd.startsWith("SET_MOTOR_SPEED ")) cmd = "PM_SPEED " + cmd.substring(16);
   else if (cmd.startsWith("SET_MOTOR_PINS ")) cmd = "PM_MOTOR_PINS " + cmd.substring(15);
   else if (cmd.startsWith("PID_LINE_STEP ")) cmd = "PM_PID_LINE " + cmd.substring(14);
   else if (cmd.startsWith("AVOID_OBSTACLE ")) cmd = "PM_AVOID " + cmd.substring(15);
   else if (cmd.startsWith("LINE_AVOID_STEP ")) cmd = "PM_LINE_AVOID " + cmd.substring(16);
   else if (cmd.startsWith("FOLLOW_LIGHT ")) cmd = "PM_FOLLOW_LIGHT " + cmd.substring(13);
   else if (cmd.startsWith("SENSOR_VALUE ")) cmd = "PM_SENSOR_VAL " + cmd.substring(13);
   else if (cmd.startsWith("SENSOR_ACTIVE ")) cmd = "PM_SENSOR_ACT " + cmd.substring(14);
   else if (cmd.startsWith("SET_LINE_THRESHOLD ")) cmd = "PM_LINE_THR " + cmd.substring(19);
   else if (cmd.startsWith("LINE_CALIBRATE ")) cmd = "PM_LINE_CAL " + cmd.substring(15);
   else if (cmd.startsWith("LINE_LEFT_ON ")) cmd = "PM_LINE_LEFT " + cmd.substring(13);
   else if (cmd.startsWith("LINE_RIGHT_ON ")) cmd = "PM_LINE_RIGHT " + cmd.substring(14);
   else if (cmd.startsWith("FACE_PIXEL ")) cmd = "PM_FACE_PIX " + cmd.substring(11);
   else if (cmd.startsWith("FACE_ROW ")) cmd = "PM_FACE_ROW " + cmd.substring(9);
   else if (cmd == "FACE_SHOW") cmd = "PM_FACE_SHOW";
   else if (cmd == "FACE_TEST_ALL") cmd = "PM_FACE_TEST_ALL";
   else if (cmd.startsWith("FACE_LETTER ")) cmd = "PM_FACE_LETTER " + cmd.substring(12);
   else if (cmd.startsWith("FACE_SCROLL_TEXT ")) cmd = "PM_FACE_SCROLL_TEXT " + cmd.substring(17);
   else if (cmd.startsWith("FACE_DRAW_PATTERN ")) cmd = "PM_FACE_PATTERN " + cmd.substring(18);
   else if (cmd.startsWith("BUTTON_READ ")) cmd = "PM_BTN " + cmd.substring(12);
   else if (cmd.startsWith("TOUCH_READ ")) cmd = "PM_TOUCH " + cmd.substring(11);
   else if (cmd == "MIC_INIT") cmd = "PM_MIC_INIT";
   else if (cmd == "MIC_PASS") cmd = "PM_MIC_PASS";
   else if (cmd.startsWith("MIC_GAIN ")) cmd = "PM_MIC_GAIN " + cmd.substring(9);
   else if (cmd.startsWith("MIC_VOICE ")) cmd = "PM_MIC_VOICE " + cmd.substring(10);
   else if (cmd.startsWith("MIC_SILENCE ")) cmd = "PM_MIC_SILENCE " + cmd.substring(12);
   else if (cmd == "MIC_LEVEL") cmd = "PM_MIC_LEVEL";
   else if (cmd.startsWith("TONE_PLAY ")) cmd = "PM_TONE " + cmd.substring(10);
   else if (cmd == "BEEP") cmd = "PM_TONE 440 200";
   else if (cmd == "SPEAK") cmd = "PM_SPEAK";
   else if (cmd.startsWith("BT_SPEAKER_START ")) cmd = "PM_BT_SPEAKER " + cmd.substring(17);
   else if (cmd == "OLED_INIT") cmd = "PM_OLED_INIT";
   else if (cmd == "OLED_CLEAR") cmd = "PM_OLED_CLEAR";
   else if (cmd.startsWith("OLED_PRINT ")) cmd = "PM_OLED_PRINT " + cmd.substring(11);
   else if (cmd.startsWith("OLED_TEXT ")) cmd = "PM_OLED " + cmd.substring(10);
   else if (cmd == "IMU_INIT") cmd = "PM_IMU_INIT";
   else if (cmd == "IMU_READ") cmd = "PM_IMU_READ";
   else if (cmd.startsWith("IMU_ACCEL")) cmd = "PM_IMU_ACCEL";
   else if (cmd.startsWith("IMU_GYRO")) cmd = "PM_IMU_GYRO";
   else if (cmd.startsWith("SMOOTH_SERVO ")) cmd = "PM_SS " + cmd.substring(13);
 }
 
 void handleZappieCommand(String cmd) {
   cmd.trim();
   normalizeZappieAlias(cmd);
   if (cmd.length() == 0) {
     sendErr("EMPTY_PM");
     return;
   }
 
   if (cmd.startsWith("PM_CAR ")) {
     // Formats: "PM_CAR forward" OR "PM_CAR forward 27 25 26 32"
     String rest = cmd.substring(7);
     rest.trim();
     int sp = rest.indexOf(' ');
     String dir = (sp < 0) ? rest : rest.substring(0, sp);
     dir.trim();
     if (sp > 0) {
       String pins = rest.substring(sp + 1);
       pins.trim();
       int a1 = 0, a2 = 0, b1 = 0, b2 = 0;
       if (sscanf(pins.c_str(), "%d %d %d %d", &a1, &a2, &b1, &b2) == 4) {
         pmSetMotorPins(a1, a2, b1, b2);
       }
     }
     if (dir.length() > 0) {
       pmStopAutoModes();
       pmCarDir(dir);
       sendResponse("OK");
     } else {
       sendErr("BAD_PM_CAR");
     }
   } else if (cmd.startsWith("PM_MOTOR_PINS ") || cmd.startsWith("SET_MOTOR_PINS ")) {
     int a1, a2, b1, b2;
     const char *p = cmd.startsWith("SET_") ? cmd.c_str() + 15 : cmd.c_str() + 14;
     if (sscanf(p, "%d %d %d %d", &a1, &a2, &b1, &b2) == 4) {
       pmSetMotorPins(a1, a2, b1, b2);
       sendResponse("OK");
     } else {
       sendErr("BAD_MOTOR_PINS");
     }
   } else if (cmd.startsWith("PM_SPEED ") || cmd.startsWith("SET_MOTOR_SPEED ")) {
     int l = 0, r = 0;
     if (cmd.startsWith("SET_MOTOR_SPEED ")) {
       sscanf(cmd.c_str(), "SET_MOTOR_SPEED %d %d", &l, &r);
     } else {
       sscanf(cmd.c_str(), "PM_SPEED %d %d", &l, &r);
     }
     pmLeftSpeed = constrain(l, 0, 255);
     pmRightSpeed = constrain(r, 0, 255);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_PID_LINE ")) {
     String color = cmd.substring(12);
     int sp = color.indexOf(' ');
     float kp = 15;
     if (sp > 0) {
       kp = color.substring(sp + 1).toFloat();
       color = color.substring(0, sp);
     }
     pmStopAutoModes();
     pmPidLineStep(color, kp);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_AVOID ")) {
     int cm = cmd.substring(9).toInt();
     if (cm <= 0) cm = 20;
     pmStopAutoModes();
     pmAvoidCm = cm;
     pmAvoidObstacle(cm);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_LINE_AVOID ")) {
     String rest = cmd.substring(14);
     rest.trim();
     int sp = rest.indexOf(' ');
     String color = rest;
     int avcm = 20;
     if (sp > 0) {
       color = rest.substring(0, sp);
       avcm = rest.substring(sp + 1).toInt();
       if (avcm <= 0) avcm = 20;
     }
     pmStopAutoModes();
     pmLineAvoidRun = true;
     pmLineFollowColor = color;
     pmLineAvoidCm = avcm;
     pmLineAvoidStep(color, 15, avcm);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FOLLOW_LIGHT ")) {
     int thr, minL;
     float corr;
     sscanf(cmd.c_str(), "PM_FOLLOW_LIGHT %d %d %f", &thr, &minL, &corr);
     pmStopAutoModes();
     pmLightFollowRun = true;
     pmLightThr = thr;
     pmLightMin = minL;
     pmLightCorr = corr;
     pmFollowLight(thr, minL, corr);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_SENSOR_VAL ")) {
     sendResponse(String(pmSensorValue(cmd.substring(14))));
   } else if (cmd.startsWith("PM_SENSOR_ACT ")) {
     sendResponse(pmSensorActive(cmd.substring(14)) ? "1" : "0");
   } else if (cmd.startsWith("PM_LINE_THR ")) {
     sscanf(cmd.c_str(), "PM_LINE_THR %d %d", &pmLineThrL, &pmLineThrR);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_LINE_CAL ")) {
     int sec = cmd.substring(12).toInt();
     unsigned long end = millis() + (unsigned long)sec * 1000UL;
     int minL = 4095, maxL = 0, minR = 4095, maxR = 0;
     while (millis() < end) {
       int l = analogRead(PM_LINE_LEFT);
       int r = analogRead(PM_LINE_RIGHT);
       if (l < minL) minL = l;
       if (l > maxL) maxL = l;
       if (r < minR) minR = r;
       if (r > maxR) maxR = r;
       processSerialInput();
       delay(20);
     }
     pmLineThrL = (minL + maxL) / 2;
     pmLineThrR = (minR + maxR) / 2;
     sendResponse("OK");
   } else if (cmd.startsWith("PM_LINE_LEFT ")) {
     bool black = (cmd.substring(13) != "white");
     sendResponse(pmLineOnBlack(PM_LINE_LEFT, black) ? "1" : "0");
   } else if (cmd.startsWith("PM_LINE_RIGHT ")) {
     bool black = (cmd.substring(14) != "white");
     sendResponse(pmLineOnBlack(PM_LINE_RIGHT, black) ? "1" : "0");
   } else if (cmd == "PM_FACE_INIT") {
     pmFaceBegin();
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_EMOJI ")) {
     String em = cmd.substring(14);
     pmFaceDrawPattern(pmEmojiPattern(em), pmEmojiColor(em));
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_DIGIT ")) {
     pmFaceShowDigit(cmd.substring(14).toInt());
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_PATTERN ")) {
     String pat = cmd.substring(17);
     pat.trim();
     char buf[PM_FACE_LEDS + 1];
     int n = pat.length();
     for (int i = 0; i < PM_FACE_LEDS; i++) buf[i] = (i < n) ? pat.charAt(i) : '0';
     buf[PM_FACE_LEDS] = '\0';
     pmFaceDrawFullPattern(buf);
     sendResponse("OK");
   } else if (cmd == "PM_FACE_CLEAR") {
     pmFaceBegin();
     pmFace.clear();
     pmFace.show();
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_BRT ")) {
     pmFaceBegin();
     pmFace.setBrightness(constrain(cmd.substring(12).toInt(), 0, 255));
     pmFace.show();
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_PIX ")) {
     int x, y, r, g, b;
     sscanf(cmd.c_str(), "PM_FACE_PIX %d %d %d %d %d", &x, &y, &r, &g, &b);
     pmFaceBegin();
     int idx = pmFaceIndex(y, x);
     if (idx >= 0) {
       pmFace.setPixelColor(idx, pmFace.Color(r, g, b));
       pmFace.show();
     }
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_ROW ")) {
     int row, r, g, b;
     sscanf(cmd.c_str(), "PM_FACE_ROW %d %d %d %d", &row, &r, &g, &b);
     pmFaceBegin();
     uint32_t c = pmFace.Color(r, g, b);
     for (int col = 0; col < PM_FACE_COLS; col++) {
       int idx = pmFaceIndex(row, col);
       if (idx >= 0) pmFace.setPixelColor(idx, c);
     }
     pmFace.show();
     sendResponse("OK");
   } else if (cmd == "PM_FACE_SHOW") {
     pmFace.show();
     sendResponse("OK");
   } else if (cmd == "PM_FACE_TEST_ALL") {
     pmFaceBegin();
     for (int i = 0; i < PM_FACE_LEDS; i++) {
       pmFace.setPixelColor(i, pmFace.Color(0, 80, 255));
     }
     pmFace.show();
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_LETTER ")) {
     String letter = cmd.substring(15);
     letter.trim();
     char ch = (letter.length() > 0) ? letter.charAt(0) : 'A';
     pmFaceShowLetter(ch);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_FACE_SCROLL_TEXT ")) {
     // PM_FACE_SCROLL_TEXT <ms> <color> <text...>  (letters + digits)
     String rest = cmd.substring(20);
     rest.trim();
     int sp1 = rest.indexOf(' ');
     if (sp1 < 0) {
       sendErr("BAD_SCROLL");
     } else {
       int speedMs = rest.substring(0, sp1).toInt();
       String rest2 = rest.substring(sp1 + 1);
       rest2.trim();
       int sp2 = rest2.indexOf(' ');
       String color = (sp2 < 0) ? rest2 : rest2.substring(0, sp2);
       String text = (sp2 < 0) ? "" : rest2.substring(sp2 + 1);
       color.trim();
       text.trim();
       pmFaceScrollText(text, color, speedMs);
       sendResponse("OK");
     }
   } else if (cmd == "PM_BTN LEFT") {
     sendResponse(pmButtonPressed(PM_BTN_LEFT) ? "1" : "0");
   } else if (cmd == "PM_BTN RIGHT") {
     sendResponse(pmButtonPressed(PM_BTN_RIGHT) ? "1" : "0");
   } else if (cmd == "PM_BTN BOTH") {
     sendResponse((pmButtonPressed(PM_BTN_LEFT) && pmButtonPressed(PM_BTN_RIGHT)) ? "1" : "0");
   } else if (cmd == "PM_MIC_INIT") {
     pmMicBegin();
     sendResponse("OK");
   } else if (cmd == "PM_MIC_PASS") {
     pmMicPassRun = true;
     pmMicPassOnce();
     sendResponse("OK");
   } else if (cmd.startsWith("PM_MIC_GAIN ")) {
     pmI2sGain = cmd.substring(11).toInt();
     sendResponse("OK");
   } else if (cmd.startsWith("PM_MIC_VOICE ")) {
     pmI2sVoiceMin = cmd.substring(13).toInt();
     sendResponse("OK");
   } else if (cmd.startsWith("PM_MIC_SILENCE ")) {
     pmI2sSilenceMax = cmd.substring(15).toInt();
     sendResponse("OK");
   } else if (cmd == "PM_MIC_LEVEL") {
     sendResponse(String(pmMicPeak()));
   } else if (cmd.startsWith("PM_TONE ")) {
     int freq, ms;
     sscanf(cmd.c_str(), "PM_TONE %d %d", &freq, &ms);
     pmTone(freq, ms);
     sendResponse("OK");
   } else if (cmd == "PM_SPEAK") {
     pmTone(880, 90);
     delay(40);
     pmTone(1175, 120);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_BT_SPEAKER ")) {
 #if PM_HAS_A2DP
     if (!pmA2dpStarted) {
       String name = cmd.substring(14);
       name.trim();
       if (name.length() == 0) name = "MyMusic";
       i2s_pin_config_t pin_config = {
         .bck_io_num = PM_I2S_BCK,
         .ws_io_num = PM_I2S_WS,
         .data_out_num = PM_I2S_SPK,
         .data_in_num = I2S_PIN_NO_CHANGE
       };
       pmA2dpSink.set_pin_config(pin_config);
       pmA2dpSink.start(name.c_str());
       pmA2dpStarted = true;
     }
     sendResponse("OK");
 #else
     sendErr("A2DP_LIB_MISSING");
 #endif
   } else if (cmd.startsWith("PM_SERVO ")) {
     int pin, angle;
     sscanf(cmd.c_str(), "PM_SERVO %d %d", &pin, &angle);
     pmServoWrite(pin, angle);
     sendResponse("OK");
   } else if (cmd.startsWith("PM_SS ")) {
     int pin, fromAng, toAng, stepMs;
     if (sscanf(cmd.c_str(), "PM_SS %d %d %d %d", &pin, &fromAng, &toAng, &stepMs) == 4) {
       fromAng = constrain(fromAng, 0, 180);
       toAng = constrain(toAng, 0, 180);
       stepMs = constrain(stepMs, 1, 200);
       int dir = (toAng >= fromAng) ? 1 : -1;
       for (int a = fromAng; a != toAng; a += dir) {
         pmServoWrite(pin, a);
         delay(stepMs);
       }
       pmServoWrite(pin, toAng);
     }
     sendResponse("OK");
   } else if (cmd.startsWith("PM_US ")) {
     int trig, echo;
     sscanf(cmd.c_str(), "PM_US %d %d", &trig, &echo);
     sendResponse(String(pmUltrasonicCm(trig, echo)));
   } else if (cmd.startsWith("PM_TOUCH ")) {
     int pin = cmd.substring(9).toInt();
     sendResponse(String(touchRead(pin)));
   } else if (cmd == "PM_OLED_INIT") {
     sendResponse(pmOledBegin() ? "OK" : "OK:NO_OLED");
   } else if (cmd == "PM_OLED_CLEAR") {
     pmOledClear();
     sendResponse(pmOledReady ? "OK" : "OK:NO_OLED");
   } else if (cmd.startsWith("PM_OLED_PRINT ")) {
     int size, x, y;
     char colorHex[16] = {0};
     const char *p = cmd.c_str() + 14;
     int consumed = 0;
     if (sscanf(p, "%d %d %d %15s%n", &size, &x, &y, colorHex, &consumed) >= 4) {
       String text = String(p + consumed);
       text.trim();
       pmOledPrint(text, size, x, y, colorHex);
       sendResponse(pmOledReady ? "OK" : "OK:NO_OLED");
     } else {
       sendErr("BAD_OLED_PRINT");
     }
   } else if (cmd.startsWith("PM_OLED ")) {
     String text = cmd.substring(8);
     text.trim();
     pmOledPrint(text, 2, 10, 20, "FFFFFF");
     sendResponse(pmOledReady ? "OK" : "OK:NO_OLED");
   } else if (cmd == "PM_IMU_INIT") {
     sendResponse(pmImuBegin() ? "OK" : "ERR:NO_IMU");
   } else if (cmd == "PM_IMU_READ") {
     sendResponse(pmImuRead() ? "OK" : "ERR:NO_IMU");
   } else if (cmd == "PM_IMU_ACCEL") {
     if (!pmImuRead()) sendErr("NO_IMU");
     else sendResponse(String("IMU_A,") + pmImuAx + "," + pmImuAy + "," + pmImuAz);
   } else if (cmd == "PM_IMU_GYRO") {
     if (!pmImuRead()) sendErr("NO_IMU");
     else sendResponse(String("IMU_G,") + pmImuGx + "," + pmImuGy + "," + pmImuGz);
   } else {
     sendErr("UNKNOWN_PM");
   }
 }
 
 void stringCallback(char *str) {
 #if PM_DEBUG_SERIAL
   pmDebugLog("SYSEX", str ? String(str) : String("(null)"));
 #endif
   onFirmataString(str);
 }
 
 void systemResetCallback() {
   pmFaceReady = false;
   pmOledReady = false;
   pmMotorReady = false;
   pmI2sReady = false;
   pmImuReady = false;
   pmServo14Attached = false;
   pmServo12Attached = false;
 }
 
 void processDecodedStringData() {
   char decoded[256];
   int outLen = 0;
   // Inverse of firmata.js sendString: each ASCII byte is two 7-bit SysEx bytes.
   // data: F0 71 4C 00 45 00 ... 0A 00 00 00 F7  →  "LEDMATRIX_INIT ...\n"
   for (int i = 1; i + 1 < pmSerialInLen && outLen < 255; i += 2) {
     uint8_t c = (pmSerialInBuf[i] & 0x7F) | ((pmSerialInBuf[i + 1] & 0x7F) << 7);
     if (c == 0) break;
     decoded[outLen++] = (char)c;
   }
   decoded[outLen] = '\0';
   String cmd = String(decoded);
   cmd.trim();
   if (cmd.length() > 0) stringCallback((char *)cmd.c_str());
 }
 
 void pmFirmataSetPinMode(uint8_t pin, uint8_t mode) {
   if (!pmFirmataPinExists(pin)) return;
   pmFirmataPinMode[pin] = mode;
   if (mode == FIRMATA_OUTPUT) {
     if (pmFirmataPinCanOutput(pin)) pinMode(pin, OUTPUT);
   } else if (mode == FIRMATA_INPUT || mode == FIRMATA_ANALOG) {
     pinMode(pin, INPUT);
   } else if (mode == FIRMATA_PWM) {
     if (pmFirmataPinCanOutput(pin)) pmLedcAttachPin(pin, 5000, 8);
   } else if (mode == FIRMATA_SERVO) {
     pmFirmataPinState[pin] = 90;
   }
 }
 
 void pmFirmataWritePin(uint8_t pin, int value) {
   if (!pmFirmataPinExists(pin) || !pmFirmataPinCanOutput(pin)) return;
   pmFirmataPinState[pin] = value;
   if (pmFirmataPinMode[pin] == FIRMATA_PWM) {
     pmLedcAttachPin(pin, 5000, 8);
     pmLedcWritePin(pin, constrain(value, 0, 255));
   } else if (pmFirmataPinMode[pin] == FIRMATA_SERVO) {
     pmServoWrite(pin, constrain(value, 0, 180));
   } else {
     pinMode(pin, OUTPUT);
     digitalWrite(pin, value ? HIGH : LOW);
   }
 }
 
 void processFirmataSysex() {
   if (pmSerialInLen == 0) return;
   switch (pmSerialInBuf[0]) {
     case QUERY_FIRMWARE:
       sendFirmataFirmwareResponse();
       break;
     case CAPABILITY_QUERY:
       sendFirmataCapabilityResponse();
       break;
     case ANALOG_MAPPING_QUERY:
       sendFirmataAnalogMappingResponse();
       break;
     case PIN_STATE_QUERY:
       if (pmSerialInLen >= 2) sendFirmataPinStateResponse(pmSerialInBuf[1]);
       break;
     case EXTENDED_ANALOG:
       if (pmSerialInLen >= 4) {
         int value = 0;
         for (int i = 2, shift = 0; i < pmSerialInLen; i++, shift += 7) {
           value |= (pmSerialInBuf[i] & 0x7F) << shift;
         }
         pmFirmataWritePin(pmSerialInBuf[1], value);
       }
       break;
     case SERVO_CONFIG:
       if (pmSerialInLen >= 2) pmFirmataSetPinMode(pmSerialInBuf[1], FIRMATA_SERVO);
       break;
     case SAMPLING_INTERVAL:
       break;
     case STRING_DATA:
       processDecodedStringData();
       break;
   }
 }
 
 void processFirmataMultiByteCommand() {
   uint8_t cmd = pmFirmataCmdBuf[0] & 0xF0;
   uint8_t channel = pmFirmataCmdBuf[0] & 0x0F;
   if (pmFirmataCmdBuf[0] == SET_PIN_MODE) {
     pmFirmataSetPinMode(pmFirmataCmdBuf[1], pmFirmataCmdBuf[2]);
   } else if (cmd == DIGITAL_MESSAGE) {
     int value = pmFirmataCmdBuf[1] | (pmFirmataCmdBuf[2] << 7);
     int basePin = channel * 8;
     for (int i = 0; i < 8; i++) {
       int pin = basePin + i;
       if (pin < 40 && pmFirmataPinMode[pin] == FIRMATA_OUTPUT) {
         pmFirmataWritePin(pin, (value >> i) & 0x01);
       }
     }
   } else if (cmd == ANALOG_MESSAGE) {
     int value = pmFirmataCmdBuf[1] | (pmFirmataCmdBuf[2] << 7);
     pmFirmataWritePin(channel, value);
   } else if (cmd == REPORT_ANALOG || cmd == REPORT_DIGITAL) {
     // Zappie realtime blocks use request/response PM_* commands, so continuous
     // Firmata reporting is ignored after satisfying startup negotiation.
   }
 }
 
 bool collectFirmataMultiByte(uint8_t b) {
   if (pmFirmataCmdNeed > 0) {
     pmFirmataCmdBuf[pmFirmataCmdLen++] = b;
     if (pmFirmataCmdLen >= pmFirmataCmdNeed) {
       processFirmataMultiByteCommand();
       pmFirmataCmdLen = 0;
       pmFirmataCmdNeed = 0;
     }
     return true;
   }
 
   if ((b >= REPORT_ANALOG && b < REPORT_ANALOG + 16) ||
       (b >= REPORT_DIGITAL && b < REPORT_DIGITAL + 16)) {
     pmFirmataCmdBuf[0] = b;
     pmFirmataCmdLen = 1;
     pmFirmataCmdNeed = 2;
     return true;
   }
 
   if (b == SET_PIN_MODE || (b >= DIGITAL_MESSAGE && b < DIGITAL_MESSAGE + 16) ||
       (b >= ANALOG_MESSAGE && b < ANALOG_MESSAGE + 16)) {
     pmFirmataCmdBuf[0] = b;
     pmFirmataCmdLen = 1;
     pmFirmataCmdNeed = 3;
     return true;
   }
 
   return false;
 }
 
 void processSerialInput() {
   // Abort only if a sysex started and then went idle (no new bytes). Do not time
   // out from F0 — a 125-byte LEDMATRIX_CUSTOM packet can pause on USB CDC.
   static unsigned long pmSysexLastByteMs = 0;
   if (pmSerialInSysex && pmSysexLastByteMs > 0 && (millis() - pmSysexLastByteMs) > 3000) {
     pmSerialInSysex = false;
     pmSerialInLen = 0;
     pmFirmataCmdLen = 0;
     pmFirmataCmdNeed = 0;
     pmSysexLastByteMs = 0;
   }
 
   while (Serial.available() > 0) {
     int b = Serial.read();
     if (b < 0) break;
     if (pmSerialInSysex) pmSysexLastByteMs = millis();
 
     if (!pmSerialInSysex) {
       if (b == REPORT_VERSION) {
         // Match AI&Robotics: version + firmware together so Blockzie Firmata becomes ready.
         sendFirmataHandshake();
       } else if (b == START_SYSEX) {
         pmSerialInSysex = true;
         pmSysexLastByteMs = millis();
         pmSerialInLen = 0;
         pmFirmataCmdLen = 0;
         pmFirmataCmdNeed = 0;
       } else if (b == SYSTEM_RESET) {
         systemResetCallback();
         sendFirmataHandshake();
       } else if (collectFirmataMultiByte((uint8_t)b)) {
         // handled above
       } else if (b == '\n' || b == '\r') {
         if (pmSerialInLen > 0) {
           pmSerialInBuf[pmSerialInLen] = '\0';
           char buf[256];
           int n = min(pmSerialInLen, 255);
           for (int i = 0; i < n; i++) buf[i] = (char)pmSerialInBuf[i];
           buf[n] = '\0';
           if (!handlePlainDiagnosticCommand(buf)) {
             stringCallback(buf);
           }
           pmSerialInLen = 0;
         }
       } else if (b >= 32 && b <= 126 && pmSerialInLen < (int)sizeof(pmSerialInBuf) - 1) {
         pmSerialInBuf[pmSerialInLen++] = (uint8_t)b;
       }
       continue;
     }
 
     if (b == END_SYSEX) {
       pmSerialInSysex = false;
       pmSysexLastByteMs = 0;
       processFirmataSysex();
       pmSerialInLen = 0;
       continue;
     }
 
     if (pmSerialInLen < (int)sizeof(pmSerialInBuf)) {
       pmSerialInBuf[pmSerialInLen++] = (uint8_t)b;
     } else {
       pmSerialInSysex = false;
       pmSysexLastByteMs = 0;
       pmSerialInLen = 0;
     }
   }
 }

void initializeWiFi() {
#if defined(ARDUINO_ARCH_ESP32)
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
#endif
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  Serial.println("Connecting to WiFi...");
  for (int round = 0; round < 4; round++) {
    Serial.print("WiFi try ");
    Serial.println(round + 1);
    WiFi.disconnect(false, false);
    delay(200);
    WiFi.begin(ssid, password);
    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED) {
      if (millis() - startAttemptTime >= 12000) break;
      delay(500);
      Serial.print(".");
    }
    Serial.println("");
    if (WiFi.status() == WL_CONNECTED) break;
    Serial.println("WiFi retry...");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Connected to WiFi");
    Serial.flush();
    delay(300);
    IPAddress ip = WiFi.localIP();
    Serial.print("IP ");
    Serial.print((int)ip[0]);
    Serial.print(".");
    Serial.print((int)ip[1]);
    Serial.print(".");
    Serial.print((int)ip[2]);
    Serial.print(".");
    Serial.println((int)ip[3]);
    Serial.flush();
  } else {
    Serial.println("WiFi not joined yet. HTTP server still starts; will retry in loop.");
  }

  server.on("/connect", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "OK");
  });
  server.on("/connect", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "OK");
  });
  server.on("/connect", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204, "text/plain", "");
  });
  server.on("/disconnect", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "OK");
  });
  server.on("/disconnect", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "OK");
  });

  server.on("/control", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204, "text/plain", "");
  });
  server.on("/control", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "OK");
  });
  server.on("/control", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    String cmd;
    if (server.hasArg("plain")) cmd = server.arg("plain");
    else if (server.hasArg("body")) cmd = server.arg("body");
    else if (server.args() > 0) cmd = server.arg(0);
    cmd.trim();
    Serial.println("Received: " + cmd);
    strncpy(pmHttpReply, "OK", sizeof(pmHttpReply) - 1);
    pmHttpReply[sizeof(pmHttpReply) - 1] = '\0';
    pmWifiHttpBusy = true;
    if (cmd.length() > 0) {
      routeIncomingCommand(cmd);
    }
    pmWifiHttpBusy = false;
    server.send(200, "text/plain", pmHttpReply);
  });

  server.begin();
  Serial.println("HTTP Server Started");
}

 void setup() {
   for (int i = 0; i < 40; i++) pmLedcChByPin[i] = -1;
   for (int i = 0; i < 16; i++) pmLedcChSetup[i] = false;
   for (int i = 0; i < 40; i++) {
     pmFirmataPinMode[i] = FIRMATA_INPUT;
     pmFirmataPinState[i] = 0;
   }
   pmNextLedcCh = 0;
   pinMode(PM_BTN_LEFT, INPUT);
   pinMode(PM_BTN_RIGHT, INPUT);
   analogSetAttenuation(ADC_11db);
   pinMode(PM_LINE_LEFT, INPUT);
   pinMode(PM_LINE_RIGHT, INPUT);
   Serial.begin(115200);
   delay(500);
   Serial.flush();
   initializeWiFi();
   pmFaceBegin();
   pmFace.setPixelColor(0, pmFace.Color(0, 40, 0));
   pmFace.show();
   delay(80);
   pmFace.clear();
   pmFace.show();
 #if PM_SERIAL_MONITOR_TEST
   // Readable proof for IDE testing only. Keep PM_SERIAL_MONITOR_TEST 0 for Blockzie.
   delay(100);
   Serial.println();
   Serial.println("ZAPPIE_BOOT_OK 115200");
   Serial.println("TYPE: PING");
   Serial.flush();
 #endif
 }
 
 // Plain ASCII lines from Blockzie (peripheral.send) — same commands as Firmata STRING_DATA.
 static unsigned long pmLastHandshake = 0;
 
 void loop() {
   processSerialInput();
   server.handleClient();
   {
     static unsigned long lastWifiTry = 0;
     static wl_status_t lastWifiSt = WL_IDLE_STATUS;
     wl_status_t st = WiFi.status();
     if (st != lastWifiSt) {
       lastWifiSt = st;
       if (st == WL_CONNECTED) {
         IPAddress ip = WiFi.localIP();
         Serial.println("Connected to WiFi");
         Serial.print("IP ");
         Serial.print((int)ip[0]);
         Serial.print(".");
         Serial.print((int)ip[1]);
         Serial.print(".");
         Serial.print((int)ip[2]);
         Serial.print(".");
         Serial.println((int)ip[3]);
         Serial.println("HTTP Server Started");
       }
     }
     if (st != WL_CONNECTED && (millis() - lastWifiTry) > 8000UL) {
       lastWifiTry = millis();
       Serial.println("WiFi reconnecting...");
       WiFi.begin(ssid, password);
     }
   }
   // Do not TX handshake in the middle of an incoming STRING_DATA packet, and
   // stop entirely once the host has sent a real command — repeating it after
   // that point only adds unsolicited traffic right after command responses.
   if (!pmHostCommandSeen && !pmSerialInSysex && millis() < 25000 && millis() - pmLastHandshake >= 1000) {
     sendFirmataHandshake();
     pmLastHandshake = millis();
   }
   if (pmMicPassRun) {
     pmMicPassOnce();
   }
   if (pmLineAvoidRun) {
     pmLineAvoidStep(pmLineFollowColor, 15, pmLineAvoidCm);
   } else if (pmLineFollowRun) {
     pmPidLineStep(pmLineFollowColor, 15);
   } else if (pmAvoidRun) {
     pmAvoidObstacle(pmAvoidCm);
   } else if (pmLightFollowRun) {
     pmFollowLight(pmLightThr, pmLightMin, pmLightCorr);
   } else {
     delay(1);
   }
 }
