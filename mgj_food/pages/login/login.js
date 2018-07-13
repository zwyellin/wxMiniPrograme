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
		if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.data.phone))) {
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
        		wx.setStorageSync('loginstatus',true);
        		wx.setStorageSync('loginMessage',loginMessage);
				if (this.data.switch === 'switch') {
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
					console.log(2);
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
		if (!(/^1(3|4|5|7|8)\d{9}$/.test(this.data.phone))) {
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
	}
});