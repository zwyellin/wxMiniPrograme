// goods/GroupPurchaseChildPage/serviceCategory1/order/order.js
const app = getApp();
const { wxRequest } = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginsuccess:false,//是否登入

    voucherItem:null,

    sliderValue:1,//滑块选择的数量

    totalMoney:"",//小计
    realTotalMoney:"",//实付总额

    redPacketDeduction:"",//红包抵扣的金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let loginMessage = wx.getStorageSync('loginMessage');
    let loginStatus = wx.getStorageSync('loginstatus');
    //判断是否登入
    if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
        this.setData({
            loginsuccess:true,
        });
        //  
      // 获得参数
      let {groupPurchaseCouponId}=options;
      this.data.groupPurchaseCouponId=groupPurchaseCouponId;
      this.findGroupPurchaseCouponInfo();
    }else{
        this.setData({
          loginsuccess:false,
        });
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