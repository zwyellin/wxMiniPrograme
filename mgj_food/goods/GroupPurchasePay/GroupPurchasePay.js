// goods/GroupPurchasePay/GroupPurchasePay.js
const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,//订单号
    orderMoney:null,
    orderTitle:null,
    findChargeTypesResData:null,//返回来的数据


    payType:0,//支付方式，0，1，2对应余额，微信，支付宝
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId,orderMoney,orderTitle}=options;
    console.log(orderId,orderMoney,orderTitle)
    this.data.orderId=orderId;
    this.setData({
      orderMoney,
      orderTitle,
    })
    this.findChargeTypes();
  },

  findChargeTypes(){
    wxRequest({
      url:'/merchant/userClient?m=findChargeTypes',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          orderId:this.data.orderId
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        console.log(res.data.value);
        this.setData({
          findChargeTypesResData:res.data.value
        })
      }else if(res.data.code===500){
      
      }
    })
  },
  payTypeSwitch(e){
    let {payindex,channel,name}=e.target.dataset;
    this.setData({
      payType:payindex
    })
  }
})