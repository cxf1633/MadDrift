cc.Class({
    extends: cc.Component,

    properties: {
        title: {
            default:null, 
            type:cc.Label,
            tooltip: '标题'
        },

        returnBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '返回'
        },

        playBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '我也要玩'
        },

        playLabel: {
            default:null, 
            type:cc.Label,
            tooltip: '我也要玩/查看群排行 文本'
        },

        _rankPanelType: null,

        rankingScrollView: cc.Sprite,//显示排行榜
        
        _oldNdoe: null,
    },

    onLoad () {
        this.addClickEvent(this.returnBtn, this.node, "rankUI", "onReturn");
        this.addClickEvent(this.playBtn, this.node, "rankUI", "onPlay");
    },

    start () {
        if (window.wx != undefined) {
            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
            this.tex = new cc.Texture2D();
            window.sharedCanvas.width = 1080;
            window.sharedCanvas.height = 1920;
        }
    },

    onEnable () {
        this.showFriendRankList();
    },

    changeTitle() {
        let _label1, _label2 = "";
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
        this._rankPanelType = 1;
        this.changeTitle();
    },

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

    getOldNode(oldNdoe) {
        this._oldNdoe = oldNdoe;
    },

    onReturn() {
        cc.log("返回");
        if(this._rankPanelType === 1){
            this.node.active = false;
            this._oldNdoe.active = true;
        }
        else if(this._rankPanelType === 2) {
            this.showFriendRankList();
        }
    },

    onPlay() {
        cc.log("发起挑战");
        if(this._rankPanelType === 1) {
            this.showGroupFriendRankList();
        }
        else if(this._rankPanelType === 2) {
            cc.director.loadScene('Game');
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
