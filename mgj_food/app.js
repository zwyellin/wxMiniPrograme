//app.js

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    // this.updataApp();
    let loginMessage = wx.getStorageSync('loginMessage');
    let shoppingCart = wx.getStorageSync('shoppingCart');
    // if (loginMessage && typeof loginMessage == "object" && loginMessage.token) {
    //   this.findAppUserByToken();
    // }
    if (shoppingCart) {
      wx.removeStorageSync('shoppingCart');
    }
    // this.getUserInfo();
    wx.getSystemInfo({
      success: (res)=> {
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.windowWidth = res.windowWidth;
        if (res.model.indexOf('iPhone') > -1) {
          this.globalData.client = "iphone";
        } else {
          this.globalData.client = "android";
        }
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
        },
        fail: function (err) {
          console.log(err);
        }
      });
    }
  },
  findAppUserByToken(cb){
    var that = this;
    if (this.globalData.token) {
      typeof cb == "function" && cb(this.globalData.token);
    } else {
      let loginMessage = wx.getStorageSync('loginMessage');
      if (loginMessage && typeof loginMessage == "object" && loginMessage.token) {
        wx.request({
          url:this.globalData.domain+'/merchant/userClient?m=findAppUserByToken',
          method:'POST',
          data:{
            imei: "mgjwm"+loginMessage.mobile,
            token: loginMessage.token
          },
          success:function(res){
            var value = res.data.value;
            if (res.data.code === 0) {
              that.globalData.token = value.token;
              that.globalData.userId = value.id;
              typeof cb == "function" && cb(that.globalData.token);
              wx.setStorageSync('loginMessage',value);
            }
          },
          fail:function(err){
            that.globalData.token = loginMessage.token;
            that.globalData.userId = loginMessage.id;
            typeof cb == "function" && cb(that.globalData.token);
          }
        });
      } else {
        typeof cb == "function" && cb(this.globalData.token);
      }  
    } 
  },
  updataApp() {//版本更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate((res)=> {
        if (res.hasUpdate) { // 请求完新版本信息的回调
          updateManager.onUpdateReady(()=> {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res)=> {
                if (res.confirm) {// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(()=> {
            console.log('新版本下载失败');
          });
        }
      });
    }
  },
  globalData: {
    token:'',
    client:'',
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
    // latitude:'39.977261',
    // longitude:'116.336983'
    latitude:'',
    longitude:''
  }
});
// prelaunch