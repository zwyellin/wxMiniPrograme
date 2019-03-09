// goods/GroupPurchaseChildPage/serviceCategory1/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupMerchantInfo:null,
    voucherItem:null,
    merchantId:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // 获得参数
      let {itemIndex}=options;
      console.log(itemIndex)
      //访问上级页面(团购商家)的对象，赋值给本页面
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]; // 上一级页面
      let prev_prevPage=pages[pages.length - 3]; // 上一级页面
      let prePageReg=/GroupPurchaseShop/;//判断上一级页面的路径是不是含有GroupPurchaseShop
      if(prePageReg.test(prevPage.route)){//直接点购买进来德
        console.log("店铺上一页过来的")
        this.setData({
          groupMerchantInfo:prevPage.data.groupMerchantInfo,
          voucherItem:prevPage.data.groupMerchantInfo.voucher[itemIndex],
          merchantId:prevPage.data.groupMerchantInfo.id
        })
      }else if(prev_prevPage.test(prevPage.route)){//从详情页进来的
        console.log("店铺上上页过来的")
        this.setData({
          groupMerchantInfo:prevPage.data.groupMerchantInfo,
          voucherItem:prevPage.data.groupMerchantInfo.voucher[itemIndex],
          merchantId:prevPage.data.groupMerchantInfo.id
        })
      }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})