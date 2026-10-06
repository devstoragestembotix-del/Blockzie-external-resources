function addBlocks(Blockly) {

    const color = '#3F51B5';
    const secondaryColour = '#303F9F';

    // =========================
    // 1. BLUETOOTH CONNECT
    // =========================
    Blockly.Blocks.bt_connect = {
        init: function () {
            this.jsonInit({
                message0: "Bluetooth Connect",
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ["shape_statement"]
            });
        }
    };

    // =========================
    // 2. SET NAME
    // =========================
    Blockly.Blocks.bt_name = {
        init: function () {
            this.jsonInit({
                message0: "Set Name %1",
                args0: [
                    {
                        type: "input_value",
                        name: "NAME"
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ["shape_statement"]
            });
        }
    };

    // =========================
    // 3. MOTOR SETUP (4 MOTOR)
    // =========================
    // Each motor has exactly 2 pins. Dropdown shows only those 2.
    // Change one pin -> other pin auto-swaps to the remaining one.
    const motorPinPairs = {
        M1: [['IO23', '23'], ['IO15', '15']],
        M2: [['IO27', '27'], ['IO19', '19']],
        M3: [['IO12', '12'], ['IO18', '18']],
        M4: [['IO13', '13'], ['IO2', '2']]
    };

    function getMotorPinOptions (motor) {
        return motorPinPairs[motor] || motorPinPairs.M1;
    }

    function getOtherMotorPin (motor, pin) {
        const opts = getMotorPinOptions(motor);
        const value = String(pin || '');
        const other = opts.find((entry) => String(entry[1]) !== value);
        return other ? String(other[1]) : String(opts[0][1]);
    }

    function applyMotorPinPair (block, preferredPin1) {
        if (!block || typeof block.getField !== 'function') {
            return;
        }
        const motor = block.getFieldValue('MOTOR') || 'M1';
        const opts = getMotorPinOptions(motor);
        const pin1Field = block.getField('PIN1');
        const pin2Field = block.getField('PIN2');
        if (!pin1Field || !pin2Field) {
            return;
        }

        const pin1 = preferredPin1 != null ?
            String(preferredPin1) :
            String(opts[0][1]);
        const pin2 = getOtherMotorPin(motor, pin1);

        // Refresh menu options first (motor change), then set values
        if (typeof pin1Field.getOptions === 'function') {
            pin1Field.getOptions(false);
        }
        if (typeof pin2Field.getOptions === 'function') {
            pin2Field.getOptions(false);
        }
        pin1Field.setValue(pin1);
        pin2Field.setValue(pin2);
    }

    function makeMotorPinValidator (otherFieldName) {
        return function (newValue) {
            const block = this.sourceBlock_;
            if (!block) {
                return newValue;
            }
            const motor = block.getFieldValue('MOTOR') || 'M1';
            const validPins = getMotorPinOptions(motor).map((entry) => String(entry[1]));
            let value = String(newValue || '');
            if (!validPins.includes(value)) {
                value = validPins[0];
            }
            const otherField = block.getField(otherFieldName);
            if (otherField) {
                otherField.setValue(getOtherMotorPin(motor, value));
            }
            return value;
        };
    }

Blockly.Blocks.motor_setup = {
    init: function () {
        const block = this;
        this.jsonInit({
            message0: "Motor Setup %1 %2 %3",
            args0: [
                {
                    type: "field_dropdown",
                    name: "MOTOR",
                    options: [
                        ["M1", "M1"],
                        ["M2", "M2"],
                        ["M3", "M3"],
                        ["M4", "M4"]
                    ]
                },
                {
                    type: "field_dropdown",
                    name: "PIN1",
                    options: function () {
                        const motor = (block.getFieldValue && block.getFieldValue('MOTOR')) || 'M1';
                        return getMotorPinOptions(motor);
                    }
                },
                {
                    type: "field_dropdown",
                    name: "PIN2",
                    options: function () {
                        const motor = (block.getFieldValue && block.getFieldValue('MOTOR')) || 'M1';
                        return getMotorPinOptions(motor);
                    }
                }
            ],
            colour: color,
            secondaryColour: secondaryColour,
            extensions: ["shape_statement"]
        });

        const motorField = this.getField('MOTOR');
        const pin1Field = this.getField('PIN1');
        const pin2Field = this.getField('PIN2');

        if (pin1Field) {
            pin1Field.setValidator(makeMotorPinValidator('PIN2'));
        }
        if (pin2Field) {
            pin2Field.setValidator(makeMotorPinValidator('PIN1'));
        }
        if (motorField) {
            motorField.setValidator(function (newValue) {
                const src = this.sourceBlock_;
                setTimeout(() => applyMotorPinPair(src), 0);
                return newValue;
            });
        }

        applyMotorPinPair(this);
    }
};

    // =========================
    // 4. RC CAR ACTION
    // =========================
    Blockly.Blocks.rc_car_command = {
        init: function () {
            this.jsonInit({
                message0: "RC Car Action %1 Command %2",
                args0: [
                    {
                        type: "field_dropdown",
                        name: "ACTION",
                        options: [
                            ["Move Forward", "forward"],
                            ["Move Backward", "backward"],
                            ["Steer Left", "left"],
                            ["Steer Right", "right"],
                            ["Rotate CW", "rotateCW"],
                            ["Rotate ACW", "rotateACW"],
                            ["Stop", "stop"],
                            ["Resume", "resume"]
                        ]
                    },
                    {
                        type: "input_value",
                        name: "CMD"
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ["shape_statement"]
            });
        }
    };

    // =========================
    // 5. SPEED CONTROL
    // =========================
Blockly.Blocks.set_speed = {
    init: function () {

        this.jsonInit({
            message0: "Set Speed %1",
            args0: [
                {
                    type: "input_value",
                    name: "SPEED"
                }
            ],
            colour: color,
            secondaryColour: secondaryColour,
            extensions: ["shape_statement"]
        });

    }
};

Blockly.Blocks.set_servo = {
    init: function () {
        this.jsonInit({
            message0: "Set Servo Pin %1 Angle %2",
            args0: [
                {
                    type: "field_dropdown",
                    name: "PIN",
                    options: [
                        ["5", "5"],
                        ["14", "14"],
                        ["32", "32"],
                        ["33", "33"]
                    ]
                },
                {
                    type: "input_value",
                    name: "ANGLE"
                }
            ],
            colour: color,
            secondaryColour: secondaryColour,
            extensions: ["shape_statement"]
        });
    }
};
    // Blockly.Blocks.ble_robot_full_1 = {
    //     init: function () {

    //         this.jsonInit({

    //             message0: "RC Car Dozzer %1",

    //             args0: [
    //                 {
    //                     type: "input_value",
    //                     name: "NAME"
    //                 }
    //             ],

    //             colour: color,
    //             secondaryColour: secondaryColour,
    //             extensions: ["shape_statement"]

    //         });

    //     }
    // };

    // Blockly.Blocks.ble_robot_full_2 = {
    //     init: function () {

    //         this.jsonInit({

    //             message0: "RC Car Pen %1",

    //             args0: [
    //                 {
    //                     type: "input_value",
    //                     name: "NAME"
    //                 }
    //             ],

    //             colour: color,
    //             secondaryColour: secondaryColour,
    //             extensions: ["shape_statement"]

    //         });

    //     }
    // };

    //  Blockly.Blocks.ble_robot_full_3 = {
    //     init: function () {

    //         this.jsonInit({

    //             message0: "RC Car Soccer %1",

    //             args0: [
    //                 {
    //                     type: "input_value",
    //                     name: "NAME"
    //                 }
    //             ],

    //             colour: color,
    //             secondaryColour: secondaryColour,
    //             extensions: ["shape_statement"]

    //         });

    //     }
    // };
    //  Blockly.Blocks.ble_robot_full_4 = {
    //     init: function () {

    //         this.jsonInit({

    //             message0: "RC Car Gripper %1",

    //             args0: [
    //                 {
    //                     type: "input_value",
    //                     name: "NAME"
    //                 }
    //             ],

    //             colour: color,
    //             secondaryColour: secondaryColour,
    //             extensions: ["shape_statement"]

    //         });

    //     }
    // };
    return Blockly;
}

exports = addBlocks;
