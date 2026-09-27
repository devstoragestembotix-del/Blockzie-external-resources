function addToolbox() {
    return `
<category name="%{BKY_ZAPPIE_WIFI_CATEGORY}" id="ZAPPIE_WIFI_CATEGORY" colour="#009688" secondaryColour="#00796B">
    <block type="zappie_wifi_connect">
        <value name="SSID">
            <shadow type="text">
                <field name="TEXT">STEMbotix 5G</field>
            </shadow>
        </value>
        <value name="PASSWORD">
            <shadow type="text">
                <field name="TEXT">shriji1234</field>
            </shadow>
        </value>
    </block>
</category>
`;
}

exports = addToolbox;
