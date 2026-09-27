/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addToolbox() {
    return `
<category name="%{BKY_LEDMATRIX_CATEGORY}" id="LEDMATRIX_CATEGORY" colour="#FF8C00" secondaryColour="#FFB733">

    <block type="ledmatrix_init">
        <value name="NUM_LEDS">
            <shadow type="math_number">
                <field name="NUM">35</field>
            </shadow>
        </value>
        <value name="BRIGHTNESS">
            <shadow type="math_number">
                <field name="NUM">50</field>
            </shadow>
        </value>
    </block>

    <block type="ledmatrix_showDigit">
        <value name="DIGIT">
            <shadow type="math_number">
                <field name="NUM">5</field>
            </shadow>
        </value>
    </block>

    <block type="ledmatrix_showChar">
        <value name="CHAR">
            <shadow type="text">
                <field name="TEXT">A</field>
            </shadow>
        </value>
    </block>

    <block type="ledmatrix_showSymbol">
        <value name="SYMBOL">
            <shadow type="text">
                <field name="TEXT">♥</field>
            </shadow>
        </value>
    </block>

    <block type="ledmatrix_draw_custom"></block>
</category>`;
}

exports = addToolbox;