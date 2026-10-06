function addToolbox() {

    return `

<category name="%{BKY_ZIOTH_CATEGORY}" id="ZIOTH_CATEGORY" colour="#1565C0" secondaryColour="#0D47A1">

    <label text="%{BKY_ZIOTH_LABEL_CONNECT}"></label>

    <block type="zioth_wifi_connect">

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

    <block type="zioth_server_connect">

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

    <block type="zioth_loop_step"></block>

    <block type="zioth_is_connected"></block>

    <label text="%{BKY_ZIOTH_LABEL_DATA}"></label>

    <block type="zioth_add_field">

        <value name="NAME">

            <shadow type="text">

                <field name="TEXT">distance</field>

            </shadow>

        </value>

        <value name="VALUE">

            <shadow type="math_number">

                <field name="NUM">0</field>

            </shadow>

        </value>

    </block>

    <block type="zioth_clear_fields"></block>

    <block type="zioth_send_sensor"></block>

    <label text="%{BKY_ZIOTH_LABEL_CMD}"></label>

    <!-- Zappie's motors/matrix/buzzer/servos/IR/ultrasonic/battery/vibration
         use 25,26,27,32,4,19,12,14,35,34,16,17,21,22,36,39,33,15.
         GPIO2 and GPIO13 are free connectors. Example uses GPIO2 for DHT
         and GPIO13 for an external LED; use an unoccupied output pin. -->
    <block type="zioth_register_control">
        <value name="KEY">
            <shadow type="text">
                <field name="TEXT">LED</field>
            </shadow>
        </value>
        <value name="PIN">
            <shadow type="math_number">
                <field name="NUM">13</field>
            </shadow>
        </value>
    </block>

    <block type="zioth_handle_commands"></block>

</category>

`;

}



exports = addToolbox;
