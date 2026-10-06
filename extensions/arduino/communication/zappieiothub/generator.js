/* eslint-disable max-len */
/**
 * Zappie IoT Hub - MQTT + HTTPS
 *
 * Same connect/publish/poll design as esp32iothub (mirrors the field-tested
 * ESP32 sketches: HTTP(S) POST to /api/ingest + /api/poll + /api/ack, MQTT
 * pub/sub on iot/data/<token> + iot/commands/<kit> + iot/ack), adapted for
 * the Zappie robot specifically:
 *
 * - HTTPS is real TLS here (WiFiClientSecure + HTTPClient), not just an
 *   http:// URL under an "https" label.
 * - No default actuator pins are auto-registered. Zappie owns GPIO 25/26/27/32
 *   (motors), 4 (42-pixel face matrix), 19 (buzzer/I2S clock), 12/14 (servos),
 *   16/17 (ultrasonic), 21/22 (I2C), 34/35 (IR), 36/39 (buttons), 15
 *   (vibration), and 33 (battery sense). GPIO 2 and 13 are the free connector
 *   pins. The Playmate_HTTP_Dashboard example uses GPIO2 for external DHT and
 *   GPIO13 for external LED; register a dashboard output only on a pin wired
 *   for output and not already used by the running sketch.
 * - Sensor values come from Zappie's own blocks (ultrasonic distance, IMU,
 *   battery, IR, etc.) wired into "add sensor field", exactly like the
 *   ESP32 kit version takes a DHT block's reading as the VALUE input - this
 *   extension never reads Zappie's sensors itself.
 */
