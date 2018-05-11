const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { wxRequest } = require('../../utils/util.js');
const app = getApp();
let interval = null;   //倒计时函数
Page({
	data:{
		userId:null,
		switch:'',
		phone:'',
		password:'',
		maStatus:false,
		yanzhengma:'获取验证码',        //验证码
		currentTime:60, //倒计时 
	},
	onLoad(options){
		this.data.userId = options.uid
	},
	checkPhone(e){
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
	register(e){
		wx.switchTab({
  			url: '/pages/index/index'
		});
	},
	checkPass(e){
		let pass = e.detail.value;
		this.setData({
			password:pass
		});
	},
	register(){
		if(this.data.phone === ''){
			feedbackApi.showToast({title: '手机号不能为空'});
			return;
		}
		if (!(/^1(3|4|5|7|8)\d{9}$/.test(this.data.phone))) {
			feedbackApi.showToast({title: '请输入正确的手机号'});
			return;
		}
		if(this.data.password === ''){
			feedbackApi.showToast({title: '验证码不能为空'});
			return;
		}
		wxRequest({
        	url:'/merchant/h5callback/checkH5LoginCode',
        	method:'GET',
        	data:{
    			code:this.data.password,
    			mobile:this.data.phone,
    			inviterAppUserId:this.data.userId,
    			callback:'callback'		
        	},
        }).then(res=>{
        	console.log(res)
			let callback = res.data
			let valueObject = JSON.parse(callback.substring(9,callback.length-1))
        	console.log(valueObject.success)
        	if (valueObject.success === true) {
        		wx.switchTab({
  					url: '/pages/index/index'
				});
			} else {
        		let msg = valueObject.value;
        		feedbackApi.showToast({title:msg});
        	}
        });	
	},
	callback(data){
		console.log(data)
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
        	url:'/merchant/userClient?m=checkLoginCode',
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