// goods/GroupPurchaseChildPage/serviceCategory2/order/order.js
const app = getApp();
const { wxRequest } = require('../../../../utils/util.js');
const {modify} =require("../../../GroupPurchaseIndex/groupPurchasePublicJs.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginsuccess:false,//是否登入

    groupMerchantInfo:null,
    groupSetMealItem:null,
    merchantId:null,

    pickerData:null,//日期选择器选择的时间
    sliderValue:1,//滑块选择的数量

    totalMoney:"",//小计
    realTotalMoney:"",//实付总额

    redPacketDeduction:"",//红包抵扣的金额


    OrderSubmitReqObj:{//固定的参数
      merchantId:null,//可以从groupSetMealItem可以获取
      groupPurchaseCouponId:null,
      loginToken:null,
      userId:null
    },
    orderId:null,//返回来的orderId
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {groupPurchaseCouponId}=options;
    this.data.groupPurchaseCouponId=groupPurchaseCouponId;
    this.findGroupPurchaseCouponInfo();
   
   //获得用户信息
   let {token,userId}=app.globalData;
   let OrderSubmitReqObj=this.data.OrderSubmitReqObj;
   Object.assign(OrderSubmitReqObj,{
     groupPurchaseCouponId,
     userId,
     loginToken:token
   })
  },
   // 提交订单
   submitOrderBtnTap(){
    this.groupPurchaseOrderSubmit().then(()=>{
      wx.navigateTo({
        url:"/goods/pay/pay?price="+this.data.realTotalMoney+"&orderId="+this.data.orderId
      })
    })
  },
    // 订单提交预览,获得订单号
    groupPurchaseOrderSubmit(){
      let OrderSubmitReqObj=JSON.parse(JSON.stringify(this.data.OrderSubmitReqObj));
      Object.assign(OrderSubmitReqObj,{
        merchantId:this.data.groupSetMealItem.merchantId,
        groupPurchaseOrderType:2,//   1, "代金券",2, "团购券",3, "优惠买单"
        groupPurchaseCouponType:2,//  1代金券，2团购
        originalPrice:this.data.groupSetMealItem.packageOriginalPrice,
        price:this.data.groupSetMealItem.price,
        quantity:this.data.sliderValue,
        totalOriginalPrice:this.data.groupSetMealItem.packageOriginalPrice*this.data.sliderValue,
        totalPrice:this.data.realTotalMoney
      })
      let data=JSON.stringify(OrderSubmitReqObj);
      return wxRequest({
        url:'/merchant/userClient?m=groupPurchaseOrderSubmit',
        method:'POST',
        data:{
          token:app.globalData.token,
          params:{
            data:data
          }
        },
      }).then(res=>{
        if (res.data.code === 0) {
         console.log("获得订单号",res.data.value.id);
         this.data.orderId=res.data.value.id;
        }else if(res.data.code===500){
          wx.showToast({
            title:res.data.value || "未知错误",
            icon:"none",
            duration:2000
          })
        }
    })
  },


  modifygroupSetMealItem(value){
    console.log("显示",value)
    // images,字符串转换为数组
    if(value.images instanceof Array){
     //访问上一页面的对象，是引用,所以。第一次进来修改为数组。返回再进来时已经是数组了
      //所以，这里doNothing  
    }else{
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
    }
    return value;
  },
  // 日期选择事件
  pickerDateChange(e){
    this.setData({
      pickerData:e.detail.value
    })
  },
  // 滑块滑动事件
  sliderChanging(e){
    var type;
    try{
      type=e.target.dataset.type;
    }catch(err){
      type=0;
    }
    let sliderValue=this.data.sliderValue+parseInt(type);
     //计算小计：
    let totalMoney=sliderValue*this.data.groupSetMealItem.price;
    // 计算实际付款：
    let realTotalMoney=totalMoney-this.data.redPacketDeduction;
    this.setData({
      sliderValue,
      totalMoney,
      realTotalMoney
    })
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
        let groupSetMealItem=this.modifygroupSetMealItem(value)
        this.setData({
           groupSetMealItem
        });
        // 计算总额和小计
       this.sliderChanging();
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



})