function addMsg(Blockly) {

    Object.assign(Blockly.ScratchMsgs.locales.en, {

        BLE_ROBOT_CATEGORY: 'RC Car',
        BT_CONNECT: 'Bluetooth Connect',
        BT_NAME: 'Set Name %1',
        MOTOR_SETUP: 'Motor Setup %1 %2 %3',
        RC_CAR_COMMAND: 'RC Car Action %1 Command %2',
        SET_SPEED: 'Set Speed %1',
        SET_SERVO: 'Set Servo Angle %1',
        BLE_ROBOT_FULL: 'RC Car Servo Robot %1',
        BLE_ROBOT_FULL_1: 'RC Car Dozzer %1',
        BLE_ROBOT_FULL_2: 'RC Car Pen %1',
        BLE_ROBOT_FULL_3: 'RC Car Soccer %1',
        BLE_ROBOT_FULL_4: 'RC Car Gripper %1',

        

    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {

        BLE_ROBOT_CATEGORY: 'RC 车',
        BT_CONNECT: '蓝牙连接',
        BT_NAME: '设置名称 %1',
        MOTOR_SETUP: '电机设置 %1 %2 %3',
        RC_CAR_COMMAND: 'RC 车动作 %1 命令 %2',
        SET_SPEED: '设置速度 %1',
        SET_SERVO: '设置舵机角度 %1',
        BLE_ROBOT_FULL: 'RC 伺服机器人 %1',
        BLE_ROBOT_FULL_1: 'RC 推土机 %1',
        BLE_ROBOT_FULL_2: 'RC 画笔 %1',
        BLE_ROBOT_FULL_3: 'RC 足球 %1',
        BLE_ROBOT_FULL_4: 'RC 夹爪 %1',

    });

    return Blockly;
}

exports = addMsg;