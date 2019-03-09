const app = getApp();
const { wxRequest } = require('../../utils/util.js');
// goods/GroupPurchaseShop/GroupPurchaseShop.js
Page({
  data: {
    //商家信息请求参数
    latitude:null,
    longitude:null,
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
    let {groupPurchaseMerchantId=748,latitude,longitude}=options;
    // latitude="39.966128",longitude="116.304782",

    latitude=app.globalData.latitude;
    longitude=app.globalData.longitude;
    Object.assign(this.data,{
      groupPurchaseMerchantId,
      longitude,
      latitude
    })
    this.requestGrouopMerchantInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
        var value=this.GrouopMerchantModify(res.data.value);
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
        let msg = res.data.value;
        if (res.data.code === 100000 ) {
          setTimeout(()=>{
            wx.navigateTo({
              url:'/pages/login/login'
            });
          },1000);	
        }
        if(res.data.code === 500 && res.data.value=="商家未关联代理商"){//返回
          setTimeout(()=>{
          wx.navigateBack({ //返回前一页
            delta: 1
            })
          },2000);	
        }
        wx.showToast({
          title: res.data.value,
          icon:"none",
          mask:true,
          duration: 2000
        })
      }
    })
  },
  // 商家信息修改
  GrouopMerchantModify(value){
    // 修改imgs,字符串转换为数组
    if(value.imgs){
        value.imgs=value.imgs.split(";");
      if(value.imgs.length >= 4){
        value.showImgs=value.imgs.slice(0,3)
      }else{
        value.showImgs=value.imgs;
      }
    }else{
      value.showImgs=[];
      value.imgs=[];
    }
    // 联系方式处理，字符串转换为数组
    if(value.contacts){
      value.contacts=value.contacts.split(";");
    }else{
      value.contacts=[];
      }
    //把商家服务，属性放到一个数组里面去
    value.merchantServe=[];
    if(value.hasWifi)  value.merchantServe= value.merchantServe.concat({type:"wifi",text:"无线"});
    if(value.hasPOSPayment)  value.merchantServe= value.merchantServe.concat({type:"posPayment",text:"刷卡"});
    if(value.hasRooms)  value.merchantServe= value.merchantServe.concat({type:"rooms",text:"包厢"});
    if(value.hasDepot)  value.merchantServe= value.merchantServe.concat({type:"depot",text:"停车"});
    if(value.hasScenerySeat)  value.merchantServe= value.merchantServe.concat({type:"scenerySeat",text:"景观位"});
    if(value.hasAlfrescoSeat)  value.merchantServe= value.merchantServe.concat({type:"alfrescoSeat",text:"露天位"});
    if(value.hasNoSmokIngArea)  value.merchantServe= value.merchantServe.concat({type:"noSmokIngArea",text:"无烟区"});
    // 把评论分类整理到一个数组里面(未做)
    // 提取出来代金券和团购套餐对象=>对应数组
    value.voucher=[];//代金券
    value.groupSetMeal=[];//团购套餐
    value.groupPurchaseCouponList.forEach((item,index,arr) => {
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
      //提取出来代金券和团购套餐对象=>对应数组
      if(item.type==1){//代金券
        value.voucher=value.voucher.concat(item);
      }else if(item.type==2){//团购套餐
        value.groupSetMeal= value.groupSetMeal.concat(item);
      }
    });
    return value;
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
          latitude:"39.966128",
          longitude:"116.304782",
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



  // 业务逻辑
  // 点击优惠买单
  serviceCategory0Tap(){
    wx.navigateTo({
      url:"/goods/GroupPurchaseChildPage/serviceCategory0/serviceCategory0"
    })
  },
  // 点击代金券 按钮
  serviceCategory1Tap(e){
    let {item_index}=e.target.dataset;
    wx.navigateTo({
      url:"/goods/GroupPurchaseChildPage/serviceCategory1/order/order?itemIndex="+item_index
    })
  },
})