//地图块
var mapBlock = cc.Class({
    properties: {
        _id:0,
        _dir:0,
        _bScaleX:true,
        _type:null,
        _root:null,
        _score:0,

        _originPos:null,//弯道的圆心
        _oppoPos:null,//对角的位置
        _trackPos:null,//赛道的位置
        
        _startAngle:0,
        _endAngle:0,
    },
    init(blockType, blockPrefab){
        this._type = blockType;
        this._root = cc.instantiate(blockPrefab);
    },
    initConfig(config){
        this._id = config.id;
        this._dir = config.dir;
        this._bScaleX = config.scaleX;
        this._score = config.score;
        this._root.active = true;
    },
    
    initPosInfo(){
        let root = this._root;
        //50是边的缝隙，540是路宽
        let offset = 50 + 540/2;
        //右
        if(root.rotation === 90 || root.rotation === -270) {
            if (this._type == 0) {
                this._trackPos = cc.v2(root.x, root.y - offset);
                this._oppoPos = cc.v2(root.x + root.height, root.y - root.width);
            }
            else{
                this._originPos = cc.v2(root.x, root.y - root.width*root.scaleX);
                this._trackPos = cc.v2(root.x, root.y - offset*root.scaleX);
                this._oppoPos = cc.v2(root.x + root.height, root.y - root.width*root.scaleX);

                this._startAngle = cc.pToAngle(cc.pSub(this._trackPos, this._originPos));
            }
        }
        //左
        else if(root.rotation === -90 || root.rotation === 270) {
            if (this._type == 0) {
                this._trackPos = cc.v2(root.x, root.y + offset);
                this._oppoPos = cc.v2(root.x - root.height, root.y + root.width);
            }
            else{
                this._originPos = cc.v2(root.x, root.y + root.width*root.scaleX);
                this._trackPos = cc.v2(root.x, root.y + offset*root.scaleX);
                this._oppoPos = cc.v2(root.x - root.height, root.y + root.width*root.scaleX);

                this._startAngle = cc.pToAngle(cc.pSub(this._trackPos, this._originPos));
            }
        }
        //下
        else if(Math.abs(root.rotation) === 180) {
            if (this._type == 0) {
                this._trackPos = cc.v2(root.x - offset, root.y);
                this._oppoPos = cc.v2(root.x - root.width, root.y - root.height);
            }
            else{
                this._originPos = cc.v2(root.x - root.width*root.scaleX, root.y);
                this._trackPos = cc.v2(root.x - offset*root.scaleX, root.y);
                this._oppoPos = cc.v2(root.x - root.width*root.scaleX, root.y - root.height);

                this._startAngle = cc.pToAngle(cc.pSub(this._trackPos, this._originPos));
            }
        }
        //上
        else{
            if (this._type == 0) {
                this._trackPos = cc.v2(root.x + offset, root.y);
                this._oppoPos = cc.v2(root.x + root.width, root.y + root.height);
            }
            else{
                this._originPos = cc.v2(root.x + root.width*root.scaleX, root.y);
                this._trackPos = cc.v2(root.x + offset*root.scaleX, root.y);
                this._oppoPos = cc.v2(root.x + root.width*root.scaleX, root.y + root.height);

                this._startAngle = cc.pToAngle(cc.pSub(this._trackPos, this._originPos));
            }
        }
    },
    setPosAndDir(lastObj){
        if(this._type != 0){
            this._root.scaleX = this._dir;
        }
        //第一块
        if (lastObj == null) {
            this._root.setPosition(cc.p(-320, -1280));
            return;
        }

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
            this._root.rotation = this._root.rotation%360;
        }
        //前一个是弯道
        else{
            //根据弯道scale反转 对新地图块进行角度旋转
            this._root.rotation = lastObj._root.rotation + 90*lastObj._root.scaleX;
            this._root.rotation = this._root.rotation%360;
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
            if(this._bScaleX){
                //对转完类型判断 转完的旋转角如果朝下 就旋转成相反朝向 (目前只有类型2)
                if((this._root.rotation == -90 && this._root.scaleX == -1) || (this._root.rotation == 90 && this._root.scaleX == 1)){
                    //转完的旋转角如果朝下 就旋转成相反朝向
                    this._root.scaleX = -this._root.scaleX;
                }
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
        //cc.log(this._root.rotation);
        //cc.log("x ==>", x, "y===", y);
        this._root.setPosition(cc.p(x, y));
    },

    //
    removeFromParent(){
        if (this._root._parent != null) {
            this._root.removeFromParent();
        }
    }
});

module.exports = mapBlock;