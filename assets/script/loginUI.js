cc.Class({
    extends: cc.Component,

    properties: {
        uIMgr: {
            default:null, 
            type:cc.Node,
        },

        gameStartBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '开始游戏'
        },

        giveARewardBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '打赏'
        },

        rankingBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '登陆界面排行榜'
        },

    },

    onLoad () {
        this.addClickEvent(this.gameStartBtn, this.node, "loginUI", "onGameStart");
        this.addClickEvent(this.giveARewardBtn, this.node, "loginUI", "onGiveAReward");
        this.addClickEvent(this.rankingBtn, this.node, "loginUI", "onRanking");
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');
    },

    onGameStart(){
        cc.log("开始游戏");
        this.uIMgr.changeScene(2);
    },

    onGiveAReward(){
        cc.log("打赏");
    },

    onRanking(){
        cc.log("排行榜");
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
