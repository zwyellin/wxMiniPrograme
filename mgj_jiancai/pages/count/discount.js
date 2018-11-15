// pages/discount/discount.js
let { globalData, isLogin } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:null
  },
  getInit(id){
    let param = {
      businessType: 12,
      agentId: id || globalData.agentId
    }
    globalData.shardAgentId = globalData.agentId
    wx.http.postReq('appletClient?m=findCouponsAllByBusinessType', param, (data) => {
      if (data.success) {
        var list = data.value;
        this.setData({
          list
        })
      }
    })
  },
  receive(e) { //领取
    let couponsRulesId = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let isReceive = e.currentTarget.dataset.receive;
    if (!isReceive){
      wx.http.postReq('/appletClient?m=getCouponsGetRecord', { couponsRulesId }, (data) => {
        if (data.success) {
          wx.showToast({
            title: '领取成功',
            icon: 'none'
          })
          let list = this.data.list
          list[index].couponsList = list[index].couponsList.map(i => {
            if (i.id === couponsRulesId) {
              i.isReceive = 1
            }
            return i
          })
          this.setData({
            list
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    isLogin(options.id, '/pages/count/discount?id=', () => {
      this.getInit(options.id || null);
    })
    /**
     * if (options.longitude) {
      globalData.localPosition.longitude = options.longitude
      globalData.localPosition.latitude = options.latitude
    }
     */
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let _this = this;
    return {
      title: '马管家建材',
      path: '/pages/count/discount?id=' + globalData.shardAgentId
      // + '&longitude=' + _this.globalData.localPosition.longitude + '&latitude' + _this.globalData.localPosition.latitude      
    }
  }
})