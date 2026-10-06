/* eslint-disable max-len */
function addGenerator (Blockly) {

    function quoteFieldName (code, fallback) {
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

    // iotDashboardWifi used to sticky-rewrite loop delay() -> iotDashDelay().
    // That breaks ESP-01 iotWifi sketches (no iotDashDelay). Always revert here.
    function installIotWifiDelayGuard () {
        const VER = 1;
        if (
            typeof Blockly.Arduino.finish !== 'function' ||
            Blockly.Arduino.finish._iotWifiDelayGuard === VER
        ) {
            return;
        }
        const prevFinish = Blockly.Arduino.finish.bind(Blockly.Arduino);
        const patched = function (code) {
            let out = prevFinish(code);
            const hasDashLib =
                out.indexOf('void iotDashDelay(') !== -1 ||
                out.indexOf('iotDashInit(') !== -1;
            if (hasDashLib) return out;
            const loopMatch = out.match(/void\s+loop\s*\(\s*\)\s*\{/);
            if (!loopMatch) return out;
            const start = loopMatch.index + loopMatch[0].length;
            let depth = 1;
            let i = start;
            for (; i < out.length; i++) {
                const ch = out[i];
                if (ch === '{') depth++;
                else if (ch === '}') {
                    depth--;
                    if (depth === 0) break;
                }
            }
            if (depth !== 0) return out;
            const head = out.slice(0, start);
            const body = out.slice(start, i);
            const tail = out.slice(i);
            const newBody = body.replace(
                /(^|[^A-Za-z0-9_])iotDashDelay\s*\(/g,
                '$1delay('
            );
            return head + newBody + tail;
        };
        patched._iotWifiDelayGuard = VER;
        Blockly.Arduino.finish = patched;
    }

    installIotWifiDelayGuard();

    function getProtocol () {
        return Blockly.Arduino.iotProtocolMode_ || 'websocket';
    }

    function ensureIotCredentials () {
        if (!Blockly.Arduino.definitions_['iot_wifi_ssid']) {
            Blockly.Arduino.definitions_['iot_wifi_ssid'] = 'const char* iotSSID = "MyWiFi";';
        }
        if (!Blockly.Arduino.definitions_['iot_wifi_pass']) {
            Blockly.Arduino.definitions_['iot_wifi_pass'] = 'const char* iotWiFiPass = "";';
        }
        if (!Blockly.Arduino.definitions_['iot_ws_host']) {
            Blockly.Arduino.definitions_['iot_ws_host'] = 'const char* iotServerHost = "192.168.1.1";';
        }
        if (!Blockly.Arduino.definitions_['iot_ws_port']) {
            Blockly.Arduino.definitions_['iot_ws_port'] = 'const int iotServerPort = 5010;';
        }
        if (!Blockly.Arduino.definitions_['iot_ws_token']) {
            Blockly.Arduino.definitions_['iot_ws_token'] = 'const char* iotDeviceToken = "";';
        }
        if (!Blockly.Arduino.definitions_['iot_kit_number']) {
            Blockly.Arduino.definitions_['iot_kit_number'] = 'const char* iotKitNumber = "AIIOT001";';
        }
    }

    function ensureEsp01Lib () {
        ensureIotCredentials();
        const protocol = getProtocol();
        // Bump IOT_LIB_VER whenever init/buffers change — else Blockly keeps stale lib
        // while protocol stays WebSocket (AT+RST / RX=96 never leave the sketch).
        const IOT_LIB_VER = '20260919f';
        installIotWifiDelayGuard();
        if (Blockly.Arduino.definitions_['iot_wifi_lib'] &&
            Blockly.Arduino.iotEsp01LibProtocol_ === protocol &&
            Blockly.Arduino.iotEsp01LibVer_ === IOT_LIB_VER) {
            return;
        }

        let protoConst = 'IOT_PROTO_WS';
        if (protocol === 'tcp') protoConst = 'IOT_PROTO_TCP';
        else if (protocol === 'udp') protoConst = 'IOT_PROTO_UDP';

        // SoftSerial RX=128 — Nano RAM tight with DHT; WS fix is TX/RX interleave not bigger buff
        Blockly.Arduino.includes_['iot_software_serial'] = `#define _SS_MAX_RX_BUFF 128
#include <SoftwareSerial.h>
#include <string.h>
#include <avr/pgmspace.h>`;

        Blockly.Arduino.iotEsp01LibProtocol_ = protocol;
        Blockly.Arduino.iotEsp01LibVer_ = IOT_LIB_VER;

        Blockly.Arduino.definitions_['iot_wifi_defaults'] = `
#ifndef IOT_ESP_RX_PIN
#define IOT_ESP_RX_PIN 13
#endif
#ifndef IOT_ESP_TX_PIN
#define IOT_ESP_TX_PIN 2
#endif

// Compat: iotDashboardWifi sticky finish may emit iotDashDelay() in loop
#ifndef iotDashDelay
#define iotDashDelay delay
#endif

#define IOT_PROTO_WS 0
#define IOT_PROTO_TCP 1
#define IOT_PROTO_UDP 2
#define IOT_WS_PATH "/"
#define IOT_RECONNECT_DELAY 5000
#define IOT_UDP_REGISTER_INTERVAL 8000UL
#define IOT_WS_KEEPALIVE_INTERVAL 8000UL
#define IOT_TCP_PING_INTERVAL 10000UL
#define IOT_MIN_SEND_GAP 350UL
#define IOT_MAX_FIELDS 4
#define IOT_MAX_FIELD_NAME 16
#define IOT_MAX_FIELD_VALUE 12
#define IOT_RESP_MAX 160
#define IOT_MAX_CONTROLS 8
#define IOT_MAX_CONTROL_KEY 16
#define IOT_MAX_CMD 32

const int iotProtocol = ${protoConst};

SoftwareSerial iotEspSerial(IOT_ESP_RX_PIN, IOT_ESP_TX_PIN);
unsigned long iotEspBaud = 9600;
bool iotEspReady = false;
unsigned long iotEspLastFailAt = 0;

enum IotState { IOT_ST_CONNECT, IOT_ST_LINK, IOT_ST_AUTH, IOT_ST_ONLINE, IOT_ST_RETRY };
IotState iotState = IOT_ST_CONNECT;
unsigned long iotRetryAt = 0;
unsigned long iotLastRegister = 0;
unsigned long iotLastSendTime = 0;
unsigned long iotLastSensorAt = 0;
int iotSendFailCount = 0;
bool iotWifiConnected = false;

struct IotField {
  char name[IOT_MAX_FIELD_NAME];
  char value[IOT_MAX_FIELD_VALUE];
};
IotField iotFields[IOT_MAX_FIELDS];
int iotFieldCount = 0;

struct IotControl {
  char key[IOT_MAX_CONTROL_KEY];
  int pin;
};
IotControl iotControls[IOT_MAX_CONTROLS];
int iotControlCount = 0;

char iotIp[16] = "0.0.0.0";
bool iotLinkOpen = false;
char iotRespBuf[IOT_RESP_MAX];
int iotRespLen = 0;
char iotTxBuf[180];
bool iotWsExpectHttp101 = false;

const char iotB64Chars[] PROGMEM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
`;

        Blockly.Arduino.definitions_['iot_wifi_lib'] = `
void iotSendStr(const char* s);
int iotReadToBuf(unsigned long timeout);
bool iotSendAT(const char* cmd, const char* expect, unsigned long timeout);
bool iotIpdReceiveToBuf(unsigned long timeout, bool stripNewline);
void iotHandleMessage(const char* msg);
void iotEspFlush();
void iotCloseLink();
bool iotTransportSend(const char* payload);
void iotSendAuthOrRegister();
void iotSendUdpKeepAlive();
void iotSendWsKeepAlive();
bool iotWsUnwrapToJson(char* buf, int len);

const __FlashStringHelper* iotProtocolName() {
  if (iotProtocol == IOT_PROTO_TCP) return F("TCP");
  if (iotProtocol == IOT_PROTO_UDP) return F("UDP");
  return F("WebSocket");
}

// SoftSerial RX interrupts corrupt Hardware Serial mid-print — flush ESP first,
// and never dump raw WS binary frames to the USB serial monitor.
void iotSerialGate() {
  while (iotEspSerial.available()) iotEspSerial.read();
  Serial.flush();
}

void iotPrintAscii(const char* s) {
  if (s == NULL) return;
  for (int i = 0; s[i] != '\\0'; i++) {
    char c = s[i];
    if (c >= 32 && c <= 126) Serial.write((uint8_t)c);
    else if (c == '\\r' || c == '\\n' || c == '\\t') Serial.write(' ');
  }
}

void iotPrintlnAscii(const char* s) {
  iotPrintAscii(s);
  Serial.println();
}

bool iotIsValidIp(const char* ip) {
  if (ip == NULL) return false;
  int len = strlen(ip);
  if (len < 7 || strcmp(ip, "0.0.0.0") == 0) return false;
  int dots = 0;
  for (int i = 0; i < len; i++) {
    char c = ip[i];
    if (c == '.') dots++;
    else if (c < '0' || c > '9') return false;
  }
  return dots == 3;
}

void iotParseIpFromCifsr(const char* resp) {
  const char* marker = strstr(resp, "STAIP");
  if (marker) {
    const char* start = strchr(marker, '"');
    if (start) {
      start++;
      const char* end = strchr(start, '"');
      if (end && end > start && (end - start) < 16) {
        char ip[16];
        memcpy(ip, start, end - start);
        ip[end - start] = '\\0';
        if (iotIsValidIp(ip)) {
          strncpy(iotIp, ip, sizeof(iotIp) - 1);
          iotIp[sizeof(iotIp) - 1] = '\\0';
          return;
        }
      }
    }
  }
}

bool iotFetchIp() {
  strncpy(iotIp, "0.0.0.0", sizeof(iotIp) - 1);
  iotIp[sizeof(iotIp) - 1] = '\\0';
  // One attempt only — CIFSR spam + DHT later = SoftSerial loss on Nano
  delay(200);
  while (iotEspSerial.available()) iotEspSerial.read();
  iotSendStr("AT+CIFSR");
  iotReadToBuf(2500);
  iotParseIpFromCifsr(iotRespBuf);
  return iotIsValidIp(iotIp);
}

void iotPrintStatus() {
  Serial.println(F("---------- IoT STATUS ----------"));
  Serial.print(F("Protocol : "));
  Serial.println(iotProtocolName());
  Serial.print(F("WiFi     : "));
  Serial.println(iotWifiConnected ? F("CONNECTED") : F("DISCONNECTED"));
  Serial.print(F("SSID     : "));
  Serial.println(iotSSID);
  Serial.print(F("IP       : "));
  Serial.println(iotIp);
  Serial.print(F("Server   : "));
  Serial.print(iotServerHost);
  Serial.print(F(":"));
  Serial.println(iotServerPort);
  Serial.print(F("Link     : "));
  Serial.println(iotLinkOpen ? F("OPEN") : F("CLOSED"));
  Serial.print(F("State    : "));
  if (iotState == IOT_ST_ONLINE) Serial.println(F("ONLINE"));
  else if (iotState == IOT_ST_RETRY) Serial.println(F("RETRY"));
  else if (iotState == IOT_ST_CONNECT) Serial.println(F("WIFI"));
  else if (iotState == IOT_ST_LINK) Serial.println(F("LINK"));
  else if (iotState == IOT_ST_AUTH) Serial.println(F("AUTH"));
  else Serial.println(F("?"));
  Serial.println(F("--------------------------------"));
}

void iotSendStr(const char* s) {
  // Match working IDE UDP sketch: SoftSerial needs paced TX or ESP drops chars
  for (int i = 0; s[i] != '\\0'; i++) {
    iotEspSerial.write((uint8_t)s[i]);
    delay(2);
  }
  iotEspSerial.write('\\r'); delay(2);
  iotEspSerial.write('\\n'); delay(40);
}

void iotEspBegin(long baud) {
  // Prefer begin-only; SoftSerial.end() thrash broke RX vs IDE sketches
  iotEspSerial.begin(baud);
  iotEspSerial.listen();
  iotEspBaud = baud;
  delay(50);
  while (iotEspSerial.available()) iotEspSerial.read();
}

// Fill iotRespBuf (no Arduino String — saves Nano RAM)
int iotReadToBuf(unsigned long timeout) {
  iotRespLen = 0;
  iotRespBuf[0] = '\\0';
  unsigned long start = millis();
  while (millis() - start < timeout) {
    while (iotEspSerial.available()) {
      char c = (char)iotEspSerial.read();
      if (iotRespLen < IOT_RESP_MAX - 1) {
        iotRespBuf[iotRespLen++] = c;
        iotRespBuf[iotRespLen] = '\\0';
      }
    }
    if (strstr(iotRespBuf, "OK") || strstr(iotRespBuf, "ERROR") ||
        strstr(iotRespBuf, "FAIL") || strstr(iotRespBuf, "WIFI GOT IP") ||
        strstr(iotRespBuf, ">") || strstr(iotRespBuf, "SEND OK") ||
        strstr(iotRespBuf, "101")) {
      delay(50);
      while (iotEspSerial.available()) {
        char c = (char)iotEspSerial.read();
        if (iotRespLen < IOT_RESP_MAX - 1) {
          iotRespBuf[iotRespLen++] = c;
          iotRespBuf[iotRespLen] = '\\0';
        }
      }
      break;
    }
  }
  while (iotEspSerial.available()) {
    char c = (char)iotEspSerial.read();
    if (iotRespLen < IOT_RESP_MAX - 1) {
      iotRespBuf[iotRespLen++] = c;
      iotRespBuf[iotRespLen] = '\\0';
    }
  }
  if (strstr(iotRespBuf, "WIFI GOT IP") || strstr(iotRespBuf, "WIFI CONNECTED")) {
    iotWifiConnected = true;
  }
  return iotRespLen;
}

bool iotWaitFor(const char* keyword, unsigned long timeout) {
  iotReadToBuf(timeout);
  if (strstr(iotRespBuf, keyword)) return true;
  return false;
}

bool iotFlushQuiet(unsigned long quietMs, unsigned long maxMs) {
  unsigned long start = millis();
  unsigned long lastByte = millis();
  while (millis() - start < maxMs) {
    while (iotEspSerial.available()) {
      iotEspSerial.read();
      lastByte = millis();
    }
    if (millis() - lastByte >= quietMs) return true;
  }
  while (iotEspSerial.available()) iotEspSerial.read();
  return false;
}

bool iotSendAT(const char* cmd, const char* expect, unsigned long timeout) {
  while (iotEspSerial.available()) iotEspSerial.read();
  iotSendStr(cmd);
  iotReadToBuf(timeout);
  return (expect == NULL) || (strstr(iotRespBuf, expect) != NULL);
}

bool iotInitEsp() {
  if (iotEspReady) return true;
  if (iotEspLastFailAt != 0 && (millis() - iotEspLastFailAt) < 5000UL) {
    return false;
  }

  // NEVER SoftSerial.end() — breaks RX on Nano
  Serial.println(F("[ESP] init..."));
  Serial.println(F("[ESP] pins RX=D13 TX=D2 baud=9600"));
  Serial.flush();

  iotEspSerial.begin(9600);
  iotEspSerial.listen();
  iotEspBaud = 9600;
  delay(2500);
  while (iotEspSerial.available()) iotEspSerial.read();

  for (int i = 0; i < 6; i++) {
    iotEspSerial.listen();
    while (iotEspSerial.available()) iotEspSerial.read();
    if (iotSendAT("AT", "OK", 3000)) {
      iotEspReady = true;
      iotEspLastFailAt = 0;
      Serial.println(F("[ESP] ready"));
      return true;
    }
    Serial.print(F("[ESP] AT fail #"));
    Serial.print(i + 1);
    Serial.print(F(" bytes="));
    Serial.println(iotRespLen);
    if (iotRespLen > 0) {
      Serial.print(F("[ESP] rx: "));
      iotPrintlnAscii(iotRespBuf);
    }
    delay(400);
  }

  iotEspLastFailAt = millis();
  Serial.println(F("[ESP] not responding"));
  if (iotRespLen == 0) {
    Serial.println(F("  -> 0 bytes: ESP power/EN/socket or TX/RX swap"));
  } else {
    Serial.println(F("  -> garbage bytes: baud mismatch (need 9600)"));
  }
  return false;
}

void iotBase64Encode(const uint8_t* in, int len, char* out) {
  int i = 0, j = 0, rem = len;
  while (rem > 0) {
    int chunk = (rem >= 3) ? 3 : rem;
    uint8_t a0 = in[i];
    uint8_t a1 = (chunk > 1) ? in[i + 1] : 0;
    uint8_t a2 = (chunk > 2) ? in[i + 2] : 0;
    out[j++] = (char)pgm_read_byte(&iotB64Chars[a0 >> 2]);
    out[j++] = (char)pgm_read_byte(&iotB64Chars[((a0 & 3) << 4) | (a1 >> 4)]);
    out[j++] = (chunk > 1) ? (char)pgm_read_byte(&iotB64Chars[((a1 & 15) << 2) | (a2 >> 6)]) : '=';
    out[j++] = (chunk > 2) ? (char)pgm_read_byte(&iotB64Chars[a2 & 63]) : '=';
    i += chunk;
    rem -= chunk;
  }
  out[j] = '\\0';
}

bool iotConnectWiFi() {
  if (iotWifiConnected) {
    Serial.println(F("[WiFi] already CONNECTED"));
    Serial.print(F("[WiFi] IP: "));
    Serial.println(iotIp);
    return true;
  }
  if (!iotInitEsp()) return false;

  iotSendStr("AT+CWJAP?");
  iotReadToBuf(3000);
  if (strstr(iotRespBuf, iotSSID) || strstr(iotRespBuf, "WIFI GOT IP")) {
    Serial.print(F("[WiFi] already on SSID: "));
    Serial.println(iotSSID);
    iotWifiConnected = true;
    if (iotFetchIp()) {
      Serial.print(F("[WiFi] IP: "));
      Serial.println(iotIp);
    } else {
      Serial.println(F("[WiFi] IP: (skip)"));
    }
    return true;
  }

  while (iotEspSerial.available()) iotEspSerial.read();
  delay(500);

  iotSendAT("AT+CWMODE=1", "OK", 3000); delay(200);
  iotSendAT("AT+CIPMUX=0", "OK", 3000); delay(200);

  Serial.print(F("[WiFi] connecting SSID: "));
  Serial.println(iotSSID);
  Serial.flush();
  char cmd[96];
  snprintf(cmd, sizeof(cmd), "AT+CWJAP=\\"%s\\",\\"%s\\"", iotSSID, iotWiFiPass);
  iotSendStr(cmd);
  // Wait up to 25s with progress (do not use Arduino String)
  {
    iotRespLen = 0;
    iotRespBuf[0] = '\\0';
    unsigned long start = millis();
    unsigned long lastDot = start;
    while (millis() - start < 25000UL) {
      while (iotEspSerial.available()) {
        char c = (char)iotEspSerial.read();
        if (iotRespLen < IOT_RESP_MAX - 1) {
          iotRespBuf[iotRespLen++] = c;
          iotRespBuf[iotRespLen] = '\\0';
        }
      }
      if (strstr(iotRespBuf, "WIFI GOT IP") || strstr(iotRespBuf, "OK") ||
          strstr(iotRespBuf, "FAIL") || strstr(iotRespBuf, "ERROR")) {
        break;
      }
      if (millis() - lastDot >= 1000UL) {
        Serial.print('.');
        Serial.flush();
        lastDot = millis();
      }
    }
    Serial.println();
  }
  if (!strstr(iotRespBuf, "OK") && !strstr(iotRespBuf, "WIFI GOT IP")) {
    Serial.println(F("[WiFi] DISCONNECTED / FAILED"));
    iotWifiConnected = false;
    strncpy(iotIp, "0.0.0.0", sizeof(iotIp) - 1);
    iotIp[sizeof(iotIp) - 1] = '\\0';
    return false;
  }
  iotWifiConnected = true;
  Serial.println(F("[WiFi] CONNECTED"));
  if (iotFetchIp()) {
    Serial.print(F("[WiFi] IP: "));
    Serial.println(iotIp);
  } else {
    Serial.println(F("[WiFi] IP: (not read)"));
  }
  return true;
}

void iotEspFlush() {
  while (iotEspSerial.available()) iotEspSerial.read();
}

// Hard-reset ESP link so TCP/UDP/WS never leave leftover sockets for each other
void iotCloseLink() {
  iotLinkOpen = false;
  iotSendStr("AT+CIPCLOSE");
  delay(350);
  iotEspFlush();
  iotSendAT("AT+CIPMUX=0", "OK", 1500);
  delay(80);
  iotEspFlush();
}

bool iotCipSend(const uint8_t* data, int len) {
  if (len <= 0 || len > 2048) return false;

  unsigned long gapNow = millis();
  if (iotLastSendTime > 0 && (gapNow - iotLastSendTime) < IOT_MIN_SEND_GAP) {
    delay(IOT_MIN_SEND_GAP - (gapNow - iotLastSendTime));
  }

  uint8_t retries = 3;
  unsigned long promptMs = 3000UL;
  unsigned long sendMs = 4000UL;
  if (iotProtocol == IOT_PROTO_UDP) {
    retries = 2;
    promptMs = 2000UL;
    sendMs = 2500UL;
  }

  Serial.flush();
  for (uint8_t tryNo = 1; tryNo <= retries; tryNo++) {
    iotEspFlush();
    delay(40);

    iotEspSerial.print(F("AT+CIPSEND="));
    iotEspSerial.println(len);

    iotRespLen = 0;
    iotRespBuf[0] = '\\0';
    bool gotPrompt = false;
    unsigned long start = millis();
    while (millis() - start < promptMs) {
      while (iotEspSerial.available()) {
        char c = (char)iotEspSerial.read();
        if (iotRespLen < IOT_RESP_MAX - 1) {
          iotRespBuf[iotRespLen++] = c;
          iotRespBuf[iotRespLen] = '\\0';
        }
        if (c == '>') {
          gotPrompt = true;
          break;
        }
      }
      if (gotPrompt) break;
      if (strstr(iotRespBuf, "ERROR") || strstr(iotRespBuf, "FAIL") ||
          strstr(iotRespBuf, "busy") || strstr(iotRespBuf, "link is not") ||
          strstr(iotRespBuf, "CLOSED")) {
        break;
      }
    }

    if (!gotPrompt) {
      if (strstr(iotRespBuf, "link is not") || strstr(iotRespBuf, "CLOSED")) {
        iotLinkOpen = false;
        break;
      }
      delay(150);
      continue;
    }

    delay(8);
    // Drain RX while TX — do NOT clear buffer afterward (SEND OK often arrives mid-TX)
    for (int i = 0; i < len; i++) {
      iotEspSerial.write(data[i]);
      while (iotEspSerial.available()) {
        char c = (char)iotEspSerial.read();
        if (iotRespLen < IOT_RESP_MAX - 1) {
          iotRespBuf[iotRespLen++] = c;
          iotRespBuf[iotRespLen] = '\\0';
        }
      }
    }

    unsigned long t = millis();
    while (millis() - t < sendMs) {
      while (iotEspSerial.available()) {
        char c = (char)iotEspSerial.read();
        if (iotRespLen < IOT_RESP_MAX - 1) {
          iotRespBuf[iotRespLen++] = c;
          iotRespBuf[iotRespLen] = '\\0';
        }
      }
      if (strstr(iotRespBuf, "SEND OK")) break;
      if (strstr(iotRespBuf, "ERROR") || strstr(iotRespBuf, "FAIL") ||
          strstr(iotRespBuf, "link is not") || strstr(iotRespBuf, "CLOSED")) {
        break;
      }
    }

    if (strstr(iotRespBuf, "SEND OK") ||
        (iotProtocol == IOT_PROTO_UDP && strstr(iotRespBuf, "OK"))) {
      iotLastSendTime = millis();
      return true;
    }
    if (strstr(iotRespBuf, "link is not") || strstr(iotRespBuf, "CLOSED") ||
        strstr(iotRespBuf, "ERROR") || strstr(iotRespBuf, "FAIL")) {
      iotLinkOpen = false;
      break;
    }
    delay(150);
  }
  iotLastSendTime = millis();
  return false;
}

bool iotOpenTcp() {
  Serial.print(F("["));
  Serial.print(iotProtocolName());
  Serial.print(F("] opening TCP "));
  Serial.print(iotServerHost);
  Serial.print(F(":"));
  Serial.println(iotServerPort);

  iotCloseLink();

  char cmd[80];
  snprintf(cmd, sizeof(cmd), "AT+CIPSTART=\\"TCP\\",\\"%s\\",%d", iotServerHost, iotServerPort);
  iotSendStr(cmd);
  iotReadToBuf(12000);
  if (!strstr(iotRespBuf, "CONNECT") || strstr(iotRespBuf, "ERROR")) {
    Serial.print(F("["));
    Serial.print(iotProtocolName());
    Serial.println(F("] TCP FAILED"));
    iotLinkOpen = false;
    return false;
  }
  Serial.print(F("["));
  Serial.print(iotProtocolName());
  Serial.println(F("] TCP CONNECTED"));
  iotLinkOpen = true;
  // WS needs extra settle before big handshake CIPSEND
  delay(iotProtocol == IOT_PROTO_WS ? 900 : 300);
  iotEspFlush();
  return true;
}

bool iotOpenUdp() {
  Serial.print(F("[UDP] opening "));
  Serial.print(iotServerHost);
  Serial.print(F(":"));
  Serial.println(iotServerPort);

  // Close leftover link — IDE waits ~1s before CIPSTART
  iotCloseLink();
  delay(800);
  iotEspFlush();

  char cmd[96];
  bool ok = false;

  // 1) Exact IDE form (works on most AT firmwares)
  snprintf(cmd, sizeof(cmd), "AT+CIPSTART=\\"UDP\\",\\"%s\\",%d",
           iotServerHost, iotServerPort);
  iotSendStr(cmd);
  iotReadToBuf(10000);
  if ((strstr(iotRespBuf, "OK") || strstr(iotRespBuf, "CONNECT") ||
       strstr(iotRespBuf, "ALREADY")) &&
      !strstr(iotRespBuf, "ERROR") && !strstr(iotRespBuf, "FAIL") &&
      !strstr(iotRespBuf, "DNS")) {
    ok = true;
  }

  // 2) Some AT builds need local port for UDP RX
  if (!ok) {
    Serial.println(F("[UDP] retry with local port..."));
    iotSendStr("AT+CIPCLOSE");
    delay(500);
    iotEspFlush();
    snprintf(cmd, sizeof(cmd), "AT+CIPSTART=\\"UDP\\",\\"%s\\",%d,%d,0",
             iotServerHost, iotServerPort, iotServerPort);
    iotSendStr(cmd);
    iotReadToBuf(10000);
    if ((strstr(iotRespBuf, "OK") || strstr(iotRespBuf, "CONNECT") ||
         strstr(iotRespBuf, "ALREADY")) &&
        !strstr(iotRespBuf, "ERROR") && !strstr(iotRespBuf, "FAIL")) {
      ok = true;
    }
  }

  if (!ok) {
    Serial.println(F("[UDP] OPEN FAILED"));
    Serial.print(F("[UDP] ESP: "));
    iotPrintlnAscii(iotRespBuf);
    Serial.println(F("[UDP] Tip: set Host to 160.187.69.147 (IDE) if DNS fails"));
    iotLinkOpen = false;
    return false;
  }

  Serial.println(F("[UDP] READY"));
  iotLinkOpen = true;
  delay(250);
  iotEspFlush();
  return true;
}

bool iotWsHandshake() {
  Serial.println(F("[WebSocket] handshake..."));
  Serial.flush();
  delay(500);
  iotEspFlush();

  uint8_t keyBytes[16];
  randomSeed(millis() ^ (unsigned long)analogRead(A0));
  for (int i = 0; i < 16; i++) keyBytes[i] = (uint8_t)random(0, 256);
  char wsKey[25];
  iotBase64Encode(keyBytes, 16, wsKey);

  // Minimal handshake — short Host (no :port) = smaller SoftSerial CIPSEND
  int reqLen = snprintf(iotTxBuf, sizeof(iotTxBuf),
    "GET / HTTP/1.1\\r\\n"
    "Host: %s\\r\\n"
    "Upgrade: websocket\\r\\n"
    "Connection: Upgrade\\r\\n"
    "Sec-WebSocket-Key: %s\\r\\n"
    "Sec-WebSocket-Version: 13\\r\\n"
    "\\r\\n",
    iotServerHost, wsKey);

  if (reqLen <= 0 || reqLen >= (int)sizeof(iotTxBuf)) {
    Serial.println(F("[WebSocket] handshake req too long"));
    return false;
  }

  Serial.print(F("[WebSocket] CIPSEND "));
  Serial.println(reqLen);
  Serial.flush();

  iotWsExpectHttp101 = true;
  bool hsSent = iotCipSend((const uint8_t*)iotTxBuf, reqLen);
  iotWsExpectHttp101 = false;

  bool got101 = (strstr(iotRespBuf, "101") != NULL) ||
                (strstr(iotRespBuf, "Switching") != NULL);
  if (!got101) {
    unsigned long t = millis();
    while (millis() - t < 10000UL) {
      while (iotEspSerial.available()) {
        char c = (char)iotEspSerial.read();
        if (iotRespLen < IOT_RESP_MAX - 1) {
          iotRespBuf[iotRespLen++] = c;
          iotRespBuf[iotRespLen] = '\\0';
        } else {
          memmove(iotRespBuf, iotRespBuf + 40, (size_t)(IOT_RESP_MAX - 41));
          iotRespLen = IOT_RESP_MAX - 41;
          iotRespBuf[iotRespLen++] = c;
          iotRespBuf[iotRespLen] = '\\0';
        }
      }
      if (strstr(iotRespBuf, "101") || strstr(iotRespBuf, "Switching")) {
        got101 = true;
        break;
      }
    }
  }

  if (!got101) {
    Serial.println(F("[WebSocket] handshake FAILED (no 101)"));
    if (hsSent) Serial.println(F("[WebSocket] tip: SEND OK but no 101 — check port 5000"));
    iotLinkOpen = false;
    return false;
  }

  Serial.println(F("[WebSocket] CONNECTED"));
  iotLinkOpen = true;
  delay(300);
  iotEspFlush();
  return true;
}

void iotWsSendText(const char* payload) {
  // Prefer transport path (iotTxBuf) — keep this as thin wrapper
  iotTransportSend(payload);
}

bool iotTransportSend(const char* payload) {
  if (payload == NULL) return false;

  // WebSocket mode = same plain JSON+\\n as TCP (SoftSerial-safe; no binary frames)
  if (iotProtocol == IOT_PROTO_TCP || iotProtocol == IOT_PROTO_WS) {
    if (payload == iotTxBuf) {
      int n = strlen(iotTxBuf);
      if (n < (int)sizeof(iotTxBuf) - 1) {
        iotTxBuf[n++] = '\\n';
        iotTxBuf[n] = '\\0';
        return iotCipSend((const uint8_t*)iotTxBuf, n);
      }
      return false;
    }
    int n = snprintf(iotTxBuf, sizeof(iotTxBuf), "%s\\n", payload);
    if (n > 0) return iotCipSend((const uint8_t*)iotTxBuf, n);
    return false;
  }

  // UDP — raw datagram, no framing
  if (payload == iotTxBuf) {
    return iotCipSend((const uint8_t*)iotTxBuf, (int)strlen(iotTxBuf));
  }
  int n = snprintf(iotTxBuf, sizeof(iotTxBuf), "%s", payload);
  if (n > 0) return iotCipSend((const uint8_t*)iotTxBuf, n);
  return false;
}

bool iotIpdReceiveToBuf(unsigned long timeout, bool stripNewline) {
  iotRespLen = 0;
  iotRespBuf[0] = '\\0';
  unsigned long start = millis();
  int expectLen = -1;
  char* colon = NULL;

  while (millis() - start < timeout) {
    while (iotEspSerial.available()) {
      char c = (char)iotEspSerial.read();
      if (iotRespLen < IOT_RESP_MAX - 1) {
        iotRespBuf[iotRespLen++] = c;
        iotRespBuf[iotRespLen] = '\\0';
      }
    }

    char* ipd = strstr(iotRespBuf, "+IPD,");
    if (!ipd) continue;

    if (expectLen < 0) {
      // +IPD,<len>: or +IPD,<id>,<len>:
      char* p = ipd + 5;
      char* comma = strchr(p, ',');
      char* col = strchr(p, ':');
      if (!col) continue;
      if (comma && comma < col) p = comma + 1;
      expectLen = atoi(p);
      if (expectLen < 0) expectLen = 0;
      if (expectLen > IOT_RESP_MAX - 1) expectLen = IOT_RESP_MAX - 1;
      colon = col;
    } else {
      colon = strchr(ipd, ':');
    }

    if (!colon) continue;
    int got = iotRespLen - (int)((colon + 1) - iotRespBuf);
    if (expectLen > 0 && got >= expectLen) break;
    // JSON command: wait until closing brace if length unknown / short
    if (expectLen <= 0 && strchr(colon + 1, '}')) break;
  }

  char* ipd = strstr(iotRespBuf, "+IPD,");
  colon = ipd ? strchr(ipd, ':') : NULL;
  if (!ipd || !colon) {
    iotRespBuf[0] = '\\0';
    iotRespLen = 0;
    return false;
  }

  // Drain any remaining payload bytes briefly
  unsigned long drainUntil = millis() + 40UL;
  while (millis() < drainUntil) {
    while (iotEspSerial.available()) {
      char c = (char)iotEspSerial.read();
      if (iotRespLen < IOT_RESP_MAX - 1) {
        iotRespBuf[iotRespLen++] = c;
        iotRespBuf[iotRespLen] = '\\0';
      }
    }
  }

  char* payload = colon + 1;
  if (stripNewline) {
    char* p = payload;
    while (*p) {
      if (*p == '\\r' || *p == '\\n') { *p = '\\0'; break; }
      p++;
    }
  }

  // Prefer exact IPD length when available
  if (expectLen > 0) {
    int maxCopy = expectLen;
    if (maxCopy > IOT_RESP_MAX - 1) maxCopy = IOT_RESP_MAX - 1;
    memmove(iotRespBuf, payload, (size_t)maxCopy);
    iotRespBuf[maxCopy] = '\\0';
    iotRespLen = maxCopy;
  } else {
    size_t n = strlen(payload);
    memmove(iotRespBuf, payload, n + 1);
    iotRespLen = (int)n;
  }
  return iotRespLen > 0;
}

void iotSendAuthOrRegister() {
  if (iotProtocol == IOT_PROTO_UDP) {
    // use global iotTxBuf — stack msg[180] + SoftSerial = Nano crash/garble
    int n = snprintf(iotTxBuf, sizeof(iotTxBuf),
      "{\\"type\\":\\"register\\",\\"device_token\\":\\"%s\\"}", iotDeviceToken);
    if (n > 0) iotTransportSend(iotTxBuf);
    iotLastRegister = millis();
    Serial.println(F("[UDP] TX register"));
    return;
  }
  // Keep auth JSON short (<=125) so 1-byte WS length framing stays valid
  int n = snprintf(iotTxBuf, sizeof(iotTxBuf),
    "{\\"type\\":\\"auth\\",\\"token\\":\\"%s\\"}", iotDeviceToken);
  bool sent = false;
  if (n > 0) sent = iotTransportSend(iotTxBuf);
  iotLastRegister = millis();
  Serial.print(F("["));
  Serial.print(iotProtocolName());
  Serial.println(sent ? F("] TX auth") : F("] TX auth FAIL"));
}

void iotSendUdpKeepAlive() {
  // Server already accepts register for presence — refresh every few seconds
  iotSendAuthOrRegister();
}

void iotSendWsKeepAlive() {
  if (!iotLinkOpen) return;
  // Short ping — long token payloads previously broke WS length framing
  bool sent = iotTransportSend("{\\"type\\":\\"ping\\"}");
  if (sent) {
    iotLastRegister = millis();
    iotSendFailCount = 0;
  } else {
    Serial.println(F("[WebSocket] keep-alive FAIL -> reconnect"));
    iotLinkOpen = false;
    iotState = IOT_ST_RETRY;
    iotRetryAt = millis();
  }
}

// Server WS frames are unmasked: 0x81, len, payload...
bool iotWsUnwrapToJson(char* buf, int len) {
  if (buf == NULL || len <= 0) return false;
  // Already looks like JSON
  if (buf[0] == '{') return true;

  for (int i = 0; i < len - 2; i++) {
    uint8_t b0 = (uint8_t)buf[i];
    uint8_t b1 = (uint8_t)buf[i + 1];
    if ((b0 & 0x0F) != 0x1) continue; // text opcode
    if (b1 & 0x80) continue;          // masked (client->server); server should be unmasked
    int plen = (int)(b1 & 0x7F);
    int hdr = 2;
    if (plen == 126) {
      if (i + 4 > len) continue;
      plen = (((int)(uint8_t)buf[i + 2]) << 8) | (int)(uint8_t)buf[i + 3];
      hdr = 4;
    } else if (plen == 127) {
      continue; // too large for Nano buffer
    }
    if (i + hdr + plen > len) continue;
    if (buf[i + hdr] != '{') continue;
    memmove(buf, buf + i + hdr, (size_t)plen);
    buf[plen] = '\\0';
    return true;
  }

  // Fallback: find first '{'
  char* brace = strchr(buf, '{');
  if (brace) {
    size_t n = strlen(brace);
    memmove(buf, brace, n + 1);
    return true;
  }
  return false;
}

void iotSendPingMsg() {
  if (iotProtocol == IOT_PROTO_UDP) {
    // Throttle — SoftSerial loses RX if forever loop floods TX
    if (millis() - iotLastRegister >= IOT_UDP_REGISTER_INTERVAL) {
      iotSendUdpKeepAlive();
    }
    return;
  }
  if (iotProtocol == IOT_PROTO_WS) {
    if (millis() - iotLastRegister >= IOT_WS_KEEPALIVE_INTERVAL) {
      iotSendWsKeepAlive();
    }
    return;
  }
  // TCP — heartbeat ping
  bool sent = iotTransportSend("{\\"type\\":\\"ping\\"}");
  if (sent) {
    iotLastRegister = millis();
    iotSendFailCount = 0;
  } else {
    iotSendFailCount++;
  }
}

void iotSendAck(const char* command, const char* st) {
  int n = snprintf(iotTxBuf, sizeof(iotTxBuf),
    "{\\"type\\":\\"ack\\",\\"command\\":\\"%s\\",\\"state\\":\\"%s\\"}", command, st);
  if (n > 0) iotTransportSend(iotTxBuf);
}

void iotRegisterControl(const char* key, int pin) {
  if (key == NULL || key[0] == '\\0') return;
  if (pin < 0) return;
  for (int i = 0; i < iotControlCount; i++) {
    if (strcmp(iotControls[i].key, key) == 0) {
      iotControls[i].pin = pin;
      pinMode(pin, OUTPUT);
      digitalWrite(pin, LOW);
      return;
    }
  }
  if (iotControlCount >= IOT_MAX_CONTROLS) return;
  strncpy(iotControls[iotControlCount].key, key, IOT_MAX_CONTROL_KEY - 1);
  iotControls[iotControlCount].key[IOT_MAX_CONTROL_KEY - 1] = '\\0';
  iotControls[iotControlCount].pin = pin;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  iotControlCount++;
}

void iotConfigureCommandPins(int ledPin, int buzzerPin, int relayPin) {
  // Backward compat defaults — dashboard Key "LED" / "BUZZER" / "RELAY"
  iotRegisterControl("LED", ledPin);
  iotRegisterControl("BUZZER", buzzerPin);
  iotRegisterControl("RELAY", relayPin);
}

int iotFindControlPin(const char* key) {
  if (key == NULL) return -1;
  for (int i = 0; i < iotControlCount; i++) {
    if (strcmp(iotControls[i].key, key) == 0) return iotControls[i].pin;
  }
  return -1;
}

bool iotApplyCommand(const char* cmd, const char** stOut, int* pinOut) {
  if (cmd == NULL || stOut == NULL) return false;
  size_t len = strlen(cmd);
  bool turnOn = false;
  size_t keyLen = 0;
  if (len > 3 && strcmp(cmd + (len - 3), "_ON") == 0) {
    turnOn = true;
    keyLen = len - 3;
  } else if (len > 4 && strcmp(cmd + (len - 4), "_OFF") == 0) {
    turnOn = false;
    keyLen = len - 4;
  } else {
    return false;
  }
  if (keyLen == 0 || keyLen >= IOT_MAX_CONTROL_KEY) return false;
  char key[IOT_MAX_CONTROL_KEY];
  memcpy(key, cmd, keyLen);
  key[keyLen] = '\\0';
  int pin = iotFindControlPin(key);
  if (pin < 0) return false;
  digitalWrite(pin, turnOn ? HIGH : LOW);
  *stOut = turnOn ? "HIGH" : "LOW";
  if (pinOut) *pinOut = pin;
  return true;
}

// Keep the exact key the user typed in the block (dashboard Key must match).
const char* iotNormalizeFieldName(const char* name) {
  if (name == NULL || name[0] == '\\0') return "value";
  return name;
}

void iotAddField(const char* name, const char* value) {
  if (iotFieldCount >= IOT_MAX_FIELDS) return;
  const char* fieldName = iotNormalizeFieldName(name);
  strncpy(iotFields[iotFieldCount].name, fieldName, IOT_MAX_FIELD_NAME - 1);
  iotFields[iotFieldCount].name[IOT_MAX_FIELD_NAME - 1] = '\\0';
  strncpy(iotFields[iotFieldCount].value, value, IOT_MAX_FIELD_VALUE - 1);
  iotFields[iotFieldCount].value[IOT_MAX_FIELD_VALUE - 1] = '\\0';
  iotFieldCount++;
}

void iotResetFields() {
  iotFieldCount = 0;
}

bool iotIsConnected() {
  return iotState == IOT_ST_ONLINE;
}

void iotSendSensorPacket() {
  if (iotState != IOT_ST_ONLINE) return;
  if (iotFieldCount == 0) return;
  // SoftSerial + DHT: max ~1 packet / 2s else CIPSEND floods -> TX FAIL
  if (iotLastSensorAt != 0 && (millis() - iotLastSensorAt) < 2000UL) {
    iotResetFields();
    return;
  }

  int pos = 0;
  if (iotProtocol == IOT_PROTO_UDP) {
    pos = snprintf(iotTxBuf, sizeof(iotTxBuf),
      "{\\"type\\":\\"sensor\\",\\"device_token\\":\\"%s\\"", iotDeviceToken);
  } else {
    pos = snprintf(iotTxBuf, sizeof(iotTxBuf),
      "{\\"type\\":\\"sensor\\"");
  }
  for (int i = 0; i < iotFieldCount && pos < (int)sizeof(iotTxBuf) - 48; i++) {
    pos += snprintf(iotTxBuf + pos, sizeof(iotTxBuf) - pos, ",\\"%s\\":%s",
      iotFields[i].name, iotFields[i].value);
  }
  if (pos < (int)sizeof(iotTxBuf) - 2) {
    iotTxBuf[pos++] = '}';
    iotTxBuf[pos] = '\\0';
  }

  iotSerialGate();
  Serial.print(F("["));
  Serial.print(iotProtocolName());
  Serial.print(F("] TX: "));
  iotPrintlnAscii(iotTxBuf);

  bool sent = iotTransportSend(iotTxBuf);
  if (!sent) {
    iotSerialGate();
    Serial.println(F("TX FAIL"));
    iotSendFailCount++;
    if (iotSendFailCount >= 3 || !iotLinkOpen) {
      Serial.println(F("TX FAIL -> reconnect"));
      iotLinkOpen = false;
      iotState = IOT_ST_RETRY;
      iotRetryAt = millis();
    }
  } else {
    iotSendFailCount = 0;
    iotLastSensorAt = millis();
  }
  iotResetFields();
}

void iotHandleMessage(const char* msg) {
  if (msg == NULL || msg[0] == '\\0') return;
  if (strcmp(msg, "__CLOSE__") == 0) {
    Serial.print(F("["));
    Serial.print(iotProtocolName());
    Serial.println(F("] server CLOSED"));
    iotLinkOpen = false;
    iotState = IOT_ST_RETRY;
    iotRetryAt = millis();
    return;
  }

  Serial.print(F("["));
  Serial.print(iotProtocolName());
  Serial.print(F("] RX: "));
  iotPrintlnAscii(msg);

  if (strstr(msg, "\\"pong\\"")) return;
  if (strstr(msg, "\\"register_ok\\"")) { Serial.println(F("[UDP] Registered!")); return; }
  if (strstr(msg, "\\"register_fail\\"")) { Serial.println(F("[UDP] Register failed")); return; }
  if (strstr(msg, "\\"auth_ok\\"")) {
    Serial.print(F("["));
    Serial.print(iotProtocolName());
    Serial.println(F("] Authenticated!"));
    return;
  }
  if (strstr(msg, "\\"auth_fail\\"")) {
    Serial.print(F("["));
    Serial.print(iotProtocolName());
    Serial.println(F("] Auth failed"));
    iotLinkOpen = false;
    iotState = IOT_ST_RETRY;
    iotRetryAt = millis();
    return;
  }

  const char* ci = strstr(msg, "\\"command\\"");
  if (!ci) return;
  ci = strchr(ci, ':');
  if (!ci) return;
  ci++;
  while (*ci == ' ' || *ci == '\t') ci++;
  if (*ci != '"') return;
  ci++;
  const char* ce = strchr(ci, '"');
  if (!ce || (ce - ci) <= 0 || (ce - ci) >= IOT_MAX_CMD) return;

  char cmd[IOT_MAX_CMD];
  memcpy(cmd, ci, (size_t)(ce - ci));
  cmd[ce - ci] = '\\0';

  const char* st = "LOW";
  int pin = -1;
  bool ok = iotApplyCommand(cmd, &st, &pin);

  if (ok) {
    Serial.print(F("[CMD] >>> "));
    Serial.print(cmd);
    Serial.print(F(" pin="));
    Serial.print(pin);
    Serial.print(F(" -> "));
    Serial.println(st);
    iotSendAck(cmd, st);
  } else {
    Serial.print(F("[CMD] unknown: "));
    Serial.println(cmd);
  }
}

void iotPollCommands() {
  if (iotState != IOT_ST_ONLINE) return;
  unsigned long waitMs = (iotProtocol == IOT_PROTO_UDP) ? 200UL : 150UL;
  // WS = TCP-style line JSON (strip newline)
  bool stripNl = (iotProtocol == IOT_PROTO_TCP || iotProtocol == IOT_PROTO_WS);
  if (!iotIpdReceiveToBuf(waitMs, stripNl)) return;
  iotHandleMessage(iotRespBuf);
}

bool iotOpenLink() {
  if (iotProtocol == IOT_PROTO_UDP) return iotOpenUdp();
  // TCP + WebSocket: same CIPSTART + plain JSON (no HTTP upgrade / frames)
  return iotOpenTcp();
}

void iotLoopStep() {
  unsigned long now = millis();

  switch (iotState) {
    case IOT_ST_CONNECT:
      // ESP hardware down → silent hold (message already printed once)
      if (!iotEspReady && iotEspLastFailAt != 0 &&
          (now - iotEspLastFailAt) < 30000UL) {
        break;
      }
      Serial.println(F("[IoT] step: WiFi connect"));
      if (iotConnectWiFi()) iotState = IOT_ST_LINK;
      else { iotState = IOT_ST_RETRY; iotRetryAt = now; }
      break;

    case IOT_ST_LINK:
      Serial.print(F("[IoT] step: open "));
      Serial.println(iotProtocolName());
      if (iotOpenLink()) iotState = IOT_ST_AUTH;
      else { iotState = IOT_ST_RETRY; iotRetryAt = now; }
      break;

    case IOT_ST_AUTH:
      Serial.print(F("["));
      Serial.print(iotProtocolName());
      Serial.println(iotProtocol == IOT_PROTO_UDP ? F("] register...") : F("] auth..."));
      iotSendAuthOrRegister();
      delay(400);
      if (iotProtocol == IOT_PROTO_UDP) {
        if (iotIpdReceiveToBuf(2500, false)) iotHandleMessage(iotRespBuf);
      } else {
        bool authed = false;
        if (iotIpdReceiveToBuf(3000, true)) {
          iotHandleMessage(iotRespBuf);
          if (strstr(iotRespBuf, "auth_ok") || strstr(iotRespBuf, "Authenticated")) {
            authed = true;
          }
        }
        // Also accept auth_ok left in buffer from CIPSEND drain
        if (!authed && (strstr(iotRespBuf, "auth_ok") || strstr(iotRespBuf, "register_ok"))) {
          authed = true;
        }
        if (!authed) {
          Serial.println(F("[IoT] auth no reply — check port 5010 (not 5000)"));
          iotLinkOpen = false;
          iotState = IOT_ST_RETRY;
          iotRetryAt = millis();
          break;
        }
      }
      iotState = IOT_ST_ONLINE;
      iotSendFailCount = 0;
      Serial.print(F("["));
      Serial.print(iotProtocolName());
      Serial.println(F("] ONLINE - ready"));
      delay(150);
      break;

    case IOT_ST_ONLINE:
      if ((iotProtocol == IOT_PROTO_WS || iotProtocol == IOT_PROTO_TCP) && !iotLinkOpen) {
        iotState = IOT_ST_RETRY;
        iotRetryAt = now;
        break;
      }
      iotPollCommands();
      if (iotProtocol == IOT_PROTO_UDP && (now - iotLastRegister >= IOT_UDP_REGISTER_INTERVAL)) {
        Serial.println(F("[UDP] keep-alive"));
        iotSendUdpKeepAlive();
      } else if (iotProtocol == IOT_PROTO_WS && (now - iotLastRegister >= IOT_WS_KEEPALIVE_INTERVAL)) {
        Serial.println(F("[WebSocket] keep-alive"));
        iotSendWsKeepAlive();
      } else if (iotProtocol == IOT_PROTO_TCP && (now - iotLastRegister >= IOT_TCP_PING_INTERVAL)) {
        Serial.println(F("[TCP] keep-alive ping"));
        iotSendPingMsg();
      }
      break;

    case IOT_ST_RETRY:
      {
        // ESP dead: quiet 60s hold — no reconnect spam
        unsigned long wait = iotEspReady ? IOT_RECONNECT_DELAY : 60000UL;
        if (now - iotRetryAt >= wait) {
          if (iotEspReady) {
            Serial.print(F("["));
            Serial.print(iotProtocolName());
            Serial.println(F("] reconnecting..."));
          }
          iotCloseLink();
          delay(200);
          iotState = iotWifiConnected ? IOT_ST_LINK : IOT_ST_CONNECT;
        }
      }
      break;
  }
}
`;
    }

    function ensureMqttLib () {
        ensureIotCredentials();
        const IOT_MQTT_LIB_VER = '20260814c';
        if (Blockly.Arduino.definitions_['iot_mqtt_lib'] &&
            Blockly.Arduino.iotMqttLibVer_ === IOT_MQTT_LIB_VER) {
            return;
        }

        Blockly.Arduino.iotMqttLibVer_ = IOT_MQTT_LIB_VER;
        Blockly.Arduino.includes_['iot_wifi_h'] = '#include <WiFi.h>';
        Blockly.Arduino.includes_['iot_pubsub'] = '#include <PubSubClient.h>\n#include <string.h>';

        Blockly.Arduino.definitions_['iot_mqtt_defaults'] = `
#define IOT_MAX_FIELDS 10
#define IOT_MAX_FIELD_NAME 16
#define IOT_MAX_FIELD_VALUE 32
#define IOT_RECONNECT_DELAY 3000
#define IOT_MAX_CONTROLS 8
#define IOT_MAX_CONTROL_KEY 16
#define IOT_MAX_CMD 32

WiFiClient iotWifiClient;
PubSubClient iotMqtt(iotWifiClient);
String iotTopicPublish;
String iotTopicCommands;
const char* iotTopicAck = "iot/ack";
bool iotMqttOnline = false;

struct IotField {
  char name[IOT_MAX_FIELD_NAME];
  char value[IOT_MAX_FIELD_VALUE];
};
IotField iotFields[IOT_MAX_FIELDS];
int iotFieldCount = 0;

struct IotControl {
  char key[IOT_MAX_CONTROL_KEY];
  int pin;
};
IotControl iotControls[IOT_MAX_CONTROLS];
int iotControlCount = 0;
bool iotWifiWasConnected = false;
`;

        Blockly.Arduino.definitions_['iot_mqtt_lib'] = `
void iotPrintStatus() {
  Serial.println(F("---------- IoT STATUS ----------"));
  Serial.println(F("Protocol : MQTT"));
  Serial.print(F("WiFi     : "));
  Serial.println(WiFi.status() == WL_CONNECTED ? F("CONNECTED") : F("DISCONNECTED"));
  Serial.print(F("SSID     : "));
  Serial.println(iotSSID);
  Serial.print(F("IP       : "));
  if (WiFi.status() == WL_CONNECTED) Serial.println(WiFi.localIP());
  else Serial.println(F("0.0.0.0"));
  Serial.print(F("Broker   : "));
  Serial.print(iotServerHost);
  Serial.print(F(":"));
  Serial.println(iotServerPort);
  Serial.print(F("MQTT     : "));
  Serial.println(iotMqtt.connected() ? F("CONNECTED") : F("DISCONNECTED"));
  Serial.print(F("Publish  : "));
  Serial.println(iotTopicPublish);
  Serial.print(F("Commands : "));
  Serial.println(iotTopicCommands);
  Serial.print(F("Kit      : "));
  Serial.println(iotKitNumber);
  Serial.println(F("--------------------------------"));
}

void iotRegisterControl(const char* key, int pin) {
  if (key == NULL || key[0] == '\\0') return;
  if (pin < 0) return;
  for (int i = 0; i < iotControlCount; i++) {
    if (strcmp(iotControls[i].key, key) == 0) {
      iotControls[i].pin = pin;
      pinMode(pin, OUTPUT);
      digitalWrite(pin, LOW);
      return;
    }
  }
  if (iotControlCount >= IOT_MAX_CONTROLS) return;
  strncpy(iotControls[iotControlCount].key, key, IOT_MAX_CONTROL_KEY - 1);
  iotControls[iotControlCount].key[IOT_MAX_CONTROL_KEY - 1] = '\\0';
  iotControls[iotControlCount].pin = pin;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  iotControlCount++;
}

void iotConfigureCommandPins(int ledPin, int buzzerPin, int relayPin) {
  iotRegisterControl("LED", ledPin);
  iotRegisterControl("BUZZER", buzzerPin);
  iotRegisterControl("RELAY", relayPin);
}

int iotFindControlPin(const char* key) {
  if (key == NULL) return -1;
  for (int i = 0; i < iotControlCount; i++) {
    if (strcmp(iotControls[i].key, key) == 0) return iotControls[i].pin;
  }
  return -1;
}

bool iotApplyCommand(const char* cmd, const char** stOut, int* pinOut) {
  if (cmd == NULL || stOut == NULL) return false;
  size_t len = strlen(cmd);
  bool turnOn = false;
  size_t keyLen = 0;
  if (len > 3 && strcmp(cmd + (len - 3), "_ON") == 0) {
    turnOn = true;
    keyLen = len - 3;
  } else if (len > 4 && strcmp(cmd + (len - 4), "_OFF") == 0) {
    turnOn = false;
    keyLen = len - 4;
  } else {
    return false;
  }
  if (keyLen == 0 || keyLen >= IOT_MAX_CONTROL_KEY) return false;
  char key[IOT_MAX_CONTROL_KEY];
  memcpy(key, cmd, keyLen);
  key[keyLen] = '\\0';
  int pin = iotFindControlPin(key);
  if (pin < 0) return false;
  digitalWrite(pin, turnOn ? HIGH : LOW);
  *stOut = turnOn ? "HIGH" : "LOW";
  if (pinOut) *pinOut = pin;
  return true;
}

void iotAddField(const char* name, const char* value) {
  if (iotFieldCount >= IOT_MAX_FIELDS) return;
  // Exact key from block — no alias remap (dashboard Key must match).
  const char* n = (name == NULL || name[0] == '\\0') ? "value" : name;
  strncpy(iotFields[iotFieldCount].name, n, IOT_MAX_FIELD_NAME - 1);
  iotFields[iotFieldCount].name[IOT_MAX_FIELD_NAME - 1] = '\\0';
  strncpy(iotFields[iotFieldCount].value, value, IOT_MAX_FIELD_VALUE - 1);
  iotFields[iotFieldCount].value[IOT_MAX_FIELD_VALUE - 1] = '\\0';
  iotFieldCount++;
}

void iotResetFields() {
  iotFieldCount = 0;
}

bool iotIsConnected() {
  return iotMqttOnline && iotMqtt.connected() && (WiFi.status() == WL_CONNECTED);
}

void iotConnectWiFiNative() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!iotWifiWasConnected) {
      Serial.println(F("[WiFi] CONNECTED"));
      Serial.print(F("[WiFi] IP: "));
      Serial.println(WiFi.localIP());
      iotWifiWasConnected = true;
    }
    return;
  }
  if (iotWifiWasConnected) {
    Serial.println(F("[WiFi] DISCONNECTED"));
    iotWifiWasConnected = false;
  }
  Serial.print(F("[WiFi] connecting SSID: "));
  Serial.println(iotSSID);
  WiFi.begin(iotSSID, iotWiFiPass);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000UL) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    iotWifiWasConnected = true;
    Serial.println(F("[WiFi] CONNECTED"));
    Serial.print(F("[WiFi] IP: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("[WiFi] DISCONNECTED / FAILED"));
  }
}

void iotMqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.print(F("MQTT RX ["));
  Serial.print(topic);
  Serial.print(F("]: "));
  Serial.println(msg);

  int ci = msg.indexOf("\\"command\\"");
  if (ci == -1) return;
  ci = msg.indexOf(':', ci);
  if (ci == -1) return;
  ci++;
  while (ci < msg.length() && (msg[ci] == ' ' || msg[ci] == '\t')) ci++;
  if (ci >= msg.length() || msg[ci] != '"') return;
  ci++;
  int ce = msg.indexOf("\\"", ci);
  if (ce == -1) return;
  String command = msg.substring(ci, ce);

  const char* state = "LOW";
  int pin = -1;
  bool ok = iotApplyCommand(command.c_str(), &state, &pin);

  if (ok) {
    Serial.print(F(">>> "));
    Serial.print(command);
    Serial.print(F(" pin="));
    Serial.println(pin);
    String ack = String("{\\"kit_number\\":\\"") + iotKitNumber +
      "\\",\\"command\\":\\"" + command + "\\",\\"state\\":\\"" + state + "\\"}";
    iotMqtt.publish(iotTopicAck, ack.c_str());
  } else {
    Serial.print(F("Unknown command: "));
    Serial.println(command);
  }
}

bool iotConnectMqtt() {
  if (iotMqtt.connected()) {
    iotMqttOnline = true;
    return true;
  }

  if (iotMqttOnline) {
    Serial.println(F("[MQTT] DISCONNECTED"));
  }
  iotMqttOnline = false;

  String clientId = String("iot-") + iotKitNumber;
  Serial.print(F("[MQTT] connecting broker "));
  Serial.print(iotServerHost);
  Serial.print(F(":"));
  Serial.print(iotServerPort);
  Serial.print(F(" ..."));
  if (iotMqtt.connect(clientId.c_str())) {
    iotMqtt.subscribe(iotTopicCommands.c_str());
    iotMqttOnline = true;
    Serial.println(F(" CONNECTED"));
    Serial.print(F("[MQTT] Subscribed: "));
    Serial.println(iotTopicCommands);
    return true;
  }
  Serial.print(F(" FAILED rc="));
  Serial.println(iotMqtt.state());
  return false;
}

void iotInitMqtt() {
  iotTopicPublish = String("iot/data/") + iotDeviceToken;
  iotTopicCommands = String("iot/commands/") + iotKitNumber;
  iotMqtt.setServer(iotServerHost, iotServerPort);
  iotMqtt.setCallback(iotMqttCallback);
  Serial.println(F("================================"));
  Serial.println(F(" IoT Dashboard — MQTT"));
  Serial.println(F("================================"));
  iotConnectWiFiNative();
  iotConnectMqtt();
  iotPrintStatus();
}

void iotSendPingMsg() {
  // MQTT keep-alive is handled by PubSubClient loop
}

void iotSendSensorPacket() {
  if (!iotIsConnected() || iotFieldCount == 0) return;

  char msg[220];
  int pos = snprintf(msg, sizeof(msg), "{");
  for (int i = 0; i < iotFieldCount && pos < (int)sizeof(msg) - 40; i++) {
    if (i > 0) pos += snprintf(msg + pos, sizeof(msg) - pos, ",");
    pos += snprintf(msg + pos, sizeof(msg) - pos, "\\"%s\\":%s",
      iotFields[i].name, iotFields[i].value);
  }
  if (pos < (int)sizeof(msg) - 2) {
    msg[pos++] = '}';
    msg[pos] = '\\0';
  }
  iotMqtt.publish(iotTopicPublish.c_str(), msg);
  Serial.print(F("MQTT TX: "));
  Serial.println(msg);
  iotResetFields();
}

void iotPollCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    if (iotWifiWasConnected) Serial.println(F("[WiFi] DISCONNECTED"));
    iotWifiWasConnected = false;
    iotConnectWiFiNative();
  }
  if (!iotMqtt.connected()) iotConnectMqtt();
  iotMqtt.loop();
}

void iotLoopStep() {
  iotPollCommands();
}

bool iotInitEsp() {
  return true;
}
`;
    }

    function ensureIotLib () {
        const protocol = getProtocol();
        if (protocol === 'mqtt') {
            delete Blockly.Arduino.definitions_['iot_wifi_lib'];
            delete Blockly.Arduino.definitions_['iot_wifi_defaults'];
            delete Blockly.Arduino.includes_['iot_software_serial'];
            delete Blockly.Arduino.iotEsp01LibProtocol_;
            ensureMqttLib();
        } else {
            delete Blockly.Arduino.definitions_['iot_mqtt_lib'];
            delete Blockly.Arduino.definitions_['iot_mqtt_defaults'];
            delete Blockly.Arduino.includes_['iot_wifi_h'];
            delete Blockly.Arduino.includes_['iot_pubsub'];
            ensureEsp01Lib();
        }
    }

    function ensureIotSetup () {
        ensureIotLib();
        if (getProtocol() === 'mqtt') {
            Blockly.Arduino.setups_['00_serial_monitor'] = 'Serial.begin(115200);';
            delete Blockly.Arduino.setups_['serial_monitor'];
            Blockly.Arduino.setups_['01_iot_setup'] =
                `delay(500);
iotConfigureCommandPins(25, 26, 27);
iotInitMqtt();`;
            delete Blockly.Arduino.setups_['iot_serial_setup'];
        } else {
            const protoLabel = ({
                websocket: 'WebSocket',
                tcp: 'TCP',
                udp: 'UDP'
            })[getProtocol()] || 'WebSocket';
            // Run Serial + ESP init BEFORE other setups (e.g. dht_begin_*)
            Blockly.Arduino.setups_['00_serial_monitor'] = 'Serial.begin(9600);';
            delete Blockly.Arduino.setups_['serial_monitor'];
            // SoftSerial begin early like IDE WS sketch (before other setup noise)
            Blockly.Arduino.setups_['01_iot_esp_init'] =
                `iotEspSerial.begin(9600);
iotEspSerial.listen();
delay(800);
Serial.println();
Serial.println(F("================================"));
Serial.println(F(" IoT Dashboard - ${protoLabel}"));
Serial.println(F(" build: STABLE-20260919-F"));
Serial.println(F(" WS mode: plain JSON on TCP port 5010"));
Serial.println(F(" (port 5000 = browser only — auto-maps to 5010)"));
Serial.println(F("================================"));
Serial.print(F("Protocol : "));
Serial.println(iotProtocolName());
Serial.flush();
Serial.print(F("Server   : "));
Serial.print(iotServerHost);
Serial.print(F(":"));
Serial.println(iotServerPort);
Serial.flush();
Serial.print(F("SSID     : "));
Serial.println(iotSSID);
Serial.println(F("[IoT] setup done - loop starting"));
Serial.flush();`;
            Blockly.Arduino.setups_['02_iot_pins'] =
                'iotConfigureCommandPins(5, 6, 7);';
            delete Blockly.Arduino.setups_['iot_serial_setup'];
        }
    }

    Blockly.Arduino.iot_wifi_connect = function (block) {
        ensureIotCredentials();

        const ssid = Blockly.Arduino.valueToCode(block, 'SSID', Blockly.Arduino.ORDER_ATOMIC) || '"MyWiFi"';
        const password = Blockly.Arduino.valueToCode(block, 'PASSWORD', Blockly.Arduino.ORDER_ATOMIC) || '""';

        Blockly.Arduino.definitions_['iot_wifi_ssid'] = `const char* iotSSID = ${ssid};`;
        Blockly.Arduino.definitions_['iot_wifi_pass'] = `const char* iotWiFiPass = ${password};`;

        return '';
    };

    Blockly.Arduino.iot_server_connect = function (block) {
        const protocol = block.getFieldValue('PROTOCOL') || 'websocket';
        Blockly.Arduino.iotProtocolMode_ = protocol;

        // Reset libs so protocol switches regenerate the correct runtime
        delete Blockly.Arduino.definitions_['iot_wifi_lib'];
        delete Blockly.Arduino.definitions_['iot_mqtt_lib'];
        delete Blockly.Arduino.definitions_['iot_wifi_defaults'];
        delete Blockly.Arduino.definitions_['iot_mqtt_defaults'];
        delete Blockly.Arduino.includes_['iot_software_serial'];
        delete Blockly.Arduino.includes_['iot_wifi_h'];
        delete Blockly.Arduino.includes_['iot_pubsub'];
        delete Blockly.Arduino.iotEsp01LibProtocol_;
        delete Blockly.Arduino.iotEsp01LibVer_;
        delete Blockly.Arduino.iotMqttLibVer_;

        const host = Blockly.Arduino.valueToCode(block, 'HOST', Blockly.Arduino.ORDER_ATOMIC) || '"192.168.1.1"';
        let port = Blockly.Arduino.valueToCode(block, 'PORT', Blockly.Arduino.ORDER_ATOMIC) || '5010';
        const token = Blockly.Arduino.valueToCode(block, 'TOKEN', Blockly.Arduino.ORDER_ATOMIC) || '""';
        const kit = Blockly.Arduino.valueToCode(block, 'KIT', Blockly.Arduino.ORDER_ATOMIC) || '"AIIOT001"';

        // Plain-JSON WebSocket mode must hit TCP device port (5010).
        // Port 5000 is browser WebSocket-only — causes TCP CONNECT then TX FAIL.
        if (protocol === 'websocket') {
            const raw = String(port).replace(/[^\d]/g, '');
            if (!raw || raw === '5000') {
                port = '5010';
            }
        }

        Blockly.Arduino.definitions_['iot_ws_host'] = `const char* iotServerHost = ${host};`;
        Blockly.Arduino.definitions_['iot_ws_port'] = `const int iotServerPort = ${port};`;
        Blockly.Arduino.definitions_['iot_ws_token'] = `const char* iotDeviceToken = ${token};`;
        Blockly.Arduino.definitions_['iot_kit_number'] = `const char* iotKitNumber = ${kit};`;

        ensureIotSetup();
        return '';
    };

    Blockly.Arduino.iot_loop_step = function () {
        ensureIotSetup();
        return 'iotLoopStep();\n';
    };

    Blockly.Arduino.iot_is_connected = function () {
        ensureIotSetup();
        return ['iotIsConnected()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.iot_add_field = function (block) {
        ensureIotSetup();

        const name = quoteFieldName(
            Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC),
            'field'
        );
        const value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';

        // Skip DHT/sensor work until ONLINE — SoftSerial + DHT kills WS handshake
        return `if (iotIsConnected()) {
  char __iotVal[16];
  dtostrf((double)(${value}), 0, 2, __iotVal);
  iotAddField(${name}, __iotVal);
}
`;
    };

    Blockly.Arduino.iot_clear_fields = function () {
        ensureIotSetup();
        return 'if (iotIsConnected()) iotResetFields();\n';
    };

    Blockly.Arduino.iot_send_sensor_packet = function () {
        ensureIotSetup();
        return 'iotSendSensorPacket();\n';
    };

    Blockly.Arduino.iot_register_control = function (block) {
        ensureIotSetup();

        const key = quoteFieldName(
            Blockly.Arduino.valueToCode(block, 'KEY', Blockly.Arduino.ORDER_ATOMIC),
            'LED1'
        );
        const pin = Blockly.Arduino.valueToCode(block, 'PIN', Blockly.Arduino.ORDER_ATOMIC) || '5';

        return `iotRegisterControl(${key}, ${pin});\n`;
    };

    Blockly.Arduino.iot_handle_commands = function () {
        ensureIotSetup();
        return 'iotPollCommands();\n';
    };

    Blockly.Arduino.iot_send_ping = function () {
        ensureIotSetup();
        return 'iotSendPingMsg();\n';
    };

    return Blockly;
}

exports = addGenerator;
