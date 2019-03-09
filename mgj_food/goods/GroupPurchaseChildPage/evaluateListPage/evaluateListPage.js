// goods/GroupPurchaseChildPage/evaluateListPage/evaluateListPage.js
Page({

  data: {
    isPageReachBottom:false,//默认false
    merchantId:null,
  },
  onLoad: function (options) {
    let {merchantId}=options;
    this.setData({
      merchantId
    })
  },

  onReachBottom: function () {
    this.setData({
      isPageReachBottom:true
    })
  },

})