function addGenerator(Blockly) {
  function quoteFieldName(code, fallback) {
    let raw = (code || `"${fallback}"`).trim();
    const match = raw.match(/^"(.*)"$/);
    if (match) {
      raw = match[1];
    }
    if (raw.startsWith('"') && raw.endsWith('"')) {
      raw = raw.slice(1, -1);
    }
    return `"${raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  function ensureZIotHubCreds() {
    if (!Blockly.Arduino.definitions_['zioth_00_creds']) {
      Blockly.Arduino.definitions_['zioth_00_creds'] = `
const char* zIotHubHost = "160.187.69.147";
const int zIotHubPort = 5000;
const char* zIotHubToken = "";
const char* zIotHubKit = "AIIOT025";
`;
    }
    if (!Blockly.Arduino.definitions_['zioth_wifi_creds']) {
      Blockly.Arduino.definitions_['zioth_wifi_creds'] = `
const char* zIotHubWifiSsid = "MyWiFi";
const char* zIotHubWifiPass = "";
`;
    }
    if (!Blockly.Arduino.definitions_['zioth_wifi_fn']) {
      Blockly.Arduino.includes_['zioth_wifi'] = '#include <WiFi.h>\n#include <string.h>\n#include <math.h>';
      Blockly.Arduino.definitions_['zioth_wifi_fn'] = `
void zIotHubConnectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print(F("Connecting to WiFi"));
  WiFi.begin(zIotHubWifiSsid, zIotHubWifiPass);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < 20000UL) {
    delay(500);
    Serial.print(F("."));
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("WiFi connected! IP: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("WiFi FAILED - check SSID/password (2.4GHz only)."));
  }
}
`;
    }
  }

  // Shared by both protocols: the dynamic sensor-field list and the
  // command -> output-pin registry. No defaults are auto-registered here -
  // Zappie's onboard actuators already own the common pins (see file header).
  function ensureZIotHubControls() {
    if (Blockly.Arduino.definitions_['zioth_10_controls']) return;
    Blockly.Arduino.includes_['zioth_matrix'] = '#include <Adafruit_NeoPixel.h>';
    Blockly.Arduino.definitions_['zioth_10_controls'] = `
#define ZIOT_HUB_MAX_FIELDS 12
#define ZIOT_HUB_MAX_NAME 16
#define ZIOT_HUB_MAX_VALUE 32

struct ZIotHubField { char name[ZIOT_HUB_MAX_NAME]; char value[ZIOT_HUB_MAX_VALUE]; };
ZIotHubField zIotHubFields[ZIOT_HUB_MAX_FIELDS];
int zIotHubFieldCount = 0;

#define ZIOT_HUB_MAX_CONTROLS 8
#define ZIOT_HUB_CTRL_KEY 16
struct ZIotHubControl { char key[ZIOT_HUB_CTRL_KEY]; int pin; };
ZIotHubControl zIotHubControls[ZIOT_HUB_MAX_CONTROLS];
int zIotHubControlCount = 0;

#define ZIOT_HUB_MATRIX_PIN 4
#define ZIOT_HUB_MATRIX_PIXELS 42
Adafruit_NeoPixel zIotHubMatrix(ZIOT_HUB_MATRIX_PIXELS, ZIOT_HUB_MATRIX_PIN, NEO_GRB + NEO_KHZ800);
bool zIotHubMatrixReady = false;
bool zIotHubMatrixOn = false;

bool zIotHubIsMatrixKey(const char* key) {
  if (key == NULL) return false;
  char normalized[ZIOT_HUB_CTRL_KEY];
  size_t out = 0;
  for (size_t i = 0; key[i] != '\\0' && out < sizeof(normalized) - 1; i++) {
    char c = key[i];
    if (c == ' ' || c == '_' || c == '-') continue;
    if (c >= 'a' && c <= 'z') c = (char)(c - 'a' + 'A');
    normalized[out++] = c;
  }
  normalized[out] = '\\0';
  return strcmp(normalized, "MATRIX") == 0 || strcmp(normalized, "LEDMATRIX") == 0;
}

void zIotHubInitMatrix() {
  if (zIotHubMatrixReady) return;
  zIotHubMatrix.begin();
  zIotHubMatrix.setBrightness(60);
  zIotHubMatrix.clear();
  zIotHubMatrix.show();
  zIotHubMatrixReady = true;
}

void zIotHubSetMatrix(bool on) {
  zIotHubInitMatrix();
  uint32_t color = on ? zIotHubMatrix.Color(255, 255, 255) : 0;
  for (uint16_t i = 0; i < ZIOT_HUB_MATRIX_PIXELS; i++) zIotHubMatrix.setPixelColor(i, color);
  zIotHubMatrix.show();
  zIotHubMatrixOn = on;
  Serial.println(on ? F("LED Matrix ON") : F("LED Matrix OFF"));
}

int zIotHubFindControlPin(const char* key) {
  if (key == NULL) return -1;
  for (int i = 0; i < zIotHubControlCount; i++) {
    if (strcmp(zIotHubControls[i].key, key) == 0 ||
        (zIotHubIsMatrixKey(zIotHubControls[i].key) && zIotHubIsMatrixKey(key))) {
      return zIotHubControls[i].pin;
    }
  }
  return -1;
}

void zIotHubRegisterControl(const char* key, int pin) {
  if (key == NULL || key[0] == '\\0' || pin < 0) return;
  if (zIotHubIsMatrixKey(key) && pin == ZIOT_HUB_MATRIX_PIN) {
    for (int i = 0; i < zIotHubControlCount; i++) {
      if (strcmp(zIotHubControls[i].key, key) == 0) {
        zIotHubInitMatrix();
        return;
      }
    }
    if (zIotHubControlCount >= ZIOT_HUB_MAX_CONTROLS) return;
    strncpy(zIotHubControls[zIotHubControlCount].key, key, ZIOT_HUB_CTRL_KEY - 1);
    zIotHubControls[zIotHubControlCount].key[ZIOT_HUB_CTRL_KEY - 1] = '\\0';
    zIotHubControls[zIotHubControlCount].pin = pin;
    zIotHubControlCount++;
    zIotHubInitMatrix();
    return;
  }
  for (int i = 0; i < zIotHubControlCount; i++) {
    if (strcmp(zIotHubControls[i].key, key) == 0) {
      if (zIotHubControls[i].pin == pin) return;
      zIotHubControls[i].pin = pin;
      pinMode(pin, OUTPUT);
      digitalWrite(pin, LOW);
      return;
    }
  }
  if (zIotHubControlCount >= ZIOT_HUB_MAX_CONTROLS) return;
  strncpy(zIotHubControls[zIotHubControlCount].key, key, ZIOT_HUB_CTRL_KEY - 1);
  zIotHubControls[zIotHubControlCount].key[ZIOT_HUB_CTRL_KEY - 1] = '\\0';
  zIotHubControls[zIotHubControlCount].pin = pin;
  zIotHubControlCount++;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
}

bool zIotHubApplyCommand(const char* command, const char** stateOut) {
  if (command == NULL || command[0] == '\\0') return false;
  int high = -1;
  char key[ZIOT_HUB_CTRL_KEY];
  key[0] = '\\0';
  size_t n = strlen(command);
  if (n >= 3 && strcmp(command + n - 3, "_ON") == 0) {
    high = 1;
    size_t klen = n - 3;
    if (klen >= sizeof(key)) klen = sizeof(key) - 1;
    memcpy(key, command, klen);
    key[klen] = '\\0';
  } else if (n >= 4 && strcmp(command + n - 4, "_OFF") == 0) {
    high = 0;
    size_t klen = n - 4;
    if (klen >= sizeof(key)) klen = sizeof(key) - 1;
    memcpy(key, command, klen);
    key[klen] = '\\0';
  } else {
    strncpy(key, command, sizeof(key) - 1);
    key[sizeof(key) - 1] = '\\0';
    high = 1;
  }
  int pin = zIotHubFindControlPin(key);
  if (pin == ZIOT_HUB_MATRIX_PIN && zIotHubIsMatrixKey(key)) {
    zIotHubSetMatrix(high != 0);
    if (stateOut) *stateOut = high ? "ON" : "OFF";
    return true;
  }
  if (pin < 0 || high < 0) return false;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, high ? HIGH : LOW);
  if (stateOut) *stateOut = high ? "HIGH" : "LOW";
  return true;
}

