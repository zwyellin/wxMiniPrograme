const app = getApp();
const { wxRequest } = require('../../utils/util.js');
const {modify} =require("../GroupPurchaseIndex/groupPurchasePublicJs.js");
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
// goods/GroupPurchaseShop/GroupPurchaseShop.js
Page({
  data: {
    // 入参
    groupPurchaseMerchantId:null,
    sharedUserId:null,
    //请求回来的对象属性
    groupMerchantInfo:null,// 商家信息
    evaluateList:null,// 商家评价
    agentId:null,//订单提交时需要,可能是分享进来的，因而要重置agentId 
    nearGroupPurchase:null,// 附近商家
    // 请求配置
    nearGroupPurchaseSize:3,//附近商家，加载个数
    evaluateListSize:3,//评价列表，加载个数
    // 页面状态
    isLoginsuccess:false,//是否登入
    isredbagShow:true,//默认要显示，有没有是另外一回事。点击领取后就不显示了
    tel_mask_show:false,// 是否显示电话弹窗
  },
   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 跳商家，需要参数groupPurchaseMerchantId
    let {groupPurchaseMerchantId,sharedUserId}=options;
    // 获取自己定位
    if(!app.globalData.latitude){//如果app.json也没有，则是外部进来的，要重新获取经纬度

    }
    if(sharedUserId==undefined || sharedUserId=="undefined") sharedUserId=null
    Object.assign(this.data,{
      groupPurchaseMerchantId,
    })
    this.setData({
      sharedUserId
    })
    // 发送请求
    this.requestGrouopMerchantInfo().then(()=>{
      //请求，商家评论
      this.findGroupPurchaseEvaluateList();     
      //请求，附近商家
      this.findNearGroupPurchaseMerchant2();
    }).then(()=>{
      wx.hideToast();
    });

    // 判断是否登入
    this.isLoginsuccess();
  },
  // 分享事件
  onShareAppMessage() {
    return {
        title: this.data.groupMerchantInfo.name,
        path: "/goods/GroupPurchaseShop/GroupPurchaseShop?groupPurchaseMerchantId="+this.data.groupPurchaseMerchantId+
        "&sharedUserId="+app.globalData.userId
    };
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
        url:"/goods/GroupPurchaseChildPage/serviceCategory1/order/order?&groupPurchaseCouponId="+id+
        "&sharedUserId="+this.data.sharedUserId
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
        url:"/goods/GroupPurchaseChildPage/serviceCategory2/order/order?groupPurchaseCouponId="+id+
        "&sharedUserId="+this.data.sharedUserId
      })
    }else{
      this.isLoginsuccess(true);//跳转到登入
    }
  },

  // 商家信息-请求
  requestGrouopMerchantInfo(){
    wx.showToast({
      title:"加载中",
      icon:"loading",
      mask:true,
      duration:20000
    })
    return wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseMerchantInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:app.globalData.latitude,
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
        // 保存代理商，订单提交时需要(可能是分享进来的)
        app.globalData.agentId=value.agentId;
        //设置标题
        wx.setNavigationBarTitle({
          title: value.name
        })
        //开始请求商家评价:如果评价不为空，则发送请求
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
    return wxRequest({
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
    return wxRequest({
      url:'/merchant/userClient?m=findNearGroupPurchaseMerchant2',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:app.globalData.latitude,
          longitude:app.globalData.longitude,
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
  // 点击商家图片事件
  merchantInfoImageTap(e){
    let {index=0,images}=e.currentTarget.dataset;
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
      tel_mask_show:false,
      QRcode_mask_show:false
    })
  },
	//店家二维码
	getMGJMerchantWXQRImage(){
		return wxRequest({
			url:'/merchant/userClient?m=getMGJMerchantWXQRImage',
			method:'POST',
			data:{
				token:app.globalData.token,
				params:{
					bizType:1,
					merchantId:this.data.groupPurchaseMerchantId
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
	//关闭二维码显示
	maskCancelTap(e){
    this.setData({
      QRcode_mask_show:false
    })
  },
})