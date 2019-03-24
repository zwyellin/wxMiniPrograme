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
    groupPurchaseOrderCouponCodeList:null,//团购券列表
    groupPurchaseOrderCouponGoodsList:null,//这个是团购券套餐内容

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
      this.findNewTOrderById().then(()=>{
        //this.findGroupPurchaseMerchantInfo()
      })
    })
  },
  onShow(){//如果是退款页面返回来的，则重新加载数据
    let isReloadData=this.data.isReloadData;
    if(isReloadData){
      this.findNewTOrderById().then(()=>{
        //this.findGroupPurchaseMerchantInfo()
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
          orderId:this.data.orderId
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;
        // 处理码券
        let groupPurchaseOrderCouponCodeList=this.codeListItemModify(value.groupPurchaseOrder.groupPurchaseOrderCouponCodeList);
        //处理商家信息
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseOrder.groupPurchaseMerchant);
        this.setData({
          groupPurchaseOrder:value.groupPurchaseOrder,//订单号
          groupMerchantInfo:groupMerchantInfo,//商家信息
          groupPurchaseOrderCouponCodeList,//团购券列表
          groupPurchaseOrderCouponGoodsList:value.groupPurchaseOrder.groupPurchaseOrderCouponGoodsList//这个是团购券套餐内容
        });
        console.log("groupPurchaseOrderCouponGoodsList",value.groupPurchaseOrder.groupPurchaseOrderCouponGoodsList)
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
          groupPurchaseMerchantId:this.data.groupPurchaseOrder.groupPurchaseMerchantId,
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