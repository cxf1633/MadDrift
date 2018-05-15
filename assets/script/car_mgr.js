var car_mgr = cc.Class({
    extends: cc.Component,

    properties: {
        // 
        maxSpeed: {
            default: 200,
            tooltip: '最大速度'
        },
        // 
        driveForce: {
            default: 200,
            tooltip: '前向加速度'
        },
        // 
        rotationAcc: {
            default: 10,
            tooltip: '轮胎转向加速度'
        },
        maxRotation: {
            default: 35,
            tooltip: '轮胎最大角度'
        },
        //按钮
        startBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '开始按钮'
        },
        testBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '测试按钮'
        },
        //拖尾
        streak1: {
            default: null,
            type: cc.MotionStreak
        },

        _touchDir: 0,
        _touchDuration:0,

        _curRotation:0, //当前转向
        _carRotation:0,

        _forwardForce: cc.v2(),
        _carSpeed: cc.v2(),
        _isStart:false,
    },
    onBtnClick(){
        cc.log("onBtnClick===");
        this._isStart = !this._isStart;
    },
    onBtnClick1(){
        cc.log("onBtnClick2===");
        this._rotation += 90;
        this.node.rotation = this._rotation;
    },
    update (dt) {
        if(!this._isStart){
            return;
        }
        if (this._touchDir !=0) {
            this._curRotation += this._touchDir * this.rotationAcc * dt;
        }
        if (Math.abs(this._curRotation) > this.maxRotation) {
            this._curRotation = this._curRotation > 0 ? this.maxRotation : -this.maxRotation;
        }
        cc.log("this._curRotation =", this._curRotation);
        // if (this._touchDir != 0) {
        //     this._touchDuration += dt;
        // }
        // this._carRotation = this.node.rotation;
        // let angle = this._carRotation / 180 * Math.PI;
        // //向前力的方向
        // let forwardNormal = cc.v2(Math.sin(angle), Math.cos(angle));
        // this._forwardForce.addSelf(forwardNormal.mul(this.driveForce));
        // let forwardF = this._forwardForce.mul(dt);
        // this._carSpeed.addSelf(forwardF);

        // let rs = Math.PI;
        // if(this._touchDuration > 1){
        //     rs = Math.PI;
        // }
        // else{
        //     rs = rs / (2 - this._touchDuration);
        // }

        let length = this.angleArray.length;
        let angle = this.angleArray[length - 1]; 
        angle = angle + this._curRotation;
        cc.log("push angle ==>", angle);
        this.angleArray.push(angle)


        angle = this.angleArray.pop()
        cc.log("pop angle ==>", angle);
        //let angle = this._rotation / 180 * Math.PI;

        // let rotation = angle / Math.PI * 180;
        // cc.log("rotation =", rotation);
        this.node.rotation += angle*dt;//rotation * dt;

        let angle1 = angle / 180 * Math.PI;
        let realSpeed = this.maxSpeed;
        this.node.x += realSpeed * dt * Math.sin(angle1)
        this.node.y += realSpeed * dt * Math.cos(angle1)

        // cc.log("x =", this.node.x);
        // cc.log("y =", this.node.y);
        
        // this.node.x += (this._carSpeed.x) * dt;
        // this.node.y += (this._carSpeed.y) * dt;
        // clear force
        //this._forwardForce.x = this._forwardForce.y = 0;
        this._updataStreak();
    },
    _updataStreak(){
        this.streak1.node.x = this.node.x;// + this._wheelX;
        this.streak1.node.y = this.node.y;// + this._wheelY;
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
        //this._curRotation = 0;
        this._touchDuration = 0;
    },
    onEnable () {
        let canvas = cc.find('Canvas')
        canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);

        this.addClickEvent(this.startBtn, this.node, "car_mgr", "onBtnClick");
        this.addClickEvent(this.testBtn, this.node, "car_mgr", "onBtnClick1");

        let angle = 0;
        this.angleArray = new Array;
        for (let index = 0; index < 50; index++) {
            this.angleArray.push(angle);
        }
    },
    onDisable () {
        let canvas = cc.find('Canvas')
        canvas.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },
    addClickEvent: function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
});
