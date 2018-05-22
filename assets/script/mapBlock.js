var DIRECTION = {
    UP:0,
    DOWN:2,
    LEFT:-1,
    RIGHT:1,
}
//地图块
var mapBlock = cc.Class({
    properties: {
        _id:0,
        _dir:0,
        _type:null,
        _root:null,
    },
    init(blockType, blockPrefab){
        this._type = blockType;
        this._root = cc.instantiate(blockPrefab);
    },

    setPosAndDir(lastObj){
        //随机直线类型长度
        if(this._type == 0){
            // let _random = this.getRandom(6, 20) * 100;
            //this._root.height = 1500;
        }
        else{
            this._root.scaleX = this._dir;
        }
        //第一块
        if (lastObj == null) {
            this._root.setPosition(cc.p(-320, 0));
        }
        else{
            let lastX = lastObj._root.x;
            let x = lastX;
            let lastY = lastObj._root.y;
            let y = lastY;
            let _quadrant = 0;
            //前一个是直线
            if (lastObj._type == 0) {
                if(lastObj._root.rotation === -90 || lastObj._root.rotation === 270) {
                    _quadrant = 3;
                    x = x - lastObj._root.height;
                }
                else if(lastObj._root.rotation === 90 || lastObj._root.rotation === -270) {
                    _quadrant = 1;
                    x = x + lastObj._root.height;
                }
                else if(Math.abs(lastObj._root.rotation) === 180) {
                    _quadrant = 4;
                    y = y - lastObj._root.height;
                }
                else{
                    _quadrant = 2;
                    y = y + lastObj._root.height;
                }
                //继承直线的旋转角度
                this._root.rotation = lastObj._root.rotation;
            }
            //前一个是弯道
            else{
                //根据弯道scale反转 对新地图块进行角度旋转
                this._root.rotation = lastObj._root.rotation + 90*lastObj._root.scaleX;
                if(lastObj._root.rotation === -90 || lastObj._root.rotation === 270) {
                    _quadrant = 2;
                    x = x - lastObj._root.width;
                    y = y + lastObj._root.height * lastObj._root.scaleX;
                }
                else if(lastObj._root.rotation === 90 || lastObj._root.rotation === -270) {
                    _quadrant = 4;
                    x = x + lastObj._root.width;
                    y = y - lastObj._root.height * lastObj._root.scaleX;
                }
                else if(Math.abs(lastObj._root.rotation) === 180) {
                    _quadrant = 3;
                    x = x - lastObj._root.width * lastObj._root.scaleX;
                    y = y - lastObj._root.height;
                }
                else {
                    _quadrant = 1;
                    x = x + lastObj._root.width * lastObj._root.scaleX;
                    y = y + lastObj._root.height;
                }
            }
            //对玩到类型进行判断 如果新地图块转向角朝下 使其反转(新地图块不能朝下)
            if(this._type === 1 || this._type === 2 || this._type === 3) {
                //对转完类型判断 转完的旋转角如果朝下 就旋转成相反朝向 (目前只有类型2)
                if((this._root.rotation == -90 && this._root.scaleX == -1) || (this._root.rotation == 90 && this._root.scaleX == 1)){
                    //转完的旋转角如果朝下 就旋转成相反朝向
                    this._root.scaleX = -this._root.scaleX;
                }
            }
            //新旧地图块反转不同的情况下 说明地块有偏差值(偏差值都为640) 根据前面定义的象限_quadrant进行不同方向的位移
            if(this._root.scaleX !== lastObj._root.scaleX && _quadrant !== null) {
                //cc.log("象限: " + _quadrant);
                if(_quadrant === 1) {
                    y = y - 640;
                }
                else if(_quadrant === 2) {
                    x = x + 640;
                }
                else if(_quadrant === 3) {
                    y = y + 640;
                }
                else if(_quadrant === 4) {
                    x = x - 640;
                }
            }
            //cc.log("x ==>", x, "y===", y);
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