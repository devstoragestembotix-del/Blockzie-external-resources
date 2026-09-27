function addBlocks(Blockly) {
    const color = '#3F51B5';
    const secondaryColour = '#303F9F';

    Blockly.Blocks.ble_connection = {
        init: function () {
            this.jsonInit({
                message0: 'Initialize BLE with name %1',
                args0: [
                    { type: 'input_value', name: 'NAME' }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };
    // ---------------- Bluetooth Blocks ----------------
    Blockly.Blocks.bt_classic_connection = {
        init: function () {
            this.jsonInit({
                message0: 'configure BT Classic with name %1',
                args0: [{ type: 'input_value', name: 'NAME' }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.bt_available = {
        init: function () {
            this.jsonInit({
                message0: 'is data available on Bluetooth?',
                output: 'Boolean',
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_boolean']
            });
        }
    };

    Blockly.Blocks.bt_read = {
        init: function () {
            this.jsonInit({
                message0: 'read bytes from Bluetooth',
                output: 'String',
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.bt_send = {
        init: function () {
            this.jsonInit({
                message0: 'send %1 on Bluetooth',
                args0: [{ type: 'input_value', name: 'TEXT' }],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // ---------------- Serial Blocks ----------------
    Blockly.Blocks.serial_set_baud = {
        init: function () {
            this.jsonInit({
                message0: 'set serial %1 baud rate to %2',
                args0: [
                    { type: 'field_number', name: 'SERIAL', value: 0, min: 0, max: 2 },
                    { type: 'field_number', name: 'BAUD', value: 115200, min: 300, max: 1000000 }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.serial_available = {
        init: function () {
            this.jsonInit({
                message0: 'bytes available on serial %1',
                args0: [{ type: 'field_number', name: 'SERIAL', value: 0, min: 0, max: 2 }],
                output: 'Number',
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.serial_read_bytes = {
        init: function () {
            this.jsonInit({
                message0: 'read bytes on serial %1',
                args0: [{ type: 'field_number', name: 'SERIAL', value: 0, min: 0, max: 2 }],
                output: 'String',
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.serial_read_number = {
        init: function () {
            this.jsonInit({
                message0: 'get a number from serial %1',
                args0: [{ type: 'field_number', name: 'SERIAL', value: 0, min: 0, max: 2 }],
                output: 'Number',
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    Blockly.Blocks.serial_read_string = {
        init: function () {
            this.jsonInit({
                message0: 'read bytes as a string from serial %1',
                args0: [{ type: 'field_number', name: 'SERIAL', value: 0, min: 0, max: 2 }],
                output: 'String',
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    Blockly.Blocks.serial_write = {
        init: function () {
            this.jsonInit({
                message0: 'write %1 on serial %2',
                args0: [
                    { type: 'input_value', name: 'TEXT' },
                    { type: 'field_number', name: 'SERIAL', value: 0, min: 0, max: 2 }
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
