
cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node
        },
    },
    start(){
        this.normalUpdate();
    },
    normalUpdate (dt) {
        if (!this.target) return;
        this.node.position = this.target.position;
    },
});
