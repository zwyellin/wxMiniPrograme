const app = getApp();
const { wxRequest } = require('../../utils/util.js');
const {modify} =require("../GroupPurchaseIndex/groupPurchasePublicJs.js");
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
// goods/GroupPurchaseShop/GroupPurchaseShop.js
Page({
  data: {
    isLoginsuccess:false,//是否登入
    isredbagShow:true,//默认要显示，有没有是另外一回事。点击领取后就不显示了

    //商家信息请求参数
    latitude:null,//店家的经纬度，
    longitude:null,
    agentId:null,//根据店家的经纬度获取的代理商id。这边暂时没有用到。这边保存到app.global

    groupPurchaseMerchantId:null,//传进来的
    sharedUserId:null,

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

    WXQRImage:"data:image/png;base64,",//店家二维码
    QRcode_mask_show:false
  },
   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 跳商家，需要参数groupPurchaseMerchantId
    let {groupPurchaseMerchantId,sharedUserId}=options;

    const scene = decodeURIComponent(options.scene)
    Object.assign(this.data,{
      groupPurchaseMerchantId,
      sharedUserId
    });
    //网页也需要sharedUserId
    this.setData({
      sharedUserId
    })
    if(!app.globalData.latitude){//如果app.json也没有，则是外部进来德，要重新获取经纬度
      //重新获取经纬度

    }

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
      if(isLoginTo){//默认不跳转，除非传参true则会判断是否登入及跳转
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
        "&merchantName="+this.data.groupMerchantInfo.name+"&sharedUserId="+this.data.sharedUserId
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
        url:"/goods/GroupPurchaseChildPage/serviceCategory1/order/order?&groupPurchaseCouponId="+id+"&sharedUserId="+this.data.sharedUserId
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
        url:"/goods/GroupPurchaseChildPage/serviceCategory2/order/order?groupPurchaseCouponId="+id+"&sharedUserId="+this.data.sharedUserId
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
          latitude:app.globalData.latitude,//这个用于计算距离什么的，传自己的定位
          longitude:app.globalData.longitude,
          groupPurchaseMerchantId:this.data.groupPurchaseMerchantId,
          userId:app.globalData.userId
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
        //设置店家的经纬度及获取代理商
        this.data.latitude=value.latitude;
        this.data.longitude=value.longitude;
        this.data.agentId=value.agentId;
        app.globalData.agentId=value.agentId;
        //请求，附近商家
        this.findNearGroupPurchaseMerchant2();
        // 请求店家的二维码
        this.getMGJMerchantWXQRImage();
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
          latitude:this.data.latitude,//传店家的经纬度
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
  // 进店红包
  redbagBtnTap(e){
    let {index}=e.target.dataset;
    let redbagItem=this.data.groupMerchantInfo.merchantRedBagList[index];
    console.log("redbagItem",redbagItem);
    wxRequest({
      url:'/merchant/userClient?m=getMerchantRedBag',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          bizType:6,
          id:redbagItem.id,
          merchantId:this.data.groupMerchantInfo.id
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let that=this;
        wx.showModal({
          title:"提示",
          content:'恭喜您已成功领取'+redbagItem.amt+"元红包，可在[个人执行]->[我的红包]查看",
          confirmText:'我知道了',
          showCancel:false,
          confirmColor:"#314bec",
          success:function(res){
            if(res.confirm){
              that.setData({
                isredbagShow:false
              })
            }
          }
        });
      }else {}
    });
  },
  // 店家二维码
  getMGJMerchantWXQRImage(){
    wxRequest({
      url:'/merchant/userClient?m=getMGJMerchantWXQRImage',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          bizType:1,
          merchantId:this.data.groupMerchantInfo.id
        }	
      },
    }).then(res=>{
      let WXQRImage=this.data.WXQRImage;
      WXQRImage+=res.data.value;
      this.setData({
        WXQRImage
      })
    })
  },
  //QRcodeIconTap
  QRcodeIconTap(){
    this.setData({
      QRcode_mask_show:true
    })
  },
  // 保存二维码
  saveQRCode(e){
    let {images}=e.currentTarget.dataset;
    let that=this;
    wx.previewImage({
			current: images, // 当前显示图片的http链接
      urls:[images],// 需要预览的图片http链接列表
      success:function(){
        that.setData({
          QRcode_mask_show:false
        })
      }
		})
  },
  // 点击商家图片事件
  merchantInfoImageTap(e){
    let {index=0,images}=e.currentTarget.dataset;
    console.log(images,index);
    
    wx.previewImage({
			current: images[index], // 当前显示图片的http链接
      urls:images, // 需要预览的图片http链接列表
 
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
      tel_mask_show:false,
      QRcode_mask_show:false
    })
  },
  // 分享
	onShareAppMessage(res) {
		console.log(app.globalData.userId);
    	return {
      		title: '马管家',
      		path: '/goods/GroupPurchaseShop/GroupPurchaseShop?groupPurchaseMerchantId='+ this.data.groupMerchantInfo.id+'&sharedUserId='+app.globalData.userId,
    	};
  	},
})