function addToolbox() {
    return `
<category name="%{BKY_NANO_BLE_CATEGORY}" id="NANO_BLE_CATEGORY" colour="#4CAF50" secondaryColour="#388E3C">
    <block type="nano_ble_connection">
        <value name="RX">
            <shadow type="math_number">
                <field name="NUM">10</field>
            </shadow>
        </value>
        <value name="TX">
            <shadow type="math_number">
                <field name="NUM">11</field>
            </shadow>
        </value>
        <value name="BAUD">
            <shadow type="math_number">
                <field name="NUM">9600</field>
            </shadow>
        </value>
    </block>
</category>
`;
}
exports = addToolbox;
