/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addToolbox () {
    // ESP32: native WiFi. AI & IoT / Nano: ESP-01 on D13/D2 (same as iotWifi).
    const wifiBlock = `
  <block type="botzie_connect_wifi" id="botzie_connect_wifi">
    <field name="MODE">AP</field>
    <value name="SSID">
      <shadow type="text">
        <field name="TEXT">Botzie</field>
      </shadow>
    </value>
    <value name="PASSWORD">
      <shadow type="text">
        <field name="TEXT">12345678</field>
      </shadow>
    </value>
  </block>`;

    return `
<category name="%{BKY_BOTZIE_CATEGORY}" id="BOTZIE_CATEGORY" colour="#FF6F00" secondaryColour="#1565C0">
  <block type="botzie_setup" id="botzie_setup"></block>
  <block type="botzie_connect_bluetooth" id="botzie_connect_bluetooth">
    <field name="MODE">BLE</field>
    <value name="NAME">
      <shadow type="text">
        <field name="TEXT">Botzie</field>
      </shadow>
    </value>
  </block>${wifiBlock}
  <block type="botzie_action_command" id="botzie_action_command">
    <field name="ACTION">forward</field>
    <value name="CMD">
      <shadow type="text">
        <field name="TEXT">u</field>
      </shadow>
    </value>
  </block>
</category>`;
}

module.exports = addToolbox;
