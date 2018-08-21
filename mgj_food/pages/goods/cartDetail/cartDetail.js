const { wxRequest, formatTime, trackTime } = require('../../../utils/util.js');
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const app = getApp();

Page({
	data:{
		orderRedAnimation:null,
		maskAnimation:null,
		maskShow:false,
		trackShow:false,                //订单追踪
		getMerchantRedBagList:{},       //根据订单领取商家红包
		orderDetail:{},
		trackDetailDate:{},
		trackDateStatus:false,
		nextOrederList:{},
		servicePhone:[],
		orderid:null,
		value:{},
		expectArrivalTime:null,          //送达时间
		show:false,
		shareRedBagInfo:{},              //红包分享规则
		shareShow:false,                  //控制分享红包弹框显示
		shareShowImg:false,
		shareRedBagAnimation:null
	},
	onLoad(options){
		let { orderid, isredbag} = options;
		this.data.orderid = orderid;
		this.data.isredbag = isredbag;
		this.findNewTOrderById();
		this.findCustomerAndComplainPhoneByUserXY();
		if (this.data.isredbag) {
			this.maskShowAnimation();
			this.setData({
				maskShow:true,
			});
			this.data.isredbag = true;
			this.getMerchantRedBagByOrderId();
		}		
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
	        	let orderDetail = res.data.value;
	          	let expectArrivalTime = parseInt(res.data.value.expectArrivalTime);
	     //      	if (this.data.isredbag) {
	     //      		if (orderDetail.shareRedBagInfo != null) {
	     //      			this.shareRedBagShowAnimation();
						// this.setData({
						// 	shareRedBagInfo:orderDetail.shareRedBagInfo,
						// 	shareShow:true,
						// 	shareShowImg:true
						// });
	     //      		}
	     //      	}
	          	if (expectArrivalTime === 1) {
	          		this.setData({
	          			orderDetail:res.data.value,
	          			trackDetailDate:res.data.value,
	          			expectArrivalTime:'立即送达'
	          		});
	          	} else {
	          		let	time = formatTime(expectArrivalTime);
	          			this.setData({
	          			orderDetail:res.data.value,
	          			trackDetailDate:res.data.value,
	          			expectArrivalTime:time
	          		});
	          	}
	        } else {
	          	let msg = res.data.msg;
	        } 
	    }).finally(()=>{
	    	wx.hideLoading();
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
		        	this.maskShowAnimation();
		        	this.choiceShowAnimation();
		        	this.setData({
		          		getMerchantRedBagList:getMerchantRedBagList,
		          		maskShow:true,
		          		show:true
		        	});
		        } else {
		        	setTimeout(()=>{
						this.maskHideAnimation();
					},1500);
		        } 
		    }
	    }).catch(err=> {
	    	console.log(err);
	    });
	},
	//再来一单
	nextOrder(e){
	    wx.showToast({
	        title: '正在提交订单',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
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
	refundDetail(e){
      	let { food } = e.currentTarget.dataset;
     	wx.navigateTo({
        	url:'/pages/goods/refundDetail/refundDetail?orderid=' + this.data.orderid
      	});
    },
    myCatchTouch(){
		return false;
	},
	close(){
		this.maskHideAnimation();
		this.choiceHideAnimation();
		this.setData({
			trackShow:false
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
	trackShow(){
		this.maskShowAnimation();
		if (!this.data.trackDateStatus) {
			let trackDetailDate = this.trackTimes()
			console.log(123)
			this.setData({
				trackDetailDate:trackDetailDate
			});
			this.data.trackDateStatus = true;
		}
		this.setData({
			maskShow:true,
			trackShow:true
		});
	},
	trackTimes(){
		let trackDetailDate = this.data.trackDetailDate
		let deliveryTask

		if (trackDetailDate.createTime) {
			trackDetailDate.createTime = trackDetailDate.createTime.replace(/-/g,'/');
			trackDetailDate.createTime = new Date(trackDetailDate.createTime).getTime();
			trackDetailDate.createTime = trackTime(trackDetailDate.createTime);
		}
		if (trackDetailDate.paymentFinishTime) {
			trackDetailDate.paymentFinishTime = trackDetailDate.paymentFinishTime.replace(/-/g,'/');
			trackDetailDate.paymentFinishTime = new Date(trackDetailDate.paymentFinishTime).getTime();
			trackDetailDate.paymentFinishTime = trackTime(trackDetailDate.paymentFinishTime);
		}
		if (trackDetailDate.modifyTime) {
			trackDetailDate.modifyTime = trackDetailDate.modifyTime.replace(/-/g,'/');
			trackDetailDate.modifyTime = new Date(trackDetailDate.modifyTime).getTime();
			trackDetailDate.modifyTime = trackTime(trackDetailDate.modifyTime);
		}
		if (trackDetailDate.deliveryTask) {
			deliveryTask = trackDetailDate.deliveryTask;
			if (deliveryTask.orderConfirmTime) {
				deliveryTask.orderConfirmTime = deliveryTask.orderConfirmTime.replace(/-/g,'/');
				deliveryTask.orderConfirmTime = new Date(deliveryTask.orderConfirmTime).getTime();
				deliveryTask.orderConfirmTime = trackTime(deliveryTask.orderConfirmTime);
			}
			if (deliveryTask.acceptTime) {
				deliveryTask.acceptTime = deliveryTask.acceptTime.replace(/-/g,'/');
				deliveryTask.acceptTime = new Date(deliveryTask.acceptTime).getTime();
				deliveryTask.acceptTime = trackTime(deliveryTask.acceptTime);
			}
			if (deliveryTask.arrivalMerchantTime) {
				deliveryTask.arrivalMerchantTime = deliveryTask.arrivalMerchantTime.replace(/-/g,'/');
				deliveryTask.arrivalMerchantTime = new Date(deliveryTask.arrivalMerchantTime).getTime();
				deliveryTask.arrivalMerchantTime = trackTime(deliveryTask.arrivalMerchantTime);
			}
			if (deliveryTask.deliveryDoneTime) {
				deliveryTask.deliveryDoneTime = deliveryTask.deliveryDoneTime.replace(/-/g,'/');
				deliveryTask.deliveryDoneTime = new Date(deliveryTask.deliveryDoneTime).getTime();
				deliveryTask.deliveryDoneTime = trackTime(deliveryTask.deliveryDoneTime);
			}	
		}
		trackDetailDate.deliveryTask = deliveryTask 
		return trackDetailDate
	},
	maskShowAnimation(){
		let animation = wx.createAnimation({  
		    transformOrigin: "50% 50%",
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(0.3).step();
	      	this.setData({
	        	maskAnimation: animation.export(),
	      	});
	    }, 200);
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
	      			maskShow:false
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
	        	getMerchantRedBagList:[]
	      	});
	    }, 200);
		animation.translate(-50+'%').top(20+'%').step();//修改透明度,放大  
		this.setData({  
		   orderRedAnimation: animation.export()  
		}); 
	},
	//关闭红包分享页面
	closeShare(){
		this.shareRedBagHideAnimation()
	},
	//订单完成后出现发红包按钮
	clickImgShareShowWX(){
		this.shareRedBagShowAnimation();
		this.setData({
			shareRedBagInfo:this.data.orderDetail.shareRedBagInfo,
			shareShow:true
		});
	},
	// onShareAppMessage(res) {
 //    	return {
 //      		title: '马管家红包来袭',
 //      		path: this.data.shareRedBagInfo.url,
 //      		imageUrl: this.data.shareRedBagInfo.img,
 //      		success: function(res) {
 //        		// 转发成功
 //     		},
 //      		fail: function(res) {
 //        		// 转发失败
 //      		}
 //    	};
 //  	},
  	shareRedBagShowAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).scale(1,1).step();
	      	this.setData({
	        	shareRedBagAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).scale(0,0).step();//修改透明度,放大  
		this.setData({  
		   shareRedBagAnimation: animation.export()  
		}); 
	},
	shareRedBagHideAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).scale(0,0).step();
	      	setTimeout(()=>{
	      		this.setData({
	        		shareShow:false,
	      		});
	      	},1000);
	      	this.setData({
	        	shareRedBagAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).scale(1,1).step();//修改透明度,放大  
		this.setData({  
		   shareRedBagAnimation: animation.export()  
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