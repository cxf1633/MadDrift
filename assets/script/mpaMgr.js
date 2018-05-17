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
        this._tempTable = [1,2,2,2,1,2,1,2,1,2,1,2,1,2,1,2];
        // this._tempTable = [1,3,2,3];
    },

    start () {
        
    },

    onEnable () {
        this._mapDataTable = [];
        for (var k in this._tempTable) {
            cc.log("key: " + k);

            this._mapDataTable[k] = this.getNode(this._tempTable[k]);
            let _mapNodeScript = this._mapDataTable[k].getComponent("mapData");
            _mapNodeScript.set("type", this._tempTable[k]);

            if(this._tempTable[k] === 1){
                // let _random = this.getRandom(12, 15) * 100;
                let _random = 640;
                this._mapDataTable[k].height = _random;
            }
            //对转弯类型转向处理
            else if(this._tempTable[k] === 2 || this._tempTable[k] === 3){
                //转向特殊处理(待定)
                let _random = this.getRandom(0, 1);
                cc.log(_random)
                if(_random == 0) {
                    this._mapDataTable[k].scaleX = 1;
                }
                else if(_random == 1) {
                    this._mapDataTable[k].scaleX = -1;
                }

                //暂定正式代码
                // this._mapDataTable[k].scaleX = -para[0];
            }

            if(this._mapDataTable[k - 1] != null) {
                let _oldNode = this._mapDataTable[k - 1];
                cc.log("oldPos " + _oldNode.getPosition())
                let _oldPos = _oldNode.getPosition();
                cc.log(_oldNode.height)
                cc.log(_oldPos.y +  "  " + _oldNode.height + "  " + this._mapDataTable[k].height + "  ")
                let _newPosY = _oldPos.y;
                let _newPosX = _oldPos.x;
                // cc.log(_newPosY);

                let _oldNodeScript = _oldNode.getComponent("mapData");
                if(_oldNodeScript.get("type") === 1) {
                    cc.log("old类型是1")
                    let _deviation = 0;
                    if(_mapNodeScript.get("type") === 3) {
                        _deviation = 320 * -this._mapDataTable[k].scaleX;
                    }
                    if(_oldNode.rotation === -90 || _oldNode.rotation === 270) {
                        _newPosY = _newPosY + _deviation;
                        _newPosX = _newPosX - _oldNode.height/2 - this._mapDataTable[k].height/2;
                    }
                    else if(_oldNode.rotation === 90 || _oldNode.rotation === -270) {
                        _newPosY = _newPosY - _deviation;
                        _newPosX = _newPosX + _oldNode.height/2 + this._mapDataTable[k].height/2;
                    }
                    else if(Math.abs(_oldNode.rotation) === 180) {
                        _newPosY = _newPosY - _oldNode.height/2 - this._mapDataTable[k].height/2
                        _newPosX = _newPosX - _deviation;
                    }
                    else{
                        _newPosY = _newPosY + _oldNode.height/2 + this._mapDataTable[k].height/2
                        _newPosX = _newPosX + _deviation;
                    }
                    this._mapDataTable[k].rotation = _oldNode.rotation;

                    // cc.log(_newPosX + "  " + _newPosY)
                }
                else if(_oldNodeScript.get("type") === 2 || _oldNodeScript.get("type") === 3) {
                    cc.log("old类型是2,3,4")

                    if(_oldNode.scaleX == 1) {
                        this._mapDataTable[k].rotation = _oldNode.rotation - 90;
                    }
                    else {
                        this._mapDataTable[k].rotation = _oldNode.rotation + 90;
                    }

                    let _deviation = 0;
                    if(_oldNodeScript.get("type") === 3) {
                        if(_mapNodeScript.get("type") !== 3) {
                            if(this._mapDataTable[k].scaleX === _oldNode.scaleX) {
                                _deviation = 320 * this._mapDataTable[k].scaleX;
                            }
                            else {
                                _deviation = 320 * -this._mapDataTable[k].scaleX;
                            }
                        }
                        else{
                            if(this._mapDataTable[k].scaleX !== _oldNode.scaleX){
                                _deviation = 640 * -this._mapDataTable[k].scaleX;
                            }
                        }
                    }
                    cc.log("_deviation  " + _deviation)

                    cc.log("newNode " + this._mapDataTable[k].rotation)
                    if(this._mapDataTable[k].rotation === -90 || this._mapDataTable[k].rotation === 270) {
                        _newPosY = _newPosY + _deviation
                        _newPosX = _newPosX - _oldNode.height/2 - this._mapDataTable[k].height/2;
                    }
                    else if(this._mapDataTable[k].rotation === 90 || this._mapDataTable[k].rotation === -270) {
                        _newPosY = _newPosY - _deviation
                        _newPosX = _newPosX + _oldNode.height/2 + this._mapDataTable[k].height/2;
                    }
                    else if(Math.abs(this._mapDataTable[k].rotation) === 180) {
                        _newPosY = _newPosY - _oldNode.height/2 - this._mapDataTable[k].height/2 - _deviation;
                        _newPosX = _newPosX - _deviation
                    }
                    else {
                        _newPosY = _newPosY + _oldNode.height/2 + this._mapDataTable[k].height/2
                        _newPosX = _newPosX + _deviation;
                    }
                }
                cc.log(_newPosX + "  " + _newPosY)

                if(_mapNodeScript.get("type") === 2 || _mapNodeScript.get("type") === 3) {
                    cc.log("1111111111'")
                    //对转完类型判断 转完的旋转角如果朝下 就旋转成相反朝向 (目前只有类型2)
                    cc.log(this._mapDataTable[k].rotation + "  " + this._mapDataTable[k].scaleX)
                    if((this._mapDataTable[k].rotation == -90 && this._mapDataTable[k].scaleX == 1) || (this._mapDataTable[k].rotation == 90 && this._mapDataTable[k].scaleX == -1)){
                        //转完的旋转角如果朝下 就旋转成相反朝向
                        this._mapDataTable[k].scaleX = -this._mapDataTable[k].scaleX;

                        cc.log("222222222222'")
                        if(_mapNodeScript.get("type") === 3){
                            cc.log("3333333333333'")
                            _newPosY = _newPosY + 640
                        }
                    }
                }
                
                this._mapDataTable[k].setPosition(cc.p(_newPosX, _newPosY))
            }
            else{
                this._mapDataTable[k].setPosition(cc.p(0,0));
            }
            
            this._mapDataTable[k].active = true;
            this._mapDataTable[k].parent = this.node;
            cc.log("===================")
        }

        cc.log(this._mapDataTable.length)
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
