// goods/GroupPurchaseChildPage/serviceCategory2/serviceCategory2.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');
const {modify} =require("../../GroupPurchaseIndex/groupPurchasePublicJs.js")
// findGroupPurchaseCouponInfo：代金券和团购套餐详情都是请求这接口。区别是type。1：代金券，2：团购套餐
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoginsuccess:false,//是否登入

    tel_mask_show:false,
    groupMerchantInfo:null,//
    merchantId:null,
    groupSetMealItem:null,//上一页团购套餐Item。以及加上请求回来的套餐具体内容
    groupSetMealexcludeItem:null,//本店优惠

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
     this.findGroupPurchaseCouponInfo();
     
    //  判断是否登入
    this.isLoginsuccess();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  findGroupPurchaseCouponInfo(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseCouponInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          groupPurchaseCouponId:this.data.groupPurchaseCouponId,
          size:20,
          start:0
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseMerchant)
        let groupSetMealItem=this.modifygroupSetMealItem(value)
        this.setData({
           groupSetMealItem,
           groupMerchantInfo
        });
        // 加载本店优惠
        this.findGroupPurchaseCouponList(groupSetMealItem.merchantId);
      }else {}
    });
  },
  modifygroupSetMealItem(value){
      // 处理是否叠加
      if(value.isCumulate){//是否叠加 0:否,1:是 
        value.isCumulateText="可叠加"
      }else{
        value.isCumulateText="不可叠加"
      }
      //处理是否预约  
      if(value.isBespeak){//0:否,1:是 
        value.isBespeakText="需预约"  
      }else{
        value.isBespeakText="免预约"
      }
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
  // 电话弹窗 点击取消
  maskCancelTap(e){
    this.setData({
      tel_mask_show:false
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