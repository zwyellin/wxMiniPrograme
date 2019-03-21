// goods/GroupPurchaseChildPage/serviceCategory0/serviceCategory0.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');
const feedbackApi = require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
Page({

  /**
   * 页面的初始数据
   */
  data: {
   

    istotalAmountInputFocues:true,//input焦点控制
   
    totalAmountInputValue:"",//消费总额，实时
    excludeAmountInputValue:"",//没有优惠的金额，实时

    totalAmountNewValue:"",//消费总额，加上￥
    excludeAmountNewValue:"",//没有优惠的金额，加上￥

    excludeAmountInputActive:false,//默认不显示,显示时同时用于控制不参与优惠的input焦点

    discount:null,//这个等于OrderPreviewRequestObj.discountRatio
    discountText:null,

    discountActive:true,//是否开启打折

    actuallyAmount:"",//实付金额(totalAmountInputValue,[excludeAmountInputActive,excludeAmountInputValue],[discountActive,discount])
    discountAmount:"",//折扣了多少金额(totalAmountInputValue,[excludeAmountInputActive,excludeAmountInputValue],[discountActive,discount])

    OrderPreviewRequestObj:{//请求参数对象,这些值是本地计算的(减少服务器压力)，提交前要已服务器为准
      cashDeductionPrice:0,//抵用劵，在线支付这边固定为0
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
    orderTitle:null,
    orderMoney:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {merchantId,discountRatio,merchantName}=options;
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
    let discountText=(discount*10).toFixed(1)
    this.data.orderTitle=merchantName;
    this.setData({
      OrderPreviewRequestObj,
      discount,
      discountText:discountText
    });
    this.groupPurchaseOrderPreview0();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 提交
  serverType0Tap(){
    // url="/goods/pay/pay?merchantId={{groupMerchantInfo.id}}&price={{actuallyAmount}}"; 
      this.groupPurchaseOrderPreview().then(()=>{//根据服务器返回计算的值
        this.groupPurchaseOrderSubmit().then(()=>{//获得订单号
            let orderId=this.data.orderId;
            if(orderId==null){
              wx.showToast({
                title:"提交失败",
                icon:"none",
                duration:2000
              })
            }else{
              wx.navigateTo({
                url:"/goods/GroupPurchasePay/GroupPurchasePay?price="+this.data.orderMoney+"&orderId="+this.data.orderId
              })
            }
        });
      });
    },
  // 订单预览
  groupPurchaseOrderPreview0(){
    let data=this.data.OrderPreviewRequestObj;
    data=JSON.stringify(data);
    wxRequest({
      url:'/merchant/userClient?m=groupPurchaseOrderPreview',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          data:data
        }
      }
    }).then(()=>{
      if (res.data.code === 0) {
      }
    })
  },
  groupPurchaseOrderPreview(){
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
      if (res.data.code === 0) {
        let {originalTotalPrice,notJoinDiscountAmount,discountAmt,totalPrice,promotionCouponsDiscountTotalAmt}=res.data.value;
        
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
          originalTotalPrice,notJoinDiscountAmount,totalPrice
        })
        this.data.groupPurchaseOrderSubmitRequestObj=groupPurchaseOrderSubmitRequestObj;
      }else if(res.data.code===500){
        wx.showToast({
          title:res.data.value,
          icon:"none",
          duration:2000
        })
      }
    });
  },
  // 订单提交预览,获得订单号
  groupPurchaseOrderSubmit(){
    let groupPurchaseOrderSubmitRequestObj=JSON.parse(JSON.stringify(this.data.groupPurchaseOrderSubmitRequestObj));
    if(groupPurchaseOrderSubmitRequestObj.hasDiscount==0) delete groupPurchaseOrderSubmitRequestObj.hasDiscount;
    if(!this.data.excludeAmountInputActive) delete groupPurchaseOrderSubmitRequestObj.notJoinDiscountAmount;
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
      if (res.data.code === 0) {
       console.log("获得订单号",res.data.value.id);
       this.data.orderId=res.data.value.id;
      }else if(res.data.code===500){
        wx.showToast({
          title:res.data.value,
          icon:"none",
          duration:2000
        })
      }
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
    if(this.data.totalAmountInputValue.length<=1) return;
    let totalAmountInputValue=parseFloat(this.data.totalAmountInputValue.substring(1));
    let discountAmount="";
    let actuallyAmount=totalAmountInputValue;
    if(this.data.discountActive){//优惠了多少金额,及实付金额 
      discountAmount=totalAmountInputValue*(1-this.data.discount);
      actuallyAmount=totalAmountInputValue-discountAmount;
      if(this.data.excludeAmountInputActive && this.data.excludeAmountInputValue.length>1){
        let excludeAmountInputValue=parseFloat(this.data.excludeAmountInputValue.substring(1));
        discountAmount=(totalAmountInputValue-excludeAmountInputValue)*(1-this.data.discount);
        actuallyAmount=totalAmountInputValue-discountAmount;
      }
      //处理好discountAmount
      discountAmount="-￥"+parseInt(discountAmount*10)/10;//保留一位小数
      //处理好actuallyAmount
      actuallyAmount="￥"+parseInt(actuallyAmount*10)/10;//保留一位小数
    }else{
      actuallyAmount="￥"+parseInt(actuallyAmount*10)/10;//保留一位小数
    }
    this.setData({
      actuallyAmount,
      discountAmount
    })
  },


})