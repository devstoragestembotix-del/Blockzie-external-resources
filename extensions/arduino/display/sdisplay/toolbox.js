// /* eslint-disable func-style */
// /* eslint-disable max-len */
// /* eslint-disable require-jsdoc */
// function addToolbox () {
//     return `
// <category name="%{BKY_SDISPLAY_CATEGORY}" id="SDISPLAY_CATEGORY" colour="#FF79BC" secondaryColour="#FF359A">
//     <block type="sdisplay_init" id="sdisplay_init">
//         <field name="DE">2</field>
//         <field name="CSN">3</field>
//         <field name="RST">3</field>
//         // <value name="RST">
//         //     <shadow type="math_uint8_number">
//         //         <field name="NUM">0</field>
//         //     </shadow>
//         // </value>
//     </block>
//     <block type="sdisplay_sendString" id="sdispaly_sendString">
//         <value name="DATA">
//             <shadow type="text">
//                 <field name="TEXT">Hello Blockzie</field>
//             </shadow>
//         </value>
//         <value name="ID">
//             <shadow type="math_uint8_number">
//                 <field name="NUM">0</field>
//             </shadow>
//         </value>
//     </block>
//     <block type="sdisplay_initDisplay" id="sdispaly_initDisplay">
//         <next>
//             <!-- Set Text Color Block -->
//             <block type="sdispaly_setTextColor" id="sdisplay_setTextColor">
//                 <field name="COLOR">ST77XX_WHITE</field>
//                 <next>
//                     <!-- Set Text Size Block -->
//                     <block type="sdisplay_setTextSize" id="sdisplay_setTextSize">
//                         <value name="SIZE">
//                             <shadow type="math_number">
//                                 <field name="NUM">2</field>
//                             </shadow>
//                         </value>
//                         <next>
//                             <!-- Set Cursor Position Block -->
//                             <block type="sdisplay_setCursor" id="sdisplay_setCursor">
//                                 <value name="X">
//                                     <shadow type="math_number">
//                                         <field name="NUM">20</field>
//                                     </shadow>
//                                 </value>
//                                 <value name="Y">
//                                     <shadow type="math_number">
//                                         <field name="NUM">50</field>
//                                     </shadow>
//                                 </value>
//                                 <next>
//                                     <!-- Print Message Block -->
//                                     <block type="sdisplay_printMessage" id="sdisplay_printMessage">
//                                         <value name="TEXT">
//                                             <shadow type="text">
//                                                 <field name="TEXT">"Hello World!"</field>
//                                             </shadow>
//                                         </value>
//                                     </block>
//                                 </next>
//                             </block>
//                         </next>
//                     </block>
//                 </next>
//             </block>
//         </next>
//     </block>
//     <block type="sdisplay_fillScreen" id="sdisplay_fillScreen">
//         <value name="COLOR">
//             <shadow type="math_number">
//                 <field name="NUM">0</field>
//             </shadow>
//         </value>
//     </block>
//      <block type="sdisplay_setRotation" id="sdisplay_setRotation">
//         <value name="ROTATION">
//             <shadow type="math_number">
//                 <field name="NUM">0</field>
//             </shadow>
//         </value>
//     </block>
//      <block type="sdisplay_clearDisplay" id="sdisplay_clearDisplay">
//      </block>
//    <block type="sdisplay_type" id="sdisplay_type">
//       <field name="TYPE"></field>
//       </block>
// </category>`;
// }

// exports = addToolbox;


/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_SDISPLAY_CATEGORY}" id="SDISPLAY_CATEGORY" colour="#FF79BC" secondaryColour="#FF359A">
    <block type="sdisplay_init" id="sdisplay_init">
        <field name="DE">8</field>
        <field name="CSN">10</field>
        <field name="RST">0</field>
    </block>
    
    <block type="sdisplay_sendString" id="sdisplay_sendString">
        <value name="DATA">
            <shadow type="text">
                <field name="TEXT">Hello Blockzie</field>
            </shadow>
        </value>
    </block>
    <block type="sdisplay_type" id="sdisplay_type">
        <field name="TYPE">INITR_GREENTAB</field>
    </block>
    
    <block type="sdisplay_setTextColor" id="sdisplay_setTextColor">
        <field name="COLOR">ST77XX_WHITE</field>
    </block>
    
    <block type="sdisplay_setTextSize" id="sdisplay_setTextSize">
        <value name="SIZE">
            <shadow type="math_number">
                <field name="NUM">2</field>
            </shadow>
        </value>
    </block>
    
    <block type="sdisplay_setCursor" id="sdisplay_setCursor">
        <value name="X">
            <shadow type="math_number">
                <field name="NUM">20</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_number">
                <field name="NUM">50</field>
            </shadow>
        </value>
    </block>
    
    <block type="sdisplay_fillScreen" id="sdisplay_fillScreen">
        <field name="COLOR">ST77XX_BLACK</field>
    </block>
    
    <block type="sdisplay_setRotation" id="sdisplay_setRotation">
        <field name="ROTATION">1</field>
    </block>
    
    <block type="sdisplay_clearDisplay" id="sdisplay_clearDisplay"></block>

