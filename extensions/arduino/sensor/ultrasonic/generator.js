/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    Blockly.Arduino.ultrasonic_readDistance = function (block) {
        const trig = block.getFieldValue('TRIG');
        const echo = block.getFieldValue('ECHO');
        const unit = block.getFieldValue('UNIT');

        // Same idea as IDE example: pulseIn + timeout; light rate-limit for WiFi/MQTT loops
        Blockly.Arduino.definitions_.ultrasonic_pulse_fn = `
float ultrasonicReadCm(uint8_t trigPin, uint8_t echoPin) {
  static float lastGood = 0;
  static unsigned long lastMs = 0;
  static uint8_t inited = 0;
  unsigned long now = millis();
  if (inited && (now - lastMs) < 200UL) return lastGood;
  lastMs = now;

  if (!inited) {
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);
    digitalWrite(trigPin, LOW);
    inited = 1;
  }

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000UL);
  if (duration > 0) {
    float cm = (duration * 0.034f) / 2.0f;
    if (cm > 0.5f && cm < 400.0f) lastGood = cm;
  }
  return lastGood;
}
`;

        if (unit === 'INC') {
            return [`(ultrasonicReadCm(${trig}, ${echo}) / 2.54f)`, Blockly.Arduino.ORDER_ATOMIC];
        }
        return [`ultrasonicReadCm(${trig}, ${echo})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    return Blockly;
}

exports = addGenerator;
