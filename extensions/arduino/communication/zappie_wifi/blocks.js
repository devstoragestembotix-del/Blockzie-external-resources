function addBlocks(Blockly) {
    const color = '#009688';
    const secondaryColour = '#00796B';

    Blockly.Blocks.zappie_wifi_connect = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ZAPPIE_WIFI_CONNECT ||
                    Blockly.Msg.WIFI_CONNECT ||
                    'connect to WiFi SSID %1 password %2',
                args0: [
                    { type: 'input_value', name: 'SSID' },
                    { type: 'input_value', name: 'PASSWORD' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;
