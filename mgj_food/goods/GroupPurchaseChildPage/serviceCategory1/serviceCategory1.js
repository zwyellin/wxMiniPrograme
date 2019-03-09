// goods/GroupPurchaseChildPage/serviceCategory1/serviceCategory1.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tel_mask_show:false,
    groupMerchantInfo:null,//直接读取上一页的该对象
    merchantId:null,
    voucherItem:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {itemIndex}=options;
    //访问上级页面(团购商家)的对象，赋值给本页面
    let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2]; // 上一级页面
		let prePageReg=/GroupPurchaseShop/;//判断上一级页面的路径是不是含有GroupPurchaseShop
		if(prePageReg.test(prevPage.route)){
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

   //点击电话图标事件
   callPhoneTap(e){
    this.setData({
      tel_mask_show:true
    })
  },
  telphoneTap(e){
    let {telphone}=e.target.dataset;
    wx.makePhoneCall({
      phoneNumber: telphone  //电话号码
    })
  },
  // 电话弹窗 点击取消
  maskCancelTap(e){
    this.setData({
      tel_mask_show:false
    })
  },
})