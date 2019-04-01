// goods/GroupPurchaseChildPage/serviceCategory2/serviceCategory2.js
const app = getApp();
const { wxRequest,buttonClicked } = require('../../../utils/util.js');
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
    groupSetMealItem:null,//团购套餐
    groupSetMealexcludeItem:null,//本店优惠
    agentId:null,//订单提交时需要,可能是分享进来的，因而要重置agentId 
    // 其它页面渲染需要属性
    latitude:null,
    longitude:null,
    // 页面状态
    isLoginsuccess:false,//是否登入
    tel_mask_show:false,

    // 店家二维码
    WXQRImage:"",//店家二维码
    QRcode_mask_show:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数@groupPurchaseCouponId为其id
    let {groupPurchaseCouponId,sharedUserId}=options;
    const scene = decodeURIComponent(options.scene);//,分割 id:merchantid,sharedUserId
		console.log("options",options);
		console.log("scene",scene);
		//search为商店搜索，点击后跳转自身商店(用于标识)
		if(scene==undefined || scene=="undefined"){
      this.data.groupPurchaseCouponId =groupPurchaseCouponId;
			this.data.sharedUserId=sharedUserId;
		}else{//扫码进来的
			console.log("扫码进来的");
      if(scene.indexOf(",")==-1){
				this.data.goodsId=scene;
			}else{
				let sceneArr=scene.split(",");
				this.data.goodsId =sceneArr[0];
				this.data.sharedUserId=sceneArr[1];
			}
		}
		// 分享者id
		sharedUserId=this.data.sharedUserId;
    if(sharedUserId==undefined || sharedUserId=="undefined") sharedUserId=null;
    
    // 获取自己定位
    let latitude,longitude;
		console.log("重新调用前的经纬度,",app.globalData.longitude)
		if(!app.globalData.latitude){//如果app.json也没有，则是外部进来的，要重新获取经纬度
			app.getLocation();
      console.log("重新调用获取经纬度,",app.globalData.longitude)
		}
    latitude=app.globalData.latitude;
    longitude=app.globalData.longitude;
    Object.assign(this.data,{
      groupPurchaseCouponId,
      longitude,
      latitude,
    })
    this.setData({
      sharedUserId
    })
    this.findGroupPurchaseCouponInfo();
     
    //  判断是否登入
    this.isLoginsuccess();
  },
  // 分享事件
  onShareAppMessage() {
    console.log("分享成功",app.globalData.userId)
    return {
        title: this.data.groupSetMealItem.groupPurchaseName,
        path: `/goods/GroupPurchaseChildPage/serviceCategory2/serviceCategory2?groupPurchaseCouponId=${this.data.groupPurchaseCouponId}&sharedUserId=${app.globalData.userId}`,
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
  // 点击团购的 按钮。
  serviceCategory2Tap(e){
    if(buttonClicked(this)) return;
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
  // 请求团购套餐信息
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
          groupPurchaseCouponId:this.data.groupPurchaseCouponId,
          latitude:app.globalData.latitude,
          longitude:app.globalData.longitude,
        }	
      },
    }).then(res=>{
      wx.hideToast();
      if (res.data.code === 0) {
        let value=res.data.value;
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseMerchant)
        let groupSetMealItem=this.modifygroupSetMealItem(value)
        this.setData({
           groupSetMealItem,
           groupMerchantInfo
        });
        // 获取代理商
        app.globalData.agentId=value.agentId;
        // 加载本店优惠
        this.findGroupPurchaseCouponList(groupSetMealItem.merchantId);
      }else {}
    });
  },
  modifygroupSetMealItem(value){
      // <!--提醒文字 -->
      // <!-- 核销。@isAutomaticallyCancelAfterVerification 。1:自动;2:不自动 -->
      //文案要求：
      // 1.免预约，则显示 免预约，随时退，不可叠加，过期自动退
      // 2.需预约，不自动核销。则显示，需预约，随时退，不可叠加，过期自动退
      // 3.需预约，自动核销。则显示，需预约，随时退，超时自动使用，不可叠加
      // 处理是否叠加
      
      if(!value.isBespeak){//免预约
        value.bespeakCumulateMsg=["免预约","随时退","不可叠加","过期自动退"];
      }else{//需预约
        if(value.isAutomaticallyCancelAfterVerification==1){//自动核销
          value.bespeakCumulateMsg=["需预约","随时退","不可叠加","超时自动使用"];
        }else{//2:不自动核销
          value.bespeakCumulateMsg=["需预约","随时退","不可叠加","过期自动退"];
        }
      }
      // if(value.isCumulate){//是否叠加 0:否,1:是 
      //   value.isCumulateText="可叠加"
      // }else{
      //   value.isCumulateText="不可叠加"
      // }
      // //处理是否预约  
      // if(value.isBespeak){//0:否,1:是 
      //   value.isBespeakText="需预约"  
      // }else{
      //   value.isBespeakText="免预约"
      // }

      // 处理图片
    if(value.images){
      value.images=value.images.split(";");
      if(value.images.length >= 4){
        value.showImgs=value.images.slice(0,3)
      }else{
        value.showImgs=value.images;
      }
    }else{
      value.showImgs=[];
      value.images=[];
    }
    // 修改createTime
    if(value.createTime && value.createTime.indexOf(" ")!=-1){
      value.createTime=value.createTime.substring(0,value.createTime.indexOf(" "));
    }
    return value;
  },
  modifygroupSetMealItem1(value){
    value.forEach((_item)=>{
      // 处理是否叠加
      if(_item.isCumulate){//是否叠加 0:否,1:是 
        val_itemue.isCumulateText="可叠加"
      }else{
        _item.isCumulateText="不可叠加"
      }
      //处理是否预约  
      if(_item.isBespeak){//0:否,1:是 
        _item.isBespeakText="需预约"
      }else{
        _item.isBespeakText="免预约"
      }
    })

    return value;
  },
  // 请求本店优惠
  findGroupPurchaseCouponList(id){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseCouponList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          groupPurchaseCouponId:this.data.groupPurchaseCouponId,
          merchantId:id,
          size:20,
          start:0,
          type:2
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;
        let groupSetMealexcludeItem=this.modifygroupSetMealItem1(value);
        this.setData({
           groupSetMealexcludeItem
        });
        console.log("groupSetMealexcludeItem",groupSetMealexcludeItem)
      }else {}
    });
  },


  // 点击图片事件
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
  // 弹窗 点击取消
  maskCancelTap(e){
    this.setData({
      tel_mask_show:false,
      QRcode_mask_show:false
    })
  },
	//商品的二维码
	getMGJMerchantWXQRImage(){
		return wxRequest({
			url:'/merchant/userClient?m=getMGJGoodsWXQRImage',
			method:'POST',
			data:{
				token:app.globalData.token,
				params:{
          bizType:6,
          goodsId:this.data.groupPurchaseCouponId
				}	
			},
		}).then(res=>{
			let WXQRImage="data:image/png;base64,"+res.data.value;
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
    let WXQRImage=this.data.WXQRImage;
    if(WXQRImage.length==0){//说明还没有发请求
      wx.showToast({
        title:"加载中",
        icon:"loading",
        duration:2000
      })
      this.getMGJMerchantWXQRImage().then(()=>{
        wx.hideToast();
      })
    }
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
})