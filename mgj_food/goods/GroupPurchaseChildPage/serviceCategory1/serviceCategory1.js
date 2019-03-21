// goods/GroupPurchaseChildPage/serviceCategory1/serviceCategory1.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');
const {modify} =require("../../GroupPurchaseIndex/groupPurchasePublicJs.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoginsuccess:false,//是否登入

    tel_mask_show:false,
    groupMerchantInfo:null,//直接读取上一页的该对象
    merchantId:null,
    voucherItem:null,
    itemIndex:null,

    groupPurchaseCouponId:null,//【必传】


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数@groupPurchaseCouponId为其id
    let {groupPurchaseCouponId,latitude,longitude}=options;
    if(!latitude){//如果没传经纬度
      if(!app.globalData.latitude){//如果app.json也没有，则是外部进来德，要重新获取经纬度

      }else{//app.json中，则赋值
        latitude=app.globalData.latitude;
        longitude=app.globalData.longitude;
      }
    }
    Object.assign(this.data,{
      groupPurchaseCouponId,
      longitude,
      latitude
    })
    // 开始请求
    console.log("传过来的参数为",groupPurchaseCouponId)
    this.findGroupPurchaseCouponInfo();

     //  判断是否登入
     this.isLoginsuccess();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
        url:"/goods/GroupPurchaseChildPage/serviceCategory1/order/order?groupPurchaseCouponId="+this.data.voucherItem.id
      })
    }else{
      this.isLoginsuccess(true);//跳转到登入
    }
  },

  findGroupPurchaseCouponInfo(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseCouponInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:this.data.latitude,
          longitude:this.data.longitude,
          groupPurchaseCouponId:this.data.groupPurchaseCouponId,
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseMerchant)
        let voucherItem=this.voucherItemModify(value)
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
  }

})