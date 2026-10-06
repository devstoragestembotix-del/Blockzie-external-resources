/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addToolbox () {
    return `
<category name="%{BKY_RGBLED_CATEGORY}" id="RGBLED_CATEGORY" colour="#00897B" secondaryColour="#4DB6AC">
    <block type="rgbled_init" id="rgbled_init">
        <field name="PORT">1</field>
        <field name="PIN">5</field>
    </block>
    <block type="rgbled_lightUpForSecs" id="rgbled_lightUpForSecs">
        <field name="PORT">1</field>
        <value name="COLOR">
            <shadow type="colour_picker"/>
        </value>
        <value name="SECS">
            <shadow type="math_whole_number">
                <field name="NUM">1</field>
            </shadow>
        </value>
    </block>
    <block type="rgbled_lightUp" id="rgbled_lightUp">
        <field name="PORT">1</field>
        <value name="COLOR">
            <shadow type="colour_picker"/>
        </value>
    </block>
    <block type="rgbled_setColor" id="rgbled_setColor">
        <field name="PORT">1</field>
        <value name="R">
            <shadow type="math_uint8_number">
                <field name="NUM">255</field>
            </shadow>
        </value>
        <value name="G">
            <shadow type="math_uint8_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="B">
            <shadow type="math_uint8_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="rgbled_lightOff" id="rgbled_lightOff">
        <field name="PORT">1</field>
    </block>
    <block type="rgbled_setChannel" id="rgbled_setChannel">
        <field name="PORT">1</field>
        <field name="CHANNEL">R</field>
        <value name="VALUE">
            <shadow type="math_uint8_number">
                <field name="NUM">255</field>
            </shadow>
        </value>
    </block>
    <block type="rgbled_changeChannel" id="rgbled_changeChannel">
        <field name="PORT">1</field>
        <field name="CHANNEL">R</field>
        <value name="DELTA">
            <shadow type="math_number">
                <field name="NUM">10</field>
            </shadow>
        </value>
    </block>
    <block type="rgbled_getChannel" id="rgbled_getChannel">
        <field name="PORT">1</field>
        <field name="CHANNEL">R</field>
    </block>
</category>`;
}

module.exports = addToolbox;
