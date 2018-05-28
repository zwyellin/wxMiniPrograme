//app.js

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    let loginMessage = wx.getStorageSync('loginMessage');
    let shoppingCart = wx.getStorageSync('shoppingCart');
    if (loginMessage) {
      this.findAppUserByToken(loginMessage);
    }
    if (shoppingCart) {
      wx.removeStorageSync('shoppingCart');
    }
    this.getUserInfo();
    wx.getSystemInfo({
      success: (res)=> {
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.windowWidth = res.windowWidth;
        console.log(res.model);
        console.log(res.pixelRatio);
        console.log(res.windowWidth);
        console.log(res.windowHeight);
        console.log(res.language);
        console.log(res.version);
        console.log(res.SDKVersion);
      }
    });
  },
  getUserInfo:function(cb){
    var that = this;
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo);
    }else{
      //获取用户信息接口
      wx.getUserInfo({
        success: function (res) {
          that.globalData.userInfo = res.userInfo;
          console.log(that.globalData.userInfo);
          typeof cb == "function" && cb(that.globalData.userInfo);
        }
      });
    }
  },
  findAppUserByToken(loginMessage){
    var that = this;
    wx.request({
      url:this.globalData.domain+'/merchant/userClient?m=findAppUserByToken',
      method:'POST',
      data:{
        imei: "mgjwm"+loginMessage.mobile,
        token: loginMessage.token
      },
      success:function(res){
        var value = res.data.value;
        that.globalData.token = value.token;
        that.globalData.userId = value.id;
        wx.setStorageSync('loginMessage',value);
      },
      fail:function(err){
        that.globalData.token = loginMessage.token;
        that.globalData.userId = value.id;
      }
    });
  },
  globalData: {
    token:'',
    agentPhone:null,
    agentId:null,
    userId:null,
    addressInfo:null,
    cityName:null,
    userInfo: null,
    sessionId: null,
    domain: 'https://prelaunch.horsegj.com',
    windowHeight: 0,
    windowWidth:0,
    latitude:'39.977261',
    longitude:'116.336983'
  }
});
// prelaunch