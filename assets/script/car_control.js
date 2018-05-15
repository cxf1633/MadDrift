// function lerp (from, to, t) {
//     return from + (to - from) * t;
// }

// function lerpV2 (from, to, t, out) {
//     out.x = lerp(from.x, to.x, t);
//     out.y = lerp(from.y, to.y, t);
// }

var car_control = cc.Class({
    extends: cc.Component,

    properties: {
        // 
        maxSpeed: {
            default: 1500,
            tooltip: '最大速度'
        },
        // 
        driveForce: {
            default: 1500,
            tooltip: '前向加速度'
        },
        intiaRatio: {
            default: 0.01,
            tooltip: '速度方向的惯性'
        },
        // 
        rotationAcceleration: {
            default: 360,
            tooltip: '旋转加速度'
        },
        // 
        maxRotationSpeed: {
            default: 720,
            tooltip: '最大旋转速度'
        },
        maxRotation: {
            default: 720,
            tooltip: '最大旋转角度'
        },
        // 
        lateralFrictionRatio: {
            default: 0.1,
            tooltip: '横向摩擦系数,值越小，滑动越远'
        },
        // 
        initialRotationRatio: {
            default: 0.33,
            tooltip: '初始化旋转角度系数，在按下左右键的时候会用这个 （系数 * 最大角度）来作为初始叠加旋转角度'
        },
        subRatio: {
            default: 1,
            tooltip: '减速的加速度'
        },
        subRatioMax: {
            default: 1,
            tooltip: '减速的加速度'
        },
        minSpeed: {
            default: 2,
            tooltip: '最小速度'
        },
        _rotation: 0,
        _rotationSpeed: 0,

        _driveForce:0,
        _force: cc.v2(),
        _linearSpeed: cc.v2(),
        _maxSpeed:0,
        _maxRotation:0,
        _wheelX:10,
        _wheelY:30,
        //拖尾
        streak1: {
            default: null,
            type: cc.MotionStreak
        },
        streak2: {
            default: null,
            type: cc.MotionStreak
        },
        streak3: {
            default: null,
            type: cc.MotionStreak
        },
        streak4: {
            default: null,
            type: cc.MotionStreak
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
        _leftTouched: false,
        _rightTouched: false,

        _isStart:false,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onEnable () {
        let canvas = cc.find('Canvas')
        canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

        this.addClickEvent(this.startBtn, this.node, "car_control", "onBtnClick");
        this.addClickEvent(this.testBtn, this.node, "car_control", "onBtnClick1");

        this._maxRotation = this.maxRotationSpeed;
    },

    onDisable () {
        let canvas = cc.find('Canvas')
        canvas.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        canvas.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
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
        if (this._leftTouched) {
            this._rotationSpeed -= this.rotationAcceleration * dt;
        }
        else if (this._rightTouched) {
            this._rotationSpeed += this.rotationAcceleration * dt;
        }
        else {
            this._rotationSpeed = 0;
            this._maxSpeed = this.maxSpeed;
            this._maxRotation = this.maxRotationSpeed;
            this._driveForce = this.driveForce;
        }

        if (Math.abs(this._rotationSpeed) > this._maxRotation) {
            this._rotationSpeed = this._rotationSpeed > 0 ? this._maxRotation : -this._maxRotation;
        }

        this._rotation += this._rotationSpeed * dt;
        // if (Math.abs(this._rotation) > this.maxRotation) {
        //     this._rotation = this._rotation > 0 ? this.maxRotation : -this.maxRotation;
        // }
        this.node.rotation = this._rotation;
        let angle = this._rotation / 180 * Math.PI;
        //向前力的方向
        let forwardNormal = cc.v2(Math.sin(angle), Math.cos(angle));
        //cc.log("forwardNormal=", forwardNormal);
        
        //离心力方向
        let lateralNormal = cc.v2(0, 0);
        if (this._rotationSpeed > 0) {

            lateralNormal = cc.v2(-forwardNormal.y, forwardNormal.x);
        }
        else if(this._rotationSpeed < 0){
            lateralNormal = cc.v2(forwardNormal.y, -forwardNormal.x);
        }
        cc.log("lateralNormal=", lateralNormal);

        //线段速度的单位向量
        // let speedForwardNormal = this._linearSpeed.normalize()
        // //mul 分量相乘 mag勾股定理算向量的长度 intiaRatio速度惯性
        // this._linearSpeed.addSelf(speedForwardNormal.mul(this._linearSpeed.mag() * this.intiaRatio))
        
        //cc.log("this._linearSpeed1 =", this._linearSpeed);
        //计算向前的力 driveForce 向前的加速度
        //if (Math.abs(this._rotationSpeed) == 0) {
            this._force.addSelf(forwardNormal.mul(this.driveForce));
            let forwardF = this._force.mul(dt);
            this._linearSpeed.addSelf(forwardF);

            // if (this._linearSpeed.mag() < 400) {
            //     this._linearSpeed.normalizeSelf().mulSelf(400);
            // }

            //cc.log("forwardF =", forwardF);
        //}
        // else{
        //     this._driveForce -= dt;
        //     this._force.addSelf(forwardNormal.mul(this._driveForce));
        //     let forwardF = this._force.mul(dt);

        //     this._linearSpeed.addSelf(forwardF);
        //     cc.log("forwardF =", forwardF);
        // }
  
        //计算横向摩擦 dot点乘
        //算出侧滑的力
        let lateral_1 = lateralNormal.dot(this._linearSpeed);
        //乘以侧滑率
        let lateral_2 = lateral_1 * this.lateralFrictionRatio
        //算出最后的侧滑的力
        let lateralF = lateralNormal.mul(lateral_2);
        //cc.log("lateralF =", lateralF);
        //和当前速度相加
        this._linearSpeed.addSelf(lateralF);

        //cc.log("this._maxSpeed =", this._maxSpeed);
        //不超过最大速度
        // if (Math.abs(this._rotationSpeed) > 0) {
        //     if (this._linearSpeed.mag() > this._maxSpeed*2) {
        //         this._linearSpeed.normalizeSelf().mulSelf(this._maxSpeed*2);
        //     }
        // }
        // else{
            if (this._linearSpeed.mag() > this._maxSpeed) {
                this._linearSpeed.normalizeSelf().mulSelf(this._maxSpeed);
            }
        //}
     
        //cc.log("this._linearSpeed3 =", this._linearSpeed);
        this.node.x += (this._linearSpeed.x) * dt;
        this.node.y += (this._linearSpeed.y) * dt;

        // clear force
        this._force.x = this._force.y = 0;

        this._updataStreak();
    },
    _updataStreak(){
        this.streak1.node.x = this.node.x;// + this._wheelX;
        this.streak1.node.y = this.node.y;// + this._wheelY;
        
        // this.streak2.node.x = this.node.x - this._wheelX;
        // this.streak2.node.y = this.node.y + this._wheelY;

        // this.streak3.node.x = this.node.x + this._wheelX;
        // this.streak3.node.y = this.node.y - this._wheelY;

        // this.streak4.node.x = this.node.x - this._wheelX;
        // this.streak4.node.y = this.node.y - this._wheelY;
    },
    _onTouchStart (event) {
        let touchStartPos = event.touch.getLocation();
        let width = cc.visibleRect.width;
        if (touchStartPos.x < width/2) {
            this._leftTouched = true;
            this._rightTouched = false;
        }
        else {
            this._leftTouched = false;
            this._rightTouched = true;
        }
    },

    _onTouchEnd (event) {
        let touchStartPos = event.touch.getLocation();
        let width = cc.visibleRect.width;
        if (touchStartPos.x < width/2) {
            this._leftTouched = false;
            this._rightTouched = false;
        }
        else {
            this._leftTouched = false;
            this._rightTouched = false;
        }
    },

    _onKeyDown (event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                if (!this._leftTouched) {
                    this._rotationSpeed = -this.maxRotationSpeed * this.initialRotationRatio;
                }
                this._leftTouched = true;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                if (!this._rightTouched) {
                    this._rotationSpeed = this.maxRotationSpeed * this.initialRotationRatio;
                }
                this._rightTouched = true;
                break;
        }
    },

    _onKeyUp (event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                this._leftTouched = false;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                this._rightTouched = false;
                break;
        }
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
