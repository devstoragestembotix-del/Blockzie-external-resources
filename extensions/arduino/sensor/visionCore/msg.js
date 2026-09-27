/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        VISIONCORE_CATEGORY: 'Vision Core',
        VISIONCORE_INIT: 'Vision Core init',
        VISIONCORE_STOP: 'Vision Core stop motors',
        VISIONCORE_DATA_AVAILABLE: 'Vision Core data available?',
        VISIONCORE_READ_STEERING: 'read steering value from Vision Core',
        VISIONCORE_STEER_FOLLOW: 'steer car using %1 for %2',
        VISIONCORE_SIGNAL_TIMEOUT: 'stop if no camera signal',
        VISIONCORE_IS_CENTERED: 'steering value %1 is centered for %2',
        VISIONCORE_UPDATE_OBJECT: 'update object from Vision Core',
        VISIONCORE_OBJECT_DETECTED: 'object detected?',
        VISIONCORE_OBJECT_NAME: 'detected object name',
        VISIONCORE_OBJECT_IS: 'object is %1?',
        VISIONCORE_OBJECT_DISTANCE: 'object distance from center',
        VISIONCORE_STEER_OBJECT: 'steer car toward object using %1',
        VISIONCORE_DRIVE_STRAIGHT: 'drive car straight forward',
        VISIONCORE_OBJECT_LOST: 'go straight if object lost',
        VISIONCORE_READ_QR: 'read QR command',
        VISIONCORE_MOVE_QR: 'move car by QR command %1',
        VISIONCORE_MOTOR_TEST: 'test Vision Core motors',
        VISIONCORE_MOVE_MANUAL: 'move car %1 at speed %2',
        VISIONCORE_MODE_LINE: 'line',
        VISIONCORE_MODE_COLOR: 'color',
        VISIONCORE_DIR_FORWARD: 'forward',
        VISIONCORE_DIR_BACKWARD: 'backward',
        VISIONCORE_DIR_LEFT: 'left',
        VISIONCORE_DIR_RIGHT: 'right'
    });
    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        VISIONCORE_CATEGORY: 'Vision Core 视觉',
        VISIONCORE_INIT: 'Vision Core 初始化',
        VISIONCORE_STOP: 'Vision Core 停止电机',
        VISIONCORE_DATA_AVAILABLE: 'Vision Core 有数据?',
        VISIONCORE_READ_STEERING: '读取 Vision Core 转向值',
        VISIONCORE_STEER_FOLLOW: '用 %1 转向跟随 %2',
        VISIONCORE_SIGNAL_TIMEOUT: '无摄像头信号则停止',
        VISIONCORE_IS_CENTERED: '转向值 %1 对 %2 已居中',
        VISIONCORE_UPDATE_OBJECT: '从 Vision Core 更新物体',
        VISIONCORE_OBJECT_DETECTED: '检测到物体?',
        VISIONCORE_OBJECT_NAME: '物体名称',
        VISIONCORE_OBJECT_IS: '物体是 %1?',
        VISIONCORE_OBJECT_DISTANCE: '物体距中心偏移',
        VISIONCORE_STEER_OBJECT: '朝物体转向 使用 %1',
        VISIONCORE_DRIVE_STRAIGHT: '直行前进',
        VISIONCORE_OBJECT_LOST: '物体丢失则直行',
        VISIONCORE_READ_QR: '读取 QR 指令',
        VISIONCORE_MOVE_QR: '按 QR 指令 %1 移动小车',
        VISIONCORE_MOTOR_TEST: '测试 Vision Core 电机',
        VISIONCORE_MOVE_MANUAL: '小车 %1 速度 %2',
        VISIONCORE_MODE_LINE: '巡线',
        VISIONCORE_MODE_COLOR: '颜色',
        VISIONCORE_DIR_FORWARD: '前进',
        VISIONCORE_DIR_BACKWARD: '后退',
        VISIONCORE_DIR_LEFT: '左转',
        VISIONCORE_DIR_RIGHT: '右转'
    });
    return Blockly;
}

exports = addMsg;
