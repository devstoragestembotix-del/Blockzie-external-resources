/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addToolbox() {
    return `
<category name="%{BKY_JOYSTICK_CATEGORY}" id="JOYSTICK_CATEGORY" colour="#00897B" secondaryColour="#80CBC4">

    <block type="ps2joystick_init" id="ps2joystick_init">
        <field name="JOY">1</field>
        <field name="AXIS">X</field>
    </block>

    <block type="ps2joystick_axisValue" id="ps2joystick_axisValue">
        <field name="JOY">1</field>
        <field name="AXIS">X</field>
        <field name="MODE">raw</field>
    </block>

    <block type="ps2joystick_direction" id="ps2joystick_direction">
        <field name="JOY">1</field>
    </block>

    <block type="ps2joystick_directionIs" id="ps2joystick_directionIs">
        <field name="JOY">1</field>
        <field name="DIR">UP</field>
    </block>

    <block type="ps2joystick_setDeadzone" id="ps2joystick_setDeadzone">
        <field name="JOY">1</field>
        <value name="DZ">
            <shadow type="math_whole_number">
                <field name="NUM">164</field>
            </shadow>
        </value>
    </block>

    <block type="ps2joystick_setThresholds" id="ps2joystick_setThresholds">
        <field name="JOY">1</field>
        <value name="LOW">
            <shadow type="math_whole_number">
                <field name="NUM">819</field>
            </shadow>
        </value>
        <value name="HIGH">
            <shadow type="math_whole_number">
                <field name="NUM">2730</field>
            </shadow>
        </value>
    </block>

    <block type="ps2joystick_angle" id="ps2joystick_angle">
        <field name="JOY">1</field>
    </block>

    <block type="ps2joystick_magnitude" id="ps2joystick_magnitude">
        <field name="JOY">1</field>
    </block>

    <sep gap="36"></sep>

    <block type="ps2joystick_continuousServo" id="ps2joystick_continuousServo">
        <value name="MIN">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="MAX">
            <shadow type="math_whole_number">
                <field name="NUM">180</field>
            </shadow>
        </value>
        <value name="DEADZONE">
            <shadow type="math_whole_number">
                <field name="NUM">40</field>
            </shadow>
        </value>
        <value name="SPEED">
            <shadow type="math_whole_number">
                <field name="NUM">2</field>
            </shadow>
        </value>
    </block>

    <block type="ps2joystick_holdToMove" id="ps2joystick_holdToMove">
        <field name="SERVO_PIN">2</field>
        <field name="ANALOG_PIN">A4</field>
        <field name="INVERT">0</field>
        <value name="LOW">
            <shadow type="math_whole_number">
                <field name="NUM">300</field>
            </shadow>
        </value>
        <value name="HIGH">
            <shadow type="math_whole_number">
                <field name="NUM">700</field>
            </shadow>
        </value>
        <value name="MIN">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="MAX">
            <shadow type="math_whole_number">
                <field name="NUM">180</field>
            </shadow>
        </value>
        <value name="STEP">
            <shadow type="math_whole_number">
                <field name="NUM">2</field>
            </shadow>
        </value>
    </block>

</category>`;
}

exports = addToolbox;
