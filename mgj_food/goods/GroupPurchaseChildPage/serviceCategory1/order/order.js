// goods/GroupPurchaseChildPage/serviceCategory1/order/order.js
const app = getApp();
const { wxRequest } = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    voucherItem:null,

    sliderValue:1,//滑块选择的数量

    totalMoney:"",//小计
    realTotalMoney:"",//实付总额

    redPacketDeduction:"",//红包抵扣的金额
    
    OrderSubmitReqObj:{//固定的参数
      merchantId:null,//从voucherItem可以获取
      groupPurchaseCouponId:null,
      loginToken:null,
      userId:null
    },
    orderId:null,//返回来的orderId
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {groupPurchaseCouponId}=options;
    this.data.groupPurchaseCouponId=groupPurchaseCouponId;
    this.findGroupPurchaseCouponInfo();
    
    //获得用户信息
    let {token,userId}=app.globalData;
    let OrderSubmitReqObj=this.data.OrderSubmitReqObj;
    Object.assign(OrderSubmitReqObj,{
      groupPurchaseCouponId,
      userId,
      loginToken:token
    })

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
    // 订单提交预览,获得订单号
    groupPurchaseOrderSubmit(){
      let OrderSubmitReqObj=JSON.parse(JSON.stringify(this.data.OrderSubmitReqObj));
      Object.assign(OrderSubmitReqObj,{
        merchantId:this.data.voucherItem.merchantId,
        groupPurchaseOrderType:1,//   1, "代金券",2, "团购券",3, "优惠买单"
        groupPurchaseCouponType:1,//  1代金券，2团购
        originalPrice:this.data.voucherItem.originPrice,
        price:this.data.voucherItem.price,
        quantity:this.data.sliderValue,
        totalOriginalPrice:this.data.voucherItem.originPrice*this.data.sliderValue,
        totalPrice:this.data.realTotalMoney
      })
      let data=JSON.stringify(OrderSubmitReqObj);
      return wxRequest({
        url:'/merchant/userClient?m=groupPurchaseOrderSubmit',
        method:'POST',
        data:{
          token:app.globalData.token,
          params:{
            data:data
          }
        },
      }).then(res=>{
        if (res.data.code === 0) {
         console.log("获得订单号",res.data.value.id);
         this.data.orderId=res.data.value.id;
        }else if(res.data.code===500){
          wx.showToast({
            title:res.data.value || "未知错误",
            icon:"none",
            duration:2000
          })
        }
    })
  },


  // 提交订单
  submitOrderBtnTap(){
    this.groupPurchaseOrderSubmit().then(()=>{
      wx.navigateTo({
        url:"/goods/pay/pay?price="+this.data.realTotalMoney+"&orderId="+this.data.orderId
      })
    })
  },

  // 滑块滑动事件
 sliderChanging(e){
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
findGroupPurchaseCouponInfo(){
  wxRequest({
    url:'/merchant/userClient?m=findGroupPurchaseCouponInfo',
    method:'POST',
    data:{
      token:app.globalData.token,
      params:{
        groupPurchaseCouponId:this.data.groupPurchaseCouponId,
        size:20,
        start:0
      }	
    },
  }).then(res=>{
    if (res.data.code === 0) {
      let value=res.data.value;
      let voucherItem=this.voucherItemModify(value)
      this.setData({
        voucherItem
      });
       // 自动设置小计及总额
       this.sliderChanging();
    }else {}
  });
},


voucherItemModify(item){
  // 处理是否叠加
  if(item.isCumulate){//是否叠加 0:否,1:是 
    item.isCumulateText="可叠加"
  }else{
  item.isCumulateText="不可叠加"
  }
  //处理是否预约  
  if(item.isBespeak){//0:否,1:是 
    item.isBespeakText="需预约"
  }else{
    item.isBespeakText="免预约"
  }
  return item;
}
})