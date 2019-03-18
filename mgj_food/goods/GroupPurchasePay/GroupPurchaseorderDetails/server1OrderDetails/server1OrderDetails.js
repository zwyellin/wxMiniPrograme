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
    groupPurchaseMerchantId:null,//商家id。来源于用于请求findNewTOrderById。用于请求findGroupPurchaseMerchantInfo


    groupPurchaseOrder:null,
    groupMerchantInfo:null,
    groupPurchaseOrderCouponCodeList:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId}=options;
    this.data.orderId=orderId;
    console.log(orderId)
    this.findNewTOrderById().then(()=>{
      //this.findGroupPurchaseMerchantInfo()
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
        this.data.groupPurchaseMerchantId=value.groupPurchaseOrder.merchantId;
        // 处理代金券
        let vouchers=this.voucherItemModify(value.groupPurchaseOrder.groupPurchaseOrderCouponCodeList);
        //处理商家信息
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseOrder.groupPurchaseMerchant);
        this.setData({
          groupMerchantInfo:groupMerchantInfo,
          groupPurchaseOrderCouponCodeList:vouchers
        })
      }
    })
  },
  findGroupPurchaseMerchantInfo(){
    return wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseMerchantInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          groupPurchaseMerchantId:this.data.groupPurchaseMerchantId,
          latitude:app.globalData.latitude,
          longitude:app.globalData.longitude
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        this.setData({
          groupMerchantInfo:res.data.value.groupPurchaseOrder.groupPurchaseMerchant
        })
      }
    })
  },
  voucherItemModify(item){
    if(item instanceof Array){
      item.forEach((_item,_index)=>{
        _item=_modify(_item);
      })
    }else{
      item=_modify(item)
    }
    function _modify(item){
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
      // 处理劵码情况
      // 0：未使用；1：已使用；2：已退款；
      if(item.status==0) item.statusText="未使用";
      else if(item.status==1) item.statusText="已使用";
      else if(item.status==2) item.statusText="已退款";
      return item;
    }
   
    return item;
  }
})