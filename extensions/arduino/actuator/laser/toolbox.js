/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addToolbox () {
    return `
<category name="%{BKY_LASER_CATEGORY}" id="LASER_CATEGORY" colour="#C62828" secondaryColour="#EF5350">
    <block type="laser_init" id="laser_init">
        <field name="PORT">1</field>
        <field name="PIN">5</field>
    </block>
    <block type="laser_setState" id="laser_setState">
        <field name="PORT">1</field>
        <field name="STATE">ON</field>
    </block>
    <block type="laser_onForSecs" id="laser_onForSecs">
        <field name="PORT">1</field>
        <value name="SECS">
            <shadow type="math_whole_number">
                <field name="NUM">1</field>
            </shadow>
        </value>
    </block>
    <block type="laser_pulseMs" id="laser_pulseMs">
        <field name="PORT">1</field>
        <value name="MS">
            <shadow type="math_whole_number">
                <field name="NUM">200</field>
            </shadow>
        </value>
    </block>
    <block type="laser_blinkEvery" id="laser_blinkEvery">
        <field name="PORT">1</field>
        <value name="MS">
            <shadow type="math_whole_number">
                <field name="NUM">100</field>
            </shadow>
        </value>
    </block>
    <block type="laser_blinkTimes" id="laser_blinkTimes">
        <field name="PORT">1</field>
        <value name="TIMES">
            <shadow type="math_whole_number">
                <field name="NUM">5</field>
            </shadow>
        </value>
        <value name="MS">
            <shadow type="math_whole_number">
                <field name="NUM">200</field>
            </shadow>
        </value>
    </block>
    <block type="laser_sos" id="laser_sos">
        <field name="PORT">1</field>
    </block>
    <block type="laser_setPower" id="laser_setPower">
        <field name="PORT">1</field>
        <value name="POWER">
            <shadow type="math_whole_number">
                <field name="NUM">128</field>
            </shadow>
        </value>
    </block>
    <block type="laser_setBrightnessPercent" id="laser_setBrightnessPercent">
        <field name="PORT">1</field>
        <value name="PCT">
            <shadow type="math_whole_number">
                <field name="NUM">50</field>
            </shadow>
        </value>
    </block>
    <block type="laser_fade" id="laser_fade">
        <field name="PORT">1</field>
        <value name="FROM">
            <shadow type="math_uint8_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="TO">
            <shadow type="math_uint8_number">
                <field name="NUM">255</field>
            </shadow>
        </value>
        <value name="SECS">
            <shadow type="math_whole_number">
                <field name="NUM">3</field>
            </shadow>
        </value>
    </block>
    <block type="laser_isOn" id="laser_isOn">
        <field name="PORT">1</field>
    </block>
    <block type="laser_getPwm" id="laser_getPwm">
        <field name="PORT">1</field>
    </block>
</category>`;
}

module.exports = addToolbox;
