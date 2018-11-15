// pages/order-detail/detail.js
var { globalData } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: {
      "-1": "已取消",
      "1": "待付款",
      "2": "待确认",
      "7": "已完成"
    },
    orderData:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData({ id: options.orderId})
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
  },
  getData(params){
    globalData.evalOrderId = params.id
    wx.http.postReq('appletClient?m=findBuildingMaterialsOrderById', params, (res) => {
      let { success, value } = res;
      if (success) {
        this.setData({
          orderData: value
        })
      } else {
        wx.showToast({
          title: '出错了,请联系管理员',
        })
      }
    })
  },
  tel(e) { //打电话
    let phone = e.currentTarget.dataset.tel;
    console.log(phone)
    wx.makePhoneCall({
      phoneNumber: phone,
      success() {
        console.log(1)
      },
      fail() {
        console.log(2)
      }
    })
  },
  goPay(e) { // 支付
    globalData.orderDetail = this.data.orderData;
    wx.navigateTo({
      url: '../payment/payment',
    })
  },
  goEvaluate(e) { // 评价
    let record = e.currentTarget.dataset.record;
    globalData.orderDetail = record;
    globalData.evalOrderId = record.id
    globalData.evalImg = record.img
    wx.navigateTo({
      url: '../evaluateList/evaluateList',
    })
  },
})