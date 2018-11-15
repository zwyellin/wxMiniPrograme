// pages/user-couponHistory/history.js
var app = getApp();
var dataStr = require('../../utils/data.js')
Page({
  data: {
    list: [],
    isList: false,
    page: {
      limit: 10,
      start: 0,
      isMore: true
    }
  },
  getList() {
    let page = this.data.page
    var params = {
      type: 0,
      businessType: 12,
      start: this.data.page.start,
      limit: this.data.page.limit
    };
    wx.http.postReq('appletClient?m=queryCouponsListPage', params, (data) => {
      if (data.success) {
        let list = this.data.list
        if (data.value.couponsList.length > 0) {
          data.value.couponsList = data.value.couponsList.map(item => {
            item.date = item.createTime.substring(5, 16) + '~' + dataStr.tsFormatTime(item.expirationTime, 'M-D h:m')
            return item
          })
          list = [...list, ...data.value.couponsList]
        }
        if (data.value.couponsList.length >= this.data.page.limit) {
          page.start += 10;
          page.isMore = true;
        } else {
          page.isMore = false;
        }
        this.setData({
          isList: true,
          list,
          page
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();
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