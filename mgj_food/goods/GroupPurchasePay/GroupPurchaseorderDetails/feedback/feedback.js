// goods/GroupPurchasePay/GroupPurchaseorderDetails/feedback/feedback.js
const app = getApp();
const { wxRequest, getNetworkType } = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    merchantId:null,
    groupPurchaseCouponType:null,

    textareaText:"",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let{merchantId,groupPurchaseCouponType}=options;
    Object.assign(this.data,{
      merchantId,
      groupPurchaseCouponType
    })
  },
  createGroupPurchaseComplain(){
    wxRequest({
      url:'/merchant/userClient?m=createGroupPurchaseComplain',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          agentId:app.globalData.agentId,
          merchantId:this.data.merchantId,
          groupPurchaseCouponType:this.data.groupPurchaseCouponType,
          content:this.data.textareaText
        }	
      },
    }).then(res=>{
      if(res.data.code==0){
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
          success: (result)=>{
              setTimeout(()=>{//返回
                wx.hideToast();
                wx.navigateBack({
                  delta: 1
                });
              },1000)
          },
          fail: ()=>{},
          complete: ()=>{}
        });
      }else{
        wx.showToast({
          title: res.data.value,
          icon: 'success',
          image: '',
          duration: 1500,
        })
      }
    })
  },
  textareaInput(e){
    this.data.textareaText=e.detail.value
  },
  submitBtnTap(){
    if(this.data.textareaText==""){
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none',
        image: '',
        duration: 1500,
      })
      return 
    }
    this.createGroupPurchaseComplain();
  }


})