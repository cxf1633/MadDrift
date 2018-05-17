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
        this.addClickEvent(this.advertisingBtn, this.node, "currentScoreUI", "onAdvertising");
        this.addClickEvent(this.sharedBtn, this.node, "currentScoreUI", "onShared");
        this.addClickEvent(this.skipBtn, this.node, "currentScoreUI", "onSkip");
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');
    },

    showCurrentScore(){
        this.currentScoreLab.string = 10000; 
    },

    onAdvertising(){
        cc.log("广告");
    },

    onShared(){
        cc.log("分享");
    },

    onSkip(){
        cc.log("跳过");

        this.uIMgr.changeScene(4);
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
