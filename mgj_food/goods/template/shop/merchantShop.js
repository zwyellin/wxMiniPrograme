const { wxRequest } = require('../../../utils/util.js');
const feedbackApi = require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const app = getApp();
let  ActivityListHeight = 149;
const merchantShop = {
	//获取商家详情
	findMerchantInfo(){
		wxRequest({
        	url:'/merchant/userClient?m=findMerchantInfo2',
        	method:'POST',
        	data:{
        		token:app.globalData.token,
        		params:{
        			latitude:app.globalData.latitude,
    				longitude:app.globalData.longitude,
        			agentId:app.globalData.agentId,
        			merchantId:this.data.merchantId
        		}	
        	},
        }).then(res=>{
        	console.log(res);
			if (res.data.code === 0) {
				let value = res.data.value;
				let name = value.merchant.name;
				let ruleDtoList =value.merchant.ruleDtoList;
				let merchantRedBagList = value.merchant.merchantRedBagList;
				wx.setNavigationBarTitle({
				  	title: name
				});
				if(!value.merchant.logo || !/.*(\.png|\.jpg)$/i.test(value.merchant.logo)){
					value.merchant.logo = '/images/merchant/merchantLogo.png';
				}
				console.log(value.merchant)
				this.setData({
					itemList:value.merchant,
					item:value.merchant,
					minPrice:value.merchant.minPrice,
					shipScore:value.merchant.shipScore,
					ruleDtoList:value.merchant.ruleDtoList,
				});
				if (wx.getStorageSync('shoppingCart')) {
					this.totalprice();	
				}
				value.merchant.activitySharedRelationList.forEach(item=>{
					if (item.promotionActivityType === 5 && item.relationPromotionActivityType === 2) {
						this.data.activitySharedStatus = item.status;
					}
				});
				ActivityListHeight += this.data.itemList.promotionActivityList.length*16;

				if (value.merchant.merchantRedBagList.length != 0) {
					merchantRedBagList.map((item)=>{
						item.isReceive = '立即领取';
					});
					this.maskShowAnimation();
					this.orderShowAnimation();
					this.setData({
						merchantRedBagList:merchantRedBagList
					});
				}
			} else {
				let msg = res.data.value;
				if (res.data.code === 100000 ) {
					setTimeout(()=>{
						wx.navigateTo({
							url:'/pages/login/login'
						});
					},1000);	
				}
				feedbackApi.showToast({title: msg});
			}
        });
	},
	//领取商家红包
	getMerchantRedBag(e){
		let { item, index} = e.currentTarget.dataset;
		if (this.data.merchantRedBagList[index].isReceive === "已领取") return;
		wxRequest({
        	url:'/merchant/userClient?m=getMerchantRedBag',
        	method:'POST',
        	data:{
        		token:app.globalData.token,
        		params:{
        			merchantId:this.data.merchantId,
        			id:item.id
        		}	
        	},
        }).then(res=>{
        	console.log(res);
			if (res.data.code === 0) {
				let value = res.data.value;
				let merchantRedBagList = this.data.merchantRedBagList;
				merchantRedBagList[index].isReceive = "已领取";
				this.setData({
					merchantRedBagList:merchantRedBagList
				});	
			} else {
				let msg = res.data.value;
				if (res.data.code === 100000 ) {
					setTimeout(()=>{
						wx.navigateTo({
							url:'/pages/login/login?switch=shop'
						});
					},1000);	
					feedbackApi.showToast({title: '你还没有登录,请先去登录'});
					return;
				}
				feedbackApi.showToast({title: msg});
			}
        });
	},
	//获取商家评价信息
	getevaluate(isLoadMore){
		if (!this.data.isEvaluate) {
			this.data.isEvaluate = true;
			wxRequest({
	        	url:'/merchant/userClient?m=findMerchantComments',
	        	method:'POST',
	        	data:{
	        		params:{
	        			merchantId:this.data.merchantId,
	        			size: this.data.evaluateSize,   
	        			start:this.data.evaluateStart
	        		}	
	        	}
	        }).then(res=>{
				if (res.data.code === 0) {
					let list = res.data.value;
					let evaluate = this.data.evaluate;
					if (isLoadMore) {
						if (list.length === 0) {
							this.setData({
								loading:true,
							});
						}
						evaluate = evaluate.concat(list);
					} else {
						evaluate = list;
					}
	    			this.setData({
	    				evaluate:evaluate,
	    			});
	    		}
				this.data.isEvaluate = false;
	        }).catch(err=>{
	        	this.data.isEvaluate = false;
	        });
		}
		
	},
	//加载更多评价
	loadMore(e){  
        this.data.evaluateStart = this.data.evaluate.length + 5;
        this.getevaluate(true);
	},
	//遮罩层显示阻止滑动
	myCatchTouch(){
		return false;
	},
	//底部弹出活动详情
	broadcast(e){
		this.maskShowAnimation();
		this.pickertagShowAnimation();
		console.log(this.data.pickertag);
		this.setData({
			pickertag:true,
			maskShow:true
		});
	},
	//拨打商家电话
	callPhone(e){
	    wx.makePhoneCall({
	      phoneNumber: this.data.itemList.contacts   //电话号码
	    });
	},
	maskShowAnimation(){
		let animation = wx.createAnimation({  
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(0.5).step();
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
	      			choice:false,
	        		detailShow:false,
	        		merchantRedBagList:[]
	      		})
	      	},500);
	      	this.setData({
	        	maskAnimation: animation.export(),	
	      	});	
	    }, 20);
		animation.opacity(0).step();//修改透明度,放大  
		this.setData({  
		   maskAnimation: animation.export()  
		}); 
	},
	choiceShowAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).translate(-50+'%',-50+'%').scale(1,1).step();
	      	this.setData({
	        	choiceAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).translate(-100+'%',-100+'%').scale(0,0).step();//修改透明度,放大  
		this.setData({  
		   choiceAnimation: animation.export()  
		}); 
	},
	choiceHideAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).scale(0,0).translateX(-50+'%').step();
	      	this.setData({
	        	choiceAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).scale(1,1).translateX(-50+'%').step();//修改透明度,放大  
		this.setData({  
		   choiceAnimation: animation.export()  
		}); 
	},
	orderShowAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.translate(-50+'%').top(20+'%').step();
	      	this.setData({
	        	orderRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.top(-1000+'rpx').step();
		this.setData({  
		   orderRedAnimation: animation.export()  
		}); 
	},
	orderHideAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.translate(-50+'%').top(150+'%').step();
	      	setTimeout(()=>{
	      		this.setData({
	        		merchantRedBagList:[]
	      		});
	      	},1000)
	      	this.setData({
	        	orderRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.translate(-50+'%').top(20+'%').step(); 
		this.setData({  
		   orderRedAnimation: animation.export()  
		}); 
	},
	pickertagShowAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.bottom(0).step();
	      	this.setData({
	        	pickertagAnimation: animation.export(),
	      	});
	    }, 200);
		animation.bottom(-ActivityListHeight+'px').step();
		this.setData({  
		   pickertagAnimation: animation.export()  
		});
	},
};
module.exports = {
   merchantShop
};