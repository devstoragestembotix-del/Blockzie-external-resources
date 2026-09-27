function addToolbox() {

    return `

<category name="%{BKY_IOT_HUB_CATEGORY}" id="IOT_HUB_CATEGORY" colour="#1565C0" secondaryColour="#0D47A1">

    <label text="%{BKY_IOT_HUB_LABEL_CONNECT}"></label>

    <block type="ioth_wifi_connect">

        <value name="SSID">

            <shadow type="text">

                <field name="TEXT">MyWiFi</field>

            </shadow>

        </value>

        <value name="PASSWORD">

            <shadow type="text">

                <field name="TEXT">password123</field>

            </shadow>

        </value>

    </block>

    <block type="ioth_server_connect">

        <field name="PROTOCOL">http</field>

        <value name="HOST">

            <shadow type="text">

                <field name="TEXT">160.187.69.147</field>

            </shadow>

        </value>

        <value name="PORT">

            <shadow type="math_number">

                <field name="NUM">5000</field>

            </shadow>

        </value>

        <value name="TOKEN">

            <shadow type="text">

                <field name="TEXT">your_device_token</field>

            </shadow>

        </value>

        <value name="KIT">

            <shadow type="text">

                <field name="TEXT">AIIOT025</field>

            </shadow>

        </value>

    </block>

    <block type="ioth_loop_step"></block>

    <block type="ioth_is_connected"></block>

    <label text="%{BKY_IOT_HUB_LABEL_DATA}"></label>

    <block type="ioth_add_field">

        <value name="NAME">

            <shadow type="text">

                <field name="TEXT">temp</field>

            </shadow>

        </value>

        <value name="VALUE">

            <shadow type="math_number">

                <field name="NUM">0</field>

            </shadow>

        </value>

    </block>

    <block type="ioth_clear_fields"></block>

    <block type="ioth_send_sensor"></block>

    <label text="%{BKY_IOT_HUB_LABEL_CMD}"></label>

    <block type="ioth_register_control">
        <value name="KEY">
            <shadow type="text">
                <field name="TEXT">LED</field>
            </shadow>
        </value>
        <value name="PIN">
            <shadow type="math_number">
                <field name="NUM">25</field>
            </shadow>
        </value>
    </block>

    <block type="ioth_handle_commands"></block>

</category>

`;

}



exports = addToolbox;
