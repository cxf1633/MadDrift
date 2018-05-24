cc.Class({
    extends: cc.Component,

    properties: {
        gameStartBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '开始游戏'
        },

        giveARewardBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '打赏'
        },

        rankingBtn: {
            default:null, 
            type:cc.Button,
            tooltip: '登陆界面排行榜'
        },

    },

    onLoad () {
        this.addClickEvent(this.gameStartBtn, this.node, "loginUI", "onGameStart");
        this.addClickEvent(this.giveARewardBtn, this.node, "loginUI", "onGiveAReward");
        this.addClickEvent(this.rankingBtn, this.node, "loginUI", "onRanking");
    },

    start () {
        this.changeBtnShow(false);
        this.wxLogin();
    },

    onGameStart(){        
        cc.log("开始游戏");
        cc.director.loadScene('Game');
    },

    onGiveAReward(){
        cc.log("打赏");
    },

    onRanking(){
        cc.log("排行榜");
    },

    wxLogin() {
        var wxnode = this;
        if(window.wx != undefined) {
            window.wx.login({
                success: function () {
                    window.wx.getUserInfo({
                        success: function (res) {
                            cc.log("res  " + res)
                            var userInfo = res.userInfo;
                            var nickName = userInfo.nickName;
                            var avatarUrl = userInfo.avatarUrl;
                            var gender = userInfo.gender;
                            var province = userInfo.province;
                            var city = userInfo.city;
                            var country = userInfo.country;
    
                            cc.log(userInfo);
                        },
                        fail: function (res) {
                            cc.log("res  " + res.errMsg)
                            // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                            if (res.errMsg.indexOf('auth deny') > -1 ||     res.errMsg.indexOf('auth denied') > -1 ) {
                                // 处理用户拒绝授权的情况
                                cc.log('授权失败')
                            }
                        },
                        complete: function (res) {
                            wxnode.changeBtnShow(true);
                        }
                    })
                }
            })
        }
        else {
            this.changeBtnShow(true);
        }
    },

    changeBtnShow(_isShow) {
        this.gameStartBtn.node.active = _isShow;
        this.giveARewardBtn.node.active = _isShow;
        this.rankingBtn.node.active = _isShow;
    },

    addClickEvent: function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
});
