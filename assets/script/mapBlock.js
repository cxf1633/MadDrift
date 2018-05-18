var DIRECTION = {
    NONE:0,
    UP:1,
    DOWN:2,
    LEFT:3,
    RIGHT:4,
}
//地图块
var mapBlock = cc.Class({
    properties: {
        _position:cc.p(0, 0),
        _rotation:0,
        _roadPos:0,
        _leftPos:0,
        _rightPos:0,
    
        _roadDir:null,

        _root:null,
    },
    init(blockType, blockPrefab){
        cc.log("mapBlock init blockType =", blockType);
        this._root = cc.instantiate(blockPrefab);
        if (blockType == 1) {
            this._leftPos = 50;
            this._rightPos = 590;
            this._roadPos = 320;
            this._enterDir = DIRECTION.UP;
            this._outDir = DIRECTION.UP;
        }
        //所有的弯道都是往上进入 往左弯曲
        else if(blockType == 2){
            this._leftPos = 50;
            this._rightPos = 590;
            this._roadPos = 320;
            this._enterDir = DIRECTION.UP;
            this._outDir = DIRECTION.LEFT;
        }
        else if(blockType == 3){
            this._enterDir = DIRECTION.UP;
            this._outDir = DIRECTION.LEFT;
        }
        else if(blockType == 4){
            this._enterDir = DIRECTION.UP;
            this._outDir = DIRECTION.LEFT;
        }
    },
    setPosition(lastObj){

        let position = cc.p(lastObj._position.x + lastObj._roadDir.x*this._root.width,  lastObj._position.y +  lastObj._roadDir.y*this._root.height);
        this._position = position;
        this._root.setPosition(position);
    },
    setDirection(dir){
        let scaleX = this._root.getScaleX() * dir;
        let scaleY = this._root.getScaleY();
        this._root.setScale(scaleX, scaleY);
        this._roadDir = cc.p(dir, 0);
    },
    //
    removeFromParent(){
        if (this._root._parent != null) {
            this._root.removeFromParent();
        }
    }
});

module.exports = mapBlock;