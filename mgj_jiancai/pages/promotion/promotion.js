// pages/promotion/promotion.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sellerInfo: false
  },

  seeSellerInfo: function () {
    this.setData({ sellerInfo: !this.data.sellerInfo });
  },
})