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
          this.globalData.clientVersion = "3.1.9";
        } else {
          this.globalData.client = "android";
          this.globalData.clientVersion = "3.2.5";
        }
        this.globalData.pixelRatio = res.pixelRatio;
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
  getLocation(){//获得经纬度
    this.getSeting().then(()=>{
			this.wxGetLocation({
				type:'gcj02'
			}).then(res=>{
				let lat = res.latitude;
				let lng = res.longitude;
				let { longitude, latitude } = this.gcj02tobd09(lng,lat);
				this.globalData.longitude = longitude;
        this.globalData.latitude = latitude;
        console.log("重新调用了获取经纬度接口。longitude:",longitude,",latitude:",latitude)
      })
    })
  },
  gcj02tobd09 (lng, lat) {//经纬度坐标
    let x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    let PI = 3.1415926535897932384626;
    let a = 6378245.0;
    let ee = 0.00669342162296594323;
    let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
    let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
    let longitude = z * Math.cos(theta) + 0.0065;
    let latitude = z * Math.sin(theta) + 0.006;
    return {longitude, latitude}
  },
  wxGetLocation(obj){
    return new Promise((resolve,reject)=>{
      const defaultConfig = {
        success:  (res)=> {
          resolve(res);  
        },
        fail: (err)=> {
          reject(err);
        },
      };
      var config = Object.assign({}, defaultConfig, obj);
      wx.getLocation(config);
    });
  },
  	//调起授权
	getSeting(){
		let that = this;
		return new Promise((resolve,reject)=>{
			wx.getSetting({
			    success: (res) => {
			        if (res.authSetting["scope.userLocation"] !=true) {
			        	this.setData({
							isAgentId:true
						});
			          	wx.showModal({
				            title: '用户未授权',
				            content: '如需正常使用马管家小程序功能，请按确定进入小程序设置界面，勾选地理位置并点击确定。',
				            showCancel: false,
				            success: (res)=> {
				              	if (res.confirm) {
					                wx.openSetting({
						                success: (res) => {
						                    if (res.authSetting["scope.userLocation"] ===true) {
												resolve();
						                    }else {
						                    	reject(err);
						                    }
						                },
						                fail: (err)=>{
						                	reject(err);
						                }
					                });
				              	}
				            },
				            fail: (err)=>{
				            	reject(err);
				            }
				        });
			        } else {
			        	resolve();
			        }
			    }
	    	});
		});	
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
    clientVersion:'3.2.3',
    agentPhone:null,
    pixelRatio:null,
    agentId:null,
    userId:null,
    addressInfo:null,
    cityName:null,
    userInfo: null,
    sessionId: null,
    domain: 'https://wxapi.horsegj.com',
    windowHeight: 0,
    windowWidth: 0,
    // latitude:'39.966128',
    // longitude:"116.304782"
    latitude:'',
    longitude:''
  }
});
//wxapi     线上
// prelaunch