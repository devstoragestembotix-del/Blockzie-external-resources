function addToolbox () {
    // BT display name is board-aware at block init time; toolbox keeps a neutral default.
    // Spider Robot category hidden for now (rc_spider_board / connect / set_name / map).
    return `
<category name="%{BKY_RCAPPBT_CATEGORY}" id="RCAPPBT_CATEGORY" colour="#1565C0" secondaryColour="#0D47A1">
    <block type="rc_bt_init">
        <field name="RX">A3</field>
        <field name="TX">13</field>
        <field name="BAUD">9600</field>
        <field name="STATE">none</field>
        <field name="NAME">App</field>
    </block>
    <block type="rc_bt_when_received">
    </block>
    <block type="rc_bt_available"></block>
    <block type="rc_bt_read_cmd"></block>
    <block type="rc_bt_command"></block>
    <block type="rc_bt_command_is">
        <field name="CMD">u</field>
    </block>
    <sep gap="36"></sep>
    <block type="rc_bt_set_priority_ms">
        <value name="MS">
            <shadow type="math_number">
                <field name="NUM">300</field>
            </shadow>
        </value>
    </block>
    <block type="rc_bt_priority_active"></block>
    <block type="rc_bt_run_every">
        <value name="MS">
            <shadow type="math_number">
                <field name="NUM">20</field>
            </shadow>
        </value>
    </block>
</category>
`;
}

exports = addToolbox;
