var DIRECTION = {
    UP:0,
    DOWN:2,
    LEFT:-1,
    RIGHT:1,
}
//地图块
var mapBlock = cc.Class({
    properties: {
        _leftPos:0,
        _rightPos:0,
        _nextRoadPos:cc.v2,

        _nextRota:0,
        _dirNum:0,
        _curDir:cc.v2,

        _blockType:null,
        _nextDir:cc.v2,

        _forwardDir:0,

        _startDir:0,
        _endDir:0,
        _root:null,
    },
    init(blockType, blockPrefab){
        this._blockType = blockType;
        this._root = cc.instantiate(blockPrefab);
        //直线
        if (blockType == 0) {
            this._leftPos = 50;
            this._rightPos = 590;
            this._startPos = cc.v2(0, -320);
            this._endPos = cc.v2(0, 320);
        }
        //所有的弯道默认图片是由下往上，往右边弯曲
        else if(blockType == 1){
            this._leftPos = 640 - 50;
            this._rightPos = 640 - 50 - 540;
            this._startPos = cc.v2(640 - 320, 0);
            this._endPos = cc.v2(640, 320);
        }
        else if(blockType == 2){
            this._leftPos = 1280 - 50;
            this._rightPos = 1280 - 50 - 540;
            this._nextRoadPos = cc.v2(1280, 1280 -320);
        }
        else if(blockType == 3){
            this._leftPos = 1920 - 50;
            this._rightPos = 1920 - 50 - 540;
            this._nextRoadPos = cc.v2(1920, 1920 -320);
        }
    },

    setPosAndDir(dir, lastObj){
        //设置长度
        if(this._blockType == 0){
            // let _random = this.getRandom(6, 20) * 100;
            // this._root.height = _random;
        }
        else{
            this._root.scaleX = dir;
        }
        //第一块
        if (lastObj == null) {
            this._root.setPosition(cc.p(320, -320));
        }
        else{
            let lastX = lastObj._root.x;
            let x = lastX;
            let lastY = lastObj._root.y;
            let y = lastY;
            let _quadrant = 0;
            //前一个是直线
            if (lastObj._blockType == 0) {
                if(lastObj._root.rotation === -90 || lastObj._root.rotation === 270) {
                    _quadrant = 2;
                    x = x - lastObj._root.height;
                }
                else if(lastObj._root.rotation === 90 || lastObj._root.rotation === -270) {
                    _quadrant = 4;
                    x = x + lastObj._root.height;
                }
                else if(Math.abs(lastObj._root.rotation) === 180) {
                    _quadrant = 3;
                    y = y - lastObj._root.height;
                }
                else{
                    _quadrant = 1;
                    y = y + lastObj._root.height;
                }
                //继承直线的旋转角度
                this._root.rotation = lastObj._root.rotation;
            }
            //前一个是弯道
            else{
                if(lastObj._root.scaleX == 1) {
                    this._root.rotation = lastObj._root.rotation - 90;
                }
                else {
                    this._root.rotation = lastObj._root.rotation + 90;
                }

                cc.log("lastObj._root.rotation: " + lastObj._root.rotation);
                if(lastObj._root.rotation === -90 || lastObj._root.rotation === 270) {
                    _quadrant = 3;
                    x = x - lastObj._root.width;
                    y = y - lastObj._root.height * lastObj._root.scaleX;
                }
                else if(lastObj._root.rotation === 90 || lastObj._root.rotation === -270) {
                    _quadrant = 1;
                    x = x + lastObj._root.width;
                    y = y + lastObj._root.height * lastObj._root.scaleX;
                }
                else if(Math.abs(lastObj._root.rotation) === 180) {
                    _quadrant = 4;
                    x = x + lastObj._root.width * lastObj._root.scaleX;
                    y = y - lastObj._root.height;
                }
                else {
                    _quadrant = 2;
                    x = x - lastObj._root.width * lastObj._root.scaleX;
                    y = y + lastObj._root.height;
                }
            }
            if(this._root.scaleX !== lastObj._root.scaleX && _quadrant !== null) {
                cc.log("象限: " + _quadrant);
                if(_quadrant === 1) {
                    x = x - 640;
                }
                else if(_quadrant === 2) {
                    y = y - 640;
                }
                else if(_quadrant === 3) {
                    x = x + 640;
                }
                else if(_quadrant === 4) {
                    y = y + 640;
                }
            }
            cc.log("x ==>", x, "y===", y);
            this._root.setPosition(cc.p(x, y))
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