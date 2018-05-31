//游戏管理器
var gameMgr = cc.Class({
    extends: cc.Component,

    properties: {
        uIMgr:cc.Node,
        car:cc.Node,
        map:cc.Node,
        ready:cc.Node,

        guide:cc.Node,
        guideLeft:cc.Node,
        guideRight:cc.Node,
        guideTitle:cc.Label,

        scoreLabel:cc.Label,
        startBtn:cc.Button,
        startBtnSprite:cc.Sprite,
        continueBtn:cc.Button,
        resetBtn:cc.Button,

        _isStart:false,
        _isReady:false,
        _readyTime:4,

        _isGuide:false,
        _guideTime:6,
        _tempGuide:false,
        _ADCount:1,//广告次数
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');
        this._carMgr = this.car.getComponent("carMgr");
        this._mapMgr = this.map.getComponent("mapMgr");

        this.addClickEvent(this.startBtn, this.node, "gameMgr", "onStartBtn");
        this.addClickEvent(this.continueBtn, this.node, "gameMgr", "onContinueBtn");
        this.addClickEvent(this.resetBtn, this.node, "gameMgr", "onResetBtn");

        //新手引导
        // cc.sys.localStorage.removeItem("isOped")
        if(window.wx != undefined) {
            var _tempData = window.wx.getStorageSync("isOped");
            if(_tempData !== 1) {
                this._guideTime = 6;
                this.guide.active = true;
                this._isGuide = true;
                this._tempGuide = true;
            }
            else {
                this.loadReady();
            }
        }
        else {
            this.loadReady();
        }
    },

    loadReady() {
        this.ready.active = true;
        this.readyTextureList = new Array;
        var self = this;
        cc.loader.loadRes("texture/gameUI/gameUI", cc.SpriteAtlas, function (err, atlas) {
            self.gameUIAtlas = atlas;
            self._isReady = true;
        });
        this.readySpriteFrame = this.ready.getComponent(cc.Sprite).spriteFrame;

        this._readyTime = 4;
        this.startBtn.node.active = false;
    },

    onStartBtn(){
        this._isStart = !this._isStart;
        var sf = null;
        if (this._isStart) {
            sf = this.gameUIAtlas.getSpriteFrame("UI_stop_0");
        }
        else{
            sf = this.gameUIAtlas.getSpriteFrame("UI_stop_1");
        }
        this.startBtnSprite.spriteFrame = sf;
    },
    onContinueBtn(){
        //cc.log("onContinueBtn===");
    },
    onResetBtn(){
        // cc.log("onResetBtn===");
        //this.replayGame();
    },
    replayGame(){
        if (this._isStart) {
            return;
        }
        this._carMgr.reset(cc.p(0, 0), 0);
        this._mapMgr.reset();
        this.scoreLabel.string = this._mapMgr.getScore();
        this._readyTime = 4;
        this.ready.active = true;
        this.startBtn.node.active = false;
        this._ADCount = 1;
    },
    continueGame(){
        if (this._isStart) {
            return;
        }
        var pos = this._mapMgr._curBlockObj._trackPos;
        var rota = this._mapMgr._curBlockObj._root.rotation;
        this._carMgr.reset(pos, rota);
        this._readyTime = 4;
        this.ready.active = true;
        this.startBtn.node.active = false;
    },
    update (dt) {
        if(this._isGuide) {
            if (this._guideTime > 0) {
                this._guideTime -= dt;
                if (this._guideTime <= 0) {
                    this.loadReady();
                    if (window.wx != undefined) {
                        window.wx.setStorageSync("isOped", 1)
                    }
                    this.guide.active = false;
                    this._isGuide = false;
                }
                else if(this._guideTime <= 3 && this._tempGuide == true) {
                    this._tempGuide = false;
                    this.guideLeft.x = 0;
                    this.guideRight.x = -540;
                    this.guideTitle.string = "触碰右半屏向右转弯";
                }
            }
        }

        if(!this._isReady){
            return;
        }

        if (this._readyTime > 0) {
            this._readyTime -= dt;
            if (this._readyTime < 0) {
                this._isStart = true;
                this.ready.active = false;
                this.startBtn.node.active = true;
                this._carMgr.resetStreak();
            }
            var idx = Math.floor(this._readyTime);
            var sf = this.gameUIAtlas.getSpriteFrame("UI_img_" + idx);
            this.ready.getComponent(cc.Sprite).spriteFrame = sf;
        }
        if(!this._isStart){
            return;
        }
        this._carMgr.normalUpdate(dt);
        this.scoreLabel.string = this._mapMgr.getScore();
        this._isStart = this._mapMgr.normalUpdate(this.car);
        if(!this._isStart){
            this._carMgr.playBoom(); 
        }

    },
    carBoomEnd(){
        if (this._ADCount > 0) {
            this.uIMgr.changeScene(2,  this._mapMgr.getScore());
        }
        else{
            this.uIMgr.changeScene(3,  this._mapMgr.getScore());
        }
        this._ADCount -= 1;
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
