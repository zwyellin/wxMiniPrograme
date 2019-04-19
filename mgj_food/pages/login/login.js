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

		mobileBindShow:false,//没有登录，则显示微信登录，微信登录后没有绑定手机号码，则置为true
		show:false //内容是否显示，避免一开始微信登录缓一下
	},
	onLoad(options) {
		this.setData({
			switch:options.switch
		});
		// 是否获得授权，如果已经授权，则直接调至绑定手机
		wx.getSetting({
			success: (res) => {
				if (res.authSetting["scope.userInfo"] ==true) {
					this.bindGetUserInfo();
				}else{//未授权,显示微信登录界面
					this.setData({
						show:true
					})
				}
			},
			fail:()=>{
				this.setData({
					show:true
				})
			}
		})
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
	// 登录后处理逻辑
	loginAfter(res){
		if (res.data.code === 0) {
			let delayTime=2000;
			wx.showToast({
				title:"登录成功",
				icon:"success",
				duration:delayTime
			})
			let loginMessage = res.data.value;
			app.globalData.token = loginMessage.token;
			app.globalData.userId = loginMessage.id;
			wx.setStorageSync('loginstatus',true);//记录登录状态
			wx.setStorageSync('loginMessage',loginMessage);//缓存用户信息
			setTimeout(() => {
				this.gotoSwitch();
			}, delayTime);
		} else {
			let msg = res.data.value;
			feedbackApi.showToast({title:msg});
		}
	},
	gotoSwitch(){
		let that = this;
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
	},
	bindingMobile(){//绑定手机
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
		wx.showToast({
			title:"请稍后",
			icon:"loading",
			duration:20000
		})
		wxRequest({
        	url:'/merchant/appletClient?m=wxBindingMobile',
        	method:'POST',
        	data:{
			    imei: "mgjwm"+this.data.phone,
        		params:{
							encryptedData: app.globalData.wxInfo.encryptedData,
							mobile:this.data.phone,
							smsCode:this.data.password,
							iv:app.globalData.wxInfo.iv,
        			bizType:1,//这边区分建材
        			latitude: app.globalData.latitude,
							longitude: app.globalData.longitude,
							key:app.globalData.openId 
        		},	
        	},
        }).then(res=>{
					console.log("绑定手机执行之后",res)
					if(res.data.code==0){
						// 绑定成功之后，再登录,获得token
						// 在appletLogin函数返回数据后，关闭loading
						this.appletLogin();
					}else{
						feedbackApi.showToast({title: res.data.value});
						wx.hideToast();
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
		if(this.data.disabled){
      feedbackApi.showToast({title: '您已发送了验证码'});
      return
    }
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
		// 直到appletLogin返回结果才会关闭
		wx.showToast({
			title:"请稍后",
			icon:"loading",
			duration:20000
		})
		wx.login({ //登录
			success: ress => {
			  wx.setStorageSync('codeWX', ress.code)
			  console.log("获取的code:",ress.code)
			  wxRequest({
				url:'/merchant/appletClient?m=appletLoginBefore',
				method:'POST',
				data:{
					imei: wx.getStorageSync('codeWX'),
					params:{
						code:ress.code,	
						bizType:1,//这边区分建材
					},	
				},
				}).then(res=>{// 获取key
					// 发送 res.code 到后台换取 openId, sessionKey
					if (res.data.success) {
						let value=res.data.value;
						console.log("已经获取到openId:",value)
						app.globalData.openId = value.key;
						// 请求登录获取用户信息
						this.appletLogin()
					}
				})

			}
		});
	},
	appletLogin(){
		// 获取最新的用户信息
		wx.getUserInfo({
			success:(e)=>{
				// 保存用户信息
				app.globalData.wxInfo=e;
				wx.setStorageSync('wxInfo',e);
				console.log("重新获取用户信息",e)
				let params = {
					encryptedData: e.encryptedData,
					iv: e.iv,
					key:app.globalData.openId,
					code: app.globalData.openId,
					longitude: app.globalData.longitude,
					latitude: app.globalData.latitude,
					bizType:1,//这边区分建材
					};
				console.log("appletLogin参数",params)
				return wxRequest({
					url:'/merchant/appletClient?m=appletLogin',
					method:'POST',
					data:{
						params:params,
						imei: wx.getStorageSync('codeWX'),
					},
					}).then(res=>{
						wx.hideToast();
						console.log("appletLogin函数执行完毕",res)
						if(res.data.code==0){//请求成功
							//1.没有绑定手机号码，则进行下一步，绑定手机号码。再appletLogin登录
							//2.绑定了手机号码，登录成功
							let value = res.data.value;
							if(value==null || value.mobile=="" || value.mobile==null){
								// value为null。要确保传参token为空！(app.js或userCenter会清楚缓存及token userId)
								this.setData({//页面显示手机号码绑定
									mobileBindShow:true,
									show:true
								})
							}else{
								this.loginAfter(res);
							}
						}else{
							feedbackApi.showToast({title:res.data.value});
							// 返回上一页
							setTimeout(() => {
								wx.switchTab({
									url:'/pages/userCenter/userCenter',
								});
							}, 2000);
						}
					});	
			},
			fail:(e)=>{
				console.log("再次获取用户信息失败",e)
				this.setData({
					show:true
				})
			}
		})
	},
	bindGetUserInfo(e){
		// 事件触发的e.detail==getuserInfo回调返回来的e,so
		if(e==undefined){//已授权情况，函数调用的本函数，木有传参
		}else{
			if(e.detail.errMsg!="getUserInfo:ok"){//授权失败情况，什么都不执行
				return;
			}
		}
		// 这边不保存用户信息，这里只是判断能不能拿到及流程(没有授权，则授权之后走这里。判断已授权，走这里)
		// 后台解析用户信息，需要在获取code之后，获取到的用户信息，才不会解析出错！
		// 所以，采取再次获取最新的用户信息
		console.log("前面已打通，确保接口可以获取用户信息")
		this.WXlogin();
	}
});