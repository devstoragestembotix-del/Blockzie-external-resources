/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox() {
    return `
<category name="%{BKY_OTTO_CATEGORY}" id="OTTO_CATEGORY" colour="#FF6F00" secondaryColour="#FF4F00">
    <block type="otto_init" id="otto_init"></block>
    <block type="otto_read_distance" id="otto_read_distance"></block>
    <block type="otto_home" id="otto_home"></block>
     <block type="otto_walk">
        <value name="STEPS">
            <shadow type="math_whole_number">
                <field name="NUM">1</field>
            </shadow>
        </value>
        <value name="TIME">
            <shadow type="math_whole_number">
                <field name="NUM">1000</field>
            </shadow>
        </value>
        <field name="DIRECTION">1</field>
    </block>
    <block type="otto_moonwalker" id="otto_moonwalker">
        <value name="COUNT">
            <shadow type="math_whole_number">
                <field name="NUM">2</field>
            </shadow>
        </value>
        <value name="SPEED">
            <shadow type="math_whole_number">
                <field name="NUM">1000</field>
            </shadow>
        </value>
        <value name="HEIGHT">
            <shadow type="math_whole_number">
                <field name="NUM">25</field>
            </shadow>
        </value>
        <field name="DIRECTION">1</field>
    </block>
    <block type="otto_jump">
    <value name="STEPS"><shadow type="math_whole_number"><field name="NUM">1</field></shadow></value>
    <value name="TIME"><shadow type="math_whole_number"><field name="NUM">1000</field></shadow></value>
</block>

<block type="otto_turn">
    <value name="STEPS"><shadow type="math_whole_number"><field name="NUM">1</field></shadow></value>
    <value name="TIME"><shadow type="math_whole_number"><field name="NUM">1000</field></shadow></value>
    <field name="DIRECTION">1</field>
</block>

<block type="otto_shake_leg">
    <value name="STEPS"><shadow type="math_whole_number"><field name="NUM">1</field></shadow></value>
    <value name="TIME"><shadow type="math_whole_number"><field name="NUM">1000</field></shadow></value>
    <field name="DIRECTION">1</field>
</block>

  <block type="otto_move_command">
        <field name="COMMAND">F</field>
    </block>
    
</category>`;
}

module.exports = addToolbox;
