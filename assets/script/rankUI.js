cc.Class({
    extends: cc.Component,

    properties: {
        uIMgr: {
            default:null, 
            type:cc.Node,
        },

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
    },

    onLoad () {
        this.addClickEvent(this.returnBtn, this.node, "rankUI", "onReturn");
        this.addClickEvent(this.returnBtn, this.node, "rankUI", "onPlay");
    },

    start () {
        this.title.string = "排行榜"
    },

    onReturn() {
        cc.log("发起挑战");
    },

    onPlay() {
        cc.log("发起挑战");
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
