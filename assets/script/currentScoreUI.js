cc.Class({
    extends: cc.Component,

    properties: {
        uIMgr: {
            default:null, 
            type:cc.Node,
        },

        advertisingBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '广告'
        },

        sharedBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '分享'
        },

        skipBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '跳过'
        },

        currentScoreLab: {
            default:null, 
            type:cc.Label,
            tooltip: '当前分数'
        },
    },

    onLoad () {
        if (window.wx != undefined) {
            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮
        }
        this.addClickEvent(this.advertisingBtn, this.node, "currentScoreUI", "onAdvertising");
        this.addClickEvent(this.sharedBtn, this.node, "currentScoreUI", "onShared");
        this.addClickEvent(this.skipBtn, this.node, "currentScoreUI", "onSkip");
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');
    },

    showCurrentScore(_score){
        this.currentScoreLab.string = _score; 
    },

    onAdvertising(){
        cc.log("广告");
        this.uIMgr.changeScene(1, true);
    },

    onShared(){
        cc.log("分享");
        // cc.log(this._imageUrl)
        if (window.wx != undefined) {
            window.wx.shareAppMessage({
                title: "分享分享分享分享分享分享",
                imageUrl: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1527657066461&di=215e31a5449a243504d264772852001a&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01ab7d55447e450000019ae9255d82.jpg",
            });
        }
        // if (window.wx != undefined) {
        //     cc.loader.loadRes("texture/share",function(err,data){
        //         cc.log(data.url)
        //         window.wx.shareAppMessage({
        //             title: "分享分享分享分享分享分享",
        //             imageUrl: data.url,
        //         });
        //     });
        // }
    },

    onSkip(){
        cc.log("跳过");
        // cc.director.loadScene('Login');
        this.uIMgr.changeScene(3, this.currentScoreLab.string);
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
