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
 
        maxBlock: {
            default: 20,
            tooltip: '地图块最大数量'
        },
        remainBlock: {
            default: 10,
            tooltip: '保留经过地块数量'
        },

        _blockMax:0,
        
        _bolckObjList:null,//现有地图块

        _blockPoolList:null,//各个地图块的池

        _configData:null,

        _curBlockObj:null,


        _hideBlockObj:null,

        _curMapPos:null,

        _lastRotation:0,//创建的最后一个地块不能往下

        _lastScore:0,
        _curScore:0,
        _totalScore:0,
    },

    start () {
        this._blockMax = this.maxBlock;
        this._curMapPos = cc.p(0, -960);

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
        this._configData = {};
        var self = this;
        cc.loader.loadRes("ConfigData",function(err,txt){
            if (err) {
                cc.error(err.message || err);
                return;
            }
            self._configData = txt;
            cc.log("数据库加载完成，初始化赛道！");
            self.initMapBlock();
        });
    },

    //初始化赛道
    initMapBlock(){
        this._bolckObjList = new Array;
        for (let i = 0; i < this._blockMax; i++) {
            let configList = this.getBlockConfig(i);
            if (configList != null) {
                //判断最后的方向朝向
                let offsetDir = this.getTurnOffset(configList);
                for (let j = 0; j < configList.length; j++) {
                    const v = configList[j];
                    v.dir = v.dir*offsetDir;
                    if (j != configList.length -1) {
                        v.scaleX = false;
                    }
                    let obj = this.getBlockObj(v);
                    let lastObj = this._bolckObjList[this._bolckObjList.length - 1];
                    if (lastObj != null) {
                        obj.setPosAndDir(lastObj);
                    }
                    else{
                        // this._curBlockObj = obj;
                        obj.setPosAndDir();
                    }
                    obj.initPosInfo();
                    this.node.addChild(obj._root);
                    this._bolckObjList.push(obj);
                }
                i = this._bolckObjList.length-1 ;
            }
        }
    },

    getTurnOffset(configList){
        let offsetDir = 1;
        let lastRotation = this._lastRotation;
        for (let m = 0; m < configList.length; m++) {
            const v = configList[m];
            if (v.type != 0) {
                if (v.dir == 1) {
                    lastRotation += 90;
                }
                else{
                    lastRotation -= 90;
                }
            }
        }
        lastRotation = lastRotation%360;
        if (Math.abs(lastRotation) == 180) {
            offsetDir = -1;
            this._lastRotation = lastRotation - 180;
        }
        else{
            offsetDir = 1;
            this._lastRotation = lastRotation;
        }
        return offsetDir;
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
        let score = 0;
        let rand = this.getRandom(1, 100);
        let w = 0;
        for (let i = 0; i < data.mapType.length; i++) {
            const v = data.mapType[i];
            w += v.weight;
            if (rand <= w) {
                styleStr = v.style;
                score = v.score;
                break;
            }
        }
        if (styleStr == null) {
            cc.log("获取配置表的style错误！");
            return;
        }
        //cc.log("index =", index, "styleStr = ", styleStr);
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
                score:score/styleList.length,
                maxSpeed:data.maxSpeed
            }
            configList.push(config);
        }
        return configList;
    },
    getBlockObj(config){
        let obj = null;
        let _blockPool = this._blockPoolList[config.type];
        if (_blockPool.size() > 0) {
            obj = _blockPool.get();
        }
        else{
            obj = this.createBlock(config.type);
        }
        obj.initConfig(config);
        return obj;
    },
    //判定游戏是否继续
    normalUpdate(car){
        let carPos = car.getPosition();
        let result = true;
        let hasBlock = false;
        this._curMapPos = cc.p(this.node.x, this.node.y);

        for (let i = 0; i < this._bolckObjList.length; i++) {
            const obj = this._bolckObjList[i];
            let oppoPos = obj._oppoPos;
            if (carPos.x >= Math.min(obj._root.x, oppoPos.x) && carPos.x <= Math.max(obj._root.x, oppoPos.x) &&
                carPos.y >= Math.min(obj._root.y, oppoPos.y) && carPos.y <= Math.max(obj._root.y, oppoPos.y)) {
                hasBlock = true;
                if (this._curBlockObj == null) {
                    this._curBlockObj = obj;
                    break;
                }
                //同一个地块
                if (obj._id == this._curBlockObj._id) {
                    break;
                }
                else{
                    //判断是否相邻
                    if (Math.abs(obj._id - this._curBlockObj._id) == 1) {
                        cc.log("进入赛道id:", obj._id, "  type=", obj._type);
                        //计分
                        if (obj._id > this._curBlockObj._id) {
                            this._lastScore = 0;
                        }
                        else{
                            this._lastScore = obj._score;
                        }
                        this._curBlockObj = obj;
                        car.getComponent("carMgr").setMaxSpeed(obj._maxSpeed);
                    }
                    //改变地图层级
                    if (this._hideBlockObj != null) {
                        this._hideBlockObj._root.zIndex = 0;
                        car.zIndex = 1;
                        this._hideBlockObj = null;
                    }
                    if( (obj._id - this._curBlockObj._id) > 1){
                        obj._root.zIndex = 10;
                        this._hideBlockObj = obj;
                    }
                }
            }
        }
        if (!hasBlock) {
            cc.log("找不到地图块 carPos:", carPos);
            let length = this._bolckObjList.length;
            let obj = this._bolckObjList[length - 1]
            return false;
        }
        //动态增加减少赛道
        
        //if ((this._bolckObjList[this._bolckObjList.length -1]._id - this._curBlockObj._id) < this._blockMax/2) {
        if ((this._curBlockObj._id - this._bolckObjList[0]._id) > this.remainBlock) {
            let firstObj = this._bolckObjList.shift();
            this._blockPoolList[firstObj._type].put(firstObj);
            let lastObj = this._bolckObjList[this._bolckObjList.length -1];
            let configList = this.getBlockConfig(lastObj._id + 1);
            if (configList != null) {
                //判断最后的方向朝向
                let offsetDir = this.getTurnOffset(configList);
                for (let j = 0; j < configList.length; j++) {
                    const v = configList[j];
                    v.dir = v.dir*offsetDir;
                    if (j != configList.length -1) {
                        v.scaleX = false;
                    }
                    let newObj = this.getBlockObj(v);
                    let lastObj = this._bolckObjList[this._bolckObjList.length -1];
                    newObj.setPosAndDir(lastObj);
                    newObj.initPosInfo();
                    this.node.addChild(newObj._root);
                    this._bolckObjList.push(newObj);
                }
            }       
        }
        //判断是否碰撞
        result = this.calcCollision(carPos, this._curBlockObj);
        return result;
    },

    calcCollision(carPos, obj){
        let result = true;
        let per = 0;
        let score = 0;
        let addScore = 0;
        if(obj._type == 0){
            let pLength =0
            //左
            if(obj._root.rotation === -90 || obj._root.rotation === 270){
                pLength = Math.abs(carPos.y - obj._root.y);
                per = (obj._root.x - carPos.x)/640;
            }
            // 右
            else if(obj._root.rotation === 90 || obj._root.rotation === -270) {
                pLength = Math.abs(carPos.y - obj._root.y);
                per = (carPos.x - obj._root.x)/640;
            }
            else if(Math.abs(obj._root.rotation) === 180) {
                pLength = Math.abs(carPos.x - obj._root.x);
                per = (obj._root.y - carPos.y)/640;
            }
            else{
                pLength = Math.abs(carPos.x - obj._root.x);
                per = (carPos.y - obj._root.y)/640;
            }
            //判断碰撞
            if (pLength < 50 || pLength > 640 - 50) {
                result = false;
            }
            else{
                result = true;   
            }
            //计算得分
            score = obj._score * per;
            addScore = score - this._lastScore;
            this._curScore += addScore;
            if (this._curScore > this._totalScore) {
                this._totalScore = Math.ceil(this._curScore);
            }
            this._lastScore = score;
        }
        else{
            let vector = cc.pSub(carPos, obj._originPos)
            let pLength = cc.pLength(vector);
            let min = obj._root.width - 50 - 540;
            let max = obj._root.width - 50;
            if (pLength < min || pLength > max) {
                result = false;
            }
            else{
                result = true;
            }
            //计算得分
            let angle = cc.pToAngle(vector);
            per = Math.PI/5*obj._score;
            score = (obj._startAngle - angle)*per*obj._dir;
            addScore = score - this._lastScore;
            this._curScore += addScore;
            // cc.log("score =", score);
            // cc.log("addScore =", addScore);
            // cc.log("this._curScore =", this._curScore);
            if (this._curScore > this._totalScore) {
                this._totalScore = Math.ceil(this._curScore);
            }
            this._lastScore = score;
        }
        return result;
    },

   //获取游戏得分
    getScore(){
        return this._totalScore ;
    },
    reset(){
        this.node.setPosition(cc.p(0, 0));
        this._totalScore = 0;
        for (let index = 0; index < this._bolckObjList.length; index++) {
            const obj = this._bolckObjList[index];
            obj._root.rotation = 0;
            obj._root.scaleX = 1;
            this._blockPoolList[obj._type].put(obj);
        }
        this._bolckObjList = null;
        this._curBlockObj = null;
        this._hideBlockObj = null;
        this._lastRotation = 0,
        this._lastScore = 0;
        this._curScore = 0;
        this._totalScore = 0;
        this.initMapBlock();
    },

    createBlock(blockType){
        //cc.log("创建新地块 type= ", blockType);
        let obj = new mapBlock();
        obj.init(blockType, this.prefabList[blockType]);
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
