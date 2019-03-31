// goods/GroupPurchaseChildPage/serviceCategory0/serviceCategory0.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');
const feedbackApi = require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sharedUserId:null,//分享者id

    istotalAmountInputFocues:true,//input焦点控制
   
    totalAmountInputValue:"",//消费总额，实时
    excludeAmountInputValue:"",//没有优惠的金额，实时

    totalAmountNewValue:"",//消费总额，加上￥
    excludeAmountNewValue:"",//没有优惠的金额，加上￥

    excludeAmountInputActive:false,//默认不显示,显示时同时用于控制不参与优惠的input焦点

    discount:null,//这个等于OrderPreviewRequestObj.discountRatio
    discountText:null,

    discountActive:false,//是否开启打折

    actuallyAmount:"",//实付金额(totalAmountInputValue,[excludeAmountInputActive,excludeAmountInputValue],[discountActive,discount])
    discountAmount:"",//折扣了多少金额(totalAmountInputValue,[excludeAmountInputActive,excludeAmountInputValue],[discountActive,discount])

    OrderPreviewRequestObj:{//请求参数对象,这些值是本地计算的(减少服务器压力)，提交前要已服务器为准
      cashDeductionPrice:0,//抵用劵，默认为0
      quantity:1, //数量，这边固定为1
      groupPurchaseOrderType:3,// 1, "代金券",2, "团购券",3, "优惠买单"

      merchantId:null,
      discountRatio:null,
      hasDiscount:0,//默认0，不开启。是否开启打折 0 false,1 true
      userId:null,
      loginToken:null,// app.globalData.token;
     
    },
    groupPurchaseOrderSubmitRequestObj:{},//根据服务器返回。和OrderPreviewRequestObj合并

    
    originalTotalPrice:null,

    orderId:null,//保存订单提交时候的order订单id
    orderMoney:null,

    isSharingRelationship:null,// @isSharingRelationship为该商店的代金券是否和优惠买单共享  //  1:共享；2：不共享 。不共享则不显示抵用券
    enableGroupPurchaseOrderCouponCodeCount:null,//抵用券数量

    coupons:null, //马管家券
    promotionCouponsDiscountTotalAmt:null,//马管家券金额
    groupPurchaseOrderCouponCodeList:[],//抵用券要发送到请求的对象
    couponsShow:false,//是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    // @isSharingRelationship为该商店的代金券是否和优惠买单共享
    //  1:共享；2：不共享 。不共享则不显示抵用券
    let {merchantId,discountRatio,merchantName,isSharingRelationship,sharedUserId}=options;
    if(sharedUserId==undefined || sharedUserId=="undefined") sharedUserId=null
    this.data.sharedUserId=sharedUserId;
    this.setData({
      isSharingRelationship
    })
    console.log("代金券是否和优惠买单共享，1:共享；2：不共享",isSharingRelationship)
    //设置标题
    wx.setNavigationBarTitle({
      title:merchantName
    })
    //获得用户信息
    let {token,userId}=app.globalData;
    let OrderPreviewRequestObj=this.data.OrderPreviewRequestObj;
    //赋值给OrderPreviewRequestObj
    Object.assign(OrderPreviewRequestObj,{
      merchantId,discountRatio,
      loginToken:token,userId
    })
    let discount=this.data.discount;
    discount=discountRatio/100;
    let discountText=(discount*10).toFixed(1);
    this.setData({
      OrderPreviewRequestObj,
      merchantId,
      discount,
      discountText:discountText
    });
    this.groupPurchaseOrderPreview0();
  },
  onShow(){
    let shareVouchersData=this.data.shareVouchersData;
    if(shareVouchersData===undefined){//没有进抵用券页面

    }else{
      let couponCodeList=shareVouchersData.couponCodeList;
      let groupPurchaseOrderCouponCodeList=[];
      // 遍历查找出被选中的
      let codeItem={};
      let cashDeductionPrice=0;
      couponCodeList.forEach((_item)=>{
        if(_item.checkType){
          codeItem={
            couponCode:_item.couponCode,
            id:_item.id
          }
          groupPurchaseOrderCouponCodeList.push(codeItem);
          // 统计抵用券金额
          cashDeductionPrice+=_item.originPrice;
        }
      })
      // 保存抵用券金额，但不渲染到页面。先后台判断
      this.data.OrderPreviewRequestObj.cashDeductionPrice=cashDeductionPrice;
      this.setData({
        groupPurchaseOrderCouponCodeList,
      },()=>{
        this.groupPurchaseOrderPreview();//发送请求,后台判断及结算
      })
    }
  },
  // 提交
  serverType0Tap(){
    // url="/goods/pay/pay?merchantId={{groupMerchantInfo.id}}&price={{actuallyAmount}}"; 
      this.groupPurchaseOrderPreview().then(()=>{//根据服务器返回计算的值
        this.groupPurchaseOrderSubmit().then(()=>{//获得订单号
            let orderId=this.data.orderId;
            if(orderId==null){
              
            }else{
             let actuallyAmount=this.data.actuallyAmount;
             if((typeof actuallyAmount)=="string" && actuallyAmount.indexOf('￥')!=-1){
              actuallyAmount=parseFloat(this.data.totalAmountInputValue.substring(1))
             }
              wx.navigateTo({
                url:"/goods/GroupPurchasePay/GroupPurchasePay?price="+actuallyAmount+"&orderId="+this.data.orderId
              })
            }
        });
      });
    },
  // 订单预览
  groupPurchaseOrderPreview0(){
    let data=this.data.OrderPreviewRequestObj;
    if(this.data.sharedUserId!==null){
      data.sharedUserId=this.data.sharedUserId;
    }
    data=JSON.stringify(data);
    wx.showToast({
      title:"加载中",
      icon:"loading",
      duration:20000,
      mask:true
    })
    return wxRequest({
      url:'/merchant/userClient?m=groupPurchaseOrderPreview',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          data:data
        }
      }
    }).then((res)=>{
      wx.hideToast();
      if (res.data.code === 0) {
        let value=res.data.value;
        this.setData({
          enableGroupPurchaseOrderCouponCodeCount:value.enableGroupPurchaseOrderCouponCodeCount,
          // 保存马管家券
          coupons:value.coupons,
          // 保存抵用券
          promotionCouponsDiscountTotalAmt:value.promotionCouponsDiscountTotalAmt,
        })
      }else{
        wx.showToast({
          title:res.data.vallue,
          icon:"none",
        })
      }
    })
  },
  groupPurchaseOrderPreview(status){
    if(!status){//在不参与优惠金额，那里输入因为太频繁请求，木有转圈圈
      wx.showToast({
        title:"更新订单",
        icon:"loading",
        duration:20000,
        mask:true
      })
    }
    let data=JSON.parse(JSON.stringify(this.data.OrderPreviewRequestObj));
    let totalPrice=parseFloat(this.data.totalAmountInputValue.substring(1));
    let excludeAmountInputValue=this.data.excludeAmountInputValue;
    data.totalPrice=totalPrice;
    let notJoinDiscountAmount="";
    if(this.data.discountActive){
      data.hasDiscount=1;
    }else{
      data.hasDiscount=0;
    }
    if(this.data.excludeAmountInputActive && excludeAmountInputValue!=null&&excludeAmountInputValue.length>1){
      notJoinDiscountAmount=parseFloat(this.data.excludeAmountInputValue.substring(1))
      data.notJoinDiscountAmount=notJoinDiscountAmount;
    }
    this.data.orderMoney=data.totalPrice;
    data.originalPrice=totalPrice;
    if(this.data.sharedUserId!==null){
      data.sharedUserId=this.data.sharedUserId;
    }
    // 抵用券
    let groupPurchaseOrderCouponCodeList=this.data.groupPurchaseOrderCouponCodeList;
    if(groupPurchaseOrderCouponCodeList.length!=0){
      data.groupPurchaseOrderCouponCodeList=groupPurchaseOrderCouponCodeList;
    }
    data=JSON.stringify(data);
    return wxRequest({
      url:'/merchant/userClient?m=groupPurchaseOrderPreview',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          data:data
        }
      },
    }).then(res=>{
      wx.hideToast();
      if (res.data.code === 0) {
        let {coupons,originalTotalPrice,cashDeductionPrice,originalPrice,notJoinDiscountAmount,discountAmt,totalPrice,promotionCouponsDiscountTotalAmt}=res.data.value; 
        let OrderPreviewRequestObj=this.data.OrderPreviewRequestObj;
        if(this.data.discountActive) {
          OrderPreviewRequestObj.hasDiscount=1;
        }else{
          OrderPreviewRequestObj.hasDiscount=0;
        }
        let groupPurchaseOrderSubmitRequestObj=JSON.parse(JSON.stringify(OrderPreviewRequestObj));
        if(promotionCouponsDiscountTotalAmt!==null){
          groupPurchaseOrderSubmitRequestObj.promotionCouponsDiscountTotalAmt=promotionCouponsDiscountTotalAmt;
        };
        Object.assign(groupPurchaseOrderSubmitRequestObj,{
          originalPrice,notJoinDiscountAmount,totalPrice
        })
        this.data.originalTotalPrice=originalTotalPrice;//这个价格本来真实提交时总额，但优惠大于输入金额时，实际提交金额为0.01即totalPrice字段
        this.data.groupPurchaseOrderSubmitRequestObj=groupPurchaseOrderSubmitRequestObj;
        // 更新总提交价格
        this.data.actuallyAmount=totalPrice;
        this.setData({
          actuallyAmount:totalPrice,
          promotionCouponsDiscountTotalAmt,
          'OrderPreviewRequestObj.cashDeductionPrice':cashDeductionPrice        // 更新抵用券
        })
        this.data.coupons=coupons;
      }else{
        wx.showToast({
          title:res.data.value,
          icon:"none",
          duration:2000
        })
        // 重置抵用券
        this.data.groupPurchaseOrderCouponCodeList=[];
        // 重置抵用券金额
        this.setData({
          'OrderPreviewRequestObj.cashDeductionPrice':0
        })
        delete this.data.shareVouchersData;//共享数据清除
      }
    });
  },
  // 订单提交预览,获得订单号
  groupPurchaseOrderSubmit(){
    wx.showToast({
      title:"正在提交",
      icon:"loading",
      duration:20000,
      mask:true
    })
    let groupPurchaseOrderSubmitRequestObj=JSON.parse(JSON.stringify(this.data.groupPurchaseOrderSubmitRequestObj));
    if(groupPurchaseOrderSubmitRequestObj.hasDiscount==0) delete groupPurchaseOrderSubmitRequestObj.hasDiscount;
    if(!this.data.excludeAmountInputActive) delete groupPurchaseOrderSubmitRequestObj.notJoinDiscountAmount;
    let coupons=this.data.coupons;
     // 马管家券
    if(coupons!=null){
      groupPurchaseOrderSubmitRequestObj.coupons=coupons;
    }
    if(this.data.sharedUserId!==null){
      groupPurchaseOrderSubmitRequestObj.sharedUserId=this.data.sharedUserId;
    }
    // 抵用券
    let groupPurchaseOrderCouponCodeList=this.data.groupPurchaseOrderCouponCodeList;
    if(groupPurchaseOrderCouponCodeList!=null && groupPurchaseOrderCouponCodeList.length!=0){
      groupPurchaseOrderSubmitRequestObj.groupPurchaseOrderCouponCodeList=groupPurchaseOrderCouponCodeList;
    }
    delete groupPurchaseOrderSubmitRequestObj.promotionCouponsDiscountTotalAmt
    let data=JSON.stringify(groupPurchaseOrderSubmitRequestObj);
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
      wx.hideToast();
      if (res.data.code === 0) {
       console.log("获得订单号",res.data.value.id);
       this.data.orderId=res.data.value.id;
      }else{
        wx.showToast({
          title:res.data.value,
          icon:"none",
          duration:2000
        })
        // 重置所有数据
        // 重置两个input值
        this.data.totalAmountInputValue="";
        this.data.excludeAmountInputValue="";
        this.setData({
          totalAmountNewValue:"",
          excludeAmountNewValue:"",
          'OrderPreviewRequestObj.cashDeductionPrice':0//抵用券金额
        })
        // 重置抵用券
        this.data.groupPurchaseOrderCouponCodeList=[];
        delete this.data.shareVouchersData;//共享数据清除
        // 重置计算的值
        this.actuallyAmount();
      }

  })
},
  // 点击抵用券事件
  couponCodeTap(e){
    if(this.data.totalAmountInputValue.length==0){
      wx.showToast({
        title:"请先输入消费金额",
        icon:"none"
      })
      return;
    }
    wx.navigateTo({
      url:`/goods/GroupPurchaseChildPage/shareVouchers/shareVouchers?merchantId=${this.data.merchantId}`
    })
  },
  // 消费总额，input输入事件
  totalAmountInput(e){
    let {value,cursor,keyCode}=e.detail;
    if(value.indexOf("￥")==-1 && value.length){//找不到，并且输入了数字。则加上￥符号
      value="￥"+value;
      this.setData({
        totalAmountNewValue:value
      })
    }
    let totalValue=value.substring(1);
    if(value.length>1 && totalValue!=(parseFloat(totalValue)+"")){//判断是否输入了非数字
      feedbackApi.showToast({title:"请输入数字"});
      return;
    }
    this.setData({
      totalAmountInputValue:value,//如果为空，则不能点击优惠金额
    });
     //计算实付金额
     this.actuallyAmount();
  },
  // 没有优惠的总额
  excludeAmountInput(e){
    let {value,cursor,keyCode}=e.detail;
    if(value.indexOf("￥")==-1 && value.length){//找不到，并且输入了数字。则加上￥符号
      value="￥"+value;
    }
    let excludeValue=value.substring(1);
    if(value.length>1 && excludeValue!=(parseFloat(excludeValue)+"")){//判断是否输入了非数字
      feedbackApi.showToast({title:"请输入数字"});
      return;
    }
    let totalValue=parseFloat(this.data.totalAmountInputValue.substring(1));
    excludeValue=parseFloat(excludeValue);
    if(excludeValue>totalValue){//不参与优惠金额不能大于消费总额
      feedbackApi.showToast({title:"不参与优惠金额不能大于消费总额"});
      //则，用旧的excludeAmountInputValue来替换原先的
      this.setData({
        excludeAmountNewValue:this.data.excludeAmountInputValue
      })
      return ;
    }
    //保存输入的有效值
    this.data.excludeAmountInputValue=value;
    //因为其会关闭，重新渲染。所以每次输入要保存其值
    this.setData({
      excludeAmountNewValue:value
    })
    //计算实付金额
    this.actuallyAmount();
    this.groupPurchaseOrderPreview(true);
  },
    // 不参与优惠金额，切换
  excludeAmountSwitch(e){
    let {value}=e.detail;
    this.setData({
      excludeAmountInputActive:value
    })
    //计算实付金额
    this.actuallyAmount();
  },
  // 不参与优惠金额，tap
  excludeAmountSwitchTap(e){
    if(!this.data.totalAmountInputValue){//消费总额为空，即还没有输入
      feedbackApi.showToast({title:"请先输入消费总额"});
    }
  },
  // 打折switch切换,先要输入消费总额
  discountSwitch(e){
    let {value}=e.detail;
   
    this.setData({
      discountActive:value
    })
    //计算实付金额
    this.actuallyAmount();
  },
  // 计算实付金额及折扣了多少金额
  actuallyAmount(){
    if(this.data.totalAmountInputValue.length<=1 || parseFloat(this.data.totalAmountInputValue.substring(1))<parseFloat(this.data.excludeAmountInputValue.substring(1))){//￥符号，则
      this.setData({
        actuallyAmount:0,
        discountAmount:0,
        'OrderPreviewRequestObj.cashDeductionPrice':0,
        excludeAmountNewValue:0,
        couponsShow:false
      })
      let groupPurchaseOrderCouponCodeList=this.data.groupPurchaseOrderCouponCodeList;
      // 重置抵用券
      this.data.groupPurchaseOrderCouponCodeList=[];
      delete this.data.shareVouchersData;//共享数据清除
      return ;
    }
    // 抵用券
    let cashDeductionPrice=parseFloat(this.data.OrderPreviewRequestObj.cashDeductionPrice);
    let totalAmountInputValue=parseFloat(this.data.totalAmountInputValue.substring(1));
    let discountAmount="";
    let actuallyAmount=totalAmountInputValue;
    // 马管家券
    let promotionCouponsDiscountTotalAmt=this.data.promotionCouponsDiscountTotalAmt;
    if(this.data.discountActive){//优惠了多少金额,及实付金额 
      discountAmount=totalAmountInputValue*(1-this.data.discount);
      actuallyAmount=totalAmountInputValue-discountAmount;
      if(this.data.excludeAmountInputActive && this.data.excludeAmountInputValue.length>1){
        let excludeAmountInputValue=parseFloat(this.data.excludeAmountInputValue.substring(1));
        discountAmount=(totalAmountInputValue-excludeAmountInputValue)*(1-this.data.discount);
        actuallyAmount=totalAmountInputValue-discountAmount;
      }
      //处理好discountAmount
      discountAmount="-￥"+parseInt(discountAmount*100)/100;//保留两位小数
      actuallyAmount=actuallyAmount-cashDeductionPrice;
    }else{
      actuallyAmount=actuallyAmount-cashDeductionPrice;
    }

    // finally处理
    actuallyAmount=parseInt(actuallyAmount*100)/100
    if(this.data.coupons!==null && this.data.coupons.length>0 && actuallyAmount>=this.data.coupons[0].restrictAmt){//最终价格超过马管家券门槛则显示
      this.setData({
        couponsShow:true
      })
      if(promotionCouponsDiscountTotalAmt!=null){
        actuallyAmount=actuallyAmount-promotionCouponsDiscountTotalAmt;
      }
    }else{
      this.setData({
        couponsShow:false
      })
    }
    // 如果显示马管家券后，计算马管家券之后价格为负数，则为0.01
    if(actuallyAmount<0) actuallyAmount=0.01;
    actuallyAmount=parseInt(actuallyAmount*100)/100;//保留两位小数
    this.setData({
      actuallyAmount,
      discountAmount
    })
  },


})