void zIotHubAddField(const char* name, const char* value) {
  if (name == NULL || name[0] == '\\0' || value == NULL) return;
  for (int i = 0; i < zIotHubFieldCount; i++) {
    if (strcmp(zIotHubFields[i].name, name) == 0) {
      strncpy(zIotHubFields[i].value, value, ZIOT_HUB_MAX_VALUE - 1);
      zIotHubFields[i].value[ZIOT_HUB_MAX_VALUE - 1] = '\\0';
      return;
    }
  }
  if (zIotHubFieldCount >= ZIOT_HUB_MAX_FIELDS) return;
  strncpy(zIotHubFields[zIotHubFieldCount].name, name, ZIOT_HUB_MAX_NAME - 1);
  zIotHubFields[zIotHubFieldCount].name[ZIOT_HUB_MAX_NAME - 1] = '\\0';
  strncpy(zIotHubFields[zIotHubFieldCount].value, value, ZIOT_HUB_MAX_VALUE - 1);
  zIotHubFields[zIotHubFieldCount].value[ZIOT_HUB_MAX_VALUE - 1] = '\\0';
  zIotHubFieldCount++;
}

void zIotHubAddFieldNumber(const char* name, double value) {
  char buf[ZIOT_HUB_MAX_VALUE];
  if (isnan(value) || isinf(value)) snprintf(buf, sizeof(buf), "0");
  else dtostrf(value, 0, 2, buf);
  zIotHubAddField(name, buf);
  Serial.print(F("FIELD add: "));
  Serial.print(name);
  Serial.print(F("="));
  Serial.println(buf);
}

void zIotHubClearFields() { zIotHubFieldCount = 0; }

int zIotHubBuildJson(char* out, size_t outSize) {
  int pos = snprintf(out, outSize, "{");
  for (int i = 0; i < zIotHubFieldCount && pos < (int)outSize - 40; i++) {
    if (i > 0) pos += snprintf(out + pos, outSize - pos, ",");
    pos += snprintf(out + pos, outSize - pos, "\\"%s\\":%s", zIotHubFields[i].name, zIotHubFields[i].value);
  }
  if (pos < (int)outSize - 2) {
    out[pos++] = '}';
    out[pos] = '\\0';
  }
  return pos;
}
`;
  }

  function ensureZIotHubRest(secure) {
    const defKey = secure ? 'zioth_20_https' : 'zioth_20_http';
    if (Blockly.Arduino.definitions_[defKey]) return;
    ensureZIotHubControls();
    Blockly.Arduino.includes_['zioth_http'] = secure
      ? '#include <HTTPClient.h>\n#include <WiFiClientSecure.h>'
      : '#include <HTTPClient.h>';
    const clientDeclaration = secure ? 'WiFiClientSecure zIotHubSecureClient;' : '';
    const beginRequest = secure
      ? 'http.begin(zIotHubSecureClient, '
      : 'http.begin(';
    const scheme = secure ? 'https' : 'http';
    const protocolLabel = secure ? 'HTTPS' : 'HTTP';
    const setupName = secure ? 'zIotHubHttpsSetup' : 'zIotHubHttpSetup';

    Blockly.Arduino.definitions_[defKey] = `
