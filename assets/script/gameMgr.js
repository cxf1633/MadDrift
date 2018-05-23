//游戏管理器
var gameMgr = cc.Class({
    extends: cc.Component,

    properties: {
        car:cc.Node,
        map:cc.Node,

        scoreLabel:cc.Label,
        startBtn:cc.Button,
        continueBtn:cc.Button,
        resetBtn:cc.Button,

        _isStart:false,
    },

    start () {
        this._carMgr = this.car.getComponent("carMgr");
        this._mapMgr = this.map.getComponent("mapMgr");
        this.addClickEvent(this.startBtn, this.node, "gameMgr", "onStartBtn");
        this.addClickEvent(this.continueBtn, this.node, "gameMgr", "onContinueBtn");
        this.addClickEvent(this.resetBtn, this.node, "gameMgr", "onResetBtn");
    },
    onStartBtn(){
        this._isStart = !this._isStart;
        //cc.log("onStartBtn===", this._isStart);
    },
    onContinueBtn(){
        //cc.log("onContinueBtn===");
        if (this._isStart) {
            return;
        }
        let resetInfo = this._mapMgr.getContinuePos();
        this._carMgr.reset(resetInfo);
    },
    onResetBtn(){
        //cc.log("onResetBtn===");
        // if (this._isStart) {
        //     return;
        // }
    },
    update (dt) {
        if(!this._isStart){
            return;
        }
        let pos = this.car.getPosition();
        //cc.log("pos =", pos);
        this._isStart = this._mapMgr.isGameContinue(pos);
        let score = this._mapMgr.getScore();
        this.scoreLabel.string = score;
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
