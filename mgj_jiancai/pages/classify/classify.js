// pages/classify/classify.js
var app = getApp();
Page({
  data: {
    id:null,
    leftData: [],
    rightData:[],
    classify: [],
    longitude: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();
  },
  getList(id=0) {
    var param = {
      agentId: app.globalData.agentId,
      parentId: id,
      longitude: app.globalData.localPosition.longitude,
      latitude: app.globalData.localPosition.latitude
    }
    wx.http.postReq('appletClient?m=findUserClassification', param, (res) => {
      if (res.success) {
        var leftData = res.value.oneCategoryList;
        var classify = res.value.twoCategoryList;
        var rightData = res.value.merchantList;
        this.setData({
          longitude:app.globalData.localPosition.longitude,
          id: id !== 0 ? id : res.value.oneCategoryList[0].id || 0,
          leftData,
          classify,
          rightData,
          allClassify: classify
        })
      }
    })
  },
  changeClassify(e){
    let id=e.currentTarget.dataset.id;
    let allClassify = this.data.allClassify;
    this.getList(id)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.longitude !== app.globalData.localPosition.longitude) {
      this.getList();
    }
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