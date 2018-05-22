
cc.Class({
    extends: cc.Component,

    properties: {
        canvas: cc.Node,
        map:cc.Node,
        touchLocationDisplay: cc.Label,
    },
    curPos:null,
    onLoad () {
        var self = this;
        self.isMoving = false;
        self.canvas.on(cc.Node.EventType.TOUCH_START, function (event) {self.touchBegin.call(self,event)}, self.node);
        self.canvas.on(cc.Node.EventType.TOUCH_MOVE, function (event) {self.touchMove.call(self,event)}, self.node);
        self.canvas.on(cc.Node.EventType.TOUCH_END, function (event) {self.touchEnd.call(self,event)}, self.node);
        this.mapMgr = this.map.getComponent("mapMgr");
        this.gameMgr = this.node.getComponent("gameMgr");
    },
    touchBegin(event){
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this.curPos = touchLoc;
    },
    touchMove(event){
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        var offseX = touchLoc.x - this.curPos.x;
        var offseY = touchLoc.y - this.curPos.y;
        if(Math.abs(offseX) < 1 && Math.abs(offseY) < 1) return;
        this.curPos = touchLoc;
        if (!this.gameMgr._isStart) {
            var mapPos = this.mapMgr.node.getPosition();
            var pos = cc.p(mapPos.x + offseX, mapPos.y + offseY);
            this.mapMgr.node.setPosition(pos);
        }
    },
    touchEnd(event){
        this.isMoving = false;
    }
});
