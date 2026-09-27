/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addGenerator (Blockly) {
    const order = Blockly.Arduino.ORDER_ATOMIC || 0;

    function ensureEsp32CamCore (Blockly) {
        if (Blockly.Arduino.definitions_.esp32cam_core) {
            return;
        }

        Blockly.Arduino.includes_.esp32cam_wifi = '#include <WiFi.h>';
        Blockly.Arduino.includes_.esp32cam_udp = '#include <WiFiUdp.h>';
        Blockly.Arduino.includes_.esp32cam_cstring = '#include <string.h>';
        Blockly.Arduino.includes_.esp32cam_server = '#include <WebServer.h>';
        Blockly.Arduino.includes_.esp32cam_camera = '#include "esp_camera.h"';
        Blockly.Arduino.includes_.esp32cam_img = '#include "img_converters.h"';

        Blockly.Arduino.definitions_.esp32cam_pins = `
#define EC_LED_PIN 4
#define EC_KIT_RX 3
#define EC_KIT_TX 1
#define EC_FRAME_WIDTH 320
#define EC_LINE_THRESHOLD 120
#define EC_KIT_UDP_PORT 8888
`;

        Blockly.Arduino.definitions_.esp32cam_board = `
HardwareSerial ecKitSerial(2);
WiFiUDP ecUdp;
WebServer ecServer(80);
IPAddress ecKitIp(192, 168, 4, 4);
bool ecWifiReady = false;
bool ecUdpReady = false;
bool ecStreamReady = false;
int ecStreamFps = 15;
int ecJpegQuality = 80;
int ecStreamRotation = 0;
String ecConfiguredStreamUrl = "";
String ecVisionMode = "idle";
String ecObjectTarget = "person";
`;

        Blockly.Arduino.definitions_.esp32cam_core = `
void ecLedOn() {
  pinMode(EC_LED_PIN, OUTPUT);
  digitalWrite(EC_LED_PIN, HIGH);
}

void ecLedOff() {
  pinMode(EC_LED_PIN, OUTPUT);
  digitalWrite(EC_LED_PIN, LOW);
}

void ecStartKitUdp() {
  if (ecUdpReady) return;
  ecUdp.begin(EC_KIT_UDP_PORT);
  ecUdpReady = true;
  Serial.print("Kit protocol -> ");
  Serial.print(ecKitIp);
  Serial.print(":");
  Serial.println(EC_KIT_UDP_PORT);
}

void ecSendPacket(const String &body) {
  String pkt = String("$$$$ ") + body + " ####\\r\\n";
  ecKitSerial.print(pkt);
  Serial.print("[EC TX] ");
  Serial.print(pkt);
  if (ecWifiReady) {
    if (!ecUdpReady) {
      ecStartKitUdp();
    }
    if (ecUdp.beginPacket(ecKitIp, EC_KIT_UDP_PORT)) {
      ecUdp.print(pkt);
      ecUdp.endPacket();
    }
  }
}

void ecSendToKit(const String &msg) {
  if (msg.startsWith("$$$$")) {
    String pkt = msg;
    if (!pkt.endsWith("\\n")) {
      pkt += "\\r\\n";
    }
    ecKitSerial.print(pkt);
    Serial.print("[EC TX] ");
    Serial.print(pkt);
    if (ecWifiReady) {
      if (!ecUdpReady) {
        ecStartKitUdp();
      }
      if (ecUdp.beginPacket(ecKitIp, EC_KIT_UDP_PORT)) {
        ecUdp.print(pkt);
        ecUdp.endPacket();
      }
    }
    return;
  }
  ecSendPacket(msg);
}

char ecMotionLetter(const char *name) {
  if (name == NULL || name[0] == '\\0') return 0;
  if (!strcmp(name, "forward") || !strcmp(name, "F") || !strcmp(name, "f")) return 'F';
  if (!strcmp(name, "backward") || !strcmp(name, "B") || !strcmp(name, "b")) return 'B';
  if (!strcmp(name, "left") || !strcmp(name, "L") || !strcmp(name, "l")) return 'L';
  if (!strcmp(name, "right") || !strcmp(name, "R") || !strcmp(name, "r")) return 'R';
  if (!strcmp(name, "uturn") || !strcmp(name, "U") || !strcmp(name, "u")) return 'U';
  if (!strcmp(name, "stop") || !strcmp(name, "S") || !strcmp(name, "s")) return 'S';
  return 0;
}

const char *ecMotionLabel(const char *name, char letter) {
  if (!strcmp(name, "forward") || !strcmp(name, "backward") || !strcmp(name, "left") ||
      !strcmp(name, "right") || !strcmp(name, "uturn") || !strcmp(name, "stop")) {
    return name;
  }
  if (letter == 'F') return "forward";
  if (letter == 'B') return "backward";
  if (letter == 'L') return "left";
  if (letter == 'R') return "right";
  if (letter == 'U') return "uturn";
  if (letter == 'S') return "stop";
  return name;
}

void ecSendMotion(const char *kind, const char *name) {
  String raw = name == NULL ? "" : String(name);
  raw.trim();
  if (raw.endsWith("\\n")) {
    raw = raw.substring(0, raw.length() - 1);
  }
  if (raw.endsWith("\\r")) {
    raw = raw.substring(0, raw.length() - 1);
  }
  char letter = ecMotionLetter(raw.c_str());
  if (letter == 0) {
    ecSendPacket(String(kind) + ", " + raw + ", " + raw);
    return;
  }
  ecSendPacket(String(kind) + ", " + ecMotionLabel(raw.c_str(), letter) + ", " + String(letter));
}

void ecSendSteering(int value) {
  ecSendPacket(String("BL, <") + String(value) + "," + String(value) + "," + String(value) + ">");
}

void ecSendLineFollow(bool whiteLine, int e1, int e2, int e3) {
  ecSendPacket(String(whiteLine ? "WL" : "BL") + ", <" + String(e1) + "," + String(e2) + "," + String(e3) + ">");
}

void ecSendColorTrack(const char *color, int found, int errX, int errY) {
  String name = (color == NULL || color[0] == '\\0') ? "Red" : String(color);
  int flag = found ? 1 : 0;
  ecSendPacket(String("CT, ") + name + ", T, " + String(flag) + ", " + String(errX) + ", " + String(errY));
}

void ecSendQrCmd(const char *cmd) {
  ecSendMotion("QC", cmd);
}

void ecSendQrRaw(const String &text) {
  ecSendMotion("QC", text.c_str());
}

void ecSendSurveillance(const char *cmd) {
  ecSendMotion("SC", cmd);
}

void ecSendObject(const char *name, int cx, int frameW) {
  const char *obj = (name == NULL || name[0] == '\\0') ? "person" : name;
  ecSendPacket(String(obj) + ", " + String(cx) + ", " + String(frameW));
}

void ecPrintIp(const char *label) {
  Serial.print(label);
  if (ecWifiReady && WiFi.localIP()[0] != 0) {
    Serial.println(WiFi.localIP());
  } else if (WiFi.getMode() == WIFI_AP && WiFi.softAPIP()[0] != 0) {
    Serial.println(WiFi.softAPIP());
  } else {
    Serial.println("(not connected)");
  } 
}

void ecPrintStreamUrl(const char *prefix) {
  Serial.print(prefix);
  if (ecConfiguredStreamUrl.length() > 0) {
    Serial.println(ecConfiguredStreamUrl);
    return;
  }
  IPAddress ip = WiFi.localIP();
  if (ip[0] == 0 && WiFi.getMode() == WIFI_AP) {
    ip = WiFi.softAPIP();
  }
  if (ip[0] != 0) {
    Serial.print("http://");
    Serial.print(ip);
    Serial.println("/stream");
    Serial.print("Browser: http://");
    Serial.println(ip);
  } else {
    Serial.println("(WiFi not ready — connect WiFi first)");
  }
}

void ecSetStreamUrl(const String &url) {
  ecConfiguredStreamUrl = url;
}

String ecGetStreamUrl() {
  if (ecConfiguredStreamUrl.length() > 0) {
    return ecConfiguredStreamUrl;
  }
  IPAddress ip = WiFi.localIP();
  if (ip[0] == 0 && WiFi.getMode() == WIFI_AP) {
    ip = WiFi.softAPIP();
  }
  if (ip[0] == 0) {
    return String("");
  }
  return String("http://") + ip.toString() + String("/stream");
}

camera_config_t ecCameraConfig() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 5;
  config.pin_d1 = 18;
  config.pin_d2 = 19;
  config.pin_d3 = 21;
  config.pin_d4 = 36;
  config.pin_d5 = 39;
  config.pin_d6 = 34;
  config.pin_d7 = 35;
  config.pin_xclk = 0;
  config.pin_pclk = 22;
  config.pin_vsync = 25;
  config.pin_href = 23;
  config.pin_sscb_sda = 26;
  config.pin_sscb_scl = 27;
  config.pin_pwdn = 32;
  config.pin_reset = -1;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_QVGA;
  config.pixel_format = PIXFORMAT_GRAYSCALE;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  return config;
}

bool ecInitCamera() {
  camera_config_t config = ecCameraConfig();
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed 0x%x\\n", err);
    return false;
  }
  sensor_t *s = esp_camera_sensor_get();
  if (s) {
    s->set_framesize(s, FRAMESIZE_QVGA);
  }
  return true;
}

void ecSetResolution(framesize_t size) {
  sensor_t *sensor = esp_camera_sensor_get();
  if (sensor) {
    sensor->set_framesize(sensor, size);
  }
}

void ecSetFrameRate(int fps) {
  ecStreamFps = constrain(fps, 1, 30);
}

void ecSetJpegQuality(int quality) {
  ecJpegQuality = constrain(quality, 10, 100);
}

void ecSetRotation(int degrees) {
  int normalized = degrees % 360;
  if (normalized < 0) normalized += 360;
  if (normalized == 0 || normalized == 90 || normalized == 180 || normalized == 270) {
    ecStreamRotation = normalized;
  }
}

void ecSetFlip(bool horizontal, bool vertical) {
  sensor_t *sensor = esp_camera_sensor_get();
  if (sensor) {
    sensor->set_hmirror(sensor, horizontal ? 1 : 0);
    sensor->set_vflip(sensor, vertical ? 1 : 0);
  }
}

bool ecFrameToJpeg(camera_fb_t *fb, uint8_t **jpgBuf, size_t *jpgLen) {
  if (ecStreamRotation == 0 || fb->format != PIXFORMAT_GRAYSCALE) {
    return frame2jpg(fb, ecJpegQuality, jpgBuf, jpgLen);
  }

  const int srcW = fb->width;
  const int srcH = fb->height;
  const int dstW = (ecStreamRotation == 90 || ecStreamRotation == 270) ? srcH : srcW;
  const int dstH = (ecStreamRotation == 90 || ecStreamRotation == 270) ? srcW : srcH;
  const size_t pixelCount = (size_t)srcW * srcH;
  uint8_t *rotatedBuf = (uint8_t *)malloc(pixelCount);
  if (!rotatedBuf) {
    Serial.println("Camera rotation skipped: not enough memory");
    return frame2jpg(fb, ecJpegQuality, jpgBuf, jpgLen);
  }

  for (int y = 0; y < srcH; y++) {
    for (int x = 0; x < srcW; x++) {
      int dstX;
      int dstY;
      if (ecStreamRotation == 90) {
        dstX = srcH - 1 - y;
        dstY = x;
      } else if (ecStreamRotation == 180) {
        dstX = srcW - 1 - x;
        dstY = srcH - 1 - y;
      } else {
        dstX = y;
        dstY = srcW - 1 - x;
      }
      rotatedBuf[(size_t)dstY * dstW + dstX] = fb->buf[(size_t)y * srcW + x];
    }
  }

  camera_fb_t rotatedFrame = *fb;
  rotatedFrame.buf = rotatedBuf;
  rotatedFrame.len = pixelCount;
  rotatedFrame.width = dstW;
  rotatedFrame.height = dstH;
  rotatedFrame.format = PIXFORMAT_GRAYSCALE;
  bool ok = frame2jpg(&rotatedFrame, ecJpegQuality, jpgBuf, jpgLen);
  free(rotatedBuf);
  return ok;
}

void ecHandleRoot() {
  ecServer.send(200, "text/html",
    "<html><body><h1>Vision Core ESP32-CAM</h1>"
    "<p>Mode: " + ecVisionMode + "</p>"
    "<p>Open <a href='https://vision-core-web.vercel.app/' target='_blank'>Vision Core Web</a> "
    "and connect to this camera stream.</p>"
    "<img src='" + ecGetStreamUrl() + "' style='width:100%;max-width:640px;'/></body></html>");
}

void ecHandleStream() {
  WiFiClient client = ecServer.client();
  String response = "HTTP/1.1 200 OK\\r\\n";
  response += "Access-Control-Allow-Origin: *\\r\\n";
  response += "Cache-Control: no-cache, no-store, must-revalidate\\r\\n";
  response += "Content-Type: multipart/x-mixed-replace; boundary=frame\\r\\n\\r\\n";
  client.print(response);
  while (client.connected()) {
    unsigned long frameStarted = millis();
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
      delay(10);
      continue;
    }
    uint8_t *jpgBuf = NULL;
    size_t jpgLen = 0;
    bool ok = ecFrameToJpeg(fb, &jpgBuf, &jpgLen);
    esp_camera_fb_return(fb);
    if (!ok || !jpgBuf) {
      delay(10);
      continue;
    }
    client.printf("--frame\\r\\nContent-Type: image/jpeg\\r\\nContent-Length: %u\\r\\n\\r\\n", (unsigned)jpgLen);
    client.write(jpgBuf, jpgLen);
    client.print("\\r\\n");
    free(jpgBuf);
    unsigned long elapsed = millis() - frameStarted;
    unsigned long frameInterval = 1000UL / ecStreamFps;
    if (elapsed < frameInterval) {
      delay(frameInterval - elapsed);
    }
  }
}

void ecHandleCmd() {
  String body = "";
  if (ecServer.hasArg("plain")) {
    body = ecServer.arg("plain");
  }
  if (body.length() == 0 && ecServer.hasArg("p")) {
    body = ecServer.arg("p");
  }
  body.trim();
  if (body.length() == 0) {
    ecServer.send(400, "text/plain", "EMPTY");
    return;
  }
  if (body.startsWith("$$$$")) {
    ecSendToKit(body);
  } else {
    ecSendPacket(body);
  }
  ecServer.send(200, "text/plain", "OK");
}

void ecStartWebStream() {
  if (ecStreamReady) return;
  ecServer.on("/", ecHandleRoot);
  ecServer.on("/stream", ecHandleStream);
  ecServer.on("/cmd", HTTP_GET, ecHandleCmd);
  ecServer.on("/cmd", HTTP_POST, ecHandleCmd);
  ecServer.begin();
  ecStreamReady = true;
  if (ecWifiReady) {
    ecStartKitUdp();
  }
  ecPrintStreamUrl("Web stream ready at ");
  Serial.print("Kit protocol UDP ");
  Serial.print(ecKitIp);
  Serial.print(":");
  Serial.println(EC_KIT_UDP_PORT);
}

void ecHandleWebClient() {
  if (ecStreamReady) {
    ecServer.handleClient();
  }
}

int ecBandLineError(camera_fb_t *fb, bool whiteLine, int y0, int y1) {
  if (!fb || y1 <= y0) return 0;
  int w = fb->width;
  int h = fb->height;
  if (y0 < 0) y0 = 0;
  if (y1 > h) y1 = h;
  long sumX = 0;
  long count = 0;
  for (int y = y0; y < y1; y++) {
    for (int x = 0; x < w; x++) {
      uint8_t pix = fb->buf[y * w + x];
      bool isLine = whiteLine ? (pix > EC_LINE_THRESHOLD) : (pix < EC_LINE_THRESHOLD);
      if (isLine) {
        sumX += x;
        count++;
      }
    }
  }
  if (count == 0) return 0;
  return (int)(sumX / count) - (w / 2);
}

void ecLineErrors(bool whiteLine, int *e1, int *e2, int *e3) {
  *e1 = *e2 = *e3 = 0;
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) return;
  int h = fb->height;
  *e1 = ecBandLineError(fb, whiteLine, h / 2, (h * 2) / 3);
  *e2 = ecBandLineError(fb, whiteLine, (h * 2) / 3, (h * 5) / 6);
  *e3 = ecBandLineError(fb, whiteLine, (h * 5) / 6, h);
  esp_camera_fb_return(fb);
}

void ecProcessLineFollow(bool whiteLine) {
  int e1 = 0;
  int e2 = 0;
  int e3 = 0;
  ecLineErrors(whiteLine, &e1, &e2, &e3);
  ecSendLineFollow(whiteLine, e1, e2, e3);
}
`;
    }

    function ensureEsp32CamSerial (Blockly) {
        ensureEsp32CamCore(Blockly);
    }

    function ensureEsp32CamSetup (Blockly) {
        ensureEsp32CamSerial(Blockly);
        if (Blockly.Arduino.setups_.esp32cam_init) {
            return;
        }
        Blockly.Arduino.setups_.esp32cam_init = `
Serial.begin(115200);
delay(500);
ecKitSerial.begin(115200, SERIAL_8N1, EC_KIT_RX, EC_KIT_TX);
ecLedOff();
if (!ecInitCamera()) {
  Serial.println("ESP32-CAM camera init failed");
} else {
  Serial.println("ESP32-CAM camera ready");
}
Serial.println("UART to kit: TX=GPIO1 RX=GPIO3 baud=115200");
Serial.println("Protocol: $$$$ CODE, data ####  kit UDP 192.168.4.4:8888");
`;
    }

    Blockly.Arduino.esp32cam_init = function (block) {
        ensureEsp32CamSetup(Blockly);
        const source = block.getFieldValue('SOURCE') || 'CAMERA';
        if (source === 'WEB_STREAM') {
            ensureEsp32CamWebLoop(Blockly);
            Blockly.Arduino.setups_.esp32cam_source_web = `
WiFi.persistent(false);
WiFi.mode(WIFI_AP);
WiFi.setSleep(false);
WiFi.softAPConfig(IPAddress(192, 168, 4, 1), IPAddress(192, 168, 4, 1), IPAddress(255, 255, 255, 0));
WiFi.softAP("VisionCore", "12345678", 1, 0, 4);
ecWifiReady = true;
ecStartKitUdp();
ecStartWebStream();
ecPrintStreamUrl("Camera web stream ready at ");
`;
        }
        return '';
    };

    function ensureEsp32CamWebLoop (Blockly) {
        Blockly.Arduino.loops_.esp32cam_web = (Blockly.Arduino.loops_.esp32cam_web || '') +
            'ecHandleWebClient();\n';
    }

    Blockly.Arduino.esp32cam_wifi = function (block) {
        ensureEsp32CamSetup(Blockly);
        const mode = block.getFieldValue('MODE') || 'STA';
        const ssid = Blockly.Arduino.valueToCode(block, 'SSID', order) || '"VisionCore"';
        const password = Blockly.Arduino.valueToCode(block, 'PASSWORD', order) || '"12345678"';
        ensureEsp32CamWebLoop(Blockly);
        if (mode === 'AP') {
            Blockly.Arduino.setups_.esp32cam_wifi = `
WiFi.persistent(false);
WiFi.mode(WIFI_AP);
WiFi.setSleep(false);
WiFi.softAPConfig(IPAddress(192, 168, 4, 1), IPAddress(192, 168, 4, 1), IPAddress(255, 255, 255, 0));
if (strlen(${password}) >= 8) {
  WiFi.softAP(${ssid}, ${password}, 1, 0, 4);
} else {
  WiFi.softAP(${ssid}, NULL, 1, 0, 4);
}
ecWifiReady = true;
ecStartKitUdp();
Serial.println("ESP32-CAM hotspot started (no internet is normal)");
Serial.print("WiFi SSID: ");
Serial.println(${ssid});
ecPrintIp("ESP32-CAM AP IP: ");
ecStartWebStream();
ecPrintStreamUrl("Open camera in browser: ");
Serial.println("Phone: join this WiFi, then open the URL above");
`;
        } else {
            Blockly.Arduino.setups_.esp32cam_wifi = `
WiFi.persistent(false);
WiFi.mode(WIFI_STA);
WiFi.setSleep(false);
WiFi.begin(${ssid}, ${password});
Serial.print("WiFi connecting to ");
Serial.println(${ssid});
unsigned long ecWifiStart = millis();
while (WiFi.status() != WL_CONNECTED && millis() - ecWifiStart < 20000) {
  delay(500);
  Serial.print(".");
}
Serial.println();
if (WiFi.status() == WL_CONNECTED) {
  unsigned long ecDhcpStart = millis();
  while (WiFi.localIP()[0] == 0 && millis() - ecDhcpStart < 15000) {
    delay(250);
  }
  ecWifiReady = true;
  Serial.println("WiFi connected!");
  ecPrintIp("ESP32-CAM IP: ");
  if (WiFi.localIP()[0] == 0) {
    Serial.println("DHCP failed — no IP from router");
  } else {
    ecStartKitUdp();
    ecStartWebStream();
    ecPrintStreamUrl("Open camera in browser: ");
  }
} else {
  Serial.println("WiFi connect failed — check SSID/password");
}
`;
        }
        return '';
    };

    Blockly.Arduino.esp32cam_stream_url = function (block) {
        ensureEsp32CamSetup(Blockly);
        const url = Blockly.Arduino.valueToCode(block, 'URL', order) ||
            '"http://192.168.4.1/stream"';
        return `ecSetStreamUrl(${url});\n`;
    };

    Blockly.Arduino.esp32cam_resolution = function (block) {
        ensureEsp32CamSetup(Blockly);
        const sizes = {
            QQVGA: 'FRAMESIZE_QQVGA',
            QVGA: 'FRAMESIZE_QVGA',
            VGA: 'FRAMESIZE_VGA',
            SVGA: 'FRAMESIZE_SVGA'
        };
        const size = sizes[block.getFieldValue('SIZE')] || 'FRAMESIZE_QVGA';
        return `ecSetResolution(${size});\n`;
    };

    Blockly.Arduino.esp32cam_frame_rate = function (block) {
        ensureEsp32CamSetup(Blockly);
        const fps = Blockly.Arduino.valueToCode(block, 'FPS', order) || '15';
        return `ecSetFrameRate(${fps});\n`;
    };

    Blockly.Arduino.esp32cam_jpeg_quality = function (block) {
        ensureEsp32CamSetup(Blockly);
        const quality = Blockly.Arduino.valueToCode(block, 'QUALITY', order) || '80';
        return `ecSetJpegQuality(${quality});\n`;
    };

    Blockly.Arduino.esp32cam_rotation = function (block) {
        ensureEsp32CamSetup(Blockly);
        const rotations = ['0', '90', '180', '270'];
        const selected = block.getFieldValue('ROTATION') || '0';
        const rotation = rotations.includes(selected) ? selected : '0';
        return `ecSetRotation(${rotation});\n`;
    };

    Blockly.Arduino.esp32cam_flip = function (block) {
        ensureEsp32CamSetup(Blockly);
        const flip = block.getFieldValue('FLIP') || 'NONE';
        const values = {
            NONE: 'false, false',
            HORIZONTAL: 'true, false',
            VERTICAL: 'false, true',
            BOTH: 'true, true'
        };
        return `ecSetFlip(${values[flip] || values.NONE});\n`;
    };

    Blockly.Arduino.esp32cam_led_on = function () {
        ensureEsp32CamCore(Blockly);
        return 'ecLedOn();\n';
    };

    Blockly.Arduino.esp32cam_led_off = function () {
        ensureEsp32CamCore(Blockly);
        return 'ecLedOff();\n';
    };

    Blockly.Arduino.esp32cam_stream_web = function () {
        ensureEsp32CamCore(Blockly);
        ensureEsp32CamWebLoop(Blockly);
        Blockly.Arduino.setups_.esp32cam_stream = `ecStartWebStream();
ecPrintStreamUrl("Web stream ready at ");
`;
        return '';
    };

    Blockly.Arduino.esp32cam_handle_client = function () {
        ensureEsp32CamCore(Blockly);
        ensureEsp32CamWebLoop(Blockly);
        return '';
    };

    Blockly.Arduino.esp32cam_surveillance = function () {
        ensureEsp32CamCore(Blockly);
        ensureEsp32CamWebLoop(Blockly);
        return `ecVisionMode = "surveillance";
ecStartWebStream();
ecPrintStreamUrl("Surveillance mode — open ");
`;
    };

    function setVisionMode (mode) {
        ensureEsp32CamCore(Blockly);
        ensureEsp32CamWebLoop(Blockly);
        return `ecVisionMode = "${mode}";
ecStartWebStream();
ecPrintIp("Vision mode: ${mode} — IP: ");
ecPrintStreamUrl("Open stream at ");
`;
    }

    Blockly.Arduino.esp32cam_face_mode = function () {
        return setVisionMode('face');
    };

    Blockly.Arduino.esp32cam_color_mode = function () {
        return setVisionMode('color');
    };

    Blockly.Arduino.esp32cam_finger_mode = function () {
        return setVisionMode('finger');
    };

    Blockly.Arduino.esp32cam_qr_mode = function () {
        return setVisionMode('qr');
    };

    Blockly.Arduino.esp32cam_emotion_mode = function () {
        return setVisionMode('emotion');
    };

    Blockly.Arduino.esp32cam_object_mode = function (block) {
        ensureEsp32CamCore(Blockly);
        ensureEsp32CamWebLoop(Blockly);
        const name = block.getFieldValue('NAME') || 'person';
        return `ecVisionMode = "object";
ecObjectTarget = "${name}";
ecStartWebStream();
ecPrintIp("Object follow (${name}) — IP: ");
ecPrintStreamUrl("Open stream at ");
`;
    };

    Blockly.Arduino.esp32cam_line_black = function () {
        ensureEsp32CamCore(Blockly);
        return 'ecProcessLineFollow(false);\n';
    };

    Blockly.Arduino.esp32cam_line_white = function () {
        ensureEsp32CamCore(Blockly);
        return 'ecProcessLineFollow(true);\n';
    };

    Blockly.Arduino.esp32cam_send_steering = function (block) {
        ensureEsp32CamCore(Blockly);
        const value = Blockly.Arduino.valueToCode(block, 'VALUE', order) || '0';
        return `ecSendSteering(${value});\n`;
    };

    Blockly.Arduino.esp32cam_send_qr = function (block) {
        ensureEsp32CamCore(Blockly);
        const cmd = block.getFieldValue('CMD') || 'forward';
        return `ecSendQrCmd("${cmd}");\n`;
    };

    Blockly.Arduino.esp32cam_send_qr_raw = function (block) {
        ensureEsp32CamCore(Blockly);
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', order) || '"Raw Text"';
        return `ecSendQrRaw(${text});\n`;
    };

    Blockly.Arduino.esp32cam_send_surveillance = function (block) {
        ensureEsp32CamCore(Blockly);
        const cmd = block.getFieldValue('CMD') || 'forward';
        return `ecSendSurveillance("${cmd}");\n`;
    };

    Blockly.Arduino.esp32cam_send_color = function (block) {
        ensureEsp32CamCore(Blockly);
        const color = block.getFieldValue('COLOR') || 'Red';
        const found = Blockly.Arduino.valueToCode(block, 'FOUND', order) || '1';
        const errX = Blockly.Arduino.valueToCode(block, 'ERRX', order) || '0';
        const errY = Blockly.Arduino.valueToCode(block, 'ERRY', order) || '0';
        return `ecSendColorTrack("${color}", ${found}, ${errX}, ${errY});\n`;
    };

    Blockly.Arduino.esp32cam_send_object = function (block) {
        ensureEsp32CamCore(Blockly);
        const name = block.getFieldValue('NAME') || 'person';
        const cx = Blockly.Arduino.valueToCode(block, 'CX', order) || '160';
        const width = Blockly.Arduino.valueToCode(block, 'WIDTH', order) || '320';
        return `ecSendObject("${name}", ${cx}, ${width});\n`;
    };

    return Blockly;
}

exports = addGenerator;
