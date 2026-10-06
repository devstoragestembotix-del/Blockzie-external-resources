function addToolbox() {
  return `

<category name="%{BKY_BLE_ROBOT_CATEGORY}" id="BLE_ROBOT_CATEGORY" colour="#3F51B5" secondaryColour="#303F9F">

  <block type="bt_connect"></block>

  <block type="bt_name">
    <value name="NAME">
      <shadow type="text">
        <field name="TEXT">MyCar</field>
      </shadow>
    </value>
  </block>

  <block type="motor_setup">
    <field name="MOTOR">M1</field>
    <field name="PIN1">23</field>
    <field name="PIN2">15</field>
  </block>

  <block type="set_speed">
    <value name="SPEED">
      <shadow type="math_number">
        <field name="NUM">200</field>
      </shadow>
    </value>
  </block>
  
  <block type="rc_car_command">
    <field name="ACTION">forward</field>
    <value name="CMD">
      <shadow type="text">
        <field name="TEXT">forward</field>
      </shadow>
    </value>
  </block>

  <block type="set_servo">
    <value name="ANGLE">
      <shadow type="math_number">
        <field name="NUM">90</field>
      </shadow>
    </value>
  </block>

</category>

`;
}

exports = addToolbox;
