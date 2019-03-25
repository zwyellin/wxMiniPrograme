// goods/GroupPurchasePay/GroupPurchaseorderDetails/server1OrderDetails/server1OrderDetails.js
const app = getApp();
const { wxRequest } = require('../../../../utils/util.js');
const {modify} =require("../../../GroupPurchaseIndex/groupPurchasePublicJs.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,//订单号,用于请求findNewTOrderById
   

    groupPurchaseOrder:null,
    groupMerchantInfo:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId}=options;
    this.setData({
      orderId
    },()=>{
      this.findNewTOrderById().then(()=>{
        this.findGroupPurchaseMerchantInfo()
      })
    })
  },
  findNewTOrderById(){
    return wxRequest({
      url:'/merchant/userClient?m=findNewTOrderById',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          orderId:this.data.orderId
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;     
        //处理订单
        let groupPurchaseOrder=this.modifygroupPurchaseOrder(value.groupPurchaseOrder)
        this.setData({
          groupPurchaseOrder,//订单号
        });
      }else{
        wx.wx.showToast({
          title: res.data.value,
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result)=>{
            
          },
          fail: ()=>{},
          complete: ()=>{}
        });
      }
    })
  },
  modifygroupPurchaseOrder(value){
    // 处理当前状态
    // *订单状态 status
    // * -1超时已取消;1未付款;2支付完成;
    let status=value.status;
    if(status==-1) value.statusText="超时已取消";
    else if(status==1) value.statusText="未付款";
    else if(status==2) value.statusText="支付完成";
    // 处理支付方式
    // * 支付类型 {PaymentType}
    // * 1.在线支付
    // * 2.货到付款
    let paymentType=value.paymentType;
    if(paymentType==1)value.paymentTypeText="在线支付";
    else if(paymentType==2) value.paymentTypeText="货到付款";

    return value;
  },
  findGroupPurchaseMerchantInfo(){
    return wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseMerchantInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          groupPurchaseMerchantId:this.data.groupPurchaseOrder.merchantId,
          latitude:app.globalData.latitude,
          longitude:app.globalData.longitude
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
         //处理商家信息
         let groupMerchantInfo=modify.GrouopMerchantModify(res.data.value);
         this.setData({
           groupMerchantInfo:groupMerchantInfo
         })
      }
    })
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