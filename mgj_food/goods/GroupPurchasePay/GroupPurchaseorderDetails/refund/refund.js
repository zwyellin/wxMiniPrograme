// goods/GroupPurchasePay/GroupPurchaseorderDetails/refund/refund.js
const { wxRequest } = require('../../../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    prevPage:null,

    orderTypeText:null, //groupPurchaseOrder:<!-- orderType:。 1, "代金券",2, "团购券",3, "优惠买单" -->
    groupPurchaseOrderCouponCodeList:null,//从上个页面读取

    refundMoney:0,//退款金额
    refundReasonList:[
      {text:"商家拒绝接待",checkType:false},
      {text:"商家倒闭/装修/搬迁",checkType:false},
      {text:"套餐内容/有效期与网页不符",checkType:false},
      {text:"预约有问题",checkType:false},
      {text:"朋友/网上评价不好",checkType:false},
      {text:"去过，不太满意",checkType:false},
      {text:"计划有变，没时间消费",checkType:false},
      {text:"后悔了，不想要了",checkType:false}
    ],
    textareaValue:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPrevData();
  },

  getPrevData(){//上个页面。只有代金券和团购券订单详情才能进这页面
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; // 上一级页面
    this.data.prevPage=prevPage;
    // 获取订单对象。取其字段判断是代金券还是团购券
    //groupPurchaseOrder:<!-- orderType:。 1, "代金券",2, "团购券",3, "优惠买单" -->
    let groupPurchaseOrder=JSON.parse(JSON.stringify(prevPage.data.groupPurchaseOrder));
    let orderTypeText="";
    if(groupPurchaseOrder.orderType===1) orderTypeText="代金券";
    else if(groupPurchaseOrder.orderType===2) orderTypeText="团购券";
    // 获取优惠券列表
    let groupPurchaseOrderCouponCodeList=JSON.parse(JSON.stringify(prevPage.data.groupPurchaseOrderCouponCodeList));
    //退款页面，只针对 未使用的
    // item.status。0：未使用；1：已使用；2：已退款；3已锁定
    groupPurchaseOrderCouponCodeList=groupPurchaseOrderCouponCodeList.filter((_item)=>{
      if(_item.status===0){
        // 增加选择状态
        _item.checkType=false;
        return _item;
      }
    })
    this.setData({
      groupPurchaseOrderCouponCodeList,
      orderTypeText
    })
  },

  // 券点击事件
  couponCodeItemTap(e){
    let {index}=e.target.dataset;
    let {value}=e.detail;
    this.data.groupPurchaseOrderCouponCodeList[index].checkType=value;
    //计算退款金额
    let refundMoney=0;
    let groupPurchaseOrderCouponCodeList=this.data.groupPurchaseOrderCouponCodeList;
    groupPurchaseOrderCouponCodeList.forEach((_item)=>{
      if(_item.checkType){
        refundMoney+=_item.price;
      }
    })
    this.setData({
      refundMoney
    })
  },

  // 退款原因点击
  refundReasonItemTap(e){
    let {index}=e.target.dataset;
    let {value}=e.detail;
    this.data.refundReasonList[index].checkType=value;
  },
  // textarea输入事件
  textareaInput(e){
    this.data.textareaValue=e.detail.value;
  },
  // 提交
  submitBtnTap(){
    // 获取groupPurchaseOrderCouponCodeIds
    let groupPurchaseOrderCouponCodeList=this.data.groupPurchaseOrderCouponCodeList;
    let groupPurchaseOrderCouponCodeIds=[];
    groupPurchaseOrderCouponCodeIds=groupPurchaseOrderCouponCodeList.filter((_item,_index)=>{
      return _item.checkType;
    }).map((_item)=>{
      return _item.id;
    })
    let CodeIdsLength=groupPurchaseOrderCouponCodeIds.length;//用于弹窗时提示几张
    if(groupPurchaseOrderCouponCodeIds.length==0){
      wx.showToast({
        title:"请选择"+this.data.orderTypeText,
        icon:"none",
        mask:true,
      })
      return 
    }else if(groupPurchaseOrderCouponCodeIds.length=1){
      groupPurchaseOrderCouponCodeIds=groupPurchaseOrderCouponCodeIds[0].toString();
    }else{
      groupPurchaseOrderCouponCodeIds=groupPurchaseOrderCouponCodeIds.join(",");//英文分隔
    }
    // 获取cancelReason
    let cancelReason=[];
    let refundReasonList=this.data.refundReasonList;
    cancelReason=refundReasonList.filter((_item,_index)=>{
      return _item.checkType;
    }).map((_item)=>{
      return  _item.text
    })
    if(cancelReason.length==0){
      wx.showToast({
        title:"请选择退款原因",
        icon:"none",
        mask:true,
      })
      return 
    }else if(cancelReason.length==1){
      cancelReason=cancelReason[0].toString();
    }else{
      cancelReason=cancelReason.join(",");//英文分隔
    }
    // 退款原因合并textarea值
    let textareaValue=this.data.textareaValue;
    if(textareaValue!=""){
      cancelReason+=","+textareaValue;
    }
    //弹窗确认
    wx.showModal({
      title:`是否确认退款${CodeIdsLength}张价值${this.data.groupPurchaseOrderCouponCodeList[0].price}元的${this.data.orderTypeText}?`,
      content:"申请退款成功后，使用余额支付部分将退还至余额，使用第三方支付部分将原来退回",
      showCancel:true,
      cancelText:"取消",
      confirmText:"确认",
      success:(res)=>{
        if (res.confirm) {
          console.log('用户点击确定')
          this.batchRefundGroupPurchaseOrderCouponCode(groupPurchaseOrderCouponCodeIds,cancelReason);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
   
  },
  // 提交时的请求
  batchRefundGroupPurchaseOrderCouponCode(groupPurchaseOrderCouponCodeIds,cancelReason){
    wxRequest({
      url:'/merchant/userClient?m=batchRefundGroupPurchaseOrderCouponCode',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          groupPurchaseOrderCouponCodeIds:groupPurchaseOrderCouponCodeIds,
          cancelReason:cancelReason
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        wx.showToast({
          title:"已申请退款",
          icon:"success",
          mask:true,
          success:()=>{
            prevPage.data.isReloadData=true;
            setTimeout(() => {
              wx.navigateBack({
                delta:1
              })
            }, 2000);
          }
        })
      }else{
        wx.showToast({
          title:res.data.value,
          icon:"none",
          mask:true,
        })
      }
    })

  }
})