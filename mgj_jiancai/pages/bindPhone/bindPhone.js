// pages/bindPhone/bindPhone.js
var app = getApp();
Page({
  data: {
    phone: "",
    code: "",
    disabled:false,
    currentTime:60,
    time: 60,
  },
  //验证码倒计时函数
  getYZM(options) {
    var that = this;
    var currentTime = that.data.currentTime;
    if (this.data.phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号!',
        icon: 'none'
      })
    }
    that.setData({
      disabled: true,
      time: currentTime + '秒'
    })
    let interval = setInterval(function () {
      that.setData({
        time: (currentTime - 1) + '秒'
      })
      currentTime--;
      if (currentTime <=
        0) {
        clearInterval(interval)
        that.setData({
          time: '重新获取',
          currentTime: 60,
          disabled: false
        })
      }
    }, 1000)


    let param = {
      mobile: that.data.phone
    }
    wx.http.postReq('appletClient?m=sendRegisterSms', param, (res) => {
      if (res.success) {

        wx.showToast({
          title: '验证码已发送！',
          icon: 'none'
        })
      }
    })
  },
  getPhoneNumber() { //绑定手机号
    if (this.data.phone.code !== 6) {
      wx.showToast({
        title: '请输入正确的验证码!',
        icon: 'none'
      })
    }
    let params = {
      userId: app.globalData.userInfo.id,
      mobile: this.data.phone,
      code: this.data.code
    }
    wx.http.postReq('appletClient?m=bindingMobile', params, (res) => {
      let { success, value } = res;
      if (success) {
        wx.setStorageSync('token', value.token)
        app.globalData.token = value.token

        let userInfo = wx.getStorageSync('userInfo')
        userInfo.mobile = this.data.phone
        wx.setStorageSync('userInfo', userInfo)
        wx.showToast({
          title: '绑定成功！',
          icon: 'none'
        })
        if (app.globalData.addressSel && (app.globalData.addressSel.longitude || app.globalData.addressSel.location.lng) || app.globalData.localPosition.longitude) {
          this.receiveRed();

        }
        wx.switchTab({
          url: '../user/index'
        });
      }
    })
  },
  // 拿到手机号
  getPhone(e) {
    var val = e.detail.value;
    this.setData({
      phone: val
    });
  },
  // 拿到手机号
  getCode(e) {
    var val = e.detail.value;
    this.setData({
      code: val
    });
  },
  //领取红包
  receiveRed() {
    var param = {
      businessType: 12,
      longitude: app.globalData.addressSel && (app.globalData.addressSel.longitude || app.globalData.addressSel.location.lng) || app.globalData.localPosition.longitude,
      latitude: app.globalData.addressSel && (app.globalData.addressSel.latitude || app.globalData.addressSel.location.lat) || app.globalData.localPosition.latitude
    }
    let isLogin = wx.getStorageSync('userInfo').mobile
    wx.http.postReq('userClient?m=getPlatformRedBag', param, (data) => {
    }, true)
  },
})