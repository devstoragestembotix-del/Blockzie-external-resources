/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addToolbox () {
    return `
<category name="%{BKY_WATERPUMP_CATEGORY}" id="WATERPUMP_CATEGORY" colour="#0288D1" secondaryColour="#0277BD" iconURI="">
    <block type="waterpump_init" id="waterpump_init">
        <field name="PIN">5</field>
    </block>
    <block type="waterpump_setState" id="waterpump_setState">
        <field name="PIN">5</field>
        <field name="STATE">ON</field>
    </block>
    <block type="waterpump_onForSecs" id="waterpump_onForSecs">
        <field name="PIN">5</field>
        <value name="SECS">
            <shadow type="math_whole_number">
                <field name="NUM">5</field>
            </shadow>
        </value>
    </block>
    <block type="waterpump_setSpeedPercent" id="waterpump_setSpeedPercent">
        <field name="PIN">5</field>
        <value name="PCT">
            <shadow type="math_whole_number">
                <field name="NUM">100</field>
            </shadow>
        </value>
    </block>
</category>`;
}

module.exports = addToolbox;
