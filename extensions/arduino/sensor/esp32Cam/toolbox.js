/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_ESP32CAM_CATEGORY}" id="ESP32CAM_CATEGORY" colour="#5E35B1" secondaryColour="#4527A0">
  <block type="esp32cam_init" id="esp32cam_init">
    <field name="SOURCE">CAMERA</field>
  </block>
  <block type="esp32cam_wifi" id="esp32cam_wifi">
    <field name="MODE">AP</field>
    <value name="SSID">
      <shadow type="text"><field name="TEXT">VisionCore</field></shadow>
    </value>
    <value name="PASSWORD">
      <shadow type="text"><field name="TEXT">12345678</field></shadow>
    </value>
  </block>
  <block type="esp32cam_stream_url" id="esp32cam_stream_url">
    <value name="URL">
      <shadow type="text"><field name="TEXT">http://192.168.4.1/stream</field></shadow>
    </value>
  </block>
  <block type="esp32cam_frame_rate" id="esp32cam_frame_rate">
    <value name="FPS">
      <shadow type="math_number"><field name="NUM">15</field></shadow>
    </value>
  </block>
  <block type="esp32cam_rotation" id="esp32cam_rotation">
    <field name="ROTATION">0</field>
  </block>
  <block type="esp32cam_stream_web" id="esp32cam_stream_web"></block>
  <block type="esp32cam_handle_client" id="esp32cam_handle_client"></block>
  <block type="esp32cam_surveillance" id="esp32cam_surveillance"></block>
  <block type="esp32cam_color_mode" id="esp32cam_color_mode"></block>
  <block type="esp32cam_qr_mode" id="esp32cam_qr_mode"></block>
  <block type="esp32cam_line_black" id="esp32cam_line_black"></block>
  <block type="esp32cam_line_white" id="esp32cam_line_white"></block>
  <block type="esp32cam_send_steering" id="esp32cam_send_steering">
    <value name="VALUE">
      <shadow type="math_number"><field name="NUM">0</field></shadow>
    </value>
  </block>
  <block type="esp32cam_send_color" id="esp32cam_send_color">
    <field name="COLOR">Red</field>
    <value name="FOUND">
      <shadow type="math_number"><field name="NUM">1</field></shadow>
    </value>
    <value name="ERRX">
      <shadow type="math_number"><field name="NUM">0</field></shadow>
    </value>
    <value name="ERRY">
      <shadow type="math_number"><field name="NUM">0</field></shadow>
    </value>
  </block>
  <block type="esp32cam_send_surveillance" id="esp32cam_send_surveillance">
    <field name="CMD">forward</field>
  </block>
  <block type="esp32cam_send_qr" id="esp32cam_send_qr">
    <field name="CMD">left</field>
  </block>
  <block type="esp32cam_send_qr_raw" id="esp32cam_send_qr_raw">
    <value name="TEXT">
      <shadow type="text"><field name="TEXT">L</field></shadow>
    </value>
  </block>
</category>`;
}

exports = addToolbox;
