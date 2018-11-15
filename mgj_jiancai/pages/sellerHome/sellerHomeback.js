// pages/sellerHome/sellerHome.js
Page({
  data: {
    sellerInfo:false,
    info:{}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.getInit(options.id)
  },
  getInit(merchantId='834') {
    var param = {
      merchantId
    }
    wx.http.postReq('appletClient?m=findClientMerchantHome', param, (data) => {
      if (data.success) {
        var info = data.value;
        this.setData({
          info
        })
      }
    })
  },
  // 收藏
  collection(e) {
    let isCollection = e.currentTarget.dataset.type;
    var param = {
      merchantId: this.data.info.id,
      merchantType: 6
    }
    wx.http.postReq(isCollection === 0 ? 'userClient?m=createUserFavorites' : 'userClient?m=cancelUserFavorites', param, (data) => {
      if (data.success) {
        /**
         *
        this.info.collectionNum + 1
         */
        var info = this.data.info;
        info.isCollection = isCollection ? 0 : 1
        this.setData({
          info
        })
        wx.showToast({
          title: isCollection ? '取消成功！' : '收藏成功！',
          icon: 'none'
        })
      }
    })
  },
  seeSellerInfo: function () {
    this.setData({ sellerInfo: !this.data.sellerInfo });
  },
  receive(e){
    let couponsRulesId = e.currentTarget.dataset.id;
    wx.http.postReq('/appletClient?m=getCouponsGetRecord', {couponsRulesId}, (data) => {
      if (data.success) {
        wx.showToast({
          title: '领取成功',
          icon: 'none'
        })
      }
    })
  }
})