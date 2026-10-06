/* eslint-disable func-style */
/* eslint-disable require-jsdoc */

function addToolbox () {
    return `
<category name="%{BKY_VOLTAGESENSOR_CATEGORY}" id="VOLTAGESENSOR_CATEGORY" colour="#2E7D32" secondaryColour="#A5D6A7">
    <block type="voltagesensor_init" id="voltagesensor_init"></block>
    <block type="voltagesensor_readVout" id="voltagesensor_readVout"></block>
    <block type="voltagesensor_readRaw" id="voltagesensor_readRaw"></block>
</category>`;
}

module.exports = addToolbox;
