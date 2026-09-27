/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_LCD_CATEGORY}" id="LCD_CATEGORY" colour="#BBBB00" secondaryColour="#888800">
    <block type="lcd_init" id="lcd_init">
        <field name="ADDR">0x27</field>
        <field name="COLS">16</field>
        <field name="ROWS">2</field>
    </block>
    <block type="lcd_setCursorPosition" id="lcd_setCursorPosition">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="lcd_print" id="lcd_print">
        <value name="DATA">
            <shadow type="text">
                <field name="TEXT">Hello Blockzie</field>
            </shadow>
        </value>
    </block>
    <block type="lcd_printNumber" id="lcd_printNumber">
        <value name="NUMBER">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="lcd_printCharCode" id="lcd_printCharCode">
        <value name="CODE">
            <shadow type="math_whole_number">
                <field name="NUM">223</field>
            </shadow>
        </value>
    </block>
    <block type="lcd_clear" id="lcd_clear">
    </block>
    <block type="lcd_setBackLight" id="lcd_setBackLight">
    </block>
    <block type="lcd_setCursorStyle" id="lcd_setCursorStyle">
    </block>
    <block type="lcd_scrollDisplay" id="lcd_scrollDisplay">
        <field name="DIR">left</field>
    </block>
</category>`;
}

exports = addToolbox;
