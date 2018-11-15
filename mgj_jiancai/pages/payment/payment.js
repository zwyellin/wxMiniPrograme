// pages/payment/payment.js
var { globalData } = getApp();
let Pingpp = require('../../request/pingpp.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    price:0,
    balance:0,
    otherPrice:0,
    isBalance:false,
    isOtherPrice: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let price = globalData.orderDetail.totalPrice;
    this.getBalance();
    this.setData({
      price,
      otherPrice: price
    })
  },
  getBalance(){ //查询余额
    wx.http.postReq('appletClient?m=findUserAccountById', {}, (res) => {
      let { success, value } = res;
      if (success) {
        this.setData({
          balance: value.balance,
        });
      }
    })
  },
  selectBalancePay(){
    let { isBalance, price, balance}=this.data;
    this.setData({ isBalance: !isBalance});
    if (!isBalance && balance < price){
      this.setData({ 
        otherPrice: price - balance,
      });
    } else {
      this.setData({ 
        isOtherPrice:false
      });
    }
  },
  selectOtherPay() {
    this.setData({ isOtherPrice: !this.data.isOtherPrice })
  },
  submit(){
    let { isBalance, isOtherPrice, price, balance}=this.data;
    let params = globalData.orderDetail;
    if (!isBalance && !isOtherPrice){
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      })
      return false;
    }


    if (!isOtherPrice) {
      wx.http.postReq('appletClient?m=balancePay', {
        orderId: params.id
      }, (res) => {
        let { success, value } = res;
        if (success) {
          globalData.orderDetail = null;
          wx.navigateTo({
            url: '../order/index',
          })
        }
      })
    }else{
      wx.http.postReq('appletClient?m=pingxxWxLitePay', {
        channel: 'wx_lite',//渠道名
        amount: params.totalPrice,
        orderId: params.id,
        openId: wx.getStorageSync('code'), //globalData.openId,
        balanceCost: balance
      }, (res2) => {
        var charge = res2.value;
        Pingpp.createPayment(charge, function (result, err) {
          console.log(result);
          console.log(err.msg);
          console.log(err.extra);
          if (result == "success") {
            // 只有微信小程序 wx_lite 支付成功的结果会在这里返回
            globalData.orderDetail = null;
            wx.http.postReq('appletClient?m=checkTOrderPay', { orderId: params.id }, (data) => {
              wx.navigateTo({
                url: '../order/index',
              })
            },true)

          } else if (result == "fail") {
            // charge 不正确或者微信小程序支付失败时会在此处返回
            globalData.orderDetail = null;
            wx.navigateTo({
              url: '../order/index',
            })
          } else if (result == "cancel") {
            // 微信小程序支付取消支付
            globalData.orderDetail = null;
            wx.navigateTo({
              url: '../order/index',
            })
          }
        });
      }
      )
    }
  }
})