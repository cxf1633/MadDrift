var mapBlock = require("mapBlock")

var BLOCK_TYPE = {
    STRAIGHT:1,
    CORNER1:2,
    CORNER2:3,
    CORNER3:4,
}
var DIRECTION = {
    NONE:0,
    UP:1,
    DOWN:2,
    LEFT:3,
    RIGHT:4,
}
cc.Class({
    extends: cc.Component,

    properties: {
        straight: cc.Node,
        corner1: cc.Node,
        corner2: cc.Node,
        corner3: cc.Node,
 
        _blockMax:10,
        
        _bolckObjList:null,//现有地图块

        _blockPoolList:null,//各个地图块的池


        _configData:null,
    },

    start () {
        this._configData = {};

        this.prefabList = {};
        this.prefabList[BLOCK_TYPE.STRAIGHT] = this.straight;
        this.prefabList[BLOCK_TYPE.CORNER1] = this.corner1;
        this.prefabList[BLOCK_TYPE.CORNER2] = this.corner2;
        this.prefabList[BLOCK_TYPE.CORNER3] = this.corner3;

        this._blockPoolList = {};
        this._blockPoolList[BLOCK_TYPE.STRAIGHT] = new cc.NodePool();
        let poolNum = 5;
        for (let i = 0; i < poolNum; ++i) {
            let obj = this.createBlock(BLOCK_TYPE.STRAIGHT);
            this._blockPoolList[BLOCK_TYPE.STRAIGHT].put(obj);
        }

        this._blockPoolList[BLOCK_TYPE.CORNER1] = new cc.NodePool();
        poolNum = 5;
        for (let i = 0; i < poolNum; ++i) {
            let obj = this.createBlock(BLOCK_TYPE.CORNER1);
            this._blockPoolList[BLOCK_TYPE.CORNER1].put(obj);
        }
        this._blockPoolList[BLOCK_TYPE.CORNER2] = new cc.NodePool();
        poolNum = 5;
        for (let i = 0; i < poolNum; ++i) {
            let obj = this.createBlock(BLOCK_TYPE.CORNER2);
            this._blockPoolList[BLOCK_TYPE.CORNER2].put(obj);
        }
        this._blockPoolList[BLOCK_TYPE.CORNER3] = new cc.NodePool();
        poolNum = 5;
        for (let i = 0; i < poolNum; ++i) {
            let obj = this.createBlock(BLOCK_TYPE.CORNER3);
            this._blockPoolList[BLOCK_TYPE.CORNER3].put(obj);
        }
        this.loadConfig();
    },
    loadConfig(){
        var self = this;
        cc.log("从本地加载数据：ConfigData.json");
        cc.loader.loadRes("ConfigData",function(err,txt){
            if (err) {
                cc.error(err.message || err);
                return;
            }
            self._configData = txt;
            cc.log("数据库加载完成！");
            self.createTrack();
        });
    },
    getConfig(index){
        for (let id = 0; id < this._configData["map"].length; id++) {
            const obj = this._configData["map"][id];
            if (index >= obj.from && index <= obj.to) {
                return obj;
            }
        }
        return null;
    },
    //创建赛道
    createTrack(){
        cc.log("创建赛道");
        this._blockMax = 4;
        this._bolckObjList = new Array;
        for (let index = 0; index < this._blockMax; index++) {
            let data = this.getConfig(index);
            let rand = this.getRandom(1, 10);
            let w = 0;
            let style = null;//地块样式
            if (data == null) {
                cc.log("赛道数量超过配置表");
            }
            for (let i = 0; i < data.mapType.length; i++) {
                const v = data.mapType[i];
                w += v.weight;
                if (rand <= w) {
                    style = v.style;
                    break;
                }
            }
            cc.log("index =", index, "style = ", style);

            let strList = style.split(":");
            let blockType = parseInt(strList[0], 10);
            let dir = parseInt(strList[1], 10);
            let obj = this.getBlock(blockType);
            if (this._bolckObjList[index -1] != null) {
                let lastObj = this._bolckObjList[index -1];
                obj.setPosAndDir(dir, lastObj);
            }
            else{
                // obj._position = cc.p(0, 320);
                // obj._root.setPosition(obj._position);
                obj.setPosAndDir(dir);
            }
            obj._root.active = true;
            this.node.addChild(obj._root);
            this._bolckObjList.push(obj);
        }
    },
    createBlock(blockType){
        let obj = null;
        let _blockPool = this._blockPoolList[blockType];
        obj = new mapBlock();
        obj.init(blockType, this.prefabList[blockType]);
        return obj;
    },
    getBlock(blockType){
        let obj = null;
        let _blockPool = this._blockPoolList[blockType];
        if (_blockPool.size() > 0) {
            obj = _blockPool.get();
        }
        else{
            obj = new mapBlock();
            obj.init(blockType, this.prefabList[blockType]);
        }
        return obj;
    },

    getRandom(min, max){
        switch(arguments.length){ 
            case 1: 
                //parseInt 第二个参数表示进制 
                return parseInt(Math.random()*min+1, 10); 
            break; 
            case 2: 
                return parseInt(Math.random()*(max-min+1)+min, 10); 
            break; 
                default: 
                    return 0; 
                break; 
        } 
    },

});
