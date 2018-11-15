// pages/classifyDetaile/classifyDetaile.js
var app = getApp();
Page({
  data: {
    commodityData:[]
  },
  getInit(id){
    var param = {
      agentId: app.globalData.agentId,
      id:parseInt(id)
    }
    wx.http.postReq('appletClient?m=findUserClassificationInfo', param, (res) => {
      if (res.success) {
        var commodityData = res.value;
        this.setData({
          commodityData
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInit(options.id)
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