<block type="sdisplay_showImage" id="sdisplay_showImage">
        <field name="IMAGE">image_ottobot</field>
        <value name="X">
            <shadow type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>

   <block type="sdisplay_showEmoji" id="sdisplay_showEmoji">
    <field name="EMOJI">image_smiley</field>
    <value name="X">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="Y">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    </block>

    <!-- Draw Line -->
    <block type="sdisplay_drawLine" id="sdisplay_drawLine">
    <value name="X1">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="Y1">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="X2">
        <shadow type="math_number">
        <field name="NUM">50</field>
        </shadow>
    </value>
    <value name="Y2">
        <shadow type="math_number">
        <field name="NUM">50</field>
        </shadow>
    </value>
    <value name="COLOR">
        <shadow type="colour_picker">
        <field name="COLOUR">#ff0000</field>
        </shadow>
    </value>
    </block>

    <!-- Rectangle -->
    <block type="sdisplay_rectangle">
    <field name="MODE">FILL</field>
    <value name="X">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="Y">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="W">
        <shadow type="math_number">
        <field name="NUM">50</field>
        </shadow>
    </value>
    <value name="H">
        <shadow type="math_number">
        <field name="NUM">30</field>
        </shadow>
    </value>
    <field name="COLOR">ST77XX_RED</field>
    </block>


    <!-- Round Rectangle -->
    <block type="sdisplay_roundrect">
    <field name="MODE">FILL</field>
    <value name="X">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="Y">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="W">
        <shadow type="math_number">
        <field name="NUM">60</field>
        </shadow>
    </value>
    <value name="H">
        <shadow type="math_number">
        <field name="NUM">40</field>
        </shadow>
    </value>
    <value name="R">
        <shadow type="math_number">
        <field name="NUM">5</field>
        </shadow>
    </value>
    </block>

    <!-- Circle -->
    <block type="sdisplay_circle">
    <field name="MODE">FILL</field>
    <value name="X">
        <shadow type="math_number">
        <field name="NUM">30</field>
        </shadow>
    </value>
    <value name="Y">
        <shadow type="math_number">
        <field name="NUM">30</field>
        </shadow>
    </value>
    <value name="R">
        <shadow type="math_number">
        <field name="NUM">15</field>
        </shadow>
    </value>
    </block>

    <!-- Ellipse -->
    <block type="sdisplay_ellipse">
    <field name="MODE">FILL</field>
    <value name="X">
        <shadow type="math_number">
        <field name="NUM">40</field>
        </shadow>
    </value>
    <value name="Y">
        <shadow type="math_number">
        <field name="NUM">40</field>
        </shadow>
    </value>
    <value name="XL">
        <shadow type="math_number">
        <field name="NUM">20</field>
        </shadow>
    </value>
    <value name="YL">
        <shadow type="math_number">
        <field name="NUM">10</field>
        </shadow>
    </value>
    </block>

    <!-- Triangle -->
    <block type="sdisplay_triangle" id="sdisplay_triangle">
    <field name="MODE">FILL</field>
    <value name="X1">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="Y1">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="X2">
        <shadow type="math_number">
        <field name="NUM">40</field>
        </shadow>
    </value>
    <value name="Y2">
        <shadow type="math_number">
        <field name="NUM">0</field>
        </shadow>
    </value>
    <value name="X3">
        <shadow type="math_number">
        <field name="NUM">20</field>
        </shadow>
    </value>
    <value name="Y3">
        <shadow type="math_number">
        <field name="NUM">30</field>
        </shadow>
    </value>
    </block>

</category>`;
}

exports = addToolbox;

