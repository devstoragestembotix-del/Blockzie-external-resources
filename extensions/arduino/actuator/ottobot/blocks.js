// /* eslint-disable func-style */
// /* eslint-disable max-len */
// /* eslint-disable require-jsdoc */
// function addBlocks(Blockly) {
//     const color = '#FF6F00';
//     const secondaryColour = '#FF4F00';

//     Blockly.Blocks.otto_home = {
//         init: function () {
//             this.jsonInit({
//                 message0: "Otto go home position",
//                 args0: [],
//                 colour: color,
//                 secondaryColour: secondaryColour,
//                 extensions: ['shape_statement']
//             });
//         }
//     };

//     Blockly.Blocks.otto_walk = {
//         init: function () {
//             this.jsonInit({
//                 message0: "Humanoid Robot walk steps %1 time %2 direction %3",
//                 args0: [
//                     {
//                         type: 'input_value',
//                         name: 'STEPS'
//                     },
//                     {
//                         type: 'input_value',
//                         name: 'TIME'
//                     },
//                     {
//                         type: 'field_dropdown',
//                         name: 'DIRECTION',
//                         options: [
//                             ['Forward', '1'],
//                             ['Backward', '-1']
//                         ]
//                     }
//                 ],
//                 colour: color,
//                 secondaryColour: secondaryColour,
//                 extensions: ['shape_statement']
//             });
//         }
//     };
    
//     Blockly.Blocks.otto_moonwalker = {
//         init: function () {
//             this.jsonInit({
//                 message0: "Humanoid Robot moonwalker %1 count %2 speed %3 height %4 direction %5",
//                 args0: [
//                     {
//                         type: 'input_dummy'
//                     },
//                     {
//                         type: 'input_value',
//                         name: 'COUNT'
//                     },
//                     {
//                         type: 'input_value',
//                         name: 'SPEED'
//                     },
//                     {
//                         type: 'input_value',
//                         name: 'HEIGHT'
//                     },
//                     {
//                         type: 'field_dropdown',
//                         name: 'DIRECTION',
//                         options: [
//                             ['Left', '1'],
//                             ['Right', '-1']
//                         ]
//                     }
//                 ],
//                 colour: '#FF6F00',
//                 secondaryColour: '#FF4F00',
//                 extensions: ['shape_statement']
//             });
//         }
//     };
    
//     // Otto Jump block
// Blockly.Blocks.otto_jump = {
//     init: function () {
//         this.jsonInit({
//             message0: "Humanoid Robot jump steps %1 time %2",
//             args0: [
//                 {
//                     type: 'input_value',
//                     name: 'STEPS'
//                 },
//                 {
//                     type: 'input_value',
//                     name: 'TIME'
//                 }
//             ],
//             colour: color,
//             secondaryColour: secondaryColour,
//             extensions: ['shape_statement']
//         });
//     }
// };

// // Otto Turn block
// Blockly.Blocks.otto_turn = {
//     init: function () {
//         this.jsonInit({
//             message0: "Otto turn steps %1 time %2 direction %3",
//             args0: [
//                 {
//                     type: 'input_value',
//                     name: 'STEPS'
//                 },
//                 {
//                     type: 'input_value',
//                     name: 'TIME'
//                 },
//                 {
//                     type: 'field_dropdown',
//                     name: 'DIRECTION',
//                     options: [['Left', '1'], ['Right', '-1']]
//                 }
//             ],
//             colour: color,
//             secondaryColour: secondaryColour,
//             extensions: ['shape_statement']
//         });
//     }
// };


// // Otto ShakeLeg block
// Blockly.Blocks.otto_shake_leg = {
//     init: function () {
//         this.jsonInit({
//             message0: "Otto shake leg steps %1 time %2 direction %3",
//             args0: [
//                 {
//                     type: 'input_value',
//                     name: 'STEPS'
//                 },
//                 {
//                     type: 'input_value',
//                     name: 'TIME'
//                 },
//                 {
//                     type: 'field_dropdown',
//                     name: 'DIRECTION',
//                     options: [['Left', '1'], ['Right', '-1']]
//                 }
//             ],
//             colour: color,
//             secondaryColour: secondaryColour,
//             extensions: ['shape_statement']
//         });
//     }
// };


//     return Blockly;
// }

// exports = addBlocks;


/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks(Blockly) {
    const color = '#FF6F00';
    const secondaryColour = '#FF4F00';

    Blockly.Blocks.otto_init = {
        init: function () {
            this.jsonInit({
                message0: 'Humanoid Robot init (servos + ultrasonic + serial)',
                args0: [],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.otto_read_distance = {
        init: function () {
            this.jsonInit({
                message0: 'Humanoid Robot ultrasonic distance (cm)',
                args0: [],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    // Otto Go Home block
    Blockly.Blocks.otto_home = {
        init: function () {
            this.jsonInit({
                message0: "Humanoid Robot go home position",
                args0: [],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // Otto Walk block
    Blockly.Blocks.otto_walk = {
        init: function () {
            this.jsonInit({
                message0: "Humanoid Robot walk steps %1 time %2 direction %3",
                args0: [
                    {
                        type: 'input_value',
                        name: 'STEPS'
                    },
                    {
                        type: 'input_value',
                        name: 'TIME'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DIRECTION',
                        options: [
                            ['Forward', '1'],
                            ['Backward', '-1']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    //otto left hand
    

    // Otto Moonwalker block
    Blockly.Blocks.otto_moonwalker = {
        init: function () {
            this.jsonInit({
                message0: "Humanoid Robot moonwalker %1 count %2 speed %3 height %4 direction %5",
                args0: [
                    {
                        type: 'input_dummy'
                    },
                    {
                        type: 'input_value',
                        name: 'COUNT'
                    },
                    {
                        type: 'input_value',
                        name: 'SPEED'
                    },
                    {
                        type: 'input_value',
                        name: 'HEIGHT'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DIRECTION',
                        options: [
                            ['Left', '1'],
                            ['Right', '-1']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // Otto Jump block
    Blockly.Blocks.otto_jump = {
        init: function () {
            this.jsonInit({
                message0: "Humanoid Robot jump steps %1 time %2",
                args0: [
                    {
                        type: 'input_value',
                        name: 'STEPS'
                    },
                    {
                        type: 'input_value',
                        name: 'TIME'
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // Otto Turn block
    Blockly.Blocks.otto_turn = {
        init: function () {
            this.jsonInit({
                message0: "Humanoid Robot turn steps %1 time %2 direction %3",
                args0: [
                    {
                        type: 'input_value',
                        name: 'STEPS'
                    },
                    {
                        type: 'input_value',
                        name: 'TIME'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DIRECTION',
                        options: [['Left', '1'], ['Right', '-1']]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // Otto Shake Leg block
    Blockly.Blocks.otto_shake_leg = {
        init: function () {
            this.jsonInit({
                message0: "Humanoid Robot shake leg steps %1 time %2 direction %3",
                args0: [
                    {
                        type: 'input_value',
                        name: 'STEPS'
                    },
                    {
                        type: 'input_value',
                        name: 'TIME'
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DIRECTION',
                        options: [['Left', '1'], ['Right', '-1']]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // New: Otto BLE Command Block
    Blockly.Blocks.otto_move_command = {
        init: function () {
            this.jsonInit({
                message0: "Humanoid Robot move %1",
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'COMMAND',
                        options: [
                            ['Forward', 'F'],
                            ['Backward', 'B'],
                            ['Left', 'L'],
                            ['Right', 'R'],
                            ['Stop', 'S'],
                            ['Test Servos', 'T']
                        ]
                    }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

module.exports = addBlocks;
