/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addToolbox() {
    return `
<category name="%{BKY_ROTARYENCODER_CATEGORY}" id="ROTARYENCODER_CATEGORY" colour="#8E24AA" secondaryColour="#CE93D8">

    <block type="rotaryencoder_init" id="rotaryencoder_init">
    </block>

    <block type="rotaryencoder_getCount" id="rotaryencoder_getCount"></block>

    <block type="rotaryencoder_resetCount" id="rotaryencoder_resetCount"></block>

    <block type="rotaryencoder_direction" id="rotaryencoder_direction"></block>

    <block type="rotaryencoder_speed" id="rotaryencoder_speed"></block>

</category>`;
}

module.exports = addToolbox;
