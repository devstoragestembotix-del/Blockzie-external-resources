/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_OLED_CATEGORY}" id="OLED_CATEGORY" colour="#0078D7" secondaryColour="#005A9E">
    <block type="oled_init" id="oled_init">
        <value name="W">
            <shadow type="math_whole_number">
                <field name="NUM">128</field>
            </shadow>
        </value>
        <value name="H">
            <shadow type="math_whole_number">
                <field name="NUM">64</field>
            </shadow>
        </value>
        <field name="POWER">SSD1306_SWITCHCAPVCC</field>
    </block>
    <block type="oled_drawPixel" id="oled_drawPixel">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">64</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">32</field>
            </shadow>
        </value>
    </block>
    <block type="oled_drawLine" id="oled_drawLine">
        <value name="X0">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y0">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="X1">
            <shadow type="math_whole_number">
                <field name="NUM">32</field>
            </shadow>
        </value>
        <value name="Y1">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
    </block>
    <block type="oled_drawRect" id="oled_drawRect">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="W">
            <shadow type="math_whole_number">
                <field name="NUM">32</field>
            </shadow>
        </value>
        <value name="H">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
    </block>
    <block type="oled_fillRect" id="oled_fillRect">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="W">
            <shadow type="math_whole_number">
                <field name="NUM">32</field>
            </shadow>
        </value>
        <value name="H">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
    </block>
    <block type="oled_drawCircle" id="oled_drawCircle">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="R">
            <shadow type="math_whole_number">
                <field name="NUM">8</field>
            </shadow>
        </value>
    </block>
    <block type="oled_fillCircle" id="oled_fillCircle">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="R">
            <shadow type="math_whole_number">
                <field name="NUM">8</field>
            </shadow>
        </value>
    </block>
    <block type="oled_drawRoundRect" id="oled_drawRoundRect">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="W">
            <shadow type="math_whole_number">
                <field name="NUM">32</field>
            </shadow>
        </value>
        <value name="H">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="R">
            <shadow type="math_whole_number">
                <field name="NUM">4</field>
            </shadow>
        </value>
    </block>
    <block type="oled_fillRoundRect" id="oled_fillRoundRect">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="W">
            <shadow type="math_whole_number">
                <field name="NUM">32</field>
            </shadow>
        </value>
        <value name="H">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="R">
            <shadow type="math_whole_number">
                <field name="NUM">4</field>
            </shadow>
        </value>
    </block>
    <block type="oled_drawTriangle" id="oled_drawTriangle">
        <value name="X0">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y0">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="X1">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="Y1">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="X2">
            <shadow type="math_whole_number">
                <field name="NUM">8</field>
            </shadow>
        </value>
        <value name="Y2">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
    </block>
    <block type="oled_fillTriangle" id="oled_fillTriangle">
        <value name="X0">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y0">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="X1">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
        <value name="Y1">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="X2">
            <shadow type="math_whole_number">
                <field name="NUM">8</field>
            </shadow>
        </value>
        <value name="Y2">
            <shadow type="math_whole_number">
                <field name="NUM">16</field>
            </shadow>
        </value>
    </block>
    <block type="oled_setText" id="oled_setText">
        <field name="COLOUR">SSD1306_WHITE</field>
        <field name="BGCOLOR">SSD1306_BLACK</field>
    </block>
    <block type="oled_setTextSize" id="oled_setTextSize">
        <value name="SIZE">
            <shadow type="math_whole_number">
                <field name="NUM">1</field>
            </shadow>
        </value>
    </block>
    <block type="oled_setFont" id="oled_setFont">
        <field name="FONT">FreeSerif9pt7b</field>
    </block>
    <block type="oled_setCursor" id="oled_setCursor">
        <value name="X">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow type="math_whole_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>
    <block type="oled_print" id="oled_print">
        <field name="COLOUR">SSD1306_WHITE</field>
        <field name="BGCOLOR">SSD1306_BLACK</field>
        <value name="DATA">
            <shadow type="text">
                <field name="TEXT">Hello Blockzie</field>
            </shadow>
        </value>
    </block>
    <block type="oled_clear" id="oled_clear">
    </block>
    <block type="oled_refresh" id="oled_refresh">
    </block>
    <block type="oled_setInvert" id="oled_setInvert">
        <field name="STATE">true</field>
    </block>
    <block type="oled_startScroll" id="oled_startScroll">
    </block>
    <block type="oled_stopScroll" id="oled_stopScroll">
    </block>
</category>`;
}

exports = addToolbox;
