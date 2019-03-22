// goods/GroupPurchaseChildPage/serviceCategory2/order/order.js
const app = getApp();
const {getTime, wxRequest,format } = require('../../../../utils/util.js');
const {modify} =require("../../../GroupPurchaseIndex/groupPurchasePublicJs.js")
const feedbackApi=require('../../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPayPageBack:false,//是否支付页面返回来的，如果是，则再次返回时直接退回到团购首页

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
    maxNum:null, //最多购买数量

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
    platformRedText:'暂无可用红包',
    
    coupons:null, //马管家券
    promotionCouponsDiscountTotalAmt:null,//马管家券金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {groupPurchaseCouponId}=options;
    this.data.groupPurchaseCouponId=groupPurchaseCouponId;
    this.findGroupPurchaseCouponInfo().then(()=>{
      this.promotionPreSetting();
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
		if (this.data.useRedBagList != null ||  this.data.usePlatformRedBagList != null) {
			let redBagMoney = 0;
			let platformRedBagMoney = 0;
	    if (this.data.useRedBagList != null) {
          this.data.useRedBagList.map(item=>{
            redBagMoney += item.amt;
          });
          this.promotionPreSetting().then((res)=>{
            console.log("show时候的",res)
            if(res==undefined){
              this.setData({
                redBagMoney:redBagMoney
              });
            }else{
              wx.showToast({
                title:res.data.value,
                icon:"none",
                duration:2000,
                mask:true
              })
              // 并且清除设置的值
              this.data.useRedBagList=null;
              this.setData({
                redBagMoney:0
              });
              //再次请求，重新赋值
              this.promotionPreSetting();
            }
          })

	    }
	    if (this.data.usePlatformRedBagList != null) {
	        this.data.usePlatformRedBagList.map(item=>{
					  platformRedBagMoney += item.amt;
          });
          this.promotionPreSetting().then((res)=>{
            if(res==undefined){
              this.setData({
                platformRedBagMoney:platformRedBagMoney
              });
            }else{
              wx.showToast({
                title:res.data.value,
                icon:"none",
                duration:2000,
                mask:true
              })
              // 并且清除设置的值
              this.data.usePlatformRedBagList=null;
              this.setData({
                platformRedBagMoney:0
              });
              //再次请求，重新赋值
              this.promotionPreSetting();
            }
          })
      }
		}
  },
  onUnload(){
   if(this.data.isPayPageBack){
     wx.redirectTo({
       url:'/goods/GroupPurchaseIndex/GroupPurchaseIndex'
     })
    }
 },
   // 提交订单
   submitOrderBtnTap(){
    this.groupPurchaseOrderSubmit().then(res=>{
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
      }else if(res.data.code==501 && res.data.value=="该团购券为商家新用户专享"){//针对新用户专享
        wx.showToast({
          title:res.data.value,
          icon:"none",
          duration:2000
        })
      }
    }).then((res)=>{
      this.data.isDisable=false;
    })
  },
    // 订单提交预览,获得订单号
    groupPurchaseOrderSubmit(){
      if (!this.data.isDisable) {
        let OrderSubmitReqObj=JSON.parse(JSON.stringify(this.data.OrderSubmitReqObj));
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
          merchantId:this.data.groupSetMealItem.merchantId,
          groupPurchaseOrderType:2,//   1, "代金券",2, "团购券",3, "优惠买单"
          groupPurchaseCouponType:2,//  1代金券，2团购
          originalPrice:this.data.groupSetMealItem.packageOriginalPrice,//原价格
          price:this.data.groupSetMealItem.price,//要出的价格
          quantity:this.data.sliderValue,//数量
          totalOriginalPrice:this.data.groupSetMealItem.packageOriginalPrice*this.data.sliderValue,//原价格*数量
          totalPrice:this.data.realTotalMoney
        })
        if(redBags!==null){
          Object.assign(OrderSubmitReqObj,{
            redBags
          })
        }
        let coupons=this.data.coupons;
        coupons=JSON.parse(coupons)
        if(coupons!=null){
          Object.assign(OrderSubmitReqObj,{
            coupons
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
  // 更新订单
  promotionPreSetting(){
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
    let params={
      agentId:app.globalData.agentId,
      businessType:6,//团购6
      itemPrice:this.data.groupSetMealItem.price,
      quantity:this.data.sliderValue,
    }
    let redBags=orderUseRedBagList.length === 0 ? null : orderUseRedBagList;
    if(redBags!==null){
      redBags=JSON.stringify(redBags);
      Object.assign(params,{
        redBags
      })
    }
    return wxRequest({
      url:'/merchant/userClient?m=promotionPreSetting',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:params
      },
    }).then((res)=>{
      if (res.data.code === 0) {
        this.data.coupons=res.data.value.coupons;//马管家券
        this.setData({
          realTotalMoney:res.data.value.totalPrice,
          promotionCouponsDiscountTotalAmt:res.data.value.promotionCouponsDiscountTotalAmt,//马管家券金额
        })
      }else if(res.data.code===502){
        return new Promise((resolve, reject) => {
            resolve(res);
        });
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
		          itemsPrice: this.data.groupSetMealItem.price
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
		          bizType: 6,
              itemsPrice: this.data.groupSetMealItem.price,
              merchantId:this.data.merchantId
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
          redBagList:valueList,
          redBagUsableCount:valueList.length
        });	
        console.log("redBagList",this.data.redBagList)
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
  // 日期选择事件
  pickerDateChange(e){
    this.setData({
      pickerData:e.detail.value
    })
  },
  // 滑块滑动事件
  sliderChanging(e){
    var type;//-1为减。1为加
    try{
      type=e.target.dataset.type;
    }catch(err){
      type=0;
    }
    type=parseInt(type);
    let sliderValue=this.data.sliderValue+type;
     //计算小计：
    let totalMoney=sliderValue*this.data.groupSetMealItem.price;
    // 计算实际付款：
    let realTotalMoney=totalMoney-this.data.redPacketDeduction;
    this.setData({
      sliderValue,
      totalMoney,
    //realTotalMoney
    })
    this.promotionPreSetting();
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
      }
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;
        let groupSetMealItem=this.modifygroupSetMealItem(value)

          /** 库存类型 0:库存无限，1：库存有限 */
          //private Integer stockType;
          /** 库存 */
          //private Integer stock;
          /** 剩余库存 */
          //private Integer surplusStock;
          /** 是否限购 1:限购，2：不限购， 3：新用户限购（这个前端不用做限制，提交后台会校验）*/
          //private Integer isPurchaseRestriction;
          /** 每单限量数 */
          //private Integer orderLimit = 0;
          let {stockType,isPurchaseRestriction,stock,surplusStock,orderLimit}=groupSetMealItem;
          let maxNum=999;//默认较大的值
          if(isPurchaseRestriction==1 && stockType==1){//都有限制，取小值
            maxNum=Math.min(surplusStock,orderLimit)
          }else if(isPurchaseRestriction==1){//库存有限制
             maxNum=surplusStock;
          }else if(stockType==1){
            maxNum=orderLimit;
          }
          this.data.groupSetMealItem=groupSetMealItem;
          this.setData({
            groupSetMealItem,
            merchantId:groupSetMealItem.merchantId,
            maxNum
         });
        //  设置预约时间
       //是否需要预约
      //@property (nonatomic, assign) BOOL isBespeak; 0 false。
       //预约天数
      //@property (nonatomic, assign) NSInteger bespeakDayCount;
      /** 核销时间 **/
      //@property (nonatomic, copy) NSString *cancelAfterVerificationTime;

        if(groupSetMealItem.isBespeak==1){
          // 格式为"YYYY-MM-DD"
          let Y=new Date().getFullYear();
          let M = new Date().getMonth() + 1;
          if(M<10) M='0'+M.toString();
          let D= new Date().getDate();
          if(D<10) D="0"+D.toString()
          let pickerDataStart=Y+'-'+M+'-'+D;
          console.log("pickerDataStart",pickerDataStart);
          let bespeakDays=groupSetMealItem.bespeakDays;
          var DateEnd=new Date(new Date().setDate(new Date().getDate()+bespeakDays));
          let Y1=DateEnd.getFullYear();
          let M1 = DateEnd.getMonth() + 1;
          if(M1<10) M1='0'+M1.toString();
          let D1= DateEnd.getDate();
          if(D1<10) D1="0"+D1.toString()
          let pickerDataEnd=Y1+'-'+M1+'-'+D1;
          console.log("pickerDataEnd",pickerDataEnd);
          this.setData({
            pickerDataStart,
            pickerDataEnd
          })
        }
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