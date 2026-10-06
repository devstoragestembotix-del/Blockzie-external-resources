function addToolbox () {
    return `
<category name="%{BKY_SMOOTHSERVO_CATEGORY}" id="SMOOTHSERVO_CATEGORY" colour="#FF6F00" secondaryColour="#E65100">
    <block type="smooth_servo_attach">
    </block>
    <block type="smooth_servo_write">
        <value name="ANGLE">
            <shadow type="math_number">
                <field name="NUM">90</field>
            </shadow>
        </value>
    </block>
    <block type="smooth_servo_move">
        <value name="ANGLE">
            <shadow type="math_number">
                <field name="NUM">90</field>
            </shadow>
        </value>
        <value name="INTERVAL">
            <shadow type="math_number">
                <field name="NUM">15</field>
            </shadow>
        </value>
    </block>
</category>
`;
}

exports = addToolbox;
