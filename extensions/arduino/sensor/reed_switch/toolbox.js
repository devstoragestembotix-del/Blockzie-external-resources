/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addToolbox() {
    return `
<category name="%{BKY_REEDSWITCH_CATEGORY}" id="REEDSWITCH_CATEGORY" colour="#E53935" secondaryColour="#EF9A9A">

    <block type="reedswitch_init" id="reedswitch_init">
    </block>

    <block type="reedswitch_read" id="reedswitch_read"></block>

    <block type="reedswitch_readRaw" id="reedswitch_readRaw"></block>

</category>`;
}

module.exports = addToolbox;
