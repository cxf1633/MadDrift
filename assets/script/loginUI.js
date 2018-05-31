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

        _rank: null,
    },

    onLoad () {
        // if (window.wx != undefined) {
        //     window.wx.showShareMenu({withShareTicket: true});//设置分享按钮
        //     cc.loader.loadRes("texture/share",function(err,data){
        //         wx.onShareAppMessage(function(res){
        //             return {
        //                 title: "不怕，就来PK！",
        //                 imageUrl: data.url,
        //                 success(res){
        //                     console.log("转发成功!!!")
        //                     common.diamond += 20;
        //                 },
        //                 fail(res){
        //                     console.log("转发失败!!!")
        //                 } 
        //             }
        //         })
        //     });
        // }
        this._rank = cc.find("Canvas/rankUI");
        this._rank.active = false;
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
        this._rank.active = true;
        this.node.active = false;
        this._rank.getComponent('rankUI').getOldNode(this.node);
    },

    wxLogin() {
        var wxnode = this;
        if(window.wx != undefined) {
            window.wx.login({
                success: function () {
                    wxnode.changeBtnShow(true);
                    // window.wx.getUserInfo({
                    //     success: function (res) {
                    //         cc.log("res  " + res)
                    //         var userInfo = res.userInfo;
                    //         var nickName = userInfo.nickName;
                    //         var avatarUrl = userInfo.avatarUrl;
                    //         var gender = userInfo.gender;
                    //         var province = userInfo.province;
                    //         var city = userInfo.city;
                    //         var country = userInfo.country;
    
                    //         cc.log(userInfo);
                    //     },
                    //     fail: function (res) {
                    //         cc.log("res  " + res.errMsg)
                    //         // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                    //         if (res.errMsg.indexOf('auth deny') > -1 ||     res.errMsg.indexOf('auth denied') > -1 ) {
                    //             // 处理用户拒绝授权的情况
                    //             cc.log('授权失败')
                    //         }
                    //     },
                    //     complete: function (res) {
                    //         wxnode.changeBtnShow(true);
                    //     }
                    // })
                }
            })
        }
        else {
            this.changeBtnShow(true);
        }
    },

    changeBtnShow(_isShow) {
        this.gameStartBtn.node.active = _isShow;
        // this.giveARewardBtn.node.active = _isShow;
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
