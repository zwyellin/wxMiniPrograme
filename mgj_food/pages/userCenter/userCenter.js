const { wxRequest } = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    loginstatus:false,
    loginsuccess:false,
    userInfo: {},
    mobile:'',
    avatarUrl:'',
    nickName:'',
    userMessage:{},
    statistic: {
      fdPriceTotal: '0.00',
      fdBottomTotal: '0.00',
      fdDebtTotal: '0.00'
    },
    cashbackAmtSum:0,
    servicePhone:'',
    total: 0,
    orderLoading: false,
    cartLoading: false,
    loading: false
  },
  onLoad(options) {
    if (app.globalData.userInfo.avatarUrl) {
      let avatarUrl = app.globalData.userInfo.avatarUrl;
      let nickName = app.globalData.userInfo.nickName;
      this.setData({
        avatarUrl:avatarUrl,
        nickName:nickName
      });
    }
  },
  onShow () {
    this.findCustomerAndComplainPhoneByUserXY();
    let loginMessage = wx.getStorageSync('loginMessage');
    let loginstatus = wx.getStorageSync('loginstatus');
    if (loginMessage && loginstatus) {
      this.findUserCenter();
      this.findUserListAndCashbackAmtSum()
      let name = loginMessage.mobile.toString();
      name = name.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      this.setData({
        loginsuccess:true,
        userInfo:loginMessage,
        mobile:name
      });
    }
  },
  //获取客服电话
  findCustomerAndComplainPhoneByUserXY(){
    wxRequest({
      url:'/merchant/userClient?m=findCustomerAndComplainPhoneByUserXY',
      method:'POST',
      data:{
        params:{
          latitude:app.globalData.latitude,
          longitude:app.globalData.longitude
        } 
      },
    }).then(res=>{
      if (res.data.code === 0) {
        if (app.globalData.agentPhone) {
          this.setData({
            servicePhone:app.globalData.agentPhone
          });
        } else {
          let servicePhone = res.data.value[0].phone;
          this.setData({
            servicePhone:servicePhone
          });
        }
      }
    });
  },
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
          userMessage:res.data.value
        })
      }
    })
  },
  //获取返利金额
  findUserListAndCashbackAmtSum(){
    wxRequest({
      url:'/merchant/userClient?m=findUserListAndCashbackAmtSum',
      method:'POST',
      data:{
        token: app.globalData.token,
        params:{
          size:this.data.size,
          start:this.data.start 
        }
      },
      }).then(res=>{
      if (res.data.code === 0) {
        let cashbackAmtSum = res.data.value.cashbackAmtSum;
        this.setData({
          cashbackAmtSum:cashbackAmtSum,
        });
      }
    });
  },
  login(){
    wx.navigateTo({
      url: '/pages/login/login?switch=usercenter'
    });
  },
  getAddress(){
    wx.navigateTo({
        url: '/pages/address/receiving/receiving'
    });
  },
  loginOut(){
    wx.setStorageSync('loginstatus',false);
    this.setData({
      loginsuccess:false
    });
  },
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.servicePhone   //电话号码
    })
  }
});