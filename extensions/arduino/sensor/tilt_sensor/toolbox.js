/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addToolbox () {
    return `
<category name="%{BKY_TILTSENSOR_CATEGORY}" id="TILTSENSOR_CATEGORY" colour="#5E35B1" secondaryColour="#B39DDB">
    <block type="tiltsensor_init" id="tiltsensor_init">
    </block>
    <block type="tiltsensor_read" id="tiltsensor_read"></block>
    <block type="tiltsensor_readRaw" id="tiltsensor_readRaw"></block>
</category>`;
}

module.exports = addToolbox;
