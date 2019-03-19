// goods/GroupPurchasePay/GroupPurchaseorderDetails/orderUse/orderUse.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,
    codeValue:null,//代码券码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {merchantInfo,couponItem,orderId}=options;
    this.data.orderId=orderId;
    
  },
  findGroupPurchaseOrderCouponCodeIDListByOrderId(){
    return wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseOrderCouponCodeIDListByOrderId',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          orderId:this.data.orderId
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        codeValue=res.data.value;
      }
    })
  }

})