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

        <field name="PROTOCOL">https</field>

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

    <!-- Zappie's motors/matrix/buzzer/servos/IR/ultrasonic already use pins
         25,26,27,4,19,12,14,35,34,16,17,21,22,36,39,15 — do NOT reuse those
         here. Pins 2 and 13 are free connector pins safe for a dashboard
         command like a spare LED or relay. -->
    <block type="zioth_register_control">
        <value name="KEY">
            <shadow type="text">
                <field name="TEXT">LED</field>
            </shadow>
        </value>
        <value name="PIN">
            <shadow type="math_number">
                <field name="NUM">2</field>
            </shadow>
        </value>
    </block>

    <block type="zioth_handle_commands"></block>

</category>

`;

}



exports = addToolbox;
