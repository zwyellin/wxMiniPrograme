// pages/discount/discount.js
let WxParse = require('../../wxParse/wxParse.js');
let { globalData, isLogin } = getApp();
Page({
  data: {
    info:null
  },
  getInit(id){
      wx.http.postReq('/appletClient?m=findBuildingMaterialsActivity', { id }, (data) => {
      if (data.success) {
        let info = data.value
        this.setData({
          info: data.value
        })
        WxParse.wxParse('info', 'html', info.content, this);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    isLogin(options.id, '/pages/discount/discount?id=', () => {
      this.setData({
        id: options.id
      })
      this.getInit(options.id)
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '马管家建材',
      path: '/pages/discount/discount?id=' + this.data.id
    }
  }
})