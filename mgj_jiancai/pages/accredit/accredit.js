// pages/accredit/accredit.js
var app = getApp();
Page({
  getToken(key) {
    app.isInit(()=>{
      wx.login({ //登录
        success: ress => {
          wx.setStorageSync('codeWX', ress.code)
          var key = null
          wx.http.postReq('appletClient?m=appletLoginBefore', { code: ress.code }, (getKey) => { // 获取key
            if (getKey.success) {
              key = getKey.value.key;
              app.globalData.openId = key;
              //console.log(e.detail.userInfo)
              // 存储code
              wx.setStorageSync('code', key)
              wx.getUserInfo({
                success: function (e) {
                  wx.setStorageSync('wxInfo', e.userInfo)
                  var params = {
                    encryptedData: e.encryptedData,
                    iv: e.iv,
                    key,
                    code: key,
                    longitude: app.globalData.localPosition.longitude,
                    latitude: app.globalData.localPosition.latitude
                  };
                  wx.http.postReq('appletClient?m=appletLogin', params, (data) => {
                    //console.log(data)
                    if (data.success) {
                      if (app.globalData.isLoginId) {
                        wx.navigateTo({
                          url: app.globalData.isLoginUrl
                        });
                      } else {
                        wx.switchTab({
                          url: '../index/index',
                        });
                      }
                      /**
                       *
                      wx.navigateBack({
                        delta: 2
                      })
                      */
                      /*wx.redirectTo({
                        url: '/pages/user/index'
                      })*/
                      // 存储登录信息
                      app.globalData.userInfo = data.value
                      wx.setStorageSync('userInfo', data.value)
                      app.globalData.userInfo = wx.getStorageSync("userInfo")
                      wx.setStorageSync('token', data.value.token)
                    }
                  })
                }
              })
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
          })
        }
      })
    })
  },
  login(ee) {
    if (ee.detail.errMsg === "getUserInfo:ok") {
      this.getToken()
    } else {
      wx.showModal({
        title: '授权失败',
        showCancel: false
      })
    }
    return false
    // 登录
  },
  /**
   * 页面的初始数据
   */
  data: {
    isShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          _this.getToken();
          return false
          if (wx.getStorageSync('token')) {
            wx.switchTab({
              url: '../index/index',
            });
          }
        }
        _this.setData({
          isShow:true
        })
      }
    })
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