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

  },
  onShow () {
    this.findCustomerAndComplainPhoneByUserXY();
    let loginMessage = wx.getStorageSync('loginMessage');
    let loginStatus = wx.getStorageSync('loginstatus');
    if (loginMessage && typeof loginMessage == "object" && loginStatus && loginMessage.token) {
      // 获取微信用户信息，登录界面有保存的字段为：
      // 	wx.setStorageSync('wxInfo',wxInfo);
      // app.globalData.wxInfo=wxInfo;
      let wxInfo=wx.getStorageSync('wxInfo');
      if (wxInfo && wxInfo.userInfo) {
        let userInfo=wxInfo.userInfo;
        let avatarUrl = userInfo.avatarUrl;
        let nickName = userInfo.nickName;
        console.log("avatarUrl.nickName",avatarUrl,nickName)
        this.setData({
          avatarUrl:avatarUrl,
          nickName:nickName
        });
      }
      // 其它请求及处理
      this.findUserCenter();
      this.findUserListAndCashbackAmtSum();
      let name = loginMessage.mobile.toString();
      name = name.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      this.setData({
        loginsuccess:true,
        userInfo:loginMessage,
        mobile:name
      });
      // 是否登录过领取过平台红包
      let isloginGetPlatformRedBag = wx.getStorageSync('isloginGetPlatformRedBag');  
      if (isloginGetPlatformRedBag) {
          this.getPlatformRedBag();
          wx.setStorageSync('isloginGetPlatformRedBag',false);
      }
    }else{//有可能清空缓存，则渲染到页面
      this.loginOut();
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
    try {
       // 清除，要清除三个
       wx.clearStorageSync()
       app.globalData.token = '';
       app.globalData.userId =null ;
       console.log("userCenter 已清除全都缓存")
    } catch (e) {
      // Do something when catch error
    }
    this.setData({
      loginsuccess:false
    });
  },
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.servicePhone   //电话号码
    })
  },
  getPlatformRedBag(){
      wxRequest({
        url:'/merchant/userClient?m=getPlatformRedBag',
        method:'POST',
        data:{
          token: app.globalData.token,
          params:{
            longitude:app.globalData.longitude,
            latitude:app.globalData.latitude
          } 
        },
      }).then(res=>{
        if (res.data.code === 0) {
          if (res.data.value.status == 1) { // 该代理商有平台红包
              if (res.data.value.redBagList != 0) {
                this.findUserCenter();
              }
          }
        }
      });
  },
});