${clientDeclaration}
char zIotHubIngestUrl[104];
char zIotHubPollUrl[104];
char zIotHubAckUrl[104];
unsigned long zIotHubLastPresenceMs = 0;
unsigned long zIotHubLastCommandCheckMs = 0;

void zIotHubMakeUrl(char* out, size_t outSize, const char* path) {
  snprintf(out, outSize, "${scheme}://%s:%d%s", zIotHubHost, zIotHubPort, path);
}

bool zIotHubIsConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void zIotHubExecuteCommand(const String& command) {
  Serial.print(F(">>> CMD: "));
  Serial.println(command);
  const char* state = "LOW";
  if (!zIotHubApplyCommand(command.c_str(), &state)) {
    Serial.println(F("Unknown command"));
  }
}

void zIotHubSendAck(const String& command) {
  HTTPClient http;
  ${beginRequest}zIotHubAckUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", zIotHubToken);
  String body = String("{\\"command\\":\\"") + command + "\\",\\"state\\":\\"" +
    (command.endsWith("ON") ? "HIGH" : "LOW") + "\\"}";
  http.POST(body);
  http.end();
  Serial.print(F("ACK: "));
  Serial.println(command);
}

bool zIotHubPollCommands() {
  HTTPClient http;
  ${beginRequest}zIotHubPollUrl);
  http.addHeader("X-Device-Token", zIotHubToken);
  int code = http.GET();
  bool gotCommand = false;
  if (code == 200) {
    String response = http.getString();
    int ci = response.indexOf("\\"command\\":\\"");
    if (ci != -1) {
      ci += 11;
      int ce = response.indexOf("\\"", ci);
      if (ce != -1) {
        String cmd = response.substring(ci, ce);
        if (cmd.length() > 0 && cmd != "NONE") {
          Serial.print(F("POLL: "));
          Serial.println(cmd);
          zIotHubExecuteCommand(cmd);
          zIotHubSendAck(cmd);
          gotCommand = true;
        }
      }
    }
  }
  http.end();
  return gotCommand;
}

void zIotHubSendPresence() {
  if (WiFi.status() != WL_CONNECTED) return;
  unsigned long now = millis();
  if (now - zIotHubLastPresenceMs < 5000UL) return;
  zIotHubLastPresenceMs = now;

  HTTPClient http;
  ${beginRequest}zIotHubIngestUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", zIotHubToken);
  char presence[40];
  snprintf(presence, sizeof(presence), "{\\"online\\":1,\\"matrix\\":\\"%s\\"}", zIotHubMatrixOn ? "ON" : "OFF");
  int code = http.POST(presence);
  if (code < 0) {
    Serial.print(F("${protocolLabel} presence connection failed: "));
    Serial.println(http.errorToString(code));
  } else {
    Serial.print(F("${protocolLabel} presence HTTP status: "));
    Serial.println(code);
  }
  http.end();
  zIotHubPollCommands();
}

void zIotHubCheckCommandsNow() {
  unsigned long now = millis();
  if (now - zIotHubLastCommandCheckMs < 1000UL) return;
  zIotHubLastCommandCheckMs = now;
  zIotHubPollCommands();
}

void zIotHubSendHttpData() {
  if (zIotHubFieldCount <= 0) {
    Serial.println(F("${protocolLabel} TX: skip (no fields - add a field before send)"));
    return;
  }
  char json[256];
  zIotHubBuildJson(json, sizeof(json));
  zIotHubClearFields();

  Serial.print(F("${protocolLabel} TX: "));
  Serial.println(json);

  HTTPClient http;
  ${beginRequest}zIotHubIngestUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", zIotHubToken);
  int code = http.POST(json);

  if (code == 200 || code == 201) {
    Serial.print(F("${protocolLabel}: "));
    Serial.print(code);
    Serial.print(F(" OK -> "));
    Serial.println(http.getString());
  } else if (code == 401) {
    Serial.println(F("${protocolLabel}: 401 - Invalid token! Check the token in the connect block."));
  } else if (code < 0) {
    Serial.print(F("${protocolLabel}: Connection failed - "));
    Serial.println(http.errorToString(code));
  } else {
    Serial.print(F("${protocolLabel}: Error "));
    Serial.println(code);
  }
  http.end();

  for (int p = 0; p < 3; p++) {
    if (!zIotHubPollCommands()) break;
    delay(100);
  }
}

void ${setupName}() {
  // No CA pinning - the dashboard is addressed by raw IP, not a domain with
  // a publicly trusted cert. Swap in setCACert(...) if/when it gets one.
  ${secure ? 'zIotHubSecureClient.setInsecure();' : '// Plain HTTP: no TLS client is used.'}
  zIotHubMakeUrl(zIotHubIngestUrl, sizeof(zIotHubIngestUrl), "/api/ingest");
  zIotHubMakeUrl(zIotHubPollUrl, sizeof(zIotHubPollUrl), "/api/poll");
  zIotHubMakeUrl(zIotHubAckUrl, sizeof(zIotHubAckUrl), "/api/ack");
  Serial.println();
  Serial.println(F("================================"));
  Serial.println(F(" Zappie IoT Hub - ${protocolLabel}"));
  Serial.println(F("================================"));
  Serial.print(F("Server : "));
  Serial.println(zIotHubIngestUrl);
  Serial.print(F("Kit    : "));
  Serial.println(zIotHubKit);
}
`;
  }

  function ensureZIotHubMqtt() {
    if (Blockly.Arduino.definitions_['zioth_20_mqtt']) return;
    ensureZIotHubControls();
    Blockly.Arduino.includes_['zioth_pubsub'] = '#include <PubSubClient.h>';

  Blockly.Arduino.definitions_['zioth_20_mqtt'] = `
WiFiClient zIotHubWifiClient;
PubSubClient zIotHubMqtt(zIotHubWifiClient);
char zIotHubTopicPub[128];
char zIotHubTopicCmd[64];
const char* zIotHubTopicAck = "iot/ack";
unsigned long zIotHubLastPresenceMs = 0;

bool zIotHubIsConnected() {
  return zIotHubMqtt.connected() && (WiFi.status() == WL_CONNECTED);
}

void zIotHubExecuteCommand(const char* command) {
  Serial.print(F(">>> CMD: "));
  Serial.println(command);
  const char* state = "LOW";
  if (!zIotHubApplyCommand(command, &state)) {
    Serial.println(F("Unknown command"));
    return;
  }
  if (zIotHubMqtt.connected()) {
    char ack[160];
    snprintf(ack, sizeof(ack), "{\\"kit_number\\":\\"%s\\",\\"command\\":\\"%s\\",\\"state\\":\\"%s\\"}",
      zIotHubKit, command, state);
    zIotHubMqtt.publish(zIotHubTopicAck, ack);
    Serial.print(F("ACK: "));
    Serial.println(ack);
  }
}

void zIotHubMqttCallback(char* topic, byte* payload, unsigned int length) {
  char msg[192];
  unsigned int n = length;
  if (n >= sizeof(msg)) n = sizeof(msg) - 1;
  for (unsigned int i = 0; i < n; i++) msg[i] = (char)payload[i];
  msg[n] = '\\0';

  Serial.print(F("MQTT RX ["));
  Serial.print(topic);
  Serial.print(F("]: "));
  Serial.println(msg);

  char* ci = strstr(msg, "\\"command\\"");
  if (ci == NULL) return;
  ci = strchr(ci, ':');
  if (ci == NULL) return;
  ci++;
  while (*ci == ' ' || *ci == '\\t') ci++;
  if (*ci != '"') return;
  ci++;
  char* ce = strchr(ci, '"');
  if (ce == NULL) return;
  *ce = '\\0';
  zIotHubExecuteCommand(ci);
}

void zIotHubConnectMqtt() {
  while (!zIotHubMqtt.connected()) {
    if (WiFi.status() != WL_CONNECTED) {
      zIotHubConnectWifi();
      if (WiFi.status() != WL_CONNECTED) return;
    }
    Serial.print(F("Connecting to MQTT broker..."));
    char clientId[48];
    snprintf(clientId, sizeof(clientId), "zappie-%s", zIotHubKit);
    if (zIotHubMqtt.connect(clientId)) {
      Serial.println(F(" connected!"));
      Serial.print(F("Subscribed to: "));
      Serial.println(zIotHubTopicCmd);
      zIotHubMqtt.subscribe(zIotHubTopicCmd);
    } else {
      Serial.print(F(" failed (rc="));
      Serial.print(zIotHubMqtt.state());
      Serial.println(F("). Retrying in 3s..."));
      delay(3000);
    }
  }
}

void zIotHubPublish() {
  if (zIotHubFieldCount <= 0) {
    Serial.println(F("MQTT TX: skip (no fields - add a field before send)"));
    return;
  }
  char json[256];
  zIotHubBuildJson(json, sizeof(json));
  zIotHubClearFields();
  zIotHubMqtt.publish(zIotHubTopicPub, json);
  Serial.print(F("MQTT TX: "));
  Serial.println(json);
}

void zIotHubSendPresence() {
  if (!zIotHubMqtt.connected()) return;
  unsigned long now = millis();
  if (now - zIotHubLastPresenceMs < 5000UL) return;
  zIotHubLastPresenceMs = now;
  char presence[40];
  snprintf(presence, sizeof(presence), "{\\"online\\":1,\\"matrix\\":\\"%s\\"}", zIotHubMatrixOn ? "ON" : "OFF");
  bool sent = zIotHubMqtt.publish(zIotHubTopicPub, presence);
  Serial.print(F("MQTT presence: "));
  Serial.println(sent ? F("sent") : F("failed"));
}

void zIotHubMqttSetup() {
  snprintf(zIotHubTopicPub, sizeof(zIotHubTopicPub), "iot/data/%s", zIotHubToken);
  snprintf(zIotHubTopicCmd, sizeof(zIotHubTopicCmd), "iot/commands/%s", zIotHubKit);
  zIotHubMqtt.setServer(zIotHubHost, zIotHubPort);
  zIotHubMqtt.setCallback(zIotHubMqttCallback);

  Serial.println();
  Serial.println(F("================================"));
  Serial.println(F(" Zappie IoT Hub - MQTT"));
  Serial.println(F("================================"));
  Serial.print(F("Broker   : "));
  Serial.print(zIotHubHost);
  Serial.print(F(":"));
  Serial.println(zIotHubPort);
  Serial.print(F("Publish  : "));
  Serial.println(zIotHubTopicPub);
  Serial.print(F("Commands : "));
  Serial.println(zIotHubTopicCmd);
  Serial.print(F("Kit      : "));
  Serial.println(zIotHubKit);

  zIotHubConnectMqtt();
}
`;
  }

  function ensureZIotHubRuntime(protocol) {
    const proto = protocol || Blockly.Arduino._zIotHubProtocol || 'http';
    Blockly.Arduino._zIotHubProtocol = proto;
    ensureZIotHubCreds();
    if (proto === 'mqtt') {
      ensureZIotHubMqtt();
    } else {
      ensureZIotHubRest(proto === 'https');
    }
    Blockly.Arduino.setups_['00_serial_monitor'] = 'Serial.begin(115200);\ndelay(300);\n';
    Blockly.Arduino.setups_['05_zioth_proto_setup'] = proto === 'mqtt'
      ? 'zIotHubMqttSetup();\n'
      : (proto === 'https' ? 'zIotHubHttpsSetup();\n' : 'zIotHubHttpSetup();\n');
  }

  Blockly.Arduino.zioth_wifi_connect = function (block) {
    const ssid = Blockly.Arduino.valueToCode(block, 'SSID', Blockly.Arduino.ORDER_ATOMIC) || '""';
    const password = Blockly.Arduino.valueToCode(block, 'PASSWORD', Blockly.Arduino.ORDER_ATOMIC) || '""';

    ensureZIotHubCreds();
    Blockly.Arduino.definitions_['zioth_wifi_creds'] = `
const char* zIotHubWifiSsid = ${ssid};
const char* zIotHubWifiPass = ${password};
`;
    Blockly.Arduino.setups_['01_zioth_wifi_connect'] = 'zIotHubConnectWifi();\n';
    return '';
  };

  Blockly.Arduino.zioth_server_connect = function (block) {
    const protocol = block.getFieldValue('PROTOCOL') || 'http';
    const host = Blockly.Arduino.valueToCode(block, 'HOST', Blockly.Arduino.ORDER_ATOMIC) || '"160.187.69.147"';
    const port = Blockly.Arduino.valueToCode(block, 'PORT', Blockly.Arduino.ORDER_ATOMIC) ||
      (protocol === 'mqtt' ? '1883' : '5000');
    const token = Blockly.Arduino.valueToCode(block, 'TOKEN', Blockly.Arduino.ORDER_ATOMIC) || '""';
    const kit = Blockly.Arduino.valueToCode(block, 'KIT', Blockly.Arduino.ORDER_ATOMIC) || '"AIIOT025"';

    Blockly.Arduino.definitions_['zioth_00_creds'] = `
const char* zIotHubHost = ${host};
const int zIotHubPort = ${port};
const char* zIotHubToken = ${token};
const char* zIotHubKit = ${kit};
`;
    ensureZIotHubRuntime(protocol);
    return '';
  };

  Blockly.Arduino.zioth_loop_step = function () {
    const proto = Blockly.Arduino._zIotHubProtocol || 'http';
    ensureZIotHubRuntime(proto);
    if (proto === 'mqtt') {
      return 'if (WiFi.status() != WL_CONNECTED) { zIotHubConnectWifi(); }\n' +
        'if (!zIotHubMqtt.connected()) { zIotHubConnectMqtt(); }\n' +
        'zIotHubMqtt.loop();\n' +
        'zIotHubSendPresence();\n';
    }
    return 'if (WiFi.status() != WL_CONNECTED) { zIotHubConnectWifi(); }\n' +
      'zIotHubSendPresence();\n';
  };

  Blockly.Arduino.zioth_is_connected = function () {
    ensureZIotHubRuntime();
    return ['zIotHubIsConnected()', Blockly.Arduino.ORDER_FUNCTION_CALL];
  };

  Blockly.Arduino.zioth_add_field = function (block) {
    ensureZIotHubRuntime();
    const name = quoteFieldName(
      Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC),
      'distance'
    );
    const value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';
    return `zIotHubAddFieldNumber(${name}, (double)(${value}));\n`;
  };

  Blockly.Arduino.zioth_clear_fields = function () {
    ensureZIotHubRuntime();
    return 'zIotHubClearFields();\n';
  };

  Blockly.Arduino.zioth_send_sensor = function () {
    const proto = Blockly.Arduino._zIotHubProtocol || 'http';
    ensureZIotHubRuntime(proto);
    return proto === 'mqtt' ? 'zIotHubPublish();\n' : 'zIotHubSendHttpData();\n';
  };

  Blockly.Arduino.zioth_register_control = function (block) {
    ensureZIotHubRuntime();
    const key = quoteFieldName(
      Blockly.Arduino.valueToCode(block, 'KEY', Blockly.Arduino.ORDER_ATOMIC),
      'LED'
    );
    const pin = Blockly.Arduino.valueToCode(block, 'PIN', Blockly.Arduino.ORDER_ATOMIC) || '13';
    const setupId = '03_zioth_ctrl_' + key.replace(/[^A-Za-z0-9]/g, '_');
    Blockly.Arduino.setups_[setupId] = `zIotHubRegisterControl(${key}, (int)(${pin}));\n`;
    return `zIotHubRegisterControl(${key}, (int)(${pin}));\n`;
  };

  Blockly.Arduino.zioth_handle_commands = function () {
    const proto = Blockly.Arduino._zIotHubProtocol || 'http';
    ensureZIotHubRuntime(proto);
    return proto === 'mqtt'
      ? 'if (!zIotHubMqtt.connected()) { zIotHubConnectMqtt(); }\nzIotHubMqtt.loop();\n'
      : 'zIotHubCheckCommandsNow();\n';
  };

  return Blockly;
}

exports = addGenerator;
