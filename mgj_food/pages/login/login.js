const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { wxRequest } = require('../../utils/util.js');
const app = getApp();
let interval = null;   //倒计时函数
Page({
	data:{
		switch:'',
		phone:'',
		password:'',
		maStatus:false,
		yanzhengma:'获取验证码',        //验证码
		currentTime:60, //倒计时 
	},
	onLoad(options) {
		this.setData({
			switch:options.switch
		});
	},
	onShow(){
		let that = this;
        let loginMessage = wx.getStorageSync('loginMessage');
		if (loginMessage  && typeof loginMessage == "object" && loginMessage.token) {
			wx.setStorageSync('loginstatus',true);
			this.findAppUserByToken(loginMessage).then(res=>{
				if (res.data.code === 0) {
					loginMessage = res.data.value;
					app.globalData.token = loginMessage.token;
					wx.setStorageSync('loginMessage',loginMessage);
				} else {
					let msg = res.data.value;
        			feedbackApi.showToast({title:msg});
				}
			});
			setTimeout(()=>{
				if (this.data.switch === 'usercenter') {
					let pages = getCurrentPages();
	    			let prevPage = pages[pages.length - 2];
					wx.switchTab({
				  		url:'/pages/userCenter/userCenter',
				  		success : function(){
				  			that.setData({
								switch:''
							});
							prevPage.setData({
								loginsuccess:true,
							});
				  		}
					});
				} else if (this.data.switch === 'cartitem') {
					let pages = getCurrentPages();
	    			let prevPage = pages[pages.length - 2];
					wx.switchTab({
				  		url:'/pages/goods/cartItem/cartItem',
				  		success : function(){
				  			that.setData({
								switch:''
							});
							prevPage.setData({
								loginsuccess:true,
							});
				  		}
					});
				} else {
					wx.navigateBack({
				  		delta: 1,
				  		fail : function(err){
				  			console.log(err);
				  		}
					});
				}
			},2000);			
		}
	},
	findAppUserByToken(loginMessage){
		return wxRequest({
        	url:'/merchant/userClient?m=findAppUserByToken',
        	method:'POST',
        	data:{
			    imei: "mgjwm"+loginMessage.mobile,
			    token: loginMessage.token
        	},
        });
	},
	checkPhone(e){//手机号码
		let phone = e.detail.value;
		if (phone.length == 11) {
			this.setData({
				phone:phone,
				maStatus:true
			})

		} else {
			this.setData({
				phone:phone,
				maStatus:false
			});
		}	
	},
	checkPass(e){//密码
		let pass = e.detail.value;
		this.setData({
			password:pass
		});
	},
	login(){//登录
		if(this.data.phone === ''){
			feedbackApi.showToast({title: '手机号不能为空'});
			return;
		}
		if (!(/^1[3456789]\d{9}$/.test(parseInt(this.data.phone)))) {
			feedbackApi.showToast({title: '请输入正确的手机号'});
			return;
		}
		if(this.data.password === ''){
			feedbackApi.showToast({title: '验证码不能为空'});
			return;
		}
		wxRequest({
        	url:'/merchant/userClient?m=checkLoginCode',
        	method:'POST',
        	data:{
			    imei: "mgjwm"+this.data.phone,
        		params:{
        			code:this.data.password,
        			mobile:this.data.phone,
        			latitude: app.globalData.latitude,
        			longitude: app.globalData.longitude
        		},	
        	},
        }).then(res=>{
        	let that = this;
        	if (res.data.code === 0) {
        		let loginMessage = res.data.value.appUser;
        		let telephone = loginMessage.mobile;
        		app.globalData.token = loginMessage.token;
        		app.globalData.userId = loginMessage.id;
        		wx.setStorageSync('loginstatus',true);//记录登录状态
        		wx.setStorageSync('loginMessage',loginMessage);//缓存用户信息
				if (this.data.switch === 'usercenter') {
					let pages = getCurrentPages();
	    			let prevPage = pages[pages.length - 2];
	    			wx.setStorageSync('isloginGetPlatformRedBag',true);// 是否通过个人中心页登录领取过平台红包
					wx.switchTab({
				  		url:'/pages/userCenter/userCenter',
				  		success : function(){
				  			that.setData({
								switch:''
							});
							prevPage.setData({
								loginsuccess:true,
							});
				  		}
					});
				} else if (this.data.switch === 'cartitem') {
					let pages = getCurrentPages();
	    			let prevPage = pages[pages.length - 2];
	    			wx.setStorageSync('isloginGetPlatformRedBag',true);     // 是否通过订单页登录领取过平台红包
					wx.switchTab({
				  		url:'/pages/goods/cartItem/cartItem',
				  		success : function(){
				  			that.setData({
								switch:''
							});
							prevPage.setData({
								loginsuccess:true,
							});
				  		}
					});
				} else if(this.data.switch === 'homepage'){
					wx.setStorageSync('isloginGetPlatformRedBag',true);    // 是否通过首页登录领取过平台红包
					wx.navigateBack({
				  		delta: 1,
				  		success : function(){
				  			that.setData({
								switch:''
							});	
				  		}
					});
				} else if(this.data.switch === 'shop'){
					wx.setStorageSync('isloginGetPlatformRedBag',true);    // 是否通过首页登录领取过平台红包
					wx.setStorageSync('isloginGetDiscountUserNum',true);
					wx.navigateBack({
				  		delta: 1,
				  		success : function(){
				  			that.setData({
								switch:''
							});	
				  		}
					});
				} else {
					wx.navigateBack({
				  		delta: 1,
				  		fail : function(err){
				  			console.log(err);
				  		}
					});
				}	
        	} else {
        		let msg = res.data.value;
        		feedbackApi.showToast({title:msg});
        	}
        });	
	},
	getCode(){
		var that = this;
	    var currentTime = that.data.currentTime;
	    interval = setInterval(function () {
	      	currentTime--;
	      	that.setData({
	        	yanzhengma: currentTime+'s'
	     	});
	      	if (currentTime <= 0) {
	        	clearInterval(interval);
	        	that.setData({
	          		yanzhengma: '获取验证码',
	          		currentTime:60,
	         		disabled: false   
	        	});
	     	}
	    }, 1000);
	},
	getVerificationCode(){
		if(this.data.phone === ''){
			feedbackApi.showToast({title: '手机号不能为空'});
			return;
		}
		if (!(/^1[3456789]\d{9}$/.test(parseInt(this.data.phone)))) {
			feedbackApi.showToast({title: '请输入正确的手机号'});
			return;
		}
		if (this.data.yanzhengma === '获取验证码') {
			this.getCode();
			this.getCodeMa();
		}
		this.setData({
      		disabled:true
    	});
	},
	getCodeMa(){
		wxRequest({
        	url:'/merchant/userClient?m=sendLoginSms',
        	method:'POST',
        	data:{
        		params:{
        			mobile:this.data.phone,	
        		},	
        	},
        }).then(res=>{
			if (res.data.code === 0) {
				feedbackApi.showToast({title: '验证码发送成功'});
			} else {
				feedbackApi.showToast({title: '验证码发送失败'});
				clearInterval(interval);
				that.setData({
	          		yanzhengma: '获取验证码',
	          		currentTime:60,
	         		disabled: false   
	        	});
			}
        }).catch(res=>{
        	feedbackApi.showToast({title: '验证码发送失败'});
        	clearInterval(interval);
			that.setData({
          		yanzhengma: '获取验证码',
          		currentTime:60,
         		disabled: false   
        	});
        });
	},
	// 微信登录
	WXlogin(){
		console.log("进入微信登录函数")
		wx.login({ //登录
			success: ress => {
			 wx.setStorageSync('codeWX', ress.code)
			  var key = null
			  wxRequest({
				url:'/merchant/appletClient?m=appletLoginBefore',
				method:'POST',
				data:{
					params:{
						code:ress.code,	
						imei: wx.getStorageSync('codeWX'),
						bizType:1,//这边区分建材
					},	
				},
				}).then(getKey=>{// 获取key
					// 发送 res.code 到后台换取 openId, sessionKey, unionId
					getKey=getKey.data;
					if (getKey.success) {
						console.log("已经获取到了key")
						key = getKey.value.key;
						app.globalData.openId = key;
						//console.log(e.detail.userInfo)
						// 存储code
						//wx.setStorageSync('code', key)
						wx.getUserInfo({
						success: function (e) {
							console.log("登录中获取用户信息")
							//wx.setStorageSync('wxInfo', e.userInfo)
							var params = {
							encryptedData: e.encryptedData,
							iv: e.iv,
							key,
							code: key,
							longitude: app.globalData.longitude,
							latitude: app.globalData.latitude,
							bizType:1,//这边区分建材
							};
							wxRequest({
								url:'/merchant/appletClient?m=appletLogin',
								method:'POST',
								data:{
									params:params,
									imei: wx.getStorageSync('codeWX'),
								},
								}).then(data=>{// 获取key
								//console.log(data)
								if (data.success) {
									// if (app.globalData.isLoginId) {
									// wx.navigateTo({
									// 	url: app.globalData.isLoginUrl
									// });
									// } else {
									// wx.switchTab({
									// 	url: '../index/index',
									// });
									// }
									// 存储登录信息
									//app.globalData.userInfo = data.value
									//wx.setStorageSync('userInfo', data.value)
									//app.globalData.userInfo = wx.getStorageSync("userInfo")
									//wx.setStorageSync('token', data.value.token)
								}
							})
						},
						fail:()=>{//获取用户信息接口失败
							wx.showToast({
								title:"请授权",
								icon:"loading"
							})
						}
					})
					}
				})

			}
		});
	},
	bindGetUserInfo(e){
		console.log("获取用户信息",e);
		this.WXlogin();
	}
});