const { wxRequest, formatTime } = require('../../../utils/util.js');
const app = getApp();

Page({
	data:{
		orderRedAnimation:null,
		maskAnimation:null,
		maskShow:false,
		getMerchantRedBagList:{},       //根据订单领取商家红包
		orderDetail:{},
		nextOrederList:{},
		servicePhone:[],
		orderid:null,
		value:{},
		expectArrivalTime:null,          //送达时间
		show:false
	},
	onLoad(options){
		let { orderid, isredbag} = options;
		this.data.orderid = orderid;
		this.data.isredbag = isredbag;
		this.findNewTOrderById();
		this.findCustomerAndComplainPhoneByUserXY();
		if (this.data.isredbag) {
			this.maskShowAnimation()
			this.setData({
				maskShow:true,
			})
			this.data.isredbag = true;
			this.getMerchantRedBagByOrderId();
		}		
	},
	onShow(){
		
	},
	findNewTOrderById(){
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		wxRequest({
	        url:'/merchant/userClient?m=findNewTOrderById',
	        method:'POST',
	        data:{
	          	params:{
	            	orderId: this.data.orderid
	          	},
	          	token:app.globalData.token  
	        },
	      }).then(res=>{
	        if (res.data.code === 0) {
	          	let expectArrivalTime = parseInt(res.data.value.expectArrivalTime)
	          	if (expectArrivalTime === 1) {
	          		this.setData({
	          			orderDetail:res.data.value,
	          			expectArrivalTime:'立即送达'
	          		});
	          	} else {
	          		let	time = formatTime(expectArrivalTime)
						console.log(time)
	          			this.setData({
	          			orderDetail:res.data.value,
	          			expectArrivalTime:time
	          		});
	          	}
	        } else {
	          	let msg = res.data.value;
	        } 
	    }).finally(()=>{
	    	wx.hideLoading()
	    });
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
		        let servicePhone = res.data.value;
		        this.setData({
		          	servicePhone:servicePhone
		        });
		    }
	    });
	},
	//根据订单领取商家红包
	getMerchantRedBagByOrderId(){
		wxRequest({
	      url:'/merchant/userClient?m=getMerchantRedBagByOrderId',
	      method:'POST',
	      data:{
	      		token:app.globalData.token,
	        	params:{
	          		orderId:this.data.orderid
	        	} 
	      },
	    }).then(res=>{
		    if (res.data.code === 0) {
		        let getMerchantRedBagList = res.data.value;
		        if (getMerchantRedBagList) {
		        	console.log(12)
		        	this.setData({
		          		getMerchantRedBagList:getMerchantRedBagList
		        	});
		        	// this.maskShowAnimation();
					this.choiceShowAnimation();
					this.setData({
						show:true
					})
		        } else {
		        	setTimeout(()=>{
						this.maskHideAnimation()
					},2000);
		        } 
		    }
	    }).catch(err=> {
	    	
	    });
	},
	//再来一单
	nextOrder(e){
      wx.showLoading({
        title:'',
        icon:'../../../images/images/loading.gif'
      });
      wxRequest({
          url:'/merchant/userClient?m=againOrderPreview',
          method:'POST',
          data:{
              token:app.globalData.token,
              params:{
                  orderId:this.data.orderDetail.id,
                  userId:this.data.orderDetail.userId,
                  loginToken:app.globalData.token
              } 
          },
        }).then(res=>{
          if (res.data.code === 0) {
            let value = res.data.value
              this.setData({
                  value:res.data.value
              });
              console.log(value)
              if (value.againOrderStatus === 0 || value.againOrderStatus === 1 || value.againOrderStatus === 2) {
                let msg = value.againOrderTip
                feedbackApi.showToast({title: msg});
              } else {
                wx.navigateTo({
                  url: '/pages/queryOrder/queryOrder?merchantId='+this.data.orderDetail.merchantId
                });
              }
              wx.hideLoading()   
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
              wx.hideLoading();
          }
        }).catch(err=>{
        	wx.hideLoading();
          	console.log(err);
        });
    },
	//取消订单
	cancelOrder(){
		let that = this
		wx.showModal({
            content: '确定要取消订单',
            cancelText: '还是不了',
            success: function (res) {
              if (res.confirm) {
              	wx.showToast({
			        title: '取消中',
			        icon: 'loading',
			        duration: 200000,
			        mask: true
			    });
      			that.maskShowAnimation();
               	wxRequest({
			      	url:'/merchant/userClient?m=cancelTOrderById',
			      	method:'POST',
			      	data:{
			      		token:app.globalData.token,
			        	params:{
			          		orderId:that.data.orderid
			        	} 
			      	},
			    }).then(res=>{
			    	console.log(res)
				    if (res.data.code === 0) {
				        that.findNewTOrderById()
				    } else {
						wx.hideLoading()
						this.maskHideAnimation();
				    }
			    }).catch(res=>{
			    	wx.hideLoading()
			    	this.maskHideAnimation();
			    });
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
        });
	},
	evaluateOrder(){
		wx.navigateTo({
			url: '/pages/evaluate/evaluate'
		});
	},
	close(){
		this.maskHideAnimation();
		this.choiceHideAnimation();
		this.setData({
			getMerchantRedBagList:[]
		});
	},
	bagListShow(){
		this.setData({
			show:true,
			maskShow:true
		});
		this.maskShowAnimation();
		this.choiceShowAnimation();
	},
	callPhone(){
	    wx.makePhoneCall({
	      phoneNumber: this.data.orderDetail.merchant.contacts   //电话号码
	    });
	},
	//拨打客服电话申请退款
	refundCall(){
		let that = this;
		wx.showModal({
	        title: '提示',
	        content: '你是否需要拨打客服电话，申请退款',
	        success: function (res) {
	          if (res.confirm) {
	          	if (that.data.orderDetail.agentPhone) {
	          		wx.makePhoneCall({
	      				phoneNumber: that.data.orderDetail.agentPhone   //代理商电话号码
	    			});
	          	} else {
	          		let servicePhone = that.data.servicePhone[1];
	          		wx.makePhoneCall({
	      				phoneNumber: servicePhone.phone   //电话号码
	    			});
	          	}
	          } else if (res.cancel) {
	            console.log('用户点击取消')
	          }
	        }
	    });
	},
	//拨打骑手电话
	deliverycall(){
		let deliveryPhone = this.data.orderDetail.deliveryTask.deliveryman;
        wx.makePhoneCall({
  			phoneNumber: deliveryPhone.mobile   //电话号码
		});
	},
	maskShowAnimation(){
		let animation = wx.createAnimation({  
		    transformOrigin: "50% 50%",
			duration: 1000,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(0.3).step();
	      	this.setData({
	        	maskAnimation: animation.export(),
	      	});
	    }, 1000);
		animation.opacity(0).step();//修改透明度,放大  
		this.setData({  
		   maskAnimation: animation.export()  
		}); 
	},
	maskHideAnimation(){
		let animation = wx.createAnimation({  
		    duration: 500,  
		});
		setTimeout(()=> {
	      	animation.opacity(0).step();
	      	setTimeout(()=>{
	      		this.setData({
	      			maskShow:false,
	      		});
	      	},500);
	      	this.setData({
	        	maskAnimation: animation.export(),	
	      	});	
	    }, 20);
		animation.opacity(0.3).step();//修改透明度,放大  
		this.setData({  
		   maskAnimation: animation.export()  
		}); 
	},
	choiceShowAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 1000,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.translate(-50+'%').top(20+'%').step();
	      	this.setData({
	        	orderRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.top(-1000+'rpx').step();//修改透明度,放大  
		this.setData({  
		   orderRedAnimation: animation.export()  
		}); 
	},
	choiceHideAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 1000,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.translate(-50+'%').top(150+'%').step();
	      	this.setData({
	        	orderRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.translate(-50+'%').top(20+'%').step();//修改透明度,放大  
		this.setData({  
		   orderRedAnimation: animation.export()  
		}); 
	},
	selectTab(e){
		wx.navigateTo({
		  url: '/pages/shop/shop?merchantid='+this.data.orderDetail.merchantId
		});
	},
	onUnload(){
		if (this.data.isredbag) {
			wx.switchTab({
				url:'/pages/index/index'
			})
		}
	}
});