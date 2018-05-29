//游戏管理器
var gameMgr = cc.Class({
    extends: cc.Component,

    properties: {
        uIMgr:cc.Node,
        car:cc.Node,
        map:cc.Node,
        ready:cc.Node,

        scoreLabel:cc.Label,
        startBtn:cc.Button,
        continueBtn:cc.Button,
        resetBtn:cc.Button,

        _isStart:false,
        _readyTime:4,
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');
        this._carMgr = this.car.getComponent("carMgr");
        this._mapMgr = this.map.getComponent("mapMgr");
        this.addClickEvent(this.startBtn, this.node, "gameMgr", "onStartBtn");
        this.addClickEvent(this.continueBtn, this.node, "gameMgr", "onContinueBtn");
        this.addClickEvent(this.resetBtn, this.node, "gameMgr", "onResetBtn");

        this.readyTextureList = new Array;
        var self = this;
        cc.loader.loadResDir("texture/ready", cc.Texture2D, function (err, assets) {
            cc.log("assets=", assets);
            self.readyTextureList = assets;
            var go = self.readyTextureList.pop();
            self.readyTextureList.unshift(go);
         });
        this.readySpriteFrame = this.ready.getComponent(cc.Sprite).spriteFrame;

        this._readyTime = 4;
    },
    onStartBtn(){
        this._isStart = !this._isStart;
        //cc.log("onStartBtn===", this._isStart);
        //this._carMgr.resetStreak();
        
        // var realUrl = cc.url.raw("resources/texture/ready/UI_img_2.png");
        // var texture = cc.textureCache.addImage(realUrl);
        // this.ready.getComponent(cc.Sprite).spriteFrame.setTexture(texture);


        // var texture2D = this.readyTextureList[0];
        // this.ready.getComponent(cc.Sprite).spriteFrame.setTexture(texture2D);
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
        cc.log("onResetBtn===");
        this._carMgr.playBoom();
    },
    update (dt) {
        if(!this._isStart){
            return;
        }
        if (this._readyTime >= 0) {
            this._readyTime -= dt;
            var idx = Math.ceil(this._readyTime);
            cc.log("this._readyTime =", this._readyTime)
            cc.log(idx);
            var texture2D = this.readyTextureList[idx];
            this.readySpriteFrame.setTexture(texture2D);
        }
        else{
            this.ready.active = false;
        }
        this._isStart = this._mapMgr.isGameContinue(this.car);
        let score = this._mapMgr.getScore();
        this.scoreLabel.string = score;
        if(!this._isStart){
            this._carMgr.playBoom(); 
        }
    },
    carBoomEnd(){
        this.uIMgr.changeScene(2,  this._mapMgr.getScore());
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
