var http = require('./request/request.js')
wx.http = http
//app.js
App({
  /**
  // 获取经纬度
  getlocation() {
    var _this = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        //console.log(!wx.getStorageSync('localPosition'))
        //if (!wx.getStorageSync('localPosition')) {
          _this.globalData.localPosition = res;
          wx.setStorageSync('localPosition', res)
        //}
        console.log(res)
        wx.http.postReq('appletClient?m=findAgentByUserXY', {
          longitude: _this.globalData.localPosition.longitude,
          latitude: _this.globalData.localPosition.latitude
        }, (data) => {
          _this.globalData.agentId = data.value && data.value.id
          wx.setStorageSync('agentId', data.value && data.value.id)
          //wx.setStorageSync('localPosition', res)
          //_this.globalData.localPosition = wx.getStorageSync('localPosition');
        })
      },
      fail(err) {
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        })
      }
    })
  },
   */
  // 是否可以请求数据 需要获取用户地理位置
  isInit(cb){
    var _this = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        _this.globalData.localPosition = _this.globalData.localPosition || res;
        wx.http.postReq('appletClient?m=findAgentByUserXY', {
          longitude: _this.globalData.localPosition.longitude,
          latitude: _this.globalData.localPosition.latitude
        }, (data) => {
          //_this.globalData.userInfo = data.value && data.value.id 
          _this.globalData.agentId = data.value && data.value.id
          _this.globalData.phone = data.value && data.value.phone
          wx.setStorageSync('agentId', data.value && data.value.id)
          //if (!wx.getStorageSync('localPosition')) {
            //_this.globalData.localPosition = res;
            //wx.setStorageSync('localPosition', res)
          //}
          //wx.setStorageSync('localPosition', res)
          //_this.globalData.localPosition = wx.getStorageSync('localPosition');
          //console.log(_this.globalData)
          cb && cb(res)
        })
      },
      fail(err) {
        wx.showModal({
          showCancel: false,
          title: '用户未授权',
          content: '如需正常使用马管家小程序功能，请进入小程序设置界面，勾选地理位置并点击确定。',
        })
      }
    })
  },
  isMobile(cb){ //是否绑定手机号
    let mobile = wx.getStorageSync('userInfo').mobile
    if (!mobile){
      wx.showToast({
        title: '没有绑定手机号，去绑定！',
        icon: 'none'
      })
      setTimeout(()=>{
        wx.navigateTo({
          url: '../bindPhone/bindPhone'
        });
      },500)
      return false;
    }else{
      cb();
    }
  },
  isLogin(id, url, cb) {
    this.globalData.isLoginId = id;
    this.globalData.isLoginUrl = url+id;
    let _this = this
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          if (!wx.getStorageSync('token')) {
            wx.navigateTo({
              url: '../accredit/accredit',
            });
          } else {
            cb();
          }
        } else {
          wx.navigateTo({
            url: '../accredit/accredit',
          });
        }
      }
    })
  },
  onLaunch: function () {
    this.isInit();
    //this.globalData.userInfo = wx.getStorageSync('userInfo');
    //this.globalData.localPosition = wx.getStorageSync('localPosition');
    this.globalData.userInfo = wx.getStorageSync('userInfo')
    //console.log(this.globalData.userInfo)
    /*if (!this.globalData.userInfo || !wx.getStorageSync('wxInfo')){
      wx.navigateTo({
        url: '/pages/accredit/accredit'
      });
    }*/
  },
  globalData: {
    localPosition: null,
    userInfo: wx.getStorageSync('userInfo') || null,
    isRed:false,
    cart:[],
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '马管家建材',
      path: '/pages/accredit/accredit'
    }
  }
})