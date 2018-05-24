var uiControl = cc.Class({
    extends: cc.Component,

    properties: {
        //Node
        gameNode: {
            default:null, 
            type:cc.Node,
            tooltip: '游戏场景'
        },

        gameUI: {
            default:null, 
            type:cc.Node,
            tooltip: '游戏界面'
        },

        currentScoreUI: {
            default:null, 
            type:cc.Node,
            tooltip: '当前分数界面'
        },

        scoreUI: {
            default:null, 
            type:cc.Node,
            tooltip: '得分结算界面'
        },

        rankUI: {
            default:null, 
            type:cc.Node,
            tooltip: '排行榜界面'
        },

        _sceneTable: null,
        _oldNdoeId: null,
    },

    onLoad () {

    },

    start () {
        this.changeScene(1, false);
    },

    changeScene(sceneId, _para) {
        if(this._sceneTable != null){
            for (var v of this._sceneTable) {
                v.active = false;
            }
        }

        let tempNode = null;
        if(sceneId == 1){
            tempNode = [this.gameNode, this.gameUI];
            this.gameNode.active = true;
            this.gameUI.active = true;
            if(_para === true) {
                this.gameNode.getComponent("gameMgr").onContinueBtn();
            }
        }
        else if(sceneId == 2){
            tempNode = [this.currentScoreUI];
            this.currentScoreUI.active = true;
            if(_para != null) {
                this.currentScoreUI.getComponent('currentScoreUI').showCurrentScore(_para);
            }
        }
        else if(sceneId == 3){
            tempNode = [this.scoreUI];
            this.scoreUI.active = true;
            if(_para != null) {
                this.scoreUI.getComponent('scoreUI').showScore(_para);
            }
        }
        else if(sceneId == 4){
            tempNode = [this.rankUI];
            this.rankUI.active = true;
            this.rankUI.getComponent('rankUI').getOldNodeId(this._oldNdoeId);
        }

        if(tempNode != null) {
            this._sceneTable = tempNode;
            this._oldNdoeId = sceneId;
        }
    },
});

module.exports = uiControl;