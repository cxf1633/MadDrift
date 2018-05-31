cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot:cc.Node,
        uIMgr: cc.Node,
        scorePanelNode: cc.Node,
        rankPanelNode: cc.Node,

        rankingScrollView: cc.Sprite,//显示排行榜

        challengeBtn: cc.Button,
        againBtn: cc.Button,
        rankingBtn: cc.Button,
        scoreLab: cc.Label,

        title: cc.Label,
        returnBtn: cc.Button,
        playBtn: cc.Button,
        playLabel: cc.Label,

        _rankPanelType: null,
    },

    onLoad () {
        this.addClickEvent(this.challengeBtn, this.node, "clearingUI", "onChallenge");
        this.addClickEvent(this.againBtn, this.node, "clearingUI", "onAgain");
        this.addClickEvent(this.rankingBtn, this.node, "clearingUI", "onRanking");

        this.addClickEvent(this.returnBtn, this.node, "clearingUI", "onReturn");
        this.addClickEvent(this.playBtn, this.node, "clearingUI", "onPlay");
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');
        this.gameMgr = this.gameRoot.getComponent("gameMgr");
    },

    onEnable () {
        if (window.wx != undefined) {
            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
            this.tex = new cc.Texture2D();
            window.sharedCanvas.width = 1080;
            window.sharedCanvas.height = 1920;
        }
    },

    changeTitle() {
        let _label1 = "";
        let _label2 = "";
        if(this._rankPanelType === 1){
            _label1 = "好友排行榜";
            _label2 = "查看群排行";
        }
        else if(this._rankPanelType === 2){
            _label1 = "群排行榜";
            _label2 = "我也要玩";
        }
        this.title.string = _label1;
        this.playLabel.string = _label2;
    },

    showFriendRankList() {
        if (window.wx != undefined) {
            window.wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "score"
            });
        }
        else{
            cc.log("获取好友排行榜数据")
        }
        this._rankPanelType = 1;
        this.changeTitle();
    },

    //横向3个玩家数据的排行榜
    showGameOverRankList() {
        if (window.wx != undefined) {
            window.wx.postMessage({
                messageType: 4,
                MAIN_MENU_NUM: "score"
            });
        }
        else{
            cc.log("获取横向展示排行榜数据")
        }
    },

    //显示群排行榜
    showGroupFriendRankList() {
        if (window.wx != undefined) {
            window.wx.shareAppMessage({
                title: "群分享",
                success: (res) => {
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window.wx.postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "score",
                            shareTicket: res.shareTickets[0]
                        });
                    }
                }
            });
        } else {
            cc.log("获取群排行榜数据");
        }
        // this._rankPanelType = 2;
        // this.changeTitle();
    },

    showScore(_score) {
        this.scoreLab.string = _score; 
        this.submitScoreButtonFunc(_score);
        this.onReturn();
    },

    submitScoreButtonFunc(score){
        if (window.wx != undefined) {
            window.wx.postMessage({
                messageType: 3,
                MAIN_MENU_NUM: "score",
                score: score,
            });
        } else {
            cc.log("提交得分: score : " + score)
        }
    },

    onChallenge() {
        cc.log("发起挑战");
        if (window.wx != undefined) {
            window.wx.shareAppMessage({
                title: "发起挑战",
                imageUrl: "/assets/logo",
            });
        }
    },
    
    onAgain() {
        cc.log("再来一局");
        //cc.director.loadScene('Login');
        this.gameMgr.replayGame();
        this.uIMgr.changeScene(1);
    },

    onRanking() {
        cc.log("排行榜");
        this.showFriendRankList();
        this.scorePanelNode.active = false;
        this.rankPanelNode.active = true;
    },

    onReturn() {
        cc.log("返回");
        if(this._rankPanelType === 1 || this._rankPanelType == null) {
            this.showGameOverRankList();
            this.scorePanelNode.active = true;
            this.rankPanelNode.active = false;
        }
        else if(this._rankPanelType === 2) {
            this.showFriendRankList();
        }
    },

    onPlay() {
        cc.log("我也要玩/查看群排行");
        if(this._rankPanelType === 1) {
            this.showGroupFriendRankList();
        }
        else if(this._rankPanelType === 2) {
            //需要 特殊处理
            cc.director.loadScene('Login');
        }
    },

    // 刷新子域的纹理
    _updateSubDomainCanvas() {
        if (!this.tex) {
            return;
        }

        if (window.sharedCanvas != undefined) {
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.rankingScrollView.spriteFrame = new cc.SpriteFrame(this.tex);
        }
    },

    update() {
        this._updateSubDomainCanvas();
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
