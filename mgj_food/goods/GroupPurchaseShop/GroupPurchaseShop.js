const app = getApp();
const { wxRequest } = require('../../utils/util.js');
const {modify} =require("../GroupPurchaseIndex/groupPurchasePublicJs.js")
// goods/GroupPurchaseShop/GroupPurchaseShop.js
Page({
  data: {
    isLoginsuccess:false,//是否登入

    //商家信息请求参数
    latitude:null,
    longitude:null,
    agentId:null,
    groupPurchaseMerchantId:null,
    // 商家信息
    groupMerchantInfo:null,
    // 商家评价
    evaluateList:null,
    evaluateListSize:3,//评价列表，加载个数
    // 是否显示电话弹窗
    tel_mask_show:false,
    // 附近商家
    nearGroupPurchase:null,
    nearGroupPurchaseSize:3,//附近商家，加载个数
  },
   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 跳商家，需要参数groupPurchaseMerchantId
    let {groupPurchaseMerchantId,latitude,longitude}=options;
    if(!latitude){//如果没传经纬度
      if(!app.globalData.latitude){//如果app.json也没有，则是外部进来德，要重新获取经纬度

      }else{//app.json中，则赋值
        latitude=app.globalData.latitude;
        longitude=app.globalData.longitude;
      }
    }
    Object.assign(this.data,{
      groupPurchaseMerchantId,
      longitude,
      latitude
    })
    this.requestGrouopMerchantInfo();

     //  判断是否登入
     this.isLoginsuccess();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  // 点击优惠买单 按钮
  serviceCategory0Tap(e){
    let {id,ratio}=e.target.dataset;
    let isLoginsuccess=this.data.isLoginsuccess;
    if(isLoginsuccess){
      wx.navigateTo({
        url:"/goods/GroupPurchaseChildPage/serviceCategory0/serviceCategory0?merchantId="+this.data.groupMerchantInfo.id+"&discountRatio="+ratio+
        "&merchantName="+this.data.groupMerchantInfo.name
      })
    }else{
      this.isLoginsuccess(true);//跳转到登入
    }
   
  },
  // 点击代金券 按钮
  serviceCategory1Tap(e){
    let {id}=e.target.dataset;
    let isLoginsuccess=this.data.isLoginsuccess;
    if(isLoginsuccess){
      wx.navigateTo({
        url:"/goods/GroupPurchaseChildPage/serviceCategory1/order/order?&groupPurchaseCouponId="+id
      })
    }else{
      this.isLoginsuccess(true);//跳转到登入
    }
  },
  // 点击团购的 按钮
  serviceCategory2Tap(e){
    let {id}=e.target.dataset;
    let isLoginsuccess=this.data.isLoginsuccess;
    if(isLoginsuccess){
      wx.navigateTo({
        url:"/goods/GroupPurchaseChildPage/serviceCategory2/order/order?groupPurchaseCouponId="+id
      })
    }else{
      this.isLoginsuccess(true);//跳转到登入
    }
  },

  // 商家信息-请求
  requestGrouopMerchantInfo(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseMerchantInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:this.data.latitude,
          longitude:this.data.longitude,
          groupPurchaseMerchantId:this.data.groupPurchaseMerchantId
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        var value=modify.GrouopMerchantModify(res.data.value);
        this.data.groupMerchantInfo=value;
        this.setData({
          groupMerchantInfo:value
        });
        //设置标题
        wx.setNavigationBarTitle({
          title: value.name
          })
        //开始请求商家评价:如果评价不为空，则发送请求
        //请求，商家评论
        if(value.merchantCommentNum){
          this.findGroupPurchaseEvaluateList();
        }
        //请求，附近商家
        this.findNearGroupPurchaseMerchant2();
      }else {
        wx.showToast({
          title: res.data.value,
          icon:"none",
          mask:true,
          duration: 2000
        })
      }
    })
  },
  // 商家评价-请求findGroupPurchaseEvaluateList。在商家信息，返回来之后，发请求
  findGroupPurchaseEvaluateList(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseEvaluateList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          start:0,
          size:this.data.evaluateListSize,
          merchantId:this.data.groupMerchantInfo.id
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        this.setData({
          evaluateList:res.data.value
        });
      }else {}
    });
  },
  // 附近商家-请求。在商家信息返回来后请求
  findNearGroupPurchaseMerchant2(){
    wxRequest({
      url:'/merchant/userClient?m=findNearGroupPurchaseMerchant2',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:this.data.latitude,
          longitude:this.data.longitude,
          merchantId:this.data.groupMerchantInfo.id,
          size:this.data.nearGroupPurchaseSize,
          start:0
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        this.setData({
          nearGroupPurchase:res.data.value
        });
      }else {}
    });
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