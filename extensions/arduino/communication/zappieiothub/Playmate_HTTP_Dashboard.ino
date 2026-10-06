/*
 * ============================================================
 *  IoT Dashboard â€” ESP32 HTTP (PLAYMATE V3 â€” HTTP instead of MQTT)
 * ============================================================
 *  Same idea as your esp32_http_client.ino test sketch:
 *   1. Every 5s: read sensors -> POST to /api/ingest
 *   2. Poll  GET /api/poll for pending commands
 *   3. Execute command, then POST /api/ack
 *
 *  Why switch from MQTT: HTTP is stateless (connect, send,
 *  disconnect each time), so there's no persistent connection
 *  to time out or drop â€” that was causing the periodic MQTT
 *  reconnects you were seeing. Tradeoff: commands now arrive
 *  only as fast as the poll interval, not instantly pushed.
 *
 *  Pins use the Zappie V2 map from zappie_serial.ino:
 *    DHT_PIN       2    (external DHT sensor on free connector)
 *    TRIG_PIN      16   ECHO_PIN 17 (onboard ultrasonic)
 *    VIBRATION_PIN 15   (onboard vibration sensor)
 *    MATRIX_PIN    4    (onboard 7x6 face matrix, 42 LEDs)
 *    LED           13   (external LED on free connector)
 *    BUZZER        19   (shared with I2S; BUZZER_ON plays a short tone)
 *    MPU-6050      SDA=21, SCL=22 (I2C, fixed onboard)
 *    Speaker       BCK=18, WS=19, DATA=5 (I2S â€” plays a simple beep tone)
 *  soil / gas sensors removed (not on this board, and you
 *  asked for them out).
 *
 *  Bluetooth A2DP speaker removed for now â€” the MAX98357A amp is
 *  driven directly with a generated tone instead. Simpler to build,
 *  no coexistence concerns with WiFi.
 *
 *  Commands supported (same string format as your test code):
 *    LED_ON / LED_OFF, BUZZER_ON / BUZZER_OFF (one-shot tone / no-op)
 *    MATRIX_ON / MATRIX_OFF
 *    BEEP   (plays a short 1kHz beep through the speaker)
 *
 *  Libraries needed (Arduino Library Manager):
 *  - ESP32Dev core provides WiFi + HTTPClient + the I2S driver
 *    (no install needed for any of these)
 *  - DHT sensor library for ESPx   by beegee_tokyo  (DHTesp.h)
 *  - Adafruit NeoPixel             by Adafruit
 *  MPU-6050 uses plain Wire calls â€” no extra library.
 * ============================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHTesp.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <driver/i2s.h>

// ===================== PINS =====================
#define DHT_PIN        2
#define TRIG_PIN       16
#define ECHO_PIN       17
#define VIBRATION_PIN  15
#define MATRIX_PIN     4

// I2C (MPU-6050) â€” fixed onboard traces
#define I2C_SDA        21
#define I2C_SCL        22
#define MPU_ADDR       0x68

// I2S (Bluetooth speaker / MAX98357A) â€” fixed onboard traces
#define I2S_BCK        18
#define I2S_WS         19
#define I2S_DATA       5

// ===================== MATRIX CONFIG =====================
#define MATRIX_COLS    7
#define MATRIX_ROWS    6
#define MATRIX_COUNT   (MATRIX_COLS * MATRIX_ROWS)   // 42 LEDs
#define MATRIX_ON_R    255
#define MATRIX_ON_G    255
#define MATRIX_ON_B    255
#define MATRIX_BRIGHTNESS 60

Adafruit_NeoPixel matrix(MATRIX_COUNT, MATRIX_PIN, NEO_GRB + NEO_KHZ800);
bool matrixState = false;

// ===================== ACTUATORS TABLE =====================
struct Actuator { const char* key; uint8_t pin; };
Actuator actuators[] = {
  { "LED",     13 },
};
const uint8_t ACT_COUNT = sizeof(actuators) / sizeof(actuators[0]);

// ===================== CONFIG ===================
const char* WIFI_SSID    = "YOUR_WIFI_SSID";
const char* WIFI_PASS    = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP    = "160.187.69.147";
const int   HTTP_PORT    = 5000;
const char* SERVER_URL   = "http://160.187.69.147:5000/api/ingest";
const char* DEVICE_TOKEN = "YOUR_DEVICE_TOKEN";

// ===================== TIMING ===================
const unsigned long SEND_INTERVAL = 5000;
unsigned long lastSend = 0;

// ===================== OBJECTS ==================
DHTesp dht;

float lastTemp = 0, lastHum = 0, lastDist = 0;
int lastVibration = 0;
float ax, ay, az, gx, gy, gz;

// ============================================================
//  WiFi Connect
// ============================================================
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected! IP: ");
  Serial.println(WiFi.localIP());
}

// ============================================================
//  Matrix helpers
// ============================================================
void matrixSetAll(uint8_t r, uint8_t g, uint8_t b) {
  for (uint16_t i = 0; i < MATRIX_COUNT; i++) {
    matrix.setPixelColor(i, matrix.Color(r, g, b));
  }
  matrix.show();
}

void matrixOn()  { matrixSetAll(MATRIX_ON_R, MATRIX_ON_G, MATRIX_ON_B); matrixState = true; }
void matrixOff() { matrixSetAll(0, 0, 0); matrixState = false; }

// ============================================================
//  Speaker â€” direct I2S beep (no Bluetooth)
// ============================================================
void i2sInit() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = 44100,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 4,
    .dma_buf_len = 256,
    .use_apll = false,
    .tx_desc_auto_clear = true
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_BCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_DATA,
    .data_in_num = I2S_PIN_NO_CHANGE
  };

  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);
}

// Plays a short sine-wave tone through the speaker. Blocking, but only
// for the duration of the beep (default ~200ms) so it won't noticeably
// stall sensor reads or HTTP calls.
void beep(int freqHz = 1000, int durationMs = 200) {
  const int sampleRate = 44100;
  const int numSamples = (sampleRate * durationMs) / 1000;
  int16_t buffer[256];
  size_t bytesWritten;
  int samplesSent = 0;

  while (samplesSent < numSamples) {
    int chunk = min(128, numSamples - samplesSent);
    for (int i = 0; i < chunk; i++) {
      float t = (float)(samplesSent + i) / sampleRate;
      int16_t sample = (int16_t)(3000 * sin(2 * PI * freqHz * t));
      buffer[i * 2]     = sample;  // left
      buffer[i * 2 + 1] = sample;  // right
    }
    i2s_write(I2S_NUM_0, buffer, chunk * 2 * sizeof(int16_t), &bytesWritten, portMAX_DELAY);
    samplesSent += chunk;
  }

  Serial.println("Beep played");
}

// ============================================================
//  MPU-6050 â€” plain I2C register reads
// ============================================================
void mpuInit() {
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission(true);
}

void mpuRead() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 14, true);
  if (Wire.available() < 14) return;

  int16_t rawAx = (Wire.read() << 8) | Wire.read();
  int16_t rawAy = (Wire.read() << 8) | Wire.read();
  int16_t rawAz = (Wire.read() << 8) | Wire.read();
  Wire.read(); Wire.read();
  int16_t rawGx = (Wire.read() << 8) | Wire.read();
  int16_t rawGy = (Wire.read() << 8) | Wire.read();
  int16_t rawGz = (Wire.read() << 8) | Wire.read();

  ax = rawAx / 16384.0;
  ay = rawAy / 16384.0;
  az = rawAz / 16384.0;
  gx = rawGx / 131.0;
  gy = rawGy / 131.0;
  gz = rawGz / 131.0;
}

// ============================================================
//  Read Sensors
// ============================================================
void readSensors() {
  TempAndHumidity data = dht.getTempAndHumidity();
  if (dht.getStatus() == 0) {
    lastTemp = data.temperature;
    lastHum = data.humidity;
  }

  lastVibration = digitalRead(VIBRATION_PIN);

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration > 0) lastDist = (duration * 0.034) / 2.0;

  mpuRead();
}

// ============================================================
//  Execute a command received from the server
// ============================================================
void executeCommand(String command) {
  Serial.print(">>> CMD: ");
  Serial.println(command);

  if (command == "MATRIX_ON")  { matrixOn();  return; }
  if (command == "MATRIX_OFF") { matrixOff(); return; }
  // SPEAKER_ON is an alias for BEEP â€” your dashboard still sends the old
  // command name, so this avoids needing a backend change. SPEAKER_OFF
  // is accepted but does nothing (beep is a one-shot, not a persistent state).
  if (command == "BEEP" || command == "SPEAKER_ON" || command == "BUZZER_ON") { beep(); return; }
  if (command == "SPEAKER_OFF" || command == "BUZZER_OFF") { return; }

  for (uint8_t i = 0; i < ACT_COUNT; i++) {
    String on  = String(actuators[i].key) + "_ON";
    String off = String(actuators[i].key) + "_OFF";
    if (command == on)  { digitalWrite(actuators[i].pin, HIGH); return; }
    if (command == off) { digitalWrite(actuators[i].pin, LOW);  return; }
  }
  Serial.println("Unknown command");
}

// ============================================================
//  Send command acknowledgement â€” POST /api/ack
// ============================================================
void sendAck(String command) {
  HTTPClient http;
  String ackUrl = String("http://") + SERVER_IP + ":" + String(HTTP_PORT) + "/api/ack";
  http.begin(ackUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  String state;
  if (command == "BEEP" || command == "SPEAKER_ON" || command == "BUZZER_ON") state = "PLAYED";
  else state = command.endsWith("ON") ? "ON" : "OFF";
  String body = "{\"command\":\"" + command + "\",\"state\":\"" + state + "\"}";
  http.POST(body);
  http.end();

  Serial.print("ACK: ");
  Serial.println(command);
}

// ============================================================
//  Poll the server for pending commands â€” GET /api/poll
// ============================================================
bool pollForCommands() {
  HTTPClient http;
  String pollUrl = String("http://") + SERVER_IP + ":" + String(HTTP_PORT) + "/api/poll";
  http.begin(pollUrl);
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  int httpCode = http.GET();
  bool gotCommand = false;

  if (httpCode == 200) {
    String response = http.getString();

    int ci = response.indexOf("\"command\":\"");
    if (ci != -1) {
      ci += 11;
      int ce = response.indexOf("\"", ci);
      if (ce != -1) {
        String cmd = response.substring(ci, ce);
        if (cmd != "NONE") {
          Serial.print("POLL: ");
          Serial.println(cmd);
          executeCommand(cmd);
          sendAck(cmd);
          gotCommand = true;
        }
      }
    }
  }
  http.end();
  return gotCommand;
}

// ============================================================
//  Send sensor data â€” POST /api/ingest
// ============================================================
void sendViaHTTP() {
  readSensors();

  String jsonBody = "{";
  jsonBody += "\"temp\":" + String(lastTemp, 1) + ",";
  jsonBody += "\"humidity\":" + String(lastHum, 1) + ",";
  jsonBody += "\"distance\":" + String(lastDist, 1) + ",";
  jsonBody += "\"vibration\":" + String(lastVibration) + ",";
  jsonBody += "\"ax\":" + String(ax, 2) + ",";
  jsonBody += "\"ay\":" + String(ay, 2) + ",";
  jsonBody += "\"az\":" + String(az, 2) + ",";
  jsonBody += "\"gx\":" + String(gx, 1) + ",";
  jsonBody += "\"gy\":" + String(gy, 1) + ",";
  jsonBody += "\"gz\":" + String(gz, 1) + ",";
  jsonBody += "\"matrix\":\"" + String(matrixState ? "ON" : "OFF") + "\"";
  jsonBody += "}";

  Serial.print("HTTP TX: ");
  Serial.println(jsonBody);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  int httpCode = http.POST(jsonBody);

  if (httpCode == 201 || httpCode == 200) {
    String response = http.getString();
    Serial.print("HTTP: ");
    Serial.print(httpCode);
    Serial.print(" OK -> ");
    Serial.println(response);
  } else if (httpCode == 401) {
    Serial.println("HTTP: 401 - Invalid token! Check DEVICE_TOKEN.");
  } else if (httpCode < 0) {
    Serial.print("HTTP: Connection failed - ");
    Serial.println(http.errorToString(httpCode));
  } else {
    Serial.print("HTTP: Error ");
    Serial.println(httpCode);
  }

  http.end();

  // Drain up to 3 pending commands per cycle
  for (int p = 0; p < 3; p++) {
    if (!pollForCommands()) break;
    delay(100);
  }
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(VIBRATION_PIN, INPUT);
  for (uint8_t i = 0; i < ACT_COUNT; i++) { pinMode(actuators[i].pin, OUTPUT); digitalWrite(actuators[i].pin, LOW); }

  dht.setup(DHT_PIN, DHTesp::DHT11);
  mpuInit();

  matrix.begin();
  matrix.setBrightness(MATRIX_BRIGHTNESS);
  matrixOff();

  Serial.println();
  Serial.println("================================");
  Serial.println(" IoT Dashboard â€” ESP32 HTTP (Playmate)");
  Serial.println("================================");

  connectWiFi();

  // Configure I2S output for the speaker beep.
  i2sInit();
  Serial.println("Speaker I2S ready â€” send BEEP to play a tone");
}

// ============================================================
//  LOOP
// ============================================================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost, reconnecting...");
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL) {
    lastSend = now;
    sendViaHTTP();
  }
}

