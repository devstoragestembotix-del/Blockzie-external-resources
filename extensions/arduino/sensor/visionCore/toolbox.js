/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_VISIONCORE_CATEGORY}" id="VISIONCORE_CATEGORY" colour="#00897B" secondaryColour="#00695C">

  <label text="Setup"></label>
  <block type="visioncore_init" id="visioncore_init"></block>
  <block type="visioncore_stop" id="visioncore_stop"></block>
  <block type="visioncore_data_available" id="visioncore_data_available"></block>

  <label text="Line / Color follow"></label>
  <block type="visioncore_read_steering" id="visioncore_read_steering"></block>
  <block type="visioncore_steer_follow" id="visioncore_steer_follow">
    <field name="MODE">LINE</field>
    <value name="VALUE">
      <shadow type="visioncore_read_steering"></shadow>
    </value>
  </block>
  <block type="visioncore_signal_timeout" id="visioncore_signal_timeout"></block>
  <block type="visioncore_is_centered" id="visioncore_is_centered">
    <field name="MODE">LINE</field>
    <value name="VALUE">
      <shadow type="visioncore_read_steering"></shadow>
    </value>
  </block>

  <label text="Object follow"></label>
  <block type="visioncore_update_object" id="visioncore_update_object"></block>
  <block type="visioncore_object_detected" id="visioncore_object_detected"></block>
  <block type="visioncore_object_name" id="visioncore_object_name"></block>
  <block type="visioncore_object_is" id="visioncore_object_is">
    <field name="NAME">person</field>
  </block>
  <block type="visioncore_object_distance" id="visioncore_object_distance"></block>
  <block type="visioncore_steer_object" id="visioncore_steer_object">
    <value name="DISTANCE">
      <shadow type="visioncore_object_distance"></shadow>
    </value>
  </block>
  <block type="visioncore_drive_straight" id="visioncore_drive_straight"></block>
  <block type="visioncore_object_lost" id="visioncore_object_lost"></block>

  <label text="QR car"></label>
  <block type="visioncore_read_qr" id="visioncore_read_qr"></block>
  <block type="visioncore_move_qr" id="visioncore_move_qr">
    <value name="CMD">
      <shadow type="visioncore_read_qr"></shadow>
    </value>
  </block>

  <label text="Manual test"></label>
  <block type="visioncore_motor_test" id="visioncore_motor_test"></block>
  <block type="visioncore_move_manual" id="visioncore_move_manual">
    <field name="DIR">FORWARD</field>
    <value name="SPEED">
      <shadow type="math_number"><field name="NUM">120</field></shadow>
    </value>
  </block>

</category>`;
}

exports = addToolbox;
