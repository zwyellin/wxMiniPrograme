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
		shareRedBagAnimation:null,

		promotionList:null,//下单后的马管家券,红包等整体的对象
		promotionListShow:true,//点X后置为false
		
	},
	onLoad(options){
		let { orderid, isredbag} = options;
		this.data.orderid = orderid;
		this.data.isredbag = isredbag;
		this.findNewTOrderById().then(()=>{//显示订单信息后，再请求红包情况
			// 仅在下单之后进入这个页面才会触发
			var pages = getCurrentPages();
			var prevPage = pages[pages.length - 2]; // 上一级页面
			// 	if(	/goods\/queryOrder\/queryOrder/.test(prevPage.route))
			if(this.data.isredbag){
				this.getPromotionListByOrderId();
				this.maskShowAnimation();
				this.setData({
					maskShow:true,
				});
				this.data.isredbag = true;
			}
		})
		this.findCustomerAndComplainPhoneByUserXY();	
	},
	findNewTOrderById(){
		wx.showLoading({
	        title: '加载中',
	        mask: true
	    });
		return wxRequest({
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
				wx.hideLoading();
	    })
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
	//再来一单
	nextOrder(e){
	    wx.showLoading({
	        title: '正在提交订单',
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
                  url: '/goods/queryOrder/queryOrder?merchantId='+this.data.orderDetail.merchantId
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
              	wx.showLoading({
			        title: '取消中',
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
			url: '/goods/createComments/createComments?orderid=' + this.data.orderid
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
		  url: '/goods/shop/shop?merchantid='+this.data.orderDetail.merchantId
		});
	},

	//红包
  getPromotionListByOrderId(){
    wxRequest({
      url:'/merchant/userClient?m=getPromotionListByOrderId',
      method:'POST',
      data:{
          params:{
            orderId: this.data.orderid
          }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let promotionList=res.data.value;
        promotionList.hascoupons=true;
        if(promotionList.coupons.couponsAmt==undefined){
          promotionList.hascoupons=false;
				}else{//获取马管家券有效期
					let data2=new Date().getTime();
					let expirationTime=promotionList.coupons.expirationTime-data2;
          let oneDay=24*60*60*1000;
          promotionList.coupons.expirationTime=Math.ceil(expirationTime/oneDay);
				}
        promotionList.hasmerchantRedBags=true;
        if(promotionList.merchantRedBags===undefined ||promotionList.merchantRedBags==null || promotionList.merchantRedBags.length==0){
          promotionList.hasmerchantRedBags=false;
        }else{ // 设置有效期
					let merchantRedBags=promotionList.merchantRedBags;
          merchantRedBags.forEach((_item,_index)=>{
            let data=new Date(_item.expirationTime);
            _item.expirationTime=data.getFullYear()+"."+(data.getMonth()+1)+"."+data.getDate()
          })
          promotionList.merchantRedBags=merchantRedBags
        }
        this.setData({
          promotionList
        },()=>{//显示之后数字动态改变
					let k=0
					let couponsAmt=JSON.parse(JSON.stringify(res.data.value.coupons.couponsAmt));
          let t1=setInterval(()=>{
            k+=1;
            if(k==10) {
              clearInterval(t1)
              console.log(couponsAmt);
              setTimeout(()=>{//避免太频繁，堵塞
                this.setData({
                  'promotionList.coupons.couponsAmt':couponsAmt
                })
              },100)
            }
            this.setData({
              'promotionList.coupons.couponsAmt':parseInt(Math.random()*10*100)/100 //保留两位的随机数
            })
          },100)
        })
      } else {
        
      }
   })
  },
  redBagsGotoTap(e){
    let {index}=e.target.dataset;
    let merchantRedBags=this.data.promotionList.merchantRedBags;
    let {merchantId,businessType}=merchantRedBags[index];
    if(businessType==1){//外卖
      wx.navigateTo({
				url:"/goods/shop/shop?merchantid=" + merchantId,
			});
    }else if(businessType==6){//团购
      wx.navigateTo({
        url:`/goods/GroupPurchaseShop/GroupPurchaseShop?groupPurchaseMerchantId=${merchantId}`
      })
    }
  },
  promotionListClose(e){
    this.setData({
      promotionListShow:false
    },()=>{
			if(this.data.orderDetail.shareRedBagInfo){
				this.clickImgShareShowWX();//打开分享红包
			}
		})
  },
	onShareAppMessage(res) {
		if(res.from=="button"){
			let src=this.data.shareRedBagInfo.url;
			console.log("分享红包path:",src)
			return {
					title: '马管家红包来袭',
					path: "/pages/webView/webView?src="+src,
					imageUrl: this.data.shareRedBagInfo.img,
					success: function(res) {
						// 转发成功
				},
					fail: function(res) {
						// 转发失败
					}
			};
		}
  },
	onUnload(){
		if (this.data.isredbag) {
			wx.switchTab({
				url:'/pages/index/index'
			})
		}
		//如果上一个页面是cartItem，则修改其页面字段，标注是从这个页面返回的，则该页面不再显示加载图标，改为下拉刷新样式
		var pages = getCurrentPages();
		var prevPage = pages[pages.length - 2]; // 上一级页面
		let prePageReg=/cartItem/;//判断上一级页面的路径是不是含有cartItem
		if(prePageReg.test(prevPage.route)){
			prevPage.data.iscartDetailBack=true;
		}
	}
});