var gameMgr = cc.Class({
    extends: cc.Component,

    properties: {
        car:cc.Node,
        scoreLabel:cc.Label,
        startBtn:cc.Button,
        continueBtn:cc.Button,
        resetBtn:cc.Button,

        _isStart:false,
    },

    start () {
        this._carMgr = this.car.getComponent("car_mgr2");

        this.addClickEvent(this.startBtn, this.node, "gameMgr", "onStartBtn");
        this.addClickEvent(this.continueBtn, this.node, "gameMgr", "onContinueBtn");
        this.addClickEvent(this.resetBtn, this.node, "gameMgr", "onResetBtn");

        this.blockPos = cc.p(-1600, 0);
    },
    onStartBtn(){
        this._isStart = !this._isStart;
        cc.log("onStartBtn===", this._isStart);
    },
    onContinueBtn(){
        cc.log("onContinueBtn===");
        if (this._isStart) {
            return;
        }
        this.car.x = 0;
        this._carMgr.reset();
    },
    onResetBtn(){
        cc.log("onResetBtn===");
        if (this._isStart) {
            return;
        }
        this.scoreLabel.string = 0;
        this.car.x = 0;
        this.car.y = 0;
        this._carMgr.reset();
    },
    update (dt) {
        if(!this._isStart){
            return;
        }
        let pos = this.car.getPosition();
        //cc.log("pos =", pos);
        this._isStart = this.judge(pos);
        this.scoreLabel.string = Math.floor(pos.y/100);
    },
    judge(pos){
        // if (Math.abs(pos.x) > 270) {
        //     return false;
        // }
        let _vector = cc.v2(pos.x - this.blockPos.x, pos.y - this.blockPos.y);
        let _pLength = cc.pLength(_vector);
        cc.log("_pLength =", _pLength);
        if (_pLength < 1330 || _pLength > 1870) {
            return false
        }
        return true;
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
