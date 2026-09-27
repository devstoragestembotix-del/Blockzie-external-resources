function addToolbox() {
    return `
<category name="%{BKY_WIFI_CATEGORY}" id="WIFI_CATEGORY" colour="#009688" secondaryColour="#00796B">
    <block type="wifi_connect">
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
</category>
`;
}

exports = addToolbox;
