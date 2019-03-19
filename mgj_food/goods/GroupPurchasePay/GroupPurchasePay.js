// goods/GroupPurchasePay/GroupPurchasePay.js
const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,//订单号
    orderMoney:null,
    orderTitle:null,
    findChargeTypesResData:null,//返回来的数据


    payType:0,//支付方式，0，1，2对应余额，微信，支付宝
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId,orderMoney,orderTitle}=options;
    console.log(orderId,orderMoney,orderTitle)
    this.data.orderId=orderId;
    this.setData({
      orderMoney,
      orderTitle,
    })
    this.findChargeTypes();
  },

  findChargeTypes(){
    wxRequest({
      url:'/merchant/userClient?m=findChargeTypes',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          orderId:this.data.orderId
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        console.log(res.data.value);
        this.setData({
          findChargeTypesResData:res.data.value
        })
      }else if(res.data.code===500){
      
      }
    })
  },
  payTypeSwitch(e){
    let {payindex,channel,name}=e.target.dataset;
    this.setData({
      payType:payindex
    })
  },
  wxLogin(channel = 0){
    wx.showLoading({
        title: '正在支付',
        mask: true
    });
    let that = this;
    wx.login({
        success: function (res) {
            if (res.code) {
              console.log(res.code);
                //发起网络请求 获取 open_id
                wxRequest({
                    url: '/merchant/userClient?m=getWxOpenId',
                    method:'POST',
                    data: {
                      params:{
                        code: res.code
                      },
                      token:app.globalData.token
                    },
                }).then(res=>{
                    if (res.data.code === 0) {
                        let value = JSON.parse(res.data.value);
                        let open_id = value.openid;
                        if (channel) {
                          that.payMoney(open_id,channel);
                        } else {
                          that.payMoney(open_id);
                        } 
                    } else {
                        let msg = res.data.value;
                        if (res.data.code === 100000) {
                          setTimeout(()=>{
                            wx.navigateTo({
                              url:'/pages/login/login'
                            });
                          },1000);
                        }
                        feedbackApi.showToast({title: msg});
                        that.data.isPayStatus = false;
                        wx.hideLoading();
                    } 
                }).catch(err=>{
                  that.data.isPayStatus = false;
                  wx.hideLoading();
                });
            } else {
              console.log('获取用户登录态失败！' + res.errMsg);
              wx.hideLoading();
              that.data.isPayStatus = false;
            }
        }
    });
  },
    //余额支付接口
    balancePay(){
      let that = this;
      wx.showLoading({
          title: '正在支付',
          mask: true
      });
      wxRequest({
        url:'/merchant/userClient?m=balancePay',
        method:'POST',
        data:{
          token: app.globalData.token,
          params:{
            orderId:this.data.orderId
          }
        },
      }).then(res=>{
        if (res.data.code === 0) {
          let merchantId = res.data.value.merchantId
          let isRedBag = true;
          setTimeout(()=>{
            wx.redirectTo({
              url: '/pages/goods/cartDetail/cartDetail?orderid='+this.data.orderId + '&isredbag='+isRedBag,
              complete: function(){
                that.data.isPayStatus = false;
              }
            });
          }, 1000);
        } else {
          let msg = res.data.value;
          if (res.data.code === 100000) {
            setTimeout(()=>{
              wx.navigateTo({
                url:'/pages/login/login'
              });
            },1000)
          }
          feedbackApi.showToast({title: msg});
          that.data.isPayStatus = false;
        }
      }).finally(()=> {
        wx.hideLoading();
        that.data.isPayStatus = false;
      });
    },

     //支付
  payMoney(open_id,channel){
    let that = this;
    let params= {
      openId:open_id,
      orderId:this.data.orderId
    };
    if (channel) {
      params.balanceCost = channel;
    }
    wxRequest({
      url:'/merchant/userClient?m=pingxxWxLitePay',
      method:'POST',
      data:{
        app:'horsegjUser',
        params:params,
        token:app.globalData.token  
      },
    }).then(res=>{
      if (res.data.code === 0) {
          let charge = res.data.value;
          wx.hideLoading();
          Pingpp.createPayment(charge, function (result, err) {
              if (result == "success") {
                let merchantId = that.data.merchantId
                let isRedBag = true;
                setTimeout(()=>{
                  wx.redirectTo({
                    url: '/pages/goods/cartDetail/cartDetail?orderid='+that.data.orderId + '&isredbag='+isRedBag,
                    complete: function(){
                      that.data.isPayStatus = false;
                    }
                  });
                }, 1000);
                  // 只有微信小程序 wx_lite 支付成功的结果会在这里返回
              } else if (result == "fail") {
                    // charge 不正确或者微信小程序支付失败时会在此处返回
                    that.data.isPayStatus = false;
                    feedbackApi.showToast({title:'支付失败'});
              } else if (result == "cancel") {
                    feedbackApi.showToast({title:'取消支付'});
                    that.data.isPayStatus = false;
              }
          });
        } else {
          let msg = res.data.value;
          feedbackApi.showToast({title:msg});
          that.data.isPayStatus = false;
          wx.hideLoading();
        } 
    }).catch(err=>{
      that.data.isPayStatus = false;
    }).finally(()=>{
      wx.hideLoading();
    });
  },
})