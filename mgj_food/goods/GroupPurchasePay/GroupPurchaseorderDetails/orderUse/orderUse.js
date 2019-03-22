// goods/GroupPurchasePay/GroupPurchaseorderDetails/orderUse/orderUse.js
const { base64src, wxRequest } = require('../../../../utils/util.js');
const {modify} =require("../../../GroupPurchaseIndex/groupPurchasePublicJs.js")
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,
    merchantId:null,
   
    groupPurchaseOrder:null,
    groupMerchantInfo:null,
    groupPurchaseOrderCouponCodeList:null,

    //返回来的二维码Image数组
    couponCodeImageSrcList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {couponItem,orderId,merchantId}=options;
    console.log("orderId",orderId)
    this.data.orderId=orderId;
    this.data.merchantId=merchantId;
    this.findNewTOrderById().then(()=>{
      let createQRImageAll=[];
      this.data.groupPurchaseOrderCouponCodeList.forEach((_item)=>{
         this.createQRImage(_item.couponCode);
      })
    })

  
    
  },

  createQRImage(_item){
    wxRequest({
      url:'/merchant/userClient?m=createQRImage',
      method:'POST',
      data:{
        params:{
         content:_item
        }
      },
    }).then((res)=>{
      let item={
        content:res.data.value.content,
        qrCode:res.data.value.qrCode
      }
      let couponCodeImageSrcList=this.data.couponCodeImageSrcList;
      couponCodeImageSrcList.push(item);
      this.setData({
        couponCodeImageSrcList
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
        // 处理券码
        let groupPurchaseOrderCouponCodeList=this.voucherItemModify(value.groupPurchaseOrder.groupPurchaseOrderCouponCodeList);
        this.data.groupPurchaseOrderCouponCodeList=groupPurchaseOrderCouponCodeList;
        //处理商家信息
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseOrder.groupPurchaseMerchant);
        this.setData({
          groupPurchaseOrder:value.groupPurchaseOrder,
          groupMerchantInfo:groupMerchantInfo,
          groupPurchaseOrderCouponCodeList:groupPurchaseOrderCouponCodeList
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
  },

})