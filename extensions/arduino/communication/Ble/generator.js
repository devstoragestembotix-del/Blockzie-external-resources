function addGenerator(Blockly) {
  Blockly.Arduino.ble_connection = function (block) {
    const name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC) || '"ESP32_BLE"';

    // ----------------- INCLUDES + GLOBALS -----------------
//     Blockly.Arduino.includes_['ble_includes'] = `
// #include <ESP32Servo.h>
// #include <BLEDevice.h>
// #include <BLEServer.h>
// #include <BLEUtils.h>
// #include <BLE2902.h>
// #include "esp32-hal-ledc.h"
// #include "esp_ota_ops.h"
// #include <driver/ledc.h>

// // ================== Global Declarations ==================
// Servo myServo[40];
// #define IS_PIN_ANALOG(pin) (pin >= 0 && pin <= 39)
// #define SERVICE_UUID_ESPOTA "d804b643-6ce7-4e81-9f8a-ce0f699085eb"
// #define CHARACTERISTIC_UUID_CMD "c8659211-af91-4ad3-a995-a58d6fd26145"
// #define CHARACTERISTIC_UUID_FW "c8659211-af91-4ad3-a995-a58d6fd26145"
// #define CHARACTERISTIC_UUID_HW_VERSION "c8659212-af91-4ad3-a995-a58d6fd26145"
// #define FULL_PACKET 512
// #define BOOT_BUTTON_PIN 0

// esp_ota_handle_t otaHandler = 0;
// bool updateFlag = false;

// BLEServer* pServer;
// BLEService* pService;
// BLECharacteristic* pCmdCharacteristic;
// BLECharacteristic* pOtaCharacteristic;
// BLECharacteristic* pVersionCharacteristic;

// // ================== BLE Server Callbacks ==================
// class BLECustomServerCallbacks : public BLEServerCallbacks {
//     void onConnect(BLEServer* pServer) {
//         Serial.println("Device Connected");
//         pServer->getAdvertising()->stop();
//     }
//     void onDisconnect(BLEServer* pServer) {
//         Serial.println("Device Disconnected");
//         pServer->getAdvertising()->start();
//     }
// };

// // ================== Command Callback ==================
// class CommandCallback : public BLECharacteristicCallbacks {
//     void onWrite(BLECharacteristic* pCharacteristic) {
//         std::string rxData = pCharacteristic->getValue().c_str();
//         if (rxData.empty()) return;

//         Serial.printf("Received: %s\\n", rxData.c_str());   // ✅ Fixed escape sequence

//         if (rxData.find("SET_PIN_MODE") != std::string::npos) {
//             int pin;
//             char mode[10];
//             sscanf(rxData.c_str(), "SET_PIN_MODE %d %s", &pin, mode);
//             if (strcmp(mode, "INPUT") == 0) pinMode(pin, INPUT);
//             else if (strcmp(mode, "OUTPUT") == 0) pinMode(pin, OUTPUT);
//         }
//         else if (rxData.find("SET_DIGITAL_OUTPUT") != std::string::npos) {
//             int pin, state;
//             sscanf(rxData.c_str(), "SET_DIGITAL_OUTPUT %d %d", &pin, &state);
//             pinMode(pin, OUTPUT);
//             digitalWrite(pin, state);
//         }
//         else if (rxData.find("SET_SERVO_OUTPUT") != std::string::npos) {
//             int pin, angle;
//             sscanf(rxData.c_str(), "SET_SERVO_OUTPUT %d %d", &pin, &angle);
//             if (!myServo[pin].attached())
//                 myServo[pin].attach(pin, 600, 2400);
//             myServo[pin].write(angle);
//         }
//         else if (rxData.find("READ_ANALOG") != std::string::npos) {
//             int pin;
//             sscanf(rxData.c_str(), "READ_ANALOG %d", &pin);
//             if (IS_PIN_ANALOG(pin)) {
//                 int analogValue = analogRead(pin);
//                 char response[20];
//                 snprintf(response, sizeof(response), "ANALOG_VALUE %d", analogValue);
//                 pCmdCharacteristic->setValue(response);
//                 pCmdCharacteristic->notify();
//             }
//         }
//         else if (rxData.find("SET_PWM_OUTPUT") != std::string::npos) {
//             int pin, value;
//             sscanf(rxData.c_str(), "SET_PWM_OUTPUT %d %d", &pin, &value);
//             pinMode(pin, OUTPUT);
//             ledcAttachPin(pin, pin);     // ✅ ESP32 specific PWM
//             ledcWrite(pin, value);
//         }

//         pCmdCharacteristic->setValue("Command Executed");
//         pCmdCharacteristic->notify();
//     }
// };

// // ================== Initialize BLE ==================
// void initializeBLE(const char* name) {
//     BLEDevice::init(name);
//     pServer = BLEDevice::createServer();
//     pServer->setCallbacks(new BLECustomServerCallbacks());

//     pService = pServer->createService(SERVICE_UUID_ESPOTA);

//     pCmdCharacteristic = pService->createCharacteristic(
//         CHARACTERISTIC_UUID_CMD,
//         BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
//     );
//     pCmdCharacteristic->addDescriptor(new BLE2902());
//     pCmdCharacteristic->setCallbacks(new CommandCallback());

//     pOtaCharacteristic = pService->createCharacteristic(
//         CHARACTERISTIC_UUID_FW,
//         BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
//     );

//     pVersionCharacteristic = pService->createCharacteristic(
//         CHARACTERISTIC_UUID_HW_VERSION,
//         BLECharacteristic::PROPERTY_READ
//     );
//     uint8_t hardwareVersion[3] = {1, 2, 0};
//     pVersionCharacteristic->setValue(hardwareVersion, sizeof(hardwareVersion));

//     pService->start();
//     BLEDevice::startAdvertising();
//     Serial.println("🚀 BLE Ready for Commands");
// }
// `;

//     // ----------------- SETUP CODE -----------------
//     Blockly.Arduino.setups_['ble_setup'] = `
// Serial.begin(57600);
// Serial.println("ESP32 BLE OTA Ready");
// initializeBLE(${name});
// `;

//     // ----------------- LOOP CODE -----------------
//     Blockly.Arduino.loops_['ble_loop'] = `
// // BLE tasks can be handled here if needed
// `;


//     return '';
//   };
Blockly.Arduino.includes_['ble_includes'] = `
#include <ESP32Servo.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "esp32-hal-ledc.h"
#include "esp_ota_ops.h"
#include <driver/ledc.h>
#include <TM1637Display.h>

// ================== Global Declarations ==================
Servo myServo[40];
#define IS_PIN_ANALOG(pin) (pin >= 0 && pin <= 39)
#define SERVICE_UUID_ESPOTA "d804b643-6ce7-4e81-9f8a-ce0f699085eb"
#define CHARACTERISTIC_UUID_CMD "c8659211-af91-4ad3-a995-a58d6fd26145"
#define CHARACTERISTIC_UUID_FW "c8659211-af91-4ad3-a995-a58d6fd26145"
#define CHARACTERISTIC_UUID_HW_VERSION "c8659212-af91-4ad3-a995-a58d6fd26145"
#define FULL_PACKET 512
#define BOOT_BUTTON_PIN 0

esp_ota_handle_t otaHandler = 0;
bool updateFlag = false;

BLEServer* pServer;
BLEService* pService;
BLECharacteristic* pCmdCharacteristic;
BLECharacteristic* pOtaCharacteristic;
BLECharacteristic* pVersionCharacteristic;

// ================== TM1637 4-Digit Clock Display ==================
TM1637Display* tm1637Display = nullptr;
int tm1637_dio_pin = -1;
int tm1637_clk_pin = -1;
bool tm1637_colon = false;

// Character mapping for TM1637 (A-Z, 0-9)
const uint8_t TM1637_CHAR_MAP[] = {
  0x77, // A
  0x7C, // b
  0x39, // C
  0x5E, // d
  0x79, // E
  0x71, // F
  0x3D, // G
  0x76, // H
  0x30, // I
  0x1E, // J
  0x76, // K (same as H)
  0x38, // L
  0x37, // M (approximation)
  0x54, // n
  0x3F, // O
  0x73, // P
  0x67, // Q
  0x50, // r
  0x6D, // S
  0x78, // t
  0x3E, // U
  0x1C, // v
  0x7E, // W (approximation)
  0x76, // X (same as H)
  0x6E, // Y
  0x5B, // Z
};

uint8_t charToSegment(char c) {
  if (c >= '0' && c <= '9') {
    return tm1637Display->encodeDigit(c - '0');
  } else if (c >= 'A' && c <= 'Z') {
    return TM1637_CHAR_MAP[c - 'A'];
  } else if (c >= 'a' && c <= 'z') {
    return TM1637_CHAR_MAP[c - 'a'];
  } else if (c == '-') {
    return 0x40;
  } else if (c == '_') {
    return 0x08;
  } else if (c == ' ') {
    return 0x00;
  }
  return 0x00;
}

void displayString(const char* str) {
  if (tm1637Display == nullptr) return;
  uint8_t segments[4] = {0x00, 0x00, 0x00, 0x00};
  int len = strlen(str);
  for (int i = 0; i < 4 && i < len; i++) {
    segments[i] = charToSegment(str[i]);
  }
  if (tm1637_colon) {
    segments[1] |= 0x80;  // Add colon after 2nd digit
  }
  tm1637Display->setSegments(segments);
}

// ================== BLE Server Callbacks ==================
class BLECustomServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        Serial.println("Device Connected");
        pServer->getAdvertising()->stop();
    }
    void onDisconnect(BLEServer* pServer) {
        Serial.println("Device Disconnected");
        pServer->getAdvertising()->start();
    }
};

// ================== Command Callback ==================
class CommandCallback : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pCharacteristic) {
        std::string rxData = pCharacteristic->getValue().c_str();
        if (rxData.empty()) return;

        Serial.printf("Received: %s\\n", rxData.c_str());

        if (rxData.find("SET_PIN_MODE") != std::string::npos) {
            int pin;
            char mode[10];
            sscanf(rxData.c_str(), "SET_PIN_MODE %d %s", &pin, mode);
            if (strcmp(mode, "INPUT") == 0) pinMode(pin, INPUT);
            else if (strcmp(mode, "OUTPUT") == 0) pinMode(pin, OUTPUT);
        }
        else if (rxData.find("SET_DIGITAL_OUTPUT") != std::string::npos) {
            int pin, state;
            sscanf(rxData.c_str(), "SET_DIGITAL_OUTPUT %d %d", &pin, &state);
            pinMode(pin, OUTPUT);
            digitalWrite(pin, state);
        }
        else if (rxData.find("SET_SERVO_OUTPUT") != std::string::npos) {
            int pin, angle;
            sscanf(rxData.c_str(), "SET_SERVO_OUTPUT %d %d", &pin, &angle);
            if (!myServo[pin].attached())
                myServo[pin].attach(pin, 600, 2400);
            myServo[pin].write(angle);
        }
        else if (rxData.find("READ_ANALOG") != std::string::npos) {
            int pin;
            sscanf(rxData.c_str(), "READ_ANALOG %d", &pin);
            if (IS_PIN_ANALOG(pin)) {
                int analogValue = analogRead(pin);
                char response[20];
                snprintf(response, sizeof(response), "ANALOG_VALUE %d", analogValue);
                pCmdCharacteristic->setValue(response);
                pCmdCharacteristic->notify();
            }
        }
        else if (rxData.find("SET_PWM_OUTPUT") != std::string::npos) {
            int pin, value;
            sscanf(rxData.c_str(), "SET_PWM_OUTPUT %d %d", &pin, &value);
            pinMode(pin, OUTPUT);
            ledcAttachPin(pin, pin);
            ledcWrite(pin, value);
        }
        else if (rxData.find("TM1637_INIT") != std::string::npos) {
            int dio, clk;
            sscanf(rxData.c_str(), "TM1637_INIT %d %d", &dio, &clk);
            tm1637_dio_pin = dio;
            tm1637_clk_pin = clk;
            if (tm1637Display != nullptr) {
                delete tm1637Display;
            }
            tm1637Display = new TM1637Display(clk, dio);
            tm1637Display->setBrightness(2);
            tm1637Display->clear();
            Serial.printf("TM1637 initialized: DIO=%d, CLK=%d\\n", dio, clk);
            pCmdCharacteristic->setValue("TM1637_INIT_OK");
            pCmdCharacteristic->notify();
            return;
        }
        else if (rxData.find("TM1637_BRIGHTNESS") != std::string::npos) {
            int brightness;
            sscanf(rxData.c_str(), "TM1637_BRIGHTNESS %d", &brightness);
            if (tm1637Display != nullptr) {
                brightness = constrain(brightness, 0, 7);
                tm1637Display->setBrightness(brightness);
                Serial.printf("TM1637 brightness set to: %d\\n", brightness);
            }
        }
        else if (rxData.find("TM1637_NUMBER") != std::string::npos) {
            int number;
            sscanf(rxData.c_str(), "TM1637_NUMBER %d", &number);
            if (tm1637Display != nullptr) {
                tm1637Display->showNumberDecEx(number, tm1637_colon ? 0x40 : 0x00, false);
                Serial.printf("TM1637 showing number: %d\\n", number);
            }
        }
        else if (rxData.find("TM1637_STRING") != std::string::npos) {
            char str[10];
            sscanf(rxData.c_str(), "TM1637_STRING %s", str);
            if (tm1637Display != nullptr) {
                displayString(str);
                Serial.printf("TM1637 showing string: %s\\n", str);
            }
        }
        else if (rxData.find("TM1637_DIGIT") != std::string::npos) {
            int value, pos;
            sscanf(rxData.c_str(), "TM1637_DIGIT %d %d", &value, &pos);
            if (tm1637Display != nullptr && pos >= 0 && pos <= 3) {
                uint8_t segment = tm1637Display->encodeDigit(value % 10);
                tm1637Display->setSegments(&segment, 1, pos);
                Serial.printf("TM1637 digit %d at position %d\\n", value, pos);
            }
        }
        else if (rxData.find("TM1637_CLEAR") != std::string::npos) {
            if (tm1637Display != nullptr) {
                tm1637Display->clear();
                Serial.println("TM1637 cleared");
            }
        }
        else if (rxData.find("TM1637_COLON") != std::string::npos) {
            char state[10];
            sscanf(rxData.c_str(), "TM1637_COLON %s", state);
            tm1637_colon = (strcmp(state, "true") == 0 || strcmp(state, "1") == 0);
            Serial.printf("TM1637 colon: %s\\n", tm1637_colon ? "ON" : "OFF");
        }

        pCmdCharacteristic->setValue("Command Executed");
        pCmdCharacteristic->notify();
    }
};

// ================== Initialize BLE ==================
void initializeBLE(const char* name) {
    BLEDevice::init(name);
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new BLECustomServerCallbacks());

    pService = pServer->createService(SERVICE_UUID_ESPOTA);

    pCmdCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_CMD,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
    );
    pCmdCharacteristic->addDescriptor(new BLE2902());
    pCmdCharacteristic->setCallbacks(new CommandCallback());

    pOtaCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_FW,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
    );

    pVersionCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_HW_VERSION,
        BLECharacteristic::PROPERTY_READ
    );
    uint8_t hardwareVersion[3] = {1, 2, 0};
    pVersionCharacteristic->setValue(hardwareVersion, sizeof(hardwareVersion));

    pService->start();
    BLEDevice::startAdvertising();
    Serial.println("BLE Ready for Commands");
}
`;

    // ----------------- SETUP CODE -----------------
    Blockly.Arduino.setups_['ble_setup'] = `
Serial.begin(57600);
Serial.println("ESP32 BLE OTA Ready");
initializeBLE(${name});
`;

    // ----------------- LOOP CODE -----------------
    Blockly.Arduino.loops_['ble_loop'] = `
// BLE tasks can be handled here if needed
`;

    return '';
    };
 // ---------------- Bluetooth Generators ----------------
 Blockly.Arduino.bt_classic_connection = function (block) {
    const name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC) || '"MyESP32"';

    Blockly.Arduino.includes_['bt_classic'] = `#include <BluetoothSerial.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>`;
    Blockly.Arduino.definitions_['bt_classic'] = `
BluetoothSerial esp32BT;
String btIosBleRx = "";
BLECharacteristic* btIosBleTx = nullptr;

#define BT_IOS_BLE_SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define BT_IOS_BLE_UUID_RX      "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define BT_IOS_BLE_UUID_TX      "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

class BtIosBleServerCb : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {}
  void onDisconnect(BLEServer* pServer) { BLEDevice::startAdvertising(); }
};

class BtIosBleRxCb : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    String v = pCharacteristic->getValue();
    if (v.length() == 0) return;
    btIosBleRx += v;
#else
    std::string v = pCharacteristic->getValue();
    if (v.empty()) return;
    btIosBleRx += String(v.c_str());
#endif
  }
};

void startBtIosBle(const char* name) {
  BLEDevice::init(name);
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new BtIosBleServerCb());
  BLEService* service = server->createService(BT_IOS_BLE_SERVICE_UUID);
  btIosBleTx = service->createCharacteristic(
    BT_IOS_BLE_UUID_TX, BLECharacteristic::PROPERTY_NOTIFY);
  btIosBleTx->addDescriptor(new BLE2902());
  BLECharacteristic* rx = service->createCharacteristic(
    BT_IOS_BLE_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  rx->setCallbacks(new BtIosBleRxCb());
  service->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(BT_IOS_BLE_SERVICE_UUID);
  BLEAdvertisementData ad;
  ad.setName(name);
  ad.setCompleteServices(BLEUUID(BT_IOS_BLE_SERVICE_UUID));
  adv->setAdvertisementData(ad);
  BLEAdvertisementData sr;
  sr.setName(name);
  adv->setScanResponseData(sr);
  adv->setScanResponse(true);
  BLEDevice::startAdvertising();
}

bool bluetoothDataAvailable() {
  return esp32BT.available() || btIosBleRx.length() > 0;
}

String readBluetoothTrimmed() {
  String s = "";
  while (esp32BT.available()) {
    s += (char)esp32BT.read();
  }
  if (btIosBleRx.length() > 0) {
    s += btIosBleRx;
    btIosBleRx = "";
  }
  s.trim();
  return s;
}

void sendBluetoothText(const String& text) {
  esp32BT.println(text);
  if (btIosBleTx != nullptr) {
    btIosBleTx->setValue(text.c_str());
    btIosBleTx->notify();
  }
}
`;
    Blockly.Arduino.setups_['bt_classic'] = `
esp32BT.begin(${name});
startBtIosBle(${name});
Serial.print("Bluetooth Ready (Android Classic + iOS BLE): ");
Serial.println(${name});
`;

    return '';
};

    Blockly.Arduino.bt_available = function () {
        return ['bluetoothDataAvailable()', Blockly.Arduino.ORDER_ATOMIC];
    };
    Blockly.Arduino.bt_read = function () {
        return ['readBluetoothTrimmed()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.bt_send = function (block) {
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC) || '""';
        return `sendBluetoothText(${text});\n`;
    };

    // ---------------- Serial Generators ----------------
    Blockly.Arduino.serial_set_baud = function (block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const baud = block.getFieldValue('BAUD') || '115200';
        if (serial === '0') {
            Blockly.Arduino.setups_[`serial_${serial}`] = `Serial.begin(${baud});`;
            return '';
        } else {
            // ESP32 has Serial1, Serial2
            Blockly.Arduino.setups_[`serial_${serial}`] = `Serial${serial}.begin(${baud});`;
            return '';
        }
    };

    Blockly.Arduino.serial_available = function (block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        return [`${ser}.available()`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.serial_read_bytes = function(block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        // ✅ check available before reading, otherwise return 0
        const code = `(${ser}.available() > 0 ? ${ser}.read() : 0)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };


    Blockly.Arduino.serial_read_number = function(block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        // ✅ check available before parsing integer
        const code = `(${ser}.available() > 0 ? ${ser}.parseInt() : 0)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };


    Blockly.Arduino.serial_read_string = function(block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        // ✅ check available before reading string
        const code = `(${ser}.available() > 0 ? ${ser}.readString() : "")`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };


    Blockly.Arduino.serial_write = function (block) {
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC) || '""';
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        return `${ser}.println(${text});\n`;
    };
    return Blockly;
}

exports = addGenerator;
