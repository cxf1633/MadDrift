var mapBlock = require("mapBlock")

var BLOCK_TYPE = {
    STRAIGHT:0,
    CORNER1:1,
    CORNER2:2,
    CORNER3:3,
}
var DIRECTION = {
    UP:0,
    RIGHT:1,
    DOWN:2,
    LEFT:3,
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

        _curBlockId:0,
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
        
        cc.log("从本地加载数据：ConfigData.json");
        var self = this;
        cc.loader.loadRes("ConfigData",function(err,txt){
            if (err) {
                cc.error(err.message || err);
                return;
            }
            self._configData = txt;
            cc.log("数据库加载完成，初始化赛道！");
            self.initTrack();
        });
    },

    //初始化赛道
    initTrack(){
        this._blockMax = 12;
        this._bolckObjList = new Array;
        for (let index = 0; index < this._blockMax; index++) {
            let obj = this.createTrack(index);
            if (this._bolckObjList[index -1] != null) {
                let lastObj = this._bolckObjList[index -1];
                obj.setPosAndDir(lastObj);
            }
            else{
                obj.setPosAndDir();
            }
            this.node.addChild(obj._root);
            this._bolckObjList.push(obj);
        }
    },
    createTrack(index){
        let data = null;
        for (let id = 0; id < this._configData["map"].length; id++) {
            const obj = this._configData["map"][id];
            if (index >= obj.from && index <= obj.to) {
                data = obj;
            }
        }
        if (data == null) {
            cc.log("赛道数量超过配置表");
            return null;
        }
        let style = null;//地块样式
        let rand = this.getRandom(1, 100);
        let w = 0;
        for (let i = 0; i < data.mapType.length; i++) {
            const v = data.mapType[i];
            w += v.weight;
            if (rand <= w) {
                style = v.style;
                break;
            }
        }
        if (style == null) {
            cc.log("获取配置表的style错误！");
            return;
        }
        //cc.log("index =", index, "style = ", style);
        let strList = style.split(":");
        let blockType = parseInt(strList[0], 10);
        let dir = parseInt(strList[1], 10);
        if (blockType == 0 && dir != 0) {
            cc.log("直线方向配置错误");
            return;
        }
        if (blockType != 0 && Math.abs(dir) != 1) {
            cc.log("弯道方向配置错误");
            return;
        }
        let obj = this.getBlock(blockType);
        obj._id = index;
        obj._dir = dir;
        obj._root.active = true;
        return obj;
    },
    //判定游戏是否继续
    isGameContinue(pos){
        let result = true;
        let hasBlock = false;
        for (let i = 0; i < this._bolckObjList.length; i++) {
            const obj = this._bolckObjList[i];
            let position = obj._root.getPosition();
            let scaleX = obj._root.scaleX;
            let offsetPos = cc.v2(0, 0);
            //右
            if (obj._root.rotation == 90 || obj._root.rotation == -270) {
                if (obj._type != 0) {
                    offsetPos = cc.v2(position.x + obj._root.height, position.y - obj._root.width*scaleX);
                }
                else{
                    offsetPos = cc.v2(position.x + obj._root.height, position.y - obj._root.width);
                }
            }
            //左
            else if(obj._root.rotation == -90 || obj._root.rotation == 270){
                if (obj._type != 0) {
                    offsetPos = cc.v2(position.x - obj._root.height, position.y + obj._root.width*scaleX);
                }
                else{
                    offsetPos = cc.v2(position.x - obj._root.height, position.y + obj._root.width);
                }
            }
            //下
            else if(Math.abs(obj._root.rotation) === 180){
                if (obj._type != 0) {
                    offsetPos = cc.v2(position.x - obj._root.width*scaleX, position.y - obj._root.height);
                }
                else{
                    offsetPos = cc.v2(position.x - obj._root.width, position.y - obj._root.height);
                }
            }
            //上
            else{
                if (obj._type != 0) {
                    offsetPos = cc.v2(position.x + obj._root.width*scaleX, position.y + obj._root.height);
                }
                else{
                    offsetPos = cc.v2(position.x + obj._root.width, position.y + obj._root.height);
                }
            }
            // cc.log("pos =", pos);
            // cc.log("position==", position);
            // cc.log("offsetPos =", offsetPos);
            
            if (pos.x >= Math.min(position.x, offsetPos.x) && pos.x <= Math.max(position.x, offsetPos.x) &&
                pos.y >= Math.min(position.y, offsetPos.y) && pos.y <= Math.max(position.y, offsetPos.y)) {
                if (obj._id > this._curBlockId) {
                    cc.log("赛道id:", obj._id, "  type=", obj._type);
                    this._curBlockId = obj._id;
                    if (this._curBlockId - this._bolckObjList[0]._id > 6) {
                        let firstObj = this._bolckObjList.shift();
                        this._blockPoolList[firstObj._type].put(firstObj);
                        let lastObj = this._bolckObjList[this._bolckObjList.length -1];
                        let newObj = this.createTrack(lastObj._id + 1);
                        newObj.setPosAndDir(lastObj);
                        this.node.addChild(newObj._root);
                        this._bolckObjList.push(newObj);
                    }   
                }
                hasBlock = true;
                if (obj._type != 0) {
                    result = this.calcCorner(pos, obj);
                }
                else{
                    result = this.calcStraight(pos, obj);
                }
                break;
            }
        }
        if (!hasBlock) {
            cc.log("找不到地图块 pos:", pos);
            let length = this._bolckObjList.length;
            let obj = this._bolckObjList[length - 1]
            return false;
        }

        return result;
    },

    //计算直线
    calcStraight(pos, obj){
        let pLength =0
        //左
        if(obj._root.rotation === -90 || obj._root.rotation === 270) {
            pLength = Math.abs(pos.y - obj._root.y);
            if (pLength < 50 || pLength > 640 - 50) {
                return false;
            }
        }
        else if(obj._root.rotation === 90 || obj._root.rotation === -270) {
            pLength = Math.abs(pos.y - obj._root.y);
            if (pLength < 50 || pLength > 640 - 50) {
                return false;
            }
        }
        else if(Math.abs(obj._root.rotation) === 180) {
            pLength = Math.abs(pos.x - obj._root.x);
            if (pLength < 50 || pLength > 640 - 50) {
                return false;
            }
        }
        else{
            pLength = Math.abs(pos.x - obj._root.x);
            if (pLength < 50 || pLength > 640 - 50) {
                return false;
            }
        }
        return true;
    },
    //计算转弯
    calcCorner(pos, obj){
        let min = obj._root.width - 50 - 540;
        let max = obj._root.width - 50;
        let origin = cc.v2(0, 0);
        if(obj._root.rotation === -90 || obj._root.rotation === 270) {
            origin = cc.v2(obj._root.x, obj._root.y + obj._root.width*obj._root.scaleX);
        }
        else if(obj._root.rotation === 90 || obj._root.rotation === -270) {
            origin = cc.v2(obj._root.x, obj._root.y - obj._root.width*obj._root.scaleX);
        }
        else if(Math.abs(obj._root.rotation) === 180) {
            origin = cc.v2(obj._root.x - obj._root.width*obj._root.scaleX, obj._root.y);
        }
        else{
            origin = cc.v2(obj._root.x + obj._root.width*obj._root.scaleX, obj._root.y);
        }
        let vector = cc.v2(pos.x - origin.x, pos.y - origin.y);
        let pLength = cc.pLength(vector);
        let angle = cc.pToAngle(vector);
        let rotation = angle/Math.PI*180;

        // cc.log("vector =", vector)
        // cc.log("angle= ", angle)
        // cc.log("rotation =", rotation);
        //cc.log("pLength =", pLength);
        if (pLength < min || pLength > max) {
            return false;
        }
        return true;
    },
    //获取游戏得分
    getScore(pos){
        return this._curBlockId;
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
            cc.log("创建新地块 type= ", blockType);
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
