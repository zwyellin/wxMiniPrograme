var app = getApp();
var dataStr = require('../../utils/data.js')
// pages/user-envelopes/envelopes.js
Page({
  data: {
    list: [],
    page: {
      limit: 10,
      start: 0,
      isMore: true
    }
  },
  getList() { //查询红包
    let page = this.data.page
    var params = {
      isDisabled: 1,
      businessType: 12,
      start: this.data.page.start,
      limit: this.data.page.limit
    };
    wx.http.postReq('appletClient?m=queryRedBagList', params, (data) => {
      if (data.success) {
        let list = this.data.list
        if (data.value.platformRedBagList.length > 0) {
          list = [...list, ...data.value.platformRedBagList]
        }
        if (data.value.platformRedBagList.length >= this.data.page.limit) {
          page.start += 10;
          page.isMore = true;
        } else {
          page.isMore = false;
        }
        this.setData({
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
    console.log(1)
    console.log(this.data.page.isMore)
    if (this.data.page.isMore) {
      this.getList()
    }
  },
})