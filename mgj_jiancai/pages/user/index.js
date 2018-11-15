// pages/user/index.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    info:null,
    couponsCount: 0,
    platformRedBagCount: 0,
    userInfo: null,
    phone: null
  },
  tel(e) { //打电话
    let phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
      success() {
      },
      fail() {
      }
    })
  },
  getCoupon() {
    let param = {
      businessType: 12,
    }
    wx.http.postReq('appletClient?m=findUserCenter', param, (data) => {
      if (data.success) {
        this.setData({
          info: data.value
        })
      }
    }, true)
  },
  getCollec() {
    var param = {
      isDisabled: 0,
      businessType: 12,
      start: 0,
      size: 10,
    }
    wx.http.postReq('userClient?m=queryRedBagList', param, (data) => {
      if (data.success) {
        this.setData({
          platformRedBagCount: data.value.platformRedBagCount
        })
      }
    })
  },
  getPhoneNumber(e) {
    let params = {
      userId: app.globalData.userInfo.id,
      mobile: 15111111111
    }

    wx.http.postReq('appletClient?m=bindingMobile', params, (res) => {
      let { success, value } = res;
      if (success) {
        wx.setStorageSync('token', value.token)
        app.globalData.token = value.token
      } 
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCoupon();
    let _this = this
    let userInfo = wx.getStorageSync('wxInfo')
    userInfo.balance = wx.getStorageSync('userInfo').balance
    userInfo.mobile = wx.getStorageSync('userInfo').mobile
    //userInfo.redBagCount = wx.getStorageSync('userInfo').redBagCount
    //userInfo.couponsCount = wx.getStorageSync('userInfo').couponsCount
    this.setData({
      userInfo
    })
    if (!userInfo) {
      wx.navigateTo({
        url: '../user-login/index'
      });
      return false
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let userInfo = wx.getStorageSync('wxInfo')
    userInfo.balance = wx.getStorageSync('userInfo').balance
    userInfo.redBagCount = wx.getStorageSync('userInfo').redBagCount
    userInfo.couponsCount = wx.getStorageSync('userInfo').couponsCount
    userInfo.mobile = wx.getStorageSync('userInfo').mobile
    this.setData({
      userInfo,
      phone: app.globalData.phone
    }) 
    this.getCoupon();  
  },
})