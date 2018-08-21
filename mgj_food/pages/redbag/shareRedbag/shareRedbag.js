const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { wxRequest } = require('../../../utils/util.js');
const app = getApp();
Page({
	data:{
		phone:'',
		password:'',
		maStatus:false,
		yanzhengma:'获取验证码',        //验证码
		currentTime:60,                //倒计时
		redBagList:[],                 //大家的红包手气数组
		redbagJson:{}                  //领取的红包对象
	},
	onLoad() {
		
	},
	wxLogin(){
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
	            }
	        }
	    });
	},
	getPlatformRedShareBagRules() {
		url = "merchant/h5callback/getPlatformRedShareBagRules";
		wxRequest({
        	url:'/merchant/h5callback/getPlatformRedShareBagRules',
        	method:'GET',
        	data:{
        		code:this.data.code,
        		openId:this.data.openId,
    			shareRedBagRulesId:this.data.shareRedBagRulesId,
    			callback:'callback',
        	},
        }).then(res=>{
        	console.log(res)
			let callback = res.data
			let valueObject = JSON.parse(callback.substring(9,callback.length-1));
        	console.log(valueObject.success);
			if (valueObject.value && valueObject.wechatInfo) {
				var redBagList = valueObject.value.redBagList ||[];
				var redBag = valueObject.value.redBag || {};
			}
			if (valueObject.code == 200 || valueObject.code == 1004) {
				let message = valueObject.message;
				this.setData({
					redBagList:redBagList
				});
				feedbackApi.showToast({title:message});
			} else if (valueObject.code == 1005) {
				feedbackApi.showToast({title:'今日领取次数已用完'});
			} else if (valueObject.code == 1006) {
				
			} else {

			}
        });	
	}
});