const app = getApp();
const { wxRequest } = require('../../utils/util.js');
const Pingpp = require('../../utils/pingpp.js');
const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
Page({
  data: {
    maskAnimation:null,
    maskShow:false,
    selectPay:false,
    isPayStatus:false,
    payWxColor:false,
    payChannelColor:false,
    isChannel:false,
    channelCost:0,
    price:0,
    merchantId:null,
    channelPrice:0,
    orderId:null
  },
  onLoad(options){
    let { orderId, price, merchantId } = options;
    this.setData({
      price:price,
      channelPrice:price,
      merchantId:merchantId,
      orderId:orderId
    });
    this.findUserCenter();
  },
  payWx(e) {
    if (this.data.channelCost < this.data.price && this.data.channelCost != 0) {
      this.setData({
        payWxColor:true
      });
    } else {
      this.setData({
        payWxColor:true,
        payChannelColor:false,
      });
    }
  },
  payChannel(){
    if (this.data.channelCost === 0) {
      if (!this.data.isChannel) {
        feedbackApi.showToast({title:'余额不足'});
        this.data.isChannel = true;
      }
      return;
    }
    if (this.data.channelCost < this.data.price) {
      if (this.data.payWxColor) {
        this.setData({
          payWxColor:true,
        });
      }
      if (this.data.payChannelColor) {
        let channelPrice = this.data.price;
        this.setData({
          payChannelColor:false,
          channelPrice:channelPrice
        });
      } else {
        let price = this.data.price;
        let channelPrice = this.data.price - this.data.channelCost;
        channelPrice = Math.round(channelPrice * 100) / 100;
        this.setData({
          payChannelColor:true,
          channelPrice:channelPrice
        });
      }
    } else {
      this.setData({
        payChannelColor:!this.data.payChannelColor,
        payWxColor:false,
        selectPay:!this.data.selectPay
      });
    } 
  },
  getOpenId() {
    var that = this;
    if (!this.data.payWxColor && !this.data.payChannelColor) {
      feedbackApi.showToast({title:'请选择支付方式'});
      return
    }
    // 微信支付
    if (this.data.payWxColor && !this.data.isPayStatus) {
      if (this.data.channelCost < this.data.price && this.data.payChannelColor) {
        this.wxLogin(this.data.channelCost);
      } else {
        this.wxLogin();
      }
      // wx.showToast({
      //   title: '正在支付',
      //   icon: 'loading',
      //   duration: 200000,
      //   mask: true
      // });
      this.setData({
        isPayStatus:true
      });
    }
    // 余额支付
    if (this.data.payChannelColor && !this.data.isPayStatus) {
      if (this.data.channelCost < this.data.price) {
        feedbackApi.showToast({title:'请选择支付方式'});
        return;
      }
      this.maskShowAnimation();
      this.setData({
        maskShow:true,
        isPayStatus:true
      });
      this.balancePay();
    }    
  },
  wxLogin(channel = 0){
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
                        console.log(open_id);
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
          Pingpp.createPayment(charge, function (result, err) {
              console.log(result);
              console.log(err.msg);
              console.log(err.extra);
              if (result == "success") {
                let merchantId = that.data.merchantId
                let shoppingCart = wx.getStorageSync('shoppingCart');
                if (shoppingCart[merchantId]) {
                  shoppingCart[merchantId] = []
                }
                wx.setStorageSync('shoppingCart',shoppingCart);
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
        } 
    }).catch(err=>{
      that.data.isPayStatus = false;
    }).finally(()=>{
      wx.hideLoading();
    });
  },
  //获取用户中心数据
  findUserCenter(){
    wxRequest({
      url:'/merchant/userClient?m=findUserCenter',
      method:'POST',
      data:{
        token: app.globalData.token
      },
    }).then(res=>{
      if (res.data.code === 0) {
        this.setData({
          channelCost:res.data.value.balance
        });
      }
    });
  },
  //余额支付接口
  balancePay(){
    let that = this;
    wx.showToast({
        title: '正在支付',
        icon: 'loading',
        duration: 200000,
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
        let shoppingCart = wx.getStorageSync('shoppingCart');
        if (shoppingCart[merchantId]) {
          shoppingCart[merchantId] = []
        }
        wx.setStorageSync('shoppingCart',shoppingCart);
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
      wx.hideLoading;
      that.data.isPayStatus = false;
    });
  },
  close(){
    this.setData({
      maskShow:false
    })
  },
  maskShowAnimation(){
    let animation = wx.createAnimation({  
      duration: 1000,
      timingFunction: "ease",
    });
    setTimeout(()=> {
          animation.opacity(0.5).step();
          this.setData({
            maskAnimation: animation.export(),
          });
      }, 200);
    animation.opacity(0).step();//修改透明度,放大  
    this.setData({  
       maskAnimation: animation.export()  
    }); 
  },
  maskHideAnimation(){
    let animation = wx.createAnimation({  
        duration: 500,  
    });
    setTimeout(()=> {
          animation.opacity(0).step();
          setTimeout(()=>{
            this.setData({
              choice:false,
              detailShow:false,
              merchantRedBagList:[]
            })
          },500);
          this.setData({
            maskAnimation: animation.export(),  
          }); 
      }, 20);
    animation.opacity(0).step();//修改透明度,放大  
    this.setData({  
       maskAnimation: animation.export()  
    }); 
  },
});