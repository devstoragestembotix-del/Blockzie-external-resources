/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addToolbox() {
    return `
<category name="%{BKY_CURRENTSENSOR_CATEGORY}" id="CURRENTSENSOR_CATEGORY" colour="#F57F17" secondaryColour="#FFE082">
    <block type="currentsensor_init" id="currentsensor_init">
        <field name="MODEL">0.185</field>
    </block>
    <block type="currentsensor_readAmps" id="currentsensor_readAmps"></block>
    <block type="currentsensor_readMilliAmps" id="currentsensor_readMilliAmps"></block>
    <block type="currentsensor_readRaw" id="currentsensor_readRaw"></block>
</category>`;
}

module.exports = addToolbox;
