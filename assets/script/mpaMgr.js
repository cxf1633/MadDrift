cc.Class({
    extends: cc.Component,

    properties: {
        map1:cc.Node,
        map2:cc.Node,
        map3:cc.Node,
        map4:cc.Node,

        _mapDataTable: null,
    },

    onLoad () {
        this._tempTable = [1,2,3,2,4,2,3,3,2,1,1,2,3,2,4,2,3,2,2,3,3,3,1,4,2,1,1,4,2,3,1,2,3,2,3,1,2,3];
        // this._tempTable = [1,2,1,2,1];
    },

    start () {
        
    },

    onEnable () {
        this._mapDataTable = [];
        for (var k in this._tempTable) {
            cc.log("key: " + k);

            this._mapDataTable[k] = this.getNode(this._tempTable[k]);
            let _newNodeScript = this._mapDataTable[k].getComponent("mapData");
            _newNodeScript.set("type", this._tempTable[k]);

            if(this._tempTable[k] === 1){ 
                //随机直线类型长度
                let _random = this.getRandom(6, 16) * 100;
                // let _random = 640
                // cc.log(_random)
                this._mapDataTable[k].height = _random;
            }
            //对转弯类型转向处理
            else if(this._tempTable[k] === 2 || this._tempTable[k] === 3 || this._tempTable[k] === 4){
                //反转方向特殊处理(待定)
                let _random = this.getRandom(0, 1);
                // let _random = 0
                // cc.log(_random)
                if(_random == 0) {
                    this._mapDataTable[k].scaleX = 1;
                }
                else if(_random == 1) {
                    this._mapDataTable[k].scaleX = -1;
                }

                //暂定正式代码(根据参数进行新弯道地块反转朝向)
                // this._mapDataTable[k].scaleX = -para[0];
            }

            //上一个地块不为空
            if(this._mapDataTable[k - 1] != null) {
                let _oldNode = this._mapDataTable[k - 1];
                let _oldPos = _oldNode.getPosition();
                let _newPosY = _oldPos.y;
                let _newPosX = _oldPos.x;

                var _quadrant = null;
                let _oldNodeScript = _oldNode.getComponent("mapData");
                //旧地块类型为1(直线)
                if(_oldNodeScript.get("type") === 1) {
                    cc.log("old类型是直线")

                    //判断直线当前旋转度数(旋转角度后 X,Y轴发生改变)
                    if(_oldNode.rotation === -90 || _oldNode.rotation === 270) {
                        _quadrant = 3;
                        _newPosX = _newPosX - _oldNode.height;
                    }
                    else if(_oldNode.rotation === 90 || _oldNode.rotation === -270) {
                        _quadrant = 1;
                        _newPosX = _newPosX + _oldNode.height;
                    }
                    else if(Math.abs(_oldNode.rotation) === 180) {
                        _quadrant = 4;
                        _newPosY = _newPosY - _oldNode.height;
                    }
                    else{
                        _quadrant = 2;
                        _newPosY = _newPosY + _oldNode.height;
                    }

                    //继承直线的旋转角度
                    this._mapDataTable[k].rotation = _oldNode.rotation;
                }
                //旧地块类型为2(弯道)
                else if(_oldNodeScript.get("type") === 2 || _oldNodeScript.get("type") === 3 || _oldNodeScript.get("type") === 4) {
                    cc.log("old类型是弯道")
                    //根据弯道scale反转 对新地图块进行角度旋转
                    this._mapDataTable[k].rotation = _oldNode.rotation + 90 * _oldNode.scaleX;

                    if(_oldNode.rotation === -90 || _oldNode.rotation === 270) {
                        _quadrant = 2;
                        _newPosX = _newPosX - _oldNode.width;
                        _newPosY = _newPosY + _oldNode.height * _oldNode.scaleX;
                    }
                    else if(_oldNode.rotation === 90 || _oldNode.rotation === -270) {
                        _quadrant = 4;
                        _newPosX = _newPosX + _oldNode.width;
                        _newPosY = _newPosY - _oldNode.height * _oldNode.scaleX;
                    }
                    else if(Math.abs(_oldNode.rotation) === 180) {
                        _quadrant = 3;
                        _newPosX = _newPosX - _oldNode.width * _oldNode.scaleX;
                        _newPosY = _newPosY - _oldNode.height;
                    }
                    else {
                        _quadrant = 1;
                        _newPosX = _newPosX + _oldNode.width * _oldNode.scaleX;
                        _newPosY = _newPosY + _oldNode.height;
                    }
                }

                //对玩到类型进行判断 如果新地图块转向角朝下 使其反转(新地图块不能朝下)
                if(_newNodeScript.get("type") === 2 || _newNodeScript.get("type") === 3 || _newNodeScript.get("type") === 4) {
                    //对转完类型判断 转完的旋转角如果朝下 就旋转成相反朝向 (目前只有类型2)
                    if((this._mapDataTable[k].rotation == -90 && this._mapDataTable[k].scaleX == -1) || (this._mapDataTable[k].rotation == 90 && this._mapDataTable[k].scaleX == 1)){
                        //转完的旋转角如果朝下 就旋转成相反朝向
                        this._mapDataTable[k].scaleX = -this._mapDataTable[k].scaleX;
                    }
                }

                //新旧地图块反转不同的情况下 说明地块有偏差值(偏差值都为640) 根据前面定义的象限_quadrant进行不同方向的位移
                if(this._mapDataTable[k].scaleX !== _oldNode.scaleX && _quadrant !== null) {
                    cc.log("象限: " + _quadrant);
                    if(_quadrant === 1) {
                        _newPosY = _newPosY - 640;
                    }
                    else if(_quadrant === 2) {
                        _newPosX = _newPosX + 640;
                    }
                    else if(_quadrant === 3) {
                        _newPosY = _newPosY + 640;
                    }
                    else if(_quadrant === 4) {
                        _newPosX = _newPosX - 640;
                    }
                }

                //position赋值
                this._mapDataTable[k].setPosition(cc.p(_newPosX, _newPosY))
            }
            else{
                //第一块地块
                this._mapDataTable[k].setPosition(cc.p(-320, -320));
            }
            cc.log("newPos " + this._mapDataTable[k].getPosition())
            cc.log("===================")
            
            this._mapDataTable[k].active = true;
            this._mapDataTable[k].parent = this.node;
        }
    },

    onDisable () {

    },

    getNode (_type) {
        let _tempNode = null;
        if(_type == 1) {
            _tempNode = this.map1;
        }
        else if(_type == 2) {
            _tempNode = this.map2;
        }
        else if(_type == 3) {
            _tempNode = this.map3;
        }
        else if(_type == 4) {
            _tempNode = this.map4;
        }
        return cc.instantiate(_tempNode);
    },

    getRandom(min, max){
        switch(arguments.length){ 
            case 1: 
                return parseInt(Math.random()*min+1,10); 
            break; 
            case 2: 
                return parseInt(Math.random()*(max-min+1)+min,10); 
            break; 
                default: 
                    return 0; 
                break; 
        } 
    },
});
