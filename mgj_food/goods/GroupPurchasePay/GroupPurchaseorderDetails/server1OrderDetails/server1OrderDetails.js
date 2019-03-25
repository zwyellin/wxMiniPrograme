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
    // @status:-1,取消订单；0，订单创建；1，等待付款；2，购买完成；3，已退款；4，等待接单；
    // 如果status:-1,取消订单。则不显示码券
    groupMerchantInfo:null,
    groupPurchaseOrderCouponCodeList:null,

    hasUnuseCouponCode:false,//所有券码中是否有未使用的，如果有则显示立即使用和退款按钮
    hasuseCouponCode:false,//所有券码中是有使用的
    hastkCouponCode:false,//所有券码中是有退款的 
    hassdCouponCode:false,//所有券码中是有锁定的
    //如果没有还可以消费的且使用过。即没有未使用的，没有已锁定的，且有使用的，则显示评价按钮

    isReloadData:false,//是否重新加载数据，用于退款页面返回申请退款成功后时重新加载数据


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId}=options;
    this.setData({
      orderId
    },()=>{
      wx.showToast({
        title:"加载中",
        icon:"loading",
        duration: 20000
      })
      this.findNewTOrderById().then(()=>{
        this.findGroupPurchaseMerchantInfo().then(()=>{//findNewTOrderById也返回商店对象，但没有传地理位置，显示距离为0
          wx.hideToast();
        });
      })
    })
  },
  onShow(){//如果是退款页面返回来的，则重新加载数据
    let isReloadData=this.data.isReloadData;
    if(isReloadData){
      this.setData({//重置状态
        hasUnuseCouponCode:false,//所有券码中是否有未使用的，如果有则显示立即使用和退款按钮
        hasuseCouponCode:false,//所有券码中是有使用的
        hastkCouponCode:false,//所有券码中是有退款的 
        hassdCouponCode:false,//所有券码中是有锁定的
      },()=>{
        wx.showToast({
          title:"加载中",
          icon:"loading",
          duration: 20000
        })
        this.findNewTOrderById().then(()=>{
         // this.findGroupPurchaseMerchantInfo();
         wx.hideToast();
        })
      })
    }
    this.data.isReloadData=false;
  },
  findNewTOrderById(){
    return wxRequest({
      url:'/merchant/userClient?m=findNewTOrderById',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          orderId:this.data.orderId,
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;
        // 处理码券
        let groupPurchaseOrderCouponCodeList=this.codeListItemModify(value.groupPurchaseOrder.groupPurchaseOrderCouponCodeList);
        // 处理订单
        let groupPurchaseOrder=this.modifygroupPurchaseOrder(value.groupPurchaseOrder);
        this.setData({
          groupPurchaseOrder,
          groupPurchaseOrderCouponCodeList
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
  codeListItemModify(item){
    let that=this;
    if(item instanceof Array){
      item.forEach((_item,_index)=>{
        _item=_modify(_item);
      })
    }else{
      item=_modify(item)
    }
    function _modify(item){
      // 处理劵码情况 
      //  并收集券码信息。【有未使用的，则显示立即使用按钮和退款按钮】
      // 如果没有还可以消费的且使用过。即没有未使用的，没有已锁定的，且有使用的，则显示评价按钮
      // 0：未使用；1：已使用；2：已退款；
      if(item.status==0) {
        item.statusText="未使用";
        that.setData({
          hasUnuseCouponCode:true
        })
      }else if(item.status==1){
        item.statusText="已使用";
        that.setData({
          hasuseCouponCode:true
        })
      }else if(item.status==2) {
        item.statusText="退款详情";
        that.setData({
          hastkCouponCode:true
        })
      }
      else if(item.status==3) {
        item.statusText="已锁定";
        that.setData({
          hassdCouponCode:true
        })
      }
      return item;
    }
    return item;
  },
  modifygroupPurchaseOrder(item){
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
    return item
  },
  // 点击商家图片事件
  merchantInfoImageTap(e){
    let {index=0,images}=e.target.dataset;
    console.log(images,index)
    wx.previewImage({
			current: images[index], // 当前显示图片的http链接
			urls:images // 需要预览的图片http链接列表
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