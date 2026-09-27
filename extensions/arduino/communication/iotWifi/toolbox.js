function addToolbox() {
    return `
<category name="%{BKY_IOT_WIFI_CATEGORY}" id="IOT_WIFI_CATEGORY" colour="#1565C0" secondaryColour="#0D47A1">
    <label text="%{BKY_IOT_WIFI_CONNECTION_CATEGORY}"></label>
    <block type="iot_wifi_connect">
        <value name="SSID">
            <shadow type="text">
                <field name="TEXT">MyWiFi</field>
            </shadow>
        </value>
        <value name="PASSWORD">
            <shadow type="text">
                <field name="TEXT">password</field>
            </shadow>
        </value>
    </block>
    <block type="iot_server_connect">
        <field name="PROTOCOL">udp</field>
        <value name="HOST">
            <shadow type="text">
                <field name="TEXT">160.187.69.147</field>
            </shadow>
        </value>
        <value name="PORT">
            <shadow type="math_number">
                <field name="NUM">5020</field>
            </shadow>
        </value>
        <value name="TOKEN">
            <shadow type="text">
                <field name="TEXT">your_device_token</field>
            </shadow>
        </value>
        <value name="KIT">
            <shadow type="text">
                <field name="TEXT">AIIOT001</field>
            </shadow>
        </value>
    </block>
    <block type="iot_loop_step"></block>
    <block type="iot_is_connected"></block>
    <block type="iot_send_ping"></block>
    <label text="%{BKY_IOT_WIFI_DATA_CATEGORY}"></label>
    <block type="iot_add_field">
        <value name="NAME">
            <shadow type="text">
                <field name="TEXT">temperature</field>
            </shadow>
        </value>
        <value name="VALUE">
            <shadow type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="iot_clear_fields"></block>
    <block type="iot_send_sensor_packet"></block>
    <label text="%{BKY_IOT_WIFI_COMMAND_CATEGORY}"></label>
    <block type="iot_register_control">
        <value name="KEY">
            <shadow type="text">
                <field name="TEXT">LED1</field>
            </shadow>
        </value>
        <value name="PIN">
            <shadow type="math_number">
                <field name="NUM">5</field>
            </shadow>
        </value>
    </block>
    <block type="iot_handle_commands"></block>
</category>
`;
}

exports = addToolbox;
