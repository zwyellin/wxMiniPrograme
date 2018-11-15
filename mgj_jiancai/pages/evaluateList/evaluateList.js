// pages/evaluateList/evaluateList.js
var { globalData } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:[]
  },
  getData(params) {
    wx.http.postReq('appletClient?m=findBuildingMaterialsOrderById', params, (res) => {
      let { success, value } = res;
      let dataList = value.buildingMaterialsOrderItemList
      dataList = dataList.filter(item=>{
        return item.hasComments !== 1
      })
      if (success) {
        if (!dataList || dataList.length===0) {
          wx.showToast({
            title: '没有可以评价的商品！',
            icon: 'none'
          })
          wx.navigateBack({
            delta: 1
          })
        }
        this.setData({
          dataList
        })
      }
    })
  },
  evaluates(e) {
    let img = e.currentTarget.dataset.img;
    let id = e.currentTarget.dataset.id;
    globalData.evalId = id
    globalData.evalImg = img
    wx.navigateTo({
      url: '../evaluate/evaluate'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData({ id: globalData.evalOrderId })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData({ id: globalData.evalOrderId })
  },
})