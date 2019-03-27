// goods/GroupPurchaseChildPage/serviceCategory1/serviceCategory1.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');
const {modify} =require("../../GroupPurchaseIndex/groupPurchasePublicJs.js")
// findGroupPurchaseCouponInfo：代金券和团购套餐详情都是请求这接口。区别是type。1：代金券，2：团购套餐
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //入参 
    groupPurchaseCouponId:null,
    sharedUserId:null,
    //请求回来的数据对象/属性
    groupMerchantInfo:null,//商家对象
    voucherItem:null,//代金券对象
    // 页面状态
    isLoginsuccess:false,//是否登入
    tel_mask_show:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数@groupPurchaseCouponId为其id
    let {groupPurchaseCouponId,sharedUserId}=options;
    if(!app.globalData.latitude){//如果app.json也没有，则是外部进来德，要重新获取自己的经纬度。及设置商家对应的代理商

    }
    if(sharedUserId==undefined || sharedUserId=="undefined") sharedUserId=null
    Object.assign(this.data,{
      groupPurchaseCouponId,
    })
    this.setData({
      sharedUserId
    })
    // 开始请求
    this.findGroupPurchaseCouponInfo();

    //判断是否登入
    this.isLoginsuccess();
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
  isLoginsuccess(isLoginTo){
    let loginMessage = wx.getStorageSync('loginMessage');
    let loginStatus = wx.getStorageSync('loginstatus');
    //判断是否登入
    if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
      this.data.isLoginsuccess=true;
    }else{
      if(isLoginTo){
        wx.navigateTo({//跳转到登入
          url:"/pages/login/login"
        })
      }
    }
  },
  // 点击代金券 按钮
  serviceCategory1Tap(e){
    let {item_index}=e.target.dataset;
    let isLoginsuccess=this.data.isLoginsuccess;
    if(isLoginsuccess){
      wx.navigateTo({
        url:"/goods/GroupPurchaseChildPage/serviceCategory1/order/order?groupPurchaseCouponId="+this.data.voucherItem.id+"&sharedUserId="+this.data.sharedUserId
      })
    }else{
      this.isLoginsuccess(true);//跳转到登入
    }
  },
  // 请求代金券信息
  findGroupPurchaseCouponInfo(){
    wx.showToast({
      title:"加载中",
      icon:"loading",
      mask:true,
      duration:20000
    })
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseCouponInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:app.globalData.latitude,
          longitude:app.globalData.longitude,
          groupPurchaseCouponId:this.data.groupPurchaseCouponId,
        }	
      },
    }).then(res=>{
      wx.hideToast();
      if (res.data.code === 0) {
        let value=res.data.value;
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseMerchant)
        let voucherItem=this.voucherItemModify(value);
        this.setData({
          groupMerchantInfo,
          voucherItem,
          merchantId:value.groupPurchaseMerchant.id,
        });
      }else {}
    });
  },
  voucherItemModify(item){
    if(item.createTime && item.createTime.indexOf(" ")!=-1){
      item.createTime=item.createTime.substring(0,item.createTime.indexOf(" "));
    }
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
  },
})