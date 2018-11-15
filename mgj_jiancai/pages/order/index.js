var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    info:[],
    isLoading:false,
    status: {
      "-1": "已取消",
      "1": "待付款",
      "2": "待确认",
      "7": "已完成"
    },
    page: { //分页
      limit: 10,
      start: 0,
      isMore: true
    },
  },
  onUnload: function () {
    wx.reLaunch({
      url: '../user/index'
    })
  },
  getList(types) {
    let page = this.data.page
    var params = {
      userId: app.globalData.userInfo.id,
      start: types ? 0 : this.data.page.start,
      limit: this.data.page.limit
    };
    wx.http.postReq('appletClient?m=findBuildingMaterialsOrderList', params, (data) => {
      if (data.success) {
        let info = this.data.info
        if (data.value.length > 0) {
          info = types ? data.value : [...info, ...data.value]
        }
        if (data.value.length >= this.data.page.limit) {
          page.start = types ? 0 : page.start + 10;
          page.isMore = true;
        } else {
          page.isMore = false;
        }
        this.setData({
          isLoading:true,
          info,
          page,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.getList();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getList(1);
  },
  goPay(e) { // 支付
    let record = e.currentTarget.dataset.record;
    app.globalData.orderDetail = record;
    wx.navigateTo({
      url: '../payment/payment',
    })
  },
  orderDetail(e){//查看详情
    wx.navigateTo({
      url: `../order-detail/detail?orderId=${e.currentTarget.dataset.orderid}`,
    })
  },
  goEvaluate(e) { // 评价
    let record = e.currentTarget.dataset.record;
    app.globalData.orderDetail = record;
    app.globalData.evalOrderId = record.id
    app.globalData.evalImg = record.img
    wx.navigateTo({
      url: '../evaluateList/evaluateList',
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.page.isMore) {
      this.getList()
    }
  },

})