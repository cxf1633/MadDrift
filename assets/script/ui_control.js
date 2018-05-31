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

        clearingUI: {
            default:null, 
            type:cc.Node,
            tooltip: '结算界面'
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
                this.gameNode.getComponent("gameMgr").continueGame();
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
            tempNode = [this.clearingUI];
            this.clearingUI.active = true;
            if(_para != null) {
                this.clearingUI.getComponent('clearingUI').showScore(_para);
            }
        }

        if(tempNode != null) {
            this._sceneTable = tempNode;
            this._oldNdoeId = sceneId;
        }
    },
});

module.exports = uiControl;