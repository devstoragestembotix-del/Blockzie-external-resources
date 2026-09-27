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
 * - No default LED/BUZZER/RELAY control pins are auto-registered. Zappie
 *   already owns pins 25/26/27 (drive motors), 4 (face LED matrix), 19
 *   (buzzer/speaker), 12/14 (servos), 16/17 (ultrasonic), 21/22 (IMU/OLED
 *   I2C), 34/35 (IR line sensors), 36/39 (buttons), 15 (vibration) - see
 *   node_modules/blockzie-vm/src/devices/zappie/zappie-peripheral.js. Reusing
 *   any of those for a dashboard command would fight Zappie's own blocks.
 *   Only 2 and 13 are genuinely free connector pins; the user registers
 *   whatever they actually wired there via the "register command key" block.
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

int zIotHubFindControlPin(const char* key) {
  if (key == NULL) return -1;
  for (int i = 0; i < zIotHubControlCount; i++) {
    if (strcmp(zIotHubControls[i].key, key) == 0) return zIotHubControls[i].pin;
  }
  return -1;
}

void zIotHubRegisterControl(const char* key, int pin) {
  if (key == NULL || key[0] == '\\0' || pin < 0) return;
  for (int i = 0; i < zIotHubControlCount; i++) {
    if (strcmp(zIotHubControls[i].key, key) == 0) {
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

  function ensureZIotHubHttps() {
    if (Blockly.Arduino.definitions_['zioth_20_https']) return;
    ensureZIotHubControls();
    Blockly.Arduino.includes_['zioth_http'] = '#include <HTTPClient.h>\n#include <WiFiClientSecure.h>';

    Blockly.Arduino.definitions_['zioth_20_https'] = `
WiFiClientSecure zIotHubSecureClient;
char zIotHubIngestUrl[104];
char zIotHubPollUrl[104];
char zIotHubAckUrl[104];

void zIotHubMakeUrl(char* out, size_t outSize, const char* path) {
  snprintf(out, outSize, "https://%s:%d%s", zIotHubHost, zIotHubPort, path);
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
  http.begin(zIotHubSecureClient, zIotHubAckUrl);
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
  http.begin(zIotHubSecureClient, zIotHubPollUrl);
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

void zIotHubSendHttps() {
  if (zIotHubFieldCount <= 0) {
    Serial.println(F("HTTPS TX: skip (no fields - add a field before send)"));
    return;
  }
  char json[256];
  zIotHubBuildJson(json, sizeof(json));
  zIotHubClearFields();

  Serial.print(F("HTTPS TX: "));
  Serial.println(json);

  HTTPClient http;
  http.begin(zIotHubSecureClient, zIotHubIngestUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", zIotHubToken);
  int code = http.POST(json);

  if (code == 200 || code == 201) {
    Serial.print(F("HTTPS: "));
    Serial.print(code);
    Serial.print(F(" OK -> "));
    Serial.println(http.getString());
  } else if (code == 401) {
    Serial.println(F("HTTPS: 401 - Invalid token! Check the token in the connect block."));
  } else if (code < 0) {
    Serial.print(F("HTTPS: Connection failed - "));
    Serial.println(http.errorToString(code));
  } else {
    Serial.print(F("HTTPS: Error "));
    Serial.println(code);
  }
  http.end();

  for (int p = 0; p < 3; p++) {
    if (!zIotHubPollCommands()) break;
    delay(100);
  }
}

void zIotHubHttpsSetup() {
  // No CA pinning - the dashboard is addressed by raw IP, not a domain with
  // a publicly trusted cert. Swap in setCACert(...) if/when it gets one.
  zIotHubSecureClient.setInsecure();
  zIotHubMakeUrl(zIotHubIngestUrl, sizeof(zIotHubIngestUrl), "/api/ingest");
  zIotHubMakeUrl(zIotHubPollUrl, sizeof(zIotHubPollUrl), "/api/poll");
  zIotHubMakeUrl(zIotHubAckUrl, sizeof(zIotHubAckUrl), "/api/ack");
  Serial.println();
  Serial.println(F("================================"));
  Serial.println(F(" Zappie IoT Hub - HTTPS"));
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
    const proto = protocol || Blockly.Arduino._zIotHubProtocol || 'https';
    Blockly.Arduino._zIotHubProtocol = proto;
    ensureZIotHubCreds();
    if (proto === 'mqtt') {
      ensureZIotHubMqtt();
    } else {
      ensureZIotHubHttps();
    }
    Blockly.Arduino.setups_['00_serial_monitor'] = 'Serial.begin(115200);\ndelay(300);\n';
    Blockly.Arduino.setups_['05_zioth_proto_setup'] =
      proto === 'mqtt' ? 'zIotHubMqttSetup();\n' : 'zIotHubHttpsSetup();\n';
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
    const protocol = block.getFieldValue('PROTOCOL') || 'https';
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
    const proto = Blockly.Arduino._zIotHubProtocol || 'https';
    ensureZIotHubRuntime(proto);
    if (proto === 'mqtt') {
      return 'if (WiFi.status() != WL_CONNECTED) { zIotHubConnectWifi(); }\n' +
        'if (!zIotHubMqtt.connected()) { zIotHubConnectMqtt(); }\n' +
        'zIotHubMqtt.loop();\n';
    }
    return 'if (WiFi.status() != WL_CONNECTED) { zIotHubConnectWifi(); }\n';
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
    const proto = Blockly.Arduino._zIotHubProtocol || 'https';
    ensureZIotHubRuntime(proto);
    return proto === 'mqtt' ? 'zIotHubPublish();\n' : 'zIotHubSendHttps();\n';
  };

  Blockly.Arduino.zioth_register_control = function (block) {
    ensureZIotHubRuntime();
    const key = quoteFieldName(
      Blockly.Arduino.valueToCode(block, 'KEY', Blockly.Arduino.ORDER_ATOMIC),
      'LED'
    );
    const pin = Blockly.Arduino.valueToCode(block, 'PIN', Blockly.Arduino.ORDER_ATOMIC) || '2';
    const setupId = '03_zioth_ctrl_' + key.replace(/[^A-Za-z0-9]/g, '_');
    Blockly.Arduino.setups_[setupId] = `zIotHubRegisterControl(${key}, (int)(${pin}));\n`;
    return `zIotHubRegisterControl(${key}, (int)(${pin}));\n`;
  };

  Blockly.Arduino.zioth_handle_commands = function () {
    const proto = Blockly.Arduino._zIotHubProtocol || 'https';
    ensureZIotHubRuntime(proto);
    return proto === 'mqtt'
      ? 'if (!zIotHubMqtt.connected()) { zIotHubConnectMqtt(); }\nzIotHubMqtt.loop();\n'
      : 'zIotHubPollCommands();\n';
  };

  return Blockly;
}

exports = addGenerator;
