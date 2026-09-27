/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_TCS34725_CATEGORY}" id="TCS34725_CATEGORY" colour="#00897B" secondaryColour="#00695C">
    <block type="tcs34725_connect" id="tcs34725_connect"></block>
    <block type="tcs34725_setLed" id="tcs34725_setLed">
        <field name="STATE">ON</field>
    </block>
    <block type="tcs34725_readRGB" id="tcs34725_readRGB"></block>
    <block type="tcs34725_color" id="tcs34725_color">
        <field name="CHANNEL">R</field>
    </block>
    <block type="tcs34725_colorTemp" id="tcs34725_colorTemp"></block>
    <block type="tcs34725_lux" id="tcs34725_lux"></block>
    <block type="tcs34725_isColour" id="tcs34725_isColour">
        <field name="COLOUR">RED</field>
    </block>
    <block type="tcs34725_getColourName" id="tcs34725_getColourName"></block>
</category>`;
}

exports = addToolbox;
