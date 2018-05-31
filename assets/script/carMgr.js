var carMgr = cc.Class({
    extends: cc.Component,

    properties: {
        gameMgr: {
            default: null,
            type: cc.Component
        },
        camera: {
            default: null,
            type: cc.Node
        },
        //拖尾
        leftStreak: {
            default: null,
            type: cc.MotionStreak
        },
		rightStreak: {
            default: null,
            type: cc.MotionStreak
        },
        maxSpeed: {
            default: 200,
            tooltip: '最大速度'
        },
        minSpeed: {
            default: 100,
            tooltip: '最小速度'
        },
        startSpeed: {
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
        //不同赛道最大速度会改变
        _curMaxSpeed:0,
        _curSpeed:0,
        _touchDir: 0,
        _touchDuration:0,
        _curRotation:0, //当前转向
        _animation:null,//爆炸动画
    },
    onEnable () {
        let canvas = cc.find('Canvas')
        canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

        this.carViewNode = this.node.getChildByName("view");
        this.boomNode = this.node.getChildByName("boom");
        this._animation = this.boomNode.getComponent(cc.Animation);
        this._animation.on('finished',  this.onFinished,    this);

        this.leftStreak.node.zIndex = 1;
        this.rightStreak.node.zIndex = 1;
        this.node.zIndex = 1;
        let rotation = 0;
        this.rotationArray = new Array;
        for (let index = 0; index < this.arraySize; index++) {
            this.rotationArray.push(rotation);
        }
        this._curMaxSpeed = this.maxSpeed;
        this._curSpeed = this.startSpeed;
        this._cameraMgr =  this.camera.getComponent("cameraMgr");
    },
    setMaxSpeed(maxSpeed){
        if (maxSpeed != null) {
            this._curMaxSpeed = maxSpeed;
        }
    },
    playBoom(){
        this.carViewNode.active = false;
        this.boomNode.active = true;
        let clip = "boom";
        var animState = this._animation.play(clip);
    },
    onFinished(){
        this.gameMgr.carBoomEnd();
        this.boomNode.active = false;
        this.carViewNode.active = true;
    },
    resetStreak(){
        this.leftStreak.reset();
        this.rightStreak.reset();
    },
    reset(pos, rota){
        this.node.setPosition(pos);
        this._curSpeed = this.startSpeed;
        this._touchDir = 0;
        this._touchDuration = 0;
        this._curRotation = 0;
        this.node.rotation = rota;
        for (let index = 0; index < this.arraySize; index++) {
            this.rotationArray[index] = rota;
        }
        this._cameraMgr.normalUpdate();
    },
    normalUpdate(dt){
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
        let rs = this._curRotation;
        if (this._touchDuration < this.clickTime) {
            rs =  rs /(2 -this._touchDuration);
        }
        let length = this.rotationArray.length;
        let rotation = this.rotationArray[length - 1]; 
        rotation = rotation + dt * this._touchDir * rs;
        this.rotationArray.push(rotation)
        this.node.rotation = rotation;
        if (this._touchDir == 0) {
            this._curSpeed += this.addSpeedAcc * dt;
            if (this._curSpeed > this._curMaxSpeed) {
                this._curSpeed = this._curMaxSpeed;
            }
        }
        else{
            if (this._curSpeed > this.minSpeed){
                if((this._curSpeed - this.subSpeedAcc * dt ) < this.minSpeed) {
                    this._curSpeed = this.minSpeed;
                }
                else{
                    this._curSpeed -= this.subSpeedAcc * dt;
                }
            }
        }
        let realSpeed = this._curSpeed;
        //cc.log("realSpeed =", realSpeed);
        rotation = this.rotationArray.shift()
        let angle = rotation / 180 * Math.PI;
        this.node.x += realSpeed * dt * Math.sin(angle);
        this.node.y += realSpeed * dt * Math.cos(angle);
        // cc.log("x=", this.node.x);
        // cc.log("y=", this.node.y);
        this._updataStreak();
        this._cameraMgr.normalUpdate();
    },
    _updataStreak(){
        //左前轮
        this.leftStreak.node.x = this.node.x - 16 * Math.cos(this.node.rotation / 180 * Math.PI) + 18 * Math.sin(this.node.rotation / 180 * Math.PI);
        this.leftStreak.node.y = this.node.y + 18 * Math.cos(this.node.rotation / 180 * Math.PI) + 16 * Math.sin(this.node.rotation / 180 * Math.PI);
        //右前轮
        this.rightStreak.node.x = this.node.x + 16 * Math.cos(this.node.rotation / 180 * Math.PI) + 18 * Math.sin(this.node.rotation / 180 * Math.PI);
        this.rightStreak.node.y = this.node.y + 18 * Math.cos(this.node.rotation / 180 * Math.PI) - 16 * Math.sin(this.node.rotation / 180 * Math.PI);
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
    _onKeyDown (event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                    this._touchDir = -1;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                    this._touchDir = 1;
                break;
            case cc.KEY.space:
                this.gameMgr.onStartBtn();
                break;
            case cc.KEY.c:
                this.gameMgr.onContinueBtn();
                break;
        }
    },
    _onKeyUp (event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
        this._touchDir = 0;
        this._touchDuration = 0;
        this._curRotation = 0;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
        this._touchDir = 0;
        this._touchDuration = 0;
        this._curRotation = 0;
                break;
        }
    },
    onDisable () {
        let canvas = cc.find('Canvas')
        canvas.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

        this._animation.off('finished',  this.onFinished,    this);
    },
});
