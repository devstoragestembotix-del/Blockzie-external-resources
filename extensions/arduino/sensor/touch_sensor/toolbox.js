/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addToolbox () {
    return `
<category name="%{BKY_TOUCHSENSOR_CATEGORY}" id="TOUCHSENSOR_CATEGORY" colour="#00897B" secondaryColour="#80CBC4">
    <block type="touchsensor_init" id="touchsensor_init">
        <field name="PIN">4</field>
    </block>
    <block type="touchsensor_read" id="touchsensor_read"></block>
    <block type="touchsensor_readRaw" id="touchsensor_readRaw"></block>
</category>`;
}

module.exports = addToolbox;
