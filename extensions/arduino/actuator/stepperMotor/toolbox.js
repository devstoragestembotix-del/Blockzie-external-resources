/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addToolbox () {
    return `
<category name="%{BKY_STEPPER_CATEGORY}" id="STEPPER_CATEGORY" colour="#0096FF" secondaryColour="#4DB8FF">
    <block type="stepper_init">
        <value name="STEPS">
            <shadow type="math_number">
                <field name="NUM">800</field>
            </shadow>
        </value>
    </block>

    <block type="stepper_rotate">
        <value name="SPEED">
            <shadow type="math_number">
                <field name="NUM">2000</field>
            </shadow>
        </value>
        <value name="STEPS">
            <shadow type="math_number">
                <field name="NUM">800</field>
            </shadow>
        </value>
    </block>
</category>`;
}
exports = addToolbox;
