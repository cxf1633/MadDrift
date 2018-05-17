
cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node
        },
    },
    
    update (dt) {
        if (!this.target) return;
        this.node.position = this.target.position;
    },
});
