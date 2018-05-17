cc.Class({
    extends: cc.Component,

    properties: {
        uIMgr: {
            default:null, 
            type:cc.Node,
        },
        
        challengeBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '发起挑战'
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

        scoreLab: {
            default:null, 
            type:cc.Label,
            tooltip: '分数'
        },

        recordHighLab: {
            default:null, 
            type:cc.Label,
            tooltip: '历史最高'
        },
    },

    onLoad () {
        this.addClickEvent(this.challengeBtn, this.node, "scoreUI", "onChallenge");
        this.addClickEvent(this.againBtn, this.node, "scoreUI", "onAgain");
        this.addClickEvent(this.rankingBtn, this.node, "scoreUI", "onRanking");
    },

    start () {
        this.uIMgr = this.uIMgr.getComponent('ui_control');

        this.scoreLab.string = 10000; 
        this.recordHighLab.string = "历史最高: " + 10000; 
    },

    onChallenge() {
        cc.log("发起挑战");
    },
    
    onAgain() {
        cc.log("再来一局");
    },

    onRanking() {
        cc.log("排行榜");
        this.uIMgr.changeScene(1);
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
