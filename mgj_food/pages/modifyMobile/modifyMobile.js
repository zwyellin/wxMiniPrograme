// pages/modifyMobile/modifyMobile.js
const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { wxRequest } = require('../../utils/util.js');
const app = getApp();

let interval = null;   //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yanzhengma:"获取验证码",
    oldMobile:"",
    newMobile:"",

    password:null,//验证码
    disabled:false,//获取验证码是否可以再点击
    currentTime:60, //倒计时 

    newMobileBindShow:false,//新手机绑定是否展示
    maStatus:false,//新手机绑定时，验证码是否亮起

    modifySuccess:false,//是否绑定新手机，状态。
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let loginMessage = wx.getStorageSync('loginMessage');
    let oldMobile=loginMessage.mobile;
    this.setData({
      oldMobile
    })
  },
	checkPass(e){//密码
		let pass = e.detail.value;
		this.setData({
			password:pass
		});
  },
  // 请求发送验证码
  getVerificationCode(){
    if(this.data.disabled){
      feedbackApi.showToast({title: '您已发送了验证码'});
      return
    }
    this.getCode();
    this.getCodeMa(this.data.oldMobile);
		this.setData({
      		disabled:true
    	});
  },
  // 新手机保存手机号码
  checkPhone(e){//手机号码
    let phone = e.detail.value;
		if (phone.length == 11) {
			this.setData({
				newMobile:phone,
				maStatus:true
			})

		} else {
			this.setData({
				newMobile:phone,
				maStatus:false
			});
		}	

	},
  // 新手机发送验证码
  getVerificationCodeNew(){
    if(this.data.disabled){
      feedbackApi.showToast({title: '您已发送了验证码'});
      return
    }
		if(this.data.newMobile === ''){
			feedbackApi.showToast({title: '手机号不能为空'});
			return;
		}
		if (!(/^1[3456789]\d{9}$/.test(parseInt(this.data.newMobile)))) {
			feedbackApi.showToast({title: '请输入正确的手机号'});
			return;
		}
		if (this.data.yanzhengma === '获取验证码') {
			this.getCode();
			this.getCodeMa(this.data.newMobile);
		}
		this.setData({
      		disabled:true
    	});
	},
  // 验证码倒计时
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
  // 请求获取验证码
  getCodeMa(mobile){
		wxRequest({
        	url:'/merchant/userClient?m=sendLoginSms',
        	method:'POST',
        	data:{
        		params:{
        			mobile:mobile,	
        		},	
        	},
        }).then(res=>{
          if (res.data.code === 0) {
            feedbackApi.showToast({title: '验证码发送成功'});
          } else {
            feedbackApi.showToast({title: '验证码发送失败'});
            clearInterval(interval);
            this.setData({
                    yanzhengma: '获取验证码',
                    currentTime:60,
                    disabled: false   
                });
          }
        }).catch(res=>{
        	feedbackApi.showToast({title: '验证码发送失败'});
        	clearInterval(interval);
          this.setData({
                  yanzhengma: '获取验证码',
                  currentTime:60,
                  disabled: false   
              });
        });
  },
  // 更换手机
  modifyMobileBefore(){
    wxRequest({
      url:'/merchant/appletClient?m=modifyMobileBefore',
      method:'POST',
      data:{
        params:{
          code:this.data.password
        },	
      },
    }).then(res=>{
      if(res.data.code==0){
        clearInterval(interval);
        this.setData({
                yanzhengma: '获取验证码',
                currentTime:60,
                disabled: false,
                newMobileBindShow:true
            });
      }else{
        feedbackApi.showToast({title: res.data.value});
      }
    })
  },

  // 绑定新手机
  modifyMobile(){
    wxRequest({
      url:'/merchant/appletClient?m=modifyMobile',
      method:'POST',
      data:{
        params:{
          code:this.data.password,
          mobile:this.data.newMobile
        },	
      },
    }).then(res=>{
      if(res.data.code==0){
        clearInterval(interval);
        // 弹窗提示
        this.data.modifySuccessObj=res;
        this.setData({
          modifySuccess:true
        })
      }else{
        feedbackApi.showToast({title: res.data.value});
      }
    })
  },
  // 完成
  finish(){
    let res=this.data.modifySuccessObj;
    let loginMessage = res.data.value;
    // 账户更新或销毁，要清除重置这四剑客
    app.globalData.token = loginMessage.token;
    app.globalData.userId = loginMessage.id;
    wx.setStorageSync('loginstatus',true);//记录登录状态
    wx.setStorageSync('loginMessage',loginMessage);//缓存用户信息
    //关闭弹窗，延迟返回 
    this.setData({
      modifySuccess:false
    },()=>{
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1000);
    })
  }
})