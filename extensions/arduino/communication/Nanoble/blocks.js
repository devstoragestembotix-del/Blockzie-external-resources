function addBlocks(Blockly) {
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "nano_ble_connection",
            "message0": "%{BKY_NANO_BLE_CONNECTION}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "RX",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TX",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "BAUD",
                    "check": "Number"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#4CAF50",
            "tooltip": "",
            "helpUrl": ""
        }
    ]);

    return Blockly;
}

exports = addBlocks;
