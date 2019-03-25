// goods/GroupPurchasePay/GroupPurchaseorderDetails/orderUse/orderUse.js
const { wxRequest } = require('../../../../utils/util.js');
const {modify} =require("../../../GroupPurchaseIndex/groupPurchasePublicJs.js")
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,
   
    groupPurchaseOrder:null,
    groupMerchantInfo:null,
    groupPurchaseOrderCouponCodeList:null,

    //返回来的二维码Image数组
    couponCodeImageSrcList:[],
    //显示的标题
    couponCodeImageSrcListItemTitle:{
      title:null,
      endTime:null,
      url:null,//点标题>部分的跳转
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId}=options;
    console.log("orderId",orderId)
    this.data.orderId=orderId;
    wx.showToast({
      title:"加载中",
      icon:"loading",
      duration: 20000
    })
    this.findNewTOrderById().then(()=>{
      let promiseAll=[];
      this.data.groupPurchaseOrderCouponCodeList.forEach((_item)=>{
        // item.status。0：未使用；1：已使用；2：已退款；3已锁定
        //只显示未使用的券码
        if(_item.status===0){//this.createQRImage(_item.couponCode)
          promiseAll.push(wxRequest({
            url:'/merchant/userClient?m=createQRImage',
            method:'POST',
            data:{
              params:{
               content:_item.couponCode
              }
            },
          }));
        }
      })
      Promise.all(promiseAll).then(res=>{
        let couponCodeImageSrcList=this.data.couponCodeImageSrcList;
        res.forEach((_item,_index)=>{
          let item={
            content:_item.data.value.content,
            qrCode:_item.data.value.qrCode
          }
          couponCodeImageSrcList.push(item);
        })
        this.setData({
          couponCodeImageSrcList
        })
      }).then(()=>{
        wx.hideToast();
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
        let groupPurchaseOrder=value.groupPurchaseOrder;
        // 处理券码
        let groupPurchaseOrderCouponCodeList=this.voucherItemModify(groupPurchaseOrder.groupPurchaseOrderCouponCodeList);
        this.data.groupPurchaseOrderCouponCodeList=groupPurchaseOrderCouponCodeList;
        //处理商家信息
        let groupMerchantInfo=modify.GrouopMerchantModify(groupPurchaseOrder.groupPurchaseMerchant);
        this.setData({
          groupPurchaseOrder,
          groupMerchantInfo,
          groupPurchaseOrderCouponCodeList,
          groupPurchaseOrderCouponGoodsList:groupPurchaseOrder.groupPurchaseOrderCouponGoodsList//针对团购
        })
        //groupPurchaseOrder:<!-- orderType:。 1, "代金券",2, "团购券",3, "优惠买单" -->
        let couponCodeImageSrcListItemTitle=this.data.couponCodeImageSrcListItemTitle;
        let url="/goods/GroupPurchasePay/GroupPurchaseorderDetails";
        if(groupPurchaseOrder.orderType===1){
          Object.assign(couponCodeImageSrcListItemTitle,{
            title:groupPurchaseOrder.groupPurchaseMerchantName+"代金券",
            endTime:groupPurchaseOrder.groupPurchaseCouponEndTime,
            url:url+"/server1OrderDetails/server1OrderDetails?orderId="+this.data.orderId
          })
        }else if(groupPurchaseOrder.orderType===2){
          Object.assign(couponCodeImageSrcListItemTitle,{
            title:groupPurchaseOrder.groupPurchaseName,
            endTime:groupPurchaseOrder.groupPurchaseCouponEndTime,
            url:url+"/server2OrderDetails/server2OrderDetails?orderId="+this.data.orderId
          })
        }
        this.setData({
          couponCodeImageSrcListItemTitle
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