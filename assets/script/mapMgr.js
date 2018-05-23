var mapBlock = require("mapBlock")

var BLOCK_TYPE = {
    STRAIGHT:0,
    CORNER1:1,
    CORNER2:2,
    CORNER3:3,
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

        _curBlockObj:null,

        _maxBlockId:0,

        _curMapPos:null,
    },

    start () {
        this._curMapPos = cc.p(0, 0);
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
        for (let i = 0; i < this._blockMax; i++) {
            let configList = this.getBlockConfig(i);
            if (configList != null) {
                for (let j = 0; j < configList.length; j++) {
                    const v = configList[j];
                    if (j != configList.length -1) {
                        v.scaleX = false;
                    }
                    let obj = this.createTrack(v);
                    if (this._bolckObjList[i + j -1] != null) {
                        let lastObj = this._bolckObjList[i + j -1];
                        obj.setPosAndDir(lastObj);
                    }
                    else{
                        this._curBlockObj = obj;
                        obj.setPosAndDir();
                    }
                    this.node.addChild(obj._root);
                    this._bolckObjList.push(obj);
                }
                i = i + configList.length - 1;
            }
        }
    },
    createTrackObj(){

    },
    getBlockConfig(index){
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
        let styleStr = null;//地块样式
        let rand = this.getRandom(1, 100);
        let w = 0;
        for (let i = 0; i < data.mapType.length; i++) {
            const v = data.mapType[i];
            w += v.weight;
            if (rand <= w) {
                styleStr = v.style;
                break;
            }
        }
        if (styleStr == null) {
            cc.log("获取配置表的style错误！");
            return;
        }
        cc.log("index =", index, "styleStr = ", styleStr);
        let styleList = styleStr.split(",");
        let configList = new Array;
        for (let i = 0; i < styleList.length; i++) {
            const style = styleList[i];
            let v = style.split(":");
            let blockType = parseInt(v[0], 10);
            let blockDir = parseInt(v[1], 10);
            if (blockType == 0 && blockDir != 0) {
                cc.log("直线方向配置错误");
                return;
            }
            if (blockType != 0 && Math.abs(blockDir) != 1) {
                cc.log("弯道方向配置错误");
                return;
            }
            let config = {
                id:index + i,
                type:blockType,
                dir:blockDir,
                scaleX:true,
            }
            configList.push(config);
        }
        return configList;
    },
    createTrack(config){
        let obj = this.getBlock(config.type);
        obj._id = config.id;
        obj._dir = config.dir;
        obj._bScaleX = config.scaleX;
        obj._root.active = true;
        return obj;
    },
    //判定游戏是否继续
    isGameContinue(carPos){
        let result = true;
        let hasBlock = false;
        this._curMapPos = cc.p(this.node.x, this.node.y);

        for (let i = 0; i < this._bolckObjList.length; i++) {
            const obj = this._bolckObjList[i];
            let posInfo = this.getBlockPosInfo(obj._root);
            let oppoPos = posInfo.oppo;
            if (carPos.x >= Math.min(obj._root.x, oppoPos.x) && carPos.x <= Math.max(obj._root.x, oppoPos.x) &&
                carPos.y >= Math.min(obj._root.y, oppoPos.y) && carPos.y <= Math.max(obj._root.y, oppoPos.y)) {
                hasBlock = true;
                //同一个地块
                if (obj._id == this._curBlockObj._id) {
                    break;
                }
                else{
                    if (obj._id > this._maxBlockId) {
                        this._maxBlockId = obj._id;
                        cc.log("maxBlockId= ",this._maxBlockId);
                    }      
                    //判断是否相邻
                    if (Math.abs(obj._id - this._curBlockObj._id) == 1) {
                        cc.log("进入赛道id:", obj._id, "  type=", obj._type);
                        this._curBlockObj = obj;
                        break;
                    }
                }
            }
        }
        
        if (this._maxBlockId - this._bolckObjList[0]._id > 6) {
            let firstObj = this._bolckObjList.shift();
            this._blockPoolList[firstObj._type].put(firstObj);
            let lastObj = this._bolckObjList[this._bolckObjList.length -1];
            
            let configList = this.getBlockConfig(lastObj._id);
            if (configList != null) {
                for (let j = 0; j < configList.length; j++) {
                    const v = configList[j];
                    if (j != configList.length -1) {
                        v.scaleX = false;
                    }
                    cc.log("33333");
                    let newObj = this.createTrack(v);
                    newObj.setPosAndDir(lastObj);
                    this.node.addChild(newObj._root);
                    this._bolckObjList.push(newObj);
                    this.node.addChild(newObj._root);
                    this._bolckObjList.push(newObj);
                }
            }       
        }
        if (!hasBlock) {
            cc.log("找不到地图块 carPos:", carPos);
            let length = this._bolckObjList.length;
            let obj = this._bolckObjList[length - 1]
            return false;
        }
        //判断是否碰撞
        result = this.calcCollision(carPos, this._curBlockObj);
        return result;
    },

    calcCollision(carPos, obj){
        let result = true;
        if(obj._type == 0){
            let pLength =0
            //左 右
            if(obj._root.rotation === -90 || obj._root.rotation === 270 ||
                obj._root.rotation === 90 || obj._root.rotation === -270) {
                pLength = Math.abs(carPos.y - obj._root.y); 
            }
            else{
                pLength = Math.abs(carPos.x - obj._root.x);
            }
            if (pLength < 50 || pLength > 640 - 50) {
                result = false;
            }
            else{
                result = true;   
            }
        }
        else{
            let posInfo = this.getBlockPosInfo(obj._root);
            let origin = posInfo.origin;
            let vector = cc.v2(carPos.x - origin.x, carPos.y - origin.y);
            let pLength = cc.pLength(vector);
            let angle = cc.pToAngle(vector);
            let rotation = angle/Math.PI*180;
    
            // cc.log("vector =", vector)
            // cc.log("angle= ", angle)
            // cc.log("rotation =", rotation);
            //cc.log("pLength =", pLength);
    
            let min = obj._root.width - 50 - 540;
            let max = obj._root.width - 50;
            if (pLength < min || pLength > max) {
                result = false;
            }
            else{
                result = true;
            }
        }
        return result;
    },

    getBlockPosInfo(root){
        let originPos = null;//弯道的圆心
        let oppoPos = null;//对角的位置
        let trackPos = null;//赛道的位置
        //50是边的缝隙，540是路宽
        let offset = 50 + 540/2;
        //右
        if(root.rotation === 90 || root.rotation === -270) {
            if (root._type == 0) {
                trackPos = cc.v2(root.x, root.y - offset);
                oppoPos = cc.v2(root.x + root.height, root.y - root.width);
            }
            else{
                originPos = cc.v2(root.x, root.y - root.width*root.scaleX);
                trackPos = cc.v2(root.x, root.y - offset*root.scaleX);
                oppoPos = cc.v2(root.x + root.height, root.y - root.width*root.scaleX);
            }
        }
        //左
        else if(root.rotation === -90 || root.rotation === 270) {
            if (root._type == 0) {
                trackPos = cc.v2(root.x, root.y + offset);
                oppoPos = cc.v2(root.x - root.height, root.y + root.width);
            }
            else{
                originPos = cc.v2(root.x, root.y + root.width*root.scaleX);
                trackPos = cc.v2(root.x, root.y + offset*root.scaleX);
                oppoPos = cc.v2(root.x - root.height, root.y + root.width*root.scaleX);
            }
        }
        //下
        else if(Math.abs(root.rotation) === 180) {
            if (root._type == 0) {
                trackPos = cc.v2(root.x - offset, root.y);
                oppoPos = cc.v2(root.x - root.width, root.y - root.height);
            }
            else{
                originPos = cc.v2(root.x - root.width*root.scaleX, root.y);
                trackPos = cc.v2(root.x - offset*root.scaleX, root.y);
                oppoPos = cc.v2(root.x - root.width*root.scaleX, root.y - root.height);
            }
        }
        //上
        else{
            if (root._type == 0) {
                trackPos = cc.v2(root.x + offset, root.y);
                oppoPos = cc.v2(root.x + root.width, root.y + root.height);
            }
            else{
                originPos = cc.v2(root.x + root.width*root.scaleX, root.y);
                trackPos = cc.v2(root.x + offset*root.scaleX, root.y);
                oppoPos = cc.v2(root.x + root.width*root.scaleX, root.y + root.height);
            }
        }
        let posInfo = {
            origin:originPos,
            oppo:oppoPos,
            track:trackPos,
        };
        return posInfo;
    },

    //获取复活的位置
    getContinuePos(){
        this.node.setPosition(this._curMapPos);
        let posInfo = this.getBlockPosInfo(this._curBlockObj._root);   
        let resetInfo = {
            p:posInfo.track,
            r:this._curBlockObj._root.rotation,
        }
        return resetInfo;
    },
    //获取游戏得分
    getScore(pos){
        return this._curBlockObj._id;
    },
    createBlock(blockType){
        cc.log("创建新地块 type= ", blockType);
        let obj = new mapBlock();
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
            obj = this.createBlock(blockType);
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
                break;
        }
    },

});
