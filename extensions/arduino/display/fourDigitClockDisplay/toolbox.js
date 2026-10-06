/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_FOURDIGITCLOCKDISPLAY_CATEGORY}" id="FOURDIGITCLOCKDISPLAY_CATEGORY" colour="#FF7F50" secondaryColour="#FF6347">
    <block type="fourDigitClockDisplay_init" id="fourDigitClockDisplay_init">
    </block>
    <block type="fourDigitClockDisplay_displayNumber" id="fourDigitClockDisplay_displayNumber">
        <value name="DATA">
            <shadow type="math_integer">
                <field name="NUM">1024</field>
            </shadow>
        </value>
    </block>
    <block type="fourDigitClockDisplay_displayNumberEx" id="fourDigitClockDisplay_displayNumberEx">
        <field name="LEN">4</field>
        <field name="POS">0</field>
        <field name="LZ">false</field>
        <value name="DATA">
            <shadow type="math_integer">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="fourDigitClockDisplay_displayNumberDots" id="fourDigitClockDisplay_displayNumberDots">
        <field name="LEN">4</field>
        <field name="POS">0</field>
        <field name="DOTS">0b00000000</field>
        <field name="LZ">false</field>
        <value name="DATA">
            <shadow type="math_integer">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="fourDigitClockDisplay_setSegments" id="fourDigitClockDisplay_setSegments">
        <field name="SEGS">SEG_A|SEG_B|SEG_F|SEG_G, SEG_A|SEG_D|SEG_E|SEG_F</field>
        <field name="LEN">2</field>
        <field name="POS">2</field>
    </block>
    <block type="fourDigitClockDisplay_displayString" id="fourDigitClockDisplay_displayString">
        <value name="DATA">
            <shadow type="text">
                <field name="TEXT">Open</field>
            </shadow>
        </value>
    </block>
    <block type="fourDigitClockDisplay_display" id="fourDigitClockDisplay_display">
        <value name="DATA">
            <shadow type="math_integer">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="fourDigitClockDisplay_clear" id="fourDigitClockDisplay_clear">
    </block>
    <block type="fourDigitClockDisplay_setBrightness" id="fourDigitClockDisplay_setBrightness">
        <value name="BRT">
            <shadow type="fourDigitClockDisplay_brightnessNumber">
                <field name="NUM">2</field>
            </shadow>
        </value>
    </block>
    <block type="fourDigitClockDisplay_setPoint" id="fourDigitClockDisplay_setPoint">
    </block>
</category>`;
}

exports = addToolbox;
