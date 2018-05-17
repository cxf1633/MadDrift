var car_mgr = cc.Class({
    extends: cc.Component,

    properties: {
        // 
        maxSpeed: {
            default: 200,
            tooltip: '最大速度'
        },
        minSpeed: {
            default: 100,
            tooltip: '最小速度'
        },
        addSpeedAcc: {
            default: 100,
            tooltip: '加速速率'
        },
        subSpeedAcc: {
            default: 100,
            tooltip: '减速速率'
        },
        rotationAcc:{
            default: 100,
            tooltip: '转向速率'
        },
        rotationMax: {
            default: 100,
            tooltip: '最大转向'
        },
        clickTime:{
            default: 10,
            tooltip: '点击时长'
        },
        arraySize: {
            default: 50,
            tooltip: '缓存大小'
        },

        //拖尾
        streak1: {
            default: null,
            type: cc.MotionStreak
        },
		streak2: {
            default: null,
            type: cc.MotionStreak
        },
        gameMgr: {
            default: null,
            type: cc.Component
        },
        _curSpeed:0,
        _touchDir: 0,
        _touchDuration:0,

        _curRotation:0, //当前转向

    },
    reset(){
        this._curSpeed = 0;
        this.node.rotation = 0;
        this._curRotation = 0;
        for (let index = 0; index < this.arraySize; index++) {
            this.rotationArray[index] = 0;
        }
    },
    update (dt) {
        if(!this.gameMgr._isStart){
            return;
        }

        if (this._touchDir != 0) {
            this._touchDuration = 0;
            this._touchDuration += dt;
            this._curRotation += this.rotationAcc * dt;
            if (this._curRotation > this.rotationMax) {
                this._curRotation = this.rotationMax;
            }
        }
        //this._curRotation = this.rotationMax;
        let rs = this._curRotation;
        if (this._touchDuration < this.clickTime) {
            rs =  rs /(2 -this._touchDuration);
        }
        let length = this.rotationArray.length;
        let rotation = this.rotationArray[length - 1]; 
        rotation = rotation + dt * this._touchDir * rs;
        //cc.log("push rotation ==>", rotation);
        this.rotationArray.push(rotation)

        this.node.rotation = rotation;

        if (this._touchDir == 0) {
            this._curSpeed += this.addSpeedAcc * dt;
            if (this._curSpeed > this.maxSpeed) {
                this._curSpeed = this.maxSpeed;
            }
        }
        else{
            this._curSpeed -= this.subSpeedAcc * dt;
            if (this._curSpeed < this.minSpeed) {
                this._curSpeed = this.minSpeed;
            }
        }
        let realSpeed = this._curSpeed;
        rotation = this.rotationArray.shift()
        //cc.log("pop rotation ==>", rotation);
        let angle = rotation / 180 * Math.PI;
        this.node.x += realSpeed * dt * Math.sin(angle);
        this.node.y += realSpeed * dt * Math.cos(angle);
        // cc.log("x=", this.node.x);
        // cc.log("y=", this.node.y);
        this._updataStreak();
    },
    _updataStreak(){
        //左前轮
        this.streak1.node.x = this.node.x - 16 * Math.cos(this.node.rotation / 180 * Math.PI)+ 18 * Math.sin(this.node.rotation / 180 * Math.PI);
        this.streak1.node.y = this.node.y + 18 * Math.cos(this.node.rotation / 180 * Math.PI)+ 16 * Math.sin(this.node.rotation / 180 * Math.PI);
        //右前轮
        this.streak2.node.x = this.node.x + 16 * Math.cos(this.node.rotation / 180 * Math.PI)+ 18 * Math.sin(this.node.rotation / 180 * Math.PI);
        this.streak2.node.y = this.node.y + 18 * Math.cos(this.node.rotation / 180 * Math.PI)- 16 * Math.sin(this.node.rotation / 180 * Math.PI);
        
        // //左后轮
        // this.streak3.node.x = this.node.x - 16 * Math.cos(this.node.rotation*3.14/180)- 30 * Math.sin(this.node.rotation*3.14/180);
        // this.streak3.node.y = this.node.y - 30 * Math.cos(this.node.rotation*3.14/180)+ 16 * Math.sin(this.node.rotation*3.14/180);
        // //右后轮
        // this.streak4.node.x = this.node.x + 16 * Math.cos(this.node.rotation*3.14/180)- 30 * Math.sin(this.node.rotation*3.14/180); 
        // this.streak4.node.y = this.node.y - 30 * Math.cos(this.node.rotation*3.14/180)- 16 * Math.sin(this.node.rotation*3.14/180);
    },
    _onTouchStart (event) {
        let touchStartPos = event.touch.getLocation();
        let width = cc.visibleRect.width;
        if (touchStartPos.x < width/2) {
            this._touchDir = -1;
        }
        else {
            this._touchDir = 1;
        }
    },

    _onTouchEnd (event) {
        this._touchDir = 0;
        this._touchDuration = 0;
        this._curRotation = 0;
    },
    onEnable () {
        let canvas = cc.find('Canvas')
        canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);

        let rotation = 0;
        this.rotationArray = new Array;
        for (let index = 0; index < this.arraySize; index++) {
            this.rotationArray.push(rotation);
        }
    },
    onDisable () {
        let canvas = cc.find('Canvas')
        canvas.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },
});
