/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_LCD_CATEGORY}" id="LCD_CATEGORY" colour="#BBBB00" secondaryColour="#888800">
   <block type="lcd_config" id="lcd_config">
        <field name="TYPE">I2C_PCF8574</field>
        <field name="ADDRESS">0x27</field>
    </block>
    <block type="lcd_config_standard" id="lcd_config_standard">
    <field name="LCD_INDEX">1</field>
    <field name="TYPE">STANDARD</field>
    <field name="RS">2</field>
    <field name="E">3</field>
    <field name="DB4">4</field>
    <field name="DB5">5</field>
    <field name="DB6">6</field>
    <field name="DB7">7</field>
</block>
    <block type="lcd_clear_screen" id="lcd_clear_screen"></block>
    <block type="lcd_backlight_control" id="lcd_backlight_control">
        <field name="STATE">on</field>
    </block>
    <block type="lcd_set_position" id="lcd_set_position">
        <value name="COLUMN">
            <shadow type="math_whole_number">
                <field name="NUM">2</field>
            </shadow>
        </value>
        <value name="ROW">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="lcd_print_text" id="lcd_print_text">
        <value name="TEXT">
            <shadow type="text">
                <field name="TEXT">Hello world!</field>
            </shadow>
        </value>
    </block>
    <block type="lcd_action_control" id="lcd_action_control">
        <field name="LCD_INDEX">1</field>
        <field name="ACTION">CLEAR</field>
    </block>
</category>`;
}

exports = addToolbox;
