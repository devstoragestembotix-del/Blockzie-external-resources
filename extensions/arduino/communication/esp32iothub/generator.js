/* eslint-disable max-len */
/**
 * ESP32 IoT Hub - MQTT + HTTP
 *
 * This generator mirrors the hand-written, field-tested ESP32 sketches
 * (HTTP POST to /api/ingest + /api/poll + /api/ack, and MQTT pub/sub on
 * iot/data/<token> + iot/commands/<kit> + iot/ack) as closely as possible,
 * instead of trying to auto-inject code into the user's loop(). The user
 * places the "IoT hub keep-alive" block inside their own forever loop,
 * exactly like the working sketches call mqtt.loop() / check WiFi every
 * iteration of loop().
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

  function ensureIotHubCreds() {
    if (!Blockly.Arduino.definitions_['ioth_00_creds']) {
      Blockly.Arduino.definitions_['ioth_00_creds'] = `
const char* iotHubHost = "160.187.69.147";
const int iotHubPort = 5000;
const char* iotHubToken = "";
const char* iotHubKit = "AIIOT025";
`;
    }
    if (!Blockly.Arduino.definitions_['ioth_wifi_creds']) {
      Blockly.Arduino.definitions_['ioth_wifi_creds'] = `
const char* iotHubWifiSsid = "MyWiFi";
const char* iotHubWifiPass = "";
`;
    }
    if (!Blockly.Arduino.definitions_['ioth_wifi_fn']) {
      Blockly.Arduino.includes_['ioth_wifi'] = '#include <WiFi.h>\n#include <string.h>\n#include <math.h>';
      Blockly.Arduino.definitions_['ioth_wifi_fn'] = `
void iotHubConnectWifi() {
  Serial.print(F("Connecting to WiFi"));
  WiFi.begin(iotHubWifiSsid, iotHubWifiPass);
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
  // command -> output-pin registry (LED / BUZZER / RELAY by default).
  function ensureIotHubControls() {
    if (Blockly.Arduino.definitions_['ioth_10_controls']) return;
    Blockly.Arduino.definitions_['ioth_10_controls'] = `
#define IOT_HUB_MAX_FIELDS 12
#define IOT_HUB_MAX_NAME 16
#define IOT_HUB_MAX_VALUE 32

struct IotHubField { char name[IOT_HUB_MAX_NAME]; char value[IOT_HUB_MAX_VALUE]; };
IotHubField iotHubFields[IOT_HUB_MAX_FIELDS];
int iotHubFieldCount = 0;

#define IOT_HUB_MAX_CONTROLS 8
#define IOT_HUB_CTRL_KEY 16
struct IotHubControl { char key[IOT_HUB_CTRL_KEY]; int pin; };
IotHubControl iotHubControls[IOT_HUB_MAX_CONTROLS];
int iotHubControlCount = 0;

int iotHubFindControlPin(const char* key) {
  if (key == NULL) return -1;
  for (int i = 0; i < iotHubControlCount; i++) {
    if (strcmp(iotHubControls[i].key, key) == 0) return iotHubControls[i].pin;
  }
  return -1;
}

void iotHubRegisterControl(const char* key, int pin) {
  if (key == NULL || key[0] == '\\0' || pin < 0) return;
  for (int i = 0; i < iotHubControlCount; i++) {
    if (strcmp(iotHubControls[i].key, key) == 0) {
      iotHubControls[i].pin = pin;
      pinMode(pin, OUTPUT);
      digitalWrite(pin, LOW);
      return;
    }
  }
  if (iotHubControlCount >= IOT_HUB_MAX_CONTROLS) return;
  strncpy(iotHubControls[iotHubControlCount].key, key, IOT_HUB_CTRL_KEY - 1);
  iotHubControls[iotHubControlCount].key[IOT_HUB_CTRL_KEY - 1] = '\\0';
  iotHubControls[iotHubControlCount].pin = pin;
  iotHubControlCount++;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
}

void iotHubConfigureDefaultControls() {
  if (iotHubFindControlPin("LED") < 0) iotHubRegisterControl("LED", 25);
  if (iotHubFindControlPin("BUZZER") < 0) iotHubRegisterControl("BUZZER", 26);
  if (iotHubFindControlPin("RELAY") < 0) iotHubRegisterControl("RELAY", 27);
}

bool iotHubApplyCommand(const char* command, const char** stateOut) {
  if (command == NULL || command[0] == '\\0') return false;
  int high = -1;
  char key[IOT_HUB_CTRL_KEY];
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
  int pin = iotHubFindControlPin(key);
  if (pin < 0 || high < 0) return false;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, high ? HIGH : LOW);
  if (stateOut) *stateOut = high ? "HIGH" : "LOW";
  return true;
}

void iotHubAddField(const char* name, const char* value) {
  if (name == NULL || name[0] == '\\0' || value == NULL) return;
  for (int i = 0; i < iotHubFieldCount; i++) {
    if (strcmp(iotHubFields[i].name, name) == 0) {
      strncpy(iotHubFields[i].value, value, IOT_HUB_MAX_VALUE - 1);
      iotHubFields[i].value[IOT_HUB_MAX_VALUE - 1] = '\\0';
      return;
    }
  }
  if (iotHubFieldCount >= IOT_HUB_MAX_FIELDS) return;
  strncpy(iotHubFields[iotHubFieldCount].name, name, IOT_HUB_MAX_NAME - 1);
  iotHubFields[iotHubFieldCount].name[IOT_HUB_MAX_NAME - 1] = '\\0';
  strncpy(iotHubFields[iotHubFieldCount].value, value, IOT_HUB_MAX_VALUE - 1);
  iotHubFields[iotHubFieldCount].value[IOT_HUB_MAX_VALUE - 1] = '\\0';
  iotHubFieldCount++;
}

void iotHubAddFieldNumber(const char* name, double value) {
  char buf[IOT_HUB_MAX_VALUE];
  if (isnan(value) || isinf(value)) snprintf(buf, sizeof(buf), "0");
  else dtostrf(value, 0, 2, buf);
  iotHubAddField(name, buf);
  Serial.print(F("FIELD add: "));
  Serial.print(name);
  Serial.print(F("="));
  Serial.println(buf);
}

void iotHubClearFields() { iotHubFieldCount = 0; }

int iotHubBuildJson(char* out, size_t outSize) {
  int pos = snprintf(out, outSize, "{");
  for (int i = 0; i < iotHubFieldCount && pos < (int)outSize - 40; i++) {
    if (i > 0) pos += snprintf(out + pos, outSize - pos, ",");
    pos += snprintf(out + pos, outSize - pos, "\\"%s\\":%s", iotHubFields[i].name, iotHubFields[i].value);
  }
  if (pos < (int)outSize - 2) {
    out[pos++] = '}';
    out[pos] = '\\0';
  }
  return pos;
}
`;
  }

  function ensureIotHubHttp() {
    if (Blockly.Arduino.definitions_['ioth_20_http']) return;
    ensureIotHubControls();
    Blockly.Arduino.includes_['ioth_http'] = '#include <HTTPClient.h>';

    Blockly.Arduino.definitions_['ioth_20_http'] = `
char iotHubIngestUrl[96];
char iotHubPollUrl[96];
char iotHubAckUrl[96];

void iotHubMakeUrl(char* out, size_t outSize, const char* path) {
  snprintf(out, outSize, "http://%s:%d%s", iotHubHost, iotHubPort, path);
}

bool iotHubIsConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void iotHubExecuteCommand(const String& command) {
  Serial.print(F(">>> CMD: "));
  Serial.println(command);
  const char* state = "LOW";
  if (!iotHubApplyCommand(command.c_str(), &state)) {
    Serial.println(F("Unknown command"));
  }
}

void iotHubSendAck(const String& command) {
  HTTPClient http;
  http.begin(iotHubAckUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", iotHubToken);
  String body = String("{\\"command\\":\\"") + command + "\\",\\"state\\":\\"" +
    (command.endsWith("ON") ? "HIGH" : "LOW") + "\\"}";
  http.POST(body);
  http.end();
  Serial.print(F("ACK: "));
  Serial.println(command);
}

bool iotHubPollCommands() {
  HTTPClient http;
  http.begin(iotHubPollUrl);
  http.addHeader("X-Device-Token", iotHubToken);
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
          iotHubExecuteCommand(cmd);
          iotHubSendAck(cmd);
          gotCommand = true;
        }
      }
    }
  }
  http.end();
  return gotCommand;
}

void iotHubSendHttp() {
  if (iotHubFieldCount <= 0) {
    Serial.println(F("HTTP TX: skip (no fields - add a field before send)"));
    return;
  }
  char json[256];
  iotHubBuildJson(json, sizeof(json));
  iotHubClearFields();

  Serial.print(F("HTTP TX: "));
  Serial.println(json);

  HTTPClient http;
  http.begin(iotHubIngestUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", iotHubToken);
  int code = http.POST(json);

  if (code == 200 || code == 201) {
    Serial.print(F("HTTP: "));
    Serial.print(code);
    Serial.print(F(" OK -> "));
    Serial.println(http.getString());
  } else if (code == 401) {
    Serial.println(F("HTTP: 401 - Invalid token! Check the token in the connect block."));
  } else if (code < 0) {
    Serial.print(F("HTTP: Connection failed - "));
    Serial.println(http.errorToString(code));
  } else {
    Serial.print(F("HTTP: Error "));
    Serial.println(code);
  }
  http.end();

  for (int p = 0; p < 3; p++) {
    if (!iotHubPollCommands()) break;
    delay(100);
  }
}

void iotHubHttpSetup() {
  iotHubMakeUrl(iotHubIngestUrl, sizeof(iotHubIngestUrl), "/api/ingest");
  iotHubMakeUrl(iotHubPollUrl, sizeof(iotHubPollUrl), "/api/poll");
  iotHubMakeUrl(iotHubAckUrl, sizeof(iotHubAckUrl), "/api/ack");
  Serial.println();
  Serial.println(F("================================"));
  Serial.println(F(" ESP32 IoT Hub - HTTP"));
  Serial.println(F("================================"));
  Serial.print(F("Server : "));
  Serial.println(iotHubIngestUrl);
  Serial.print(F("Kit    : "));
  Serial.println(iotHubKit);
}
`;
  }

  function ensureIotHubMqtt() {
    if (Blockly.Arduino.definitions_['ioth_20_mqtt']) return;
    ensureIotHubControls();
    Blockly.Arduino.includes_['ioth_pubsub'] = '#include <PubSubClient.h>';

    Blockly.Arduino.definitions_['ioth_20_mqtt'] = `
WiFiClient iotHubWifiClient;
PubSubClient iotHubMqtt(iotHubWifiClient);
char iotHubTopicPub[128];
char iotHubTopicCmd[64];
const char* iotHubTopicAck = "iot/ack";

bool iotHubIsConnected() {
  return iotHubMqtt.connected() && (WiFi.status() == WL_CONNECTED);
}

void iotHubExecuteCommand(const char* command) {
  Serial.print(F(">>> CMD: "));
  Serial.println(command);
  const char* state = "LOW";
  if (!iotHubApplyCommand(command, &state)) {
    Serial.println(F("Unknown command"));
    return;
  }
  if (iotHubMqtt.connected()) {
    char ack[160];
    snprintf(ack, sizeof(ack), "{\\"kit_number\\":\\"%s\\",\\"command\\":\\"%s\\",\\"state\\":\\"%s\\"}",
      iotHubKit, command, state);
    iotHubMqtt.publish(iotHubTopicAck, ack);
    Serial.print(F("ACK: "));
    Serial.println(ack);
  }
}

void iotHubMqttCallback(char* topic, byte* payload, unsigned int length) {
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
  iotHubExecuteCommand(ci);
}

void iotHubConnectMqtt() {
  while (!iotHubMqtt.connected()) {
    if (WiFi.status() != WL_CONNECTED) {
      iotHubConnectWifi();
      if (WiFi.status() != WL_CONNECTED) return;
    }
    Serial.print(F("Connecting to MQTT broker..."));
    char clientId[48];
    snprintf(clientId, sizeof(clientId), "iot-%s", iotHubKit);
    if (iotHubMqtt.connect(clientId)) {
      Serial.println(F(" connected!"));
      Serial.print(F("Subscribed to: "));
      Serial.println(iotHubTopicCmd);
      iotHubMqtt.subscribe(iotHubTopicCmd);
    } else {
      Serial.print(F(" failed (rc="));
      Serial.print(iotHubMqtt.state());
      Serial.println(F("). Retrying in 3s..."));
      delay(3000);
    }
  }
}

void iotHubPublish() {
  if (iotHubFieldCount <= 0) {
    Serial.println(F("MQTT TX: skip (no fields - add a field before send)"));
    return;
  }
  char json[256];
  iotHubBuildJson(json, sizeof(json));
  iotHubClearFields();
  iotHubMqtt.publish(iotHubTopicPub, json);
  Serial.print(F("MQTT TX: "));
  Serial.println(json);
}

void iotHubMqttSetup() {
  snprintf(iotHubTopicPub, sizeof(iotHubTopicPub), "iot/data/%s", iotHubToken);
  snprintf(iotHubTopicCmd, sizeof(iotHubTopicCmd), "iot/commands/%s", iotHubKit);
  iotHubMqtt.setServer(iotHubHost, iotHubPort);
  iotHubMqtt.setCallback(iotHubMqttCallback);

  Serial.println();
  Serial.println(F("================================"));
  Serial.println(F(" ESP32 IoT Hub - MQTT"));
  Serial.println(F("================================"));
  Serial.print(F("Broker   : "));
  Serial.print(iotHubHost);
  Serial.print(F(":"));
  Serial.println(iotHubPort);
  Serial.print(F("Publish  : "));
  Serial.println(iotHubTopicPub);
  Serial.print(F("Commands : "));
  Serial.println(iotHubTopicCmd);
  Serial.print(F("Kit      : "));
  Serial.println(iotHubKit);

  iotHubConnectMqtt();
}
`;
  }

  function ensureIotHubRuntime(protocol) {
    const proto = protocol || Blockly.Arduino._iotHubProtocol || 'http';
    Blockly.Arduino._iotHubProtocol = proto;
    ensureIotHubCreds();
    if (proto === 'mqtt') {
      ensureIotHubMqtt();
    } else {
      ensureIotHubHttp();
    }
    Blockly.Arduino.setups_['00_serial_monitor'] = 'Serial.begin(115200);\ndelay(300);\n';
    Blockly.Arduino.setups_['02_ioth_default_controls'] = 'iotHubConfigureDefaultControls();\n';
    Blockly.Arduino.setups_['05_ioth_proto_setup'] =
      proto === 'mqtt' ? 'iotHubMqttSetup();\n' : 'iotHubHttpSetup();\n';
  }

  Blockly.Arduino.ioth_wifi_connect = function (block) {
    const ssid = Blockly.Arduino.valueToCode(block, 'SSID', Blockly.Arduino.ORDER_ATOMIC) || '""';
    const password = Blockly.Arduino.valueToCode(block, 'PASSWORD', Blockly.Arduino.ORDER_ATOMIC) || '""';

    ensureIotHubCreds();
    Blockly.Arduino.definitions_['ioth_wifi_creds'] = `
const char* iotHubWifiSsid = ${ssid};
const char* iotHubWifiPass = ${password};
`;
    Blockly.Arduino.setups_['01_ioth_wifi_connect'] = 'iotHubConnectWifi();\n';
    return '';
  };

  Blockly.Arduino.ioth_server_connect = function (block) {
    const protocol = block.getFieldValue('PROTOCOL') || 'http';
    const host = Blockly.Arduino.valueToCode(block, 'HOST', Blockly.Arduino.ORDER_ATOMIC) || '"160.187.69.147"';
    const port = Blockly.Arduino.valueToCode(block, 'PORT', Blockly.Arduino.ORDER_ATOMIC) ||
      (protocol === 'mqtt' ? '1883' : '5000');
    const token = Blockly.Arduino.valueToCode(block, 'TOKEN', Blockly.Arduino.ORDER_ATOMIC) || '""';
    const kit = Blockly.Arduino.valueToCode(block, 'KIT', Blockly.Arduino.ORDER_ATOMIC) || '"AIIOT025"';

    Blockly.Arduino.definitions_['ioth_00_creds'] = `
const char* iotHubHost = ${host};
const int iotHubPort = ${port};
const char* iotHubToken = ${token};
const char* iotHubKit = ${kit};
`;
    ensureIotHubRuntime(protocol);
    return '';
  };

  Blockly.Arduino.ioth_loop_step = function () {
    const proto = Blockly.Arduino._iotHubProtocol || 'http';
    ensureIotHubRuntime(proto);
    if (proto === 'mqtt') {
      return 'if (WiFi.status() != WL_CONNECTED) { iotHubConnectWifi(); }\n' +
        'if (!iotHubMqtt.connected()) { iotHubConnectMqtt(); }\n' +
        'iotHubMqtt.loop();\n';
    }
    return 'if (WiFi.status() != WL_CONNECTED) { iotHubConnectWifi(); }\n';
  };

  Blockly.Arduino.ioth_is_connected = function () {
    ensureIotHubRuntime();
    return ['iotHubIsConnected()', Blockly.Arduino.ORDER_FUNCTION_CALL];
  };

  Blockly.Arduino.ioth_add_field = function (block) {
    ensureIotHubRuntime();
    const name = quoteFieldName(
      Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC),
      'temp'
    );
    const value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';
    return `iotHubAddFieldNumber(${name}, (double)(${value}));\n`;
  };

  Blockly.Arduino.ioth_clear_fields = function () {
    ensureIotHubRuntime();
    return 'iotHubClearFields();\n';
  };

  Blockly.Arduino.ioth_send_sensor = function () {
    const proto = Blockly.Arduino._iotHubProtocol || 'http';
    ensureIotHubRuntime(proto);
    return proto === 'mqtt' ? 'iotHubPublish();\n' : 'iotHubSendHttp();\n';
  };

  Blockly.Arduino.ioth_register_control = function (block) {
    ensureIotHubRuntime();
    const key = quoteFieldName(
      Blockly.Arduino.valueToCode(block, 'KEY', Blockly.Arduino.ORDER_ATOMIC),
      'LED'
    );
    const pin = Blockly.Arduino.valueToCode(block, 'PIN', Blockly.Arduino.ORDER_ATOMIC) || '25';
    const setupId = '03_ioth_ctrl_' + key.replace(/[^A-Za-z0-9]/g, '_');
    Blockly.Arduino.setups_[setupId] = `iotHubRegisterControl(${key}, (int)(${pin}));\n`;
    return `iotHubRegisterControl(${key}, (int)(${pin}));\n`;
  };

  Blockly.Arduino.ioth_handle_commands = function () {
    const proto = Blockly.Arduino._iotHubProtocol || 'http';
    ensureIotHubRuntime(proto);
    return proto === 'mqtt'
      ? 'if (!iotHubMqtt.connected()) { iotHubConnectMqtt(); }\niotHubMqtt.loop();\n'
      : 'iotHubPollCommands();\n';
  };

  return Blockly;
}

exports = addGenerator;
