function addToolbox() {
    return `
<category name="%{BKY_BT_CATEGORY}" id="BT_CATEGORY" colour="#3F51B5" secondaryColour="#303F9F">
    <!-- BLE -->
    <block type="ble_connection">
        <value name="NAME">
            <shadow type="text">
                <field name="TEXT">ESP32_BLE</field>
            </shadow>
        </value>
    </block>
    <block type="bt_classic_connection">
        <value name="NAME">
            <shadow type="text">
                <field name="TEXT">MyESP32</field>
            </shadow>
        </value>
    </block>
    <block type="bt_available"></block>
    <block type="bt_read"></block>
    <block type="bt_send">
        <value name="TEXT">
            <shadow type="text">
                <field name="TEXT">Hello World</field>
            </shadow>
        </value>
    </block>

    <!-- Serial -->
    <block type="serial_set_baud">
        <field name="SERIAL">0</field>
        <field name="BAUD">115200</field>
    </block>
    <block type="serial_available">
        <field name="SERIAL">0</field>
    </block>
    <block type="serial_read_bytes">
        <field name="SERIAL">0</field>
    </block>
    <block type="serial_read_number">
        <field name="SERIAL">0</field>
    </block>
    <block type="serial_read_string">
        <field name="SERIAL">0</field>
    </block>
    <block type="serial_write">
        <value name="TEXT">
            <shadow type="text">
                <field name="TEXT">Hello Serial</field>
            </shadow>
        </value>
        <field name="SERIAL">0</field>
    </block>
</category>
`;
}

exports = addToolbox;
