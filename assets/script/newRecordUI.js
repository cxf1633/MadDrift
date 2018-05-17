cc.Class({
    extends: cc.Component,

    properties: {
        uIMgr: {
            default:null, 
            type:cc.Node,
        },

        againBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '再来一局'
        },

        rankingBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '排行榜'
        },

        newScoreLab: {
            default:null, 
            type:cc.Label,
            tooltip: '新分数'
        },
    },

    onLoad () {
        this.addClickEvent(this.againBtn, this.node, "newRecordUI", "onAgain");
        this.addClickEvent(this.rankingBtn, this.node, "newRecordUI", "onRanking");
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');
    },

    showScore(){
        this.newScoreLab.string = 10000; 
    },

    onAgain(){
        cc.log("再来一局");
        this.uIMgr.changeScene(1);
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
