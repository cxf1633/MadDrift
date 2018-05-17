cc.Class({
    extends: cc.Component,

    properties: {
        _data: null,
        _veer: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    set:function(name, value){
        this[name] = value;
    },

    get:function(name){
        return this[name];
    },

    // update (dt) {},
});
