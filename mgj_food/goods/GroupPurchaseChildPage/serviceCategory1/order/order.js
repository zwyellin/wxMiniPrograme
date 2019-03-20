// goods/GroupPurchaseChildPage/serviceCategory1/order/order.js
const app = getApp();
const { wxRequest } = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPayPageBack:false,//是否支付页面返回来的，如果是，则再次返回时直接退回到团购首页

    voucherItem:null,
    sliderValue:1,//滑块选择的数量

    totalMoney:"",//小计
    realTotalMoney:"",//实付总额

    redPacketDeduction:"",//红包抵扣的金额
    
    OrderSubmitReqObj:{//固定的参数
      merchantId:null,//从voucherItem可以获取
      groupPurchaseCouponId:null,
      loginToken:null,
      userId:null
    },
    orderId:null,//返回来的orderId

    redBagUsableCount:0,    //可用商家红包个数
		redBagList:[],          //可用的商家红包列表
		useRedBagList:null,       //本次订单使用的商家红包列表
		select:true,                //商家红包使用状态
		redBagMoney:0,               //商家红包使用金额
		redText:'暂无可用红包',      

		platformRedBagList:[],  //可用的平台红包列表  
		disabledPlatformRedBagList:[], //不可用的平台红包列表   
		usePlatformRedBagList:null,       //本次订单使用的平台红包列表
		platformSelect:true,        //平台红包使用状态
		platformRedBagMoney:0,       //平台红包使用金额
		platformRedBagCount:0,  //可使用的平台红包个数
		platformRedText:'无可用红包',
    
    isDisable:false,//是否可以不提交
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {groupPurchaseCouponId}=options;
    this.data.groupPurchaseCouponId=groupPurchaseCouponId;
    this.findGroupPurchaseCouponInfo().then(()=>{
      console.log("then")
      this.redBagSetting();
      this.queryPlatformRedBagList();
      this.filterUsableRedBagList();
    });
    
    //获得用户信息
    let {token,userId}=app.globalData;
    let OrderSubmitReqObj=this.data.OrderSubmitReqObj;
    Object.assign(OrderSubmitReqObj,{
      groupPurchaseCouponId,
      userId,
      loginToken:token
    })

  },
  onShow(){
		if (this.data.useRedBagList != null || this.data.addressInfoId != null || this.data.usePlatformRedBagList != null) {
			let redBagMoney = 0;
			let platformRedBagMoney = 0;
	    if (this.data.useRedBagList != null) {
          this.data.useRedBagList.map(item=>{
            redBagMoney += item.amt;
          });
          this.setData({
              redBagMoney:redBagMoney
          });
	    }
	    if (this.data.usePlatformRedBagList != null) {
	        this.data.usePlatformRedBagList.map(item=>{
					  platformRedBagMoney += item.amt;
		    	});
          this.setData({
              platformRedBagMoney:platformRedBagMoney
          });
      }
      this.setData({
        realTotalMoney:this.data.totalMoney-redBagMoney-platformRedBagMoney
      })
		}
  },
  onUnload(){
    console.log("isPayPageBack",this.data.isPayPageBack)
    if(this.data.isPayPageBack){
     wx.redirectTo({
       url:'/goods/GroupPurchaseIndex/GroupPurchaseIndex'
     })
    }
 },
    // 订单提交预览,获得订单号
    groupPurchaseOrderSubmit(){
      let OrderSubmitReqObj=JSON.parse(JSON.stringify(this.data.OrderSubmitReqObj));
      if (!this.data.isDisable) {
        wx.showLoading({
              title: '正在提交订单',
              mask: true
          });
        this.data.isDisable = true;
        let orderUseRedBagList = [];
        if (this.data.useRedBagList) {
          this.data.useRedBagList.map(item=>{
            let json = {}
            json.id = item.id;
            json.amt = item.amt;
            json.name = item.name;
            json.promotionType = item.promotionType
            orderUseRedBagList.push(json)
          })
        }
        if (this.data.usePlatformRedBagList) {
          this.data.usePlatformRedBagList.map(item=>{
            let json = {}
            json.id = item.id;
            json.amt = item.amt;
            json.name = item.name;
            json.promotionType = item.promotionType
            orderUseRedBagList.push(json)
          })
        }
        let redBags=orderUseRedBagList.length === 0 ? null : orderUseRedBagList;
        Object.assign(OrderSubmitReqObj,{
          merchantId:this.data.voucherItem.merchantId,
          groupPurchaseOrderType:1,//   1, "代金券",2, "团购券",3, "优惠买单"
          groupPurchaseCouponType:1,//  1代金券，2团购
          originalPrice:this.data.voucherItem.originPrice,//原价格
          price:this.data.voucherItem.price,//要出的价格
          quantity:this.data.sliderValue,//数量
          totalOriginalPrice:this.data.voucherItem.originPrice*this.data.sliderValue,//原价格*数量
          totalPrice:this.data.realTotalMoney
        })
        if(redBags!==null){
          Object.assign(OrderSubmitReqObj,{
            redBags
          })
        }
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
        })
    }
  },
  // 提交订单
  submitOrderBtnTap(){
    this.groupPurchaseOrderSubmit().then((res)=>{
        if (res.data.code === 0) {
          this.data.orderId=res.data.value.id;
          wx.showToast({
            title:"下单成功",
            icon:"none",
            duration:1000
          })
          setTimeout(()=>{
            wx.navigateTo({
              url:"/goods/GroupPurchasePay/GroupPurchasePay?price="+this.data.realTotalMoney+"&orderId="+this.data.orderId
            })
          },1000)
        }else if(res.data.code===500){
          wx.showToast({
            title:res.data.value || "未知错误",
            icon:"none",
            duration:2000
          })
        }
      }).then((res)=>{
        this.data.isDisable=false;
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
    let totalMoney=sliderValue*this.data.voucherItem.price;
    // 计算实际付款：
    let realTotalMoney=totalMoney-this.data.redPacketDeduction-this.data.redBagMoney-this.data.platformRedBagMoney;
    this.setData({
      sliderValue,
      totalMoney,
      realTotalMoney
    })
},
findGroupPurchaseCouponInfo(){
  return wxRequest({
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
      let voucherItem=this.voucherItemModify(value)
      this.setData({
        voucherItem
      });
       // 自动设置小计及总额
       this.sliderChanging();
    }else {}
  });
},


voucherItemModify(item){
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


redBagSetting(){
  let params={
    agentId:app.globalData.agentId,
    businessType:6,//团购6
    itemPrice:this.data.voucherItem.originPrice,
    quantity:1,
    redBags:"[]"
  }
  return wxRequest({
    url:'/merchant/userClient?m=redBagSetting',
    method:'POST',
    data:{
      token:app.globalData.token,
      params:params
    },
  }).then((res)=>{
    if (res.data.code === 0) {
      this.setData({
        platformRedBagCount:res.data.value.platformRedBagCount
      })
      
    }
  })
},
  //获取平台可用红包
queryPlatformRedBagList(){
  wxRequest({
        url:'/merchant/userClient?m=queryPlatformRedBagList',
        method:'POST',
        data:{
          token:app.globalData.token,
          params:{
            agentId:app.globalData.agentId,
            businessType: 6,
            itemsPrice: this.data.voucherItem.originPrice,
          }	
        },
      }).then(res=>{
        console.log(res);
    if (res.data.code === 0) {
      console.log(res);
      let platformRedBagAvailableList = res.data.value.platformRedBagAvailableList;    //不可使用的平台红包
      let platformRedBagList = res.data.value.platformRedBagList;      //可使用的平台红包
      let platformRedBagCount = res.data.value.platformRedBagCount;      //可使用的平台红包个数
      platformRedBagAvailableList.map(item=>{
        item.lookReason = false;
      });
      this.setData({
        disabledPlatformRedBagList:platformRedBagAvailableList,
        platformRedBagCount:platformRedBagCount,
        platformRedBagList:platformRedBagList
      });
    } else {
      let msg = res.data.value;
      feedbackApi.showToast({title: msg});
    }
      });
},

  //获取商家可用红包
filterUsableRedBagList(){
  wxRequest({
        url:'/merchant/userClient?m=filterUsableRedBagList',
        method:'POST',
        data:{
          token:app.globalData.token,
          params:{
            agentId:app.globalData.agentId,
            businessType: 6,
            itemsPrice: this.data.voucherItem.originPrice,
          }	
        },
      }).then(res=>{
        console.log(res);
    if (res.data.code === 0) {
      let valueList = res.data.value;
      valueList.map(item=>{
        item.selectStatus = false;
        item.expirationTime = format(item.expirationTime,'-'); 
      });
      this.setData({
        redBagList:valueList
      });	
    } else {
      let msg = res.data.value;
      feedbackApi.showToast({title: msg});
    }
      });
},

platformRedPage(){
  wx.navigateTo({
      url: '/goods/redbag/platformRedbag/platformRedbag?merchantId='+this.data.merchantId+'&itemsPrice=' +this.data.totalPrice
  });
},
merchantRedPage(){
  wx.navigateTo({
      url: '/goods/redbag/merchantRedbag/merchantRedbag?merchantId='+this.data.merchantId+'&itemsPrice=' +this.data.totalPrice
  });
},

})