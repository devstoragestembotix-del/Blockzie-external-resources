/*
  ESP-01 / ESP-01S AT Test (Arduino Nano)
  ---------------------------------------
  Wiring (AI & IoT kit default):
    Nano D13 (SoftSerial RX) <- ESP TX
    Nano D2  (SoftSerial TX) -> ESP RX
    ESP VCC + EN  -> 3.3V
    ESP GND       -> GND

  Serial Monitor: 9600 baud
  Open Serial Monitor and watch for "OK"
*/

#include <SoftwareSerial.h>

#define ESP_RX_PIN 13   // Nano receives from ESP TX
#define ESP_TX_PIN 2    // Nano sends to ESP RX

SoftwareSerial esp(ESP_RX_PIN, ESP_TX_PIN);

void sendAT(const char* cmd) {
  while (esp.available()) esp.read();
  Serial.print(F(">> "));
  Serial.println(cmd);
  // Same paced TX as working IDE udp_client.ino
  for (int i = 0; cmd[i] != '\0'; i++) { esp.write((uint8_t)cmd[i]); delay(2); }
  esp.write('\r'); delay(2);
  esp.write('\n'); delay(40);
}

String readResp(unsigned long timeoutMs) {
  String r = "";
  unsigned long t0 = millis();
  while (millis() - t0 < timeoutMs) {
    while (esp.available()) {
      char c = (char)esp.read();
      r += c;
      Serial.write(c);   // live echo to Serial Monitor
    }
  }
  return r;
}

bool tryBaud(long baud) {
  Serial.println();
  Serial.print(F("=== Try baud "));
  Serial.print(baud);
  Serial.println(F(" ==="));

  esp.end();
  esp.begin(baud);
  delay(1500);
  while (esp.available()) esp.read();

  for (int i = 1; i <= 5; i++) {
    Serial.print(F("AT attempt #"));
    Serial.println(i);
    sendAT("AT");
    String r = readResp(2000);
    Serial.print(F("\n[bytes="));
    Serial.print(r.length());
    Serial.println(F("]"));
    if (r.indexOf("OK") >= 0) {
      Serial.print(F("SUCCESS at baud "));
      Serial.println(baud);
      return true;
    }
    delay(300);
  }
  return false;
}

void setup() {
  Serial.begin(9600);
  delay(500);
  Serial.println(F("ESP-01 AT Test"));
  Serial.print(F("SoftSerial RX="));
  Serial.print(ESP_RX_PIN);
  Serial.print(F(" TX="));
  Serial.println(ESP_TX_PIN);

  // Nano SoftSerial: 9600 stable; factory ESP often 115200 (RX fails → bytes=0).
  // Blind TX UART_DEF still works at 115200 — force ESP down to 9600 then re-probe.
  long found = 0;
  if (tryBaud(9600)) found = 9600;

  if (!found) {
    Serial.println(F("Blind force 9600 from 115200..."));
    esp.end();
    esp.begin(115200);
    delay(200);
    for (int i = 0; i < 2; i++) {
      sendAT("AT+UART_DEF=9600,8,1,0,0");
      delay(400);
    }
    esp.end();
    delay(200);
    esp.begin(9600);
    delay(800);
    while (esp.available()) esp.read();
    if (tryBaud(9600)) found = 9600;
  }

  if (!found) {
    if (tryBaud(57600)) found = 57600;
    else if (tryBaud(115200)) found = 115200;
  }

  if (found) {
    if (found != 9600) {
      Serial.println(F("Switching ESP to 9600 for SoftSerial stability..."));
      sendAT("AT+UART_DEF=9600,8,1,0,0");
      readResp(1500);
      esp.end();
      delay(200);
      esp.begin(9600);
      delay(800);
      while (esp.available()) esp.read();
      sendAT("AT");
      readResp(2000);
      Serial.println();
    }
    Serial.println(F("--- ESP READY ---"));
    sendAT("AT+GMR");
    readResp(3000);
    Serial.println();
    sendAT("AT+CIFSR");
    readResp(3000);
    Serial.println();
    Serial.println(F("Type AT commands in Serial Monitor (Both NL & CR)"));
  } else {
    Serial.println(F("FAIL: bytes=0 / no OK"));
    Serial.println(F("Check: D13<-ESP TX, D2->ESP RX, VCC+EN 3.3V, GND"));
  }
}

void loop() {
  // PC -> ESP
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) {
      sendAT(line.c_str());
      readResp(3000);
      Serial.println();
    }
  }
  // ESP -> PC
  while (esp.available()) {
    Serial.write(esp.read());
  }
}
