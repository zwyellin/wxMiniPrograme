// goods/GroupPurchaseChildPage/serviceCategory1/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupMerchantInfo:null,
    voucherItem:null,
    merchantId:null,

    sliderValue:1,//滑块选择的数量

    totalMoney:"",//小计
    realTotalMoney:"",//实付总额

    redPacketDeduction:"",//红包抵扣的金额
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
      let originPage=undefined;
      if(prePageReg.test(prevPage.route)){//直接点购买进来德
        console.log("店铺上一页过来的")
        originPage=prevPage;
      }else if(prePageReg.test(prev_prevPage.route)){//从详情页进来的
        console.log("店铺上上页过来的")
        originPage=prev_prevPage;
      }

      this.setData({
        groupMerchantInfo:originPage.data.groupMerchantInfo,
        voucherItem:originPage.data.groupMerchantInfo.voucher[itemIndex],
        merchantId:originPage.data.groupMerchantInfo.id
      })

      // 自动设置小计及总额
      this.sliderChanging();
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
  // 滑块滑动事件
 sliderChanging(e){
  // let value=e.detail.value;
  // // 计算小计：
  // let totalMoney=value*this.data.groupSetMealItem.price;
  // // 计算实际付款：
  // let realTotalMoney=totalMoney-this.data.redPacketDeduction;
  // this.setData({
  //   sliderValue:value,
  //   totalMoney,
  //   realTotalMoney
  // })

  // 以上为滑动模块，暂时不使用
    var type;
    try{
      type=e.target.dataset.type;
    }catch(err){
      type=0;
    }
    let sliderValue=this.data.sliderValue+parseInt(type);
    //计算小计：
    let totalMoney=sliderValue*this.data.voucherItem.price;
    // 计算实际付款：
    let realTotalMoney=totalMoney-this.data.redPacketDeduction;
    this.setData({
      sliderValue,
      totalMoney,
      realTotalMoney
    })
},
})