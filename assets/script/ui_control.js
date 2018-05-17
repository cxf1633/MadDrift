cc.Class({
    extends: cc.Component,

    properties: {
        //Node
        gameNode: {
            default:null, 
            type:cc.Node,
            tooltip: '游戏场景'
        },

        //UI
        loginUI: {
            default:null, 
            type:cc.Node,
            tooltip: '登陆界面'
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

        newRecordUI: {
            default:null, 
            type:cc.Node,
            tooltip: '新纪录界面'
        },

        scoreUI: {
            default:null, 
            type:cc.Node,
            tooltip: '本次分数界面'
        },

        _sceneTable: null,
    },

    onLoad () {

    },

    start () {
        this.changeScene(2);
    },

    changeScene(sceneId) {
        if(this._sceneTable != null){
            for (var v of this._sceneTable) {
                v.active = false;
            }
        }

        let tempNode = null;
        if(sceneId == 1){
            tempNode = [this.loginUI];
            this.loginUI.active = true;
        }
        else if(sceneId == 2){
            tempNode = [this.gameNode, this.gameUI];
            this.gameNode.active = true;
            this.gameUI.active = true;
        }
        else if(sceneId == 3){
            tempNode = [this.currentScoreUI];
            this.currentScoreUI.active = true;
        }
        else if(sceneId == 4){
            tempNode = [this.newRecordUI];
            this.newRecordUI.active = true;
        }
        else if(sceneId == 5){
            tempNode = [this.scoreUI];
            this.scoreUI.active = true;
        }

        if(tempNode != null) {
            this._sceneTable = tempNode;
        }
    },
});
