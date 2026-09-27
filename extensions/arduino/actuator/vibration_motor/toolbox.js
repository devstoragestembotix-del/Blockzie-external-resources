/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addToolbox () {
    return `
<category name="%{BKY_VIBRATIONMOTOR_CATEGORY}" id="VIBRATIONMOTOR_CATEGORY" colour="#FF7043" secondaryColour="#F4511E" iconURI="">
    <block type="vibrationmotor_init" id="vibrationmotor_init">
        <field name="PIN">5</field>
    </block>
    <block type="vibrationmotor_on" id="vibrationmotor_on">
        <field name="PIN">5</field>
    </block>
    <block type="vibrationmotor_off" id="vibrationmotor_off">
        <field name="PIN">5</field>
    </block>
    <block type="vibrationmotor_setPower" id="vibrationmotor_setPower">
        <field name="PIN">5</field>
        <value name="POWER">
            <shadow type="math_whole_number">
                <field name="NUM">128</field>
            </shadow>
        </value>
    </block>
    <block type="vibrationmotor_vibrateMs" id="vibrationmotor_vibrateMs">
        <field name="PIN">5</field>
        <value name="MS">
            <shadow type="math_whole_number">
                <field name="NUM">200</field>
            </shadow>
        </value>
    </block>
</category>`;
}

module.exports = addToolbox;
