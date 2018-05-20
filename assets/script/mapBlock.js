var DIRECTION = {
    UP:0,
    DOWN:2,
    LEFT:-1,
    RIGHT:1,
}
//地图块
var mapBlock = cc.Class({
    properties: {


        _roadPos:0,
        _leftPos:0,
        _rightPos:0,

        _nextRota:0,

        _dirNum:0,
        _curDir:cc.v2,

        _root:null,
    },
    init(blockType, blockPrefab){
        //cc.log("mapBlock init blockType =", blockType);
        this._root = cc.instantiate(blockPrefab);
        //默认方向朝上
        this._curDir = cc.v2(0, 1);
        if (blockType == 1) {
            this._leftPos = 50;
            this._rightPos = 590;   
            this._roadPos = 320;
        }
        //所有的弯道默认图片是由下往上，往右边弯曲
        else if(blockType == 2){
            this._leftPos = 640 - 50;
            this._rightPos = 640 - 50 - 540;
            this._roadPos = 320;
        }
        else if(blockType == 3){
            this._leftPos = 1280 - 50;          
            this._rightPos = 1280 - 50 - 540;    
            this._roadPos = 320;
        }
        else if(blockType == 4){
            this._leftPos = 1920 - 50;
            this._rightPos = 1920 - 50 - 540;
            this._roadPos = 320;
        }
    },
    //设置位置和旋转图片
    setPosAndDir(dir, lastObj){        
        if (lastObj == null) {
            this._nextRota = dir * 90;
            this._dirNum = dir;
            this._root.setPosition(cc.p(0, 0));
        }
        else{
            this._root.rotation = lastObj._nextRota;
            this._nextRota = lastObj._nextRota + dir * 90;
            //this._root.rotation += dir * 90;
            if (dir != 0) {
                let scaleX = this._root.getScaleX() * dir;
                let scaleY = this._root.getScaleY();
                this._root.setScale(scaleX, scaleY);
                let realdir = lastObj._dirNum%4;
                if (realdir < 0) {
                    realdir = 4 + realdir;
                }
                if (realdir == 0) {
                    this._curDir = cc.v2(0, 1);
                }
                else if(realdir == 1){
                    this._curDir = cc.v2(1, 0);
                }
                else if(realdir == 2){
                    this._curDir = cc.v2(0, -1);
                }
                else if(realdir == 3){
                    this._curDir = cc.v2(-1, 0);
                }
                else{
                    cc.log("方向设置错误");
                }
                this._dirNum = lastObj._dirNum + dir;
            }
            //let position = cc.p(lastObj._position.x + lastObj._roadDir.x*this._root.width,  lastObj._position.y +  lastObj._roadDir.y*this._root.height);
            let posX = lastObj._root.x + this._curDir.x * lastObj._root.width/2 + this._curDir.x * this._root.width/2;
            let posY = lastObj._root.y + this._curDir.y * lastObj._root.height/2 + this._curDir.y * this._root.height/2;
            //let position = cc.p(0, lastObj._root.y + this._root.height);
            this._root.setPosition(cc.p(posX, posY));
        }
    },

    //
    removeFromParent(){
        if (this._root._parent != null) {
            this._root.removeFromParent();
        }
    }
});

module.exports = mapBlock;