const { wxRequest } = require('../../../utils/util.js');
const feedbackApi = require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const app = getApp();
let  ActivityListHeight = 149;
const merchantShop = {
	//获取商家详情
	findMerchantInfo(){
		return wxRequest({
        	url:'/merchant/userClient?m=findMerchantInfo2',
        	method:'POST',
        	data:{
        		token:app.globalData.token,
        		params:{
        			latitude:app.globalData.latitude,
    					longitude:app.globalData.longitude,
        			merchantId:this.data.merchantId
        		}	
        	},
        }).then(res=>{
			if (res.data.code === 0) {
				let value = res.data.value;
				console.log(res)
				let name = value.merchant.name;
				let ruleDtoList =[];
				let merchantRedBagList = value.merchant.merchantRedBagList;
				let promotionActivityList=value.merchant.promotionActivityList;
				wx.setNavigationBarTitle({
				  	title: name
				});
				// 更新代理商【可能是分享进来的】
				app.globalData.agentId=value.agentId;
				if(!value.merchant.logo || !/.*(\.png|\.jpg)$/i.test(value.merchant.logo)){
					value.merchant.logo = '/images/merchant/merchantLogo.png';
				}
				//这边从promotionActivityList里面获取
				promotionActivityList.forEach((ele,index,arr) => {
					if(ele.type===1 && ele.activityType===2){
						ruleDtoList=ele.ruleDtoList
					}
				});
				console.log("规则",ruleDtoList)
				this.setData({
					merchantInfoObj:value.merchant,
					minPrice:value.merchant.minPrice,
					shipScore:value.merchant.shipScore,
					ruleDtoList
				});
				value.merchant.activitySharedRelationList.forEach(item=>{
					if (item.promotionActivityType === 5 && item.relationPromotionActivityType === 2) {
						this.data.activitySharedStatus = item.status;
					}
				});
				if (wx.getStorageSync('shoppingCart')) {
					this.totalprice();	
				}
				ActivityListHeight += this.data.merchantInfoObj.promotionActivityList.length*16;

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
			}else {
				let msg = res.data.value;
				if (res.data.code === 100000 ) {
					setTimeout(()=>{
						wx.navigateTo({
							url:'/pages/login/login'
						});
					},1000);	
				}
				if(res.data.code === 500 && res.data.value=="商家未关联代理商"){//返回
					setTimeout(()=>{
					wx.navigateBack({ //返回前一页
						delta: 1
					  })
					},2000);	
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
		if (!this.data.isEvaluate&&!this.data.loading) {//正在加载或者没有更多评论了，则不发送请求
			this.data.isEvaluate = true;
			wxRequest({
	        	url:'/merchant/userClient?m=queryMerchantComments',
	        	method:'POST',
	        	data:{
	        		params:{
	        			merchantId:this.data.merchantId,
								isHaveContent:this.data.isHaveContent,  //
								queryType: this.data.evaluateType,
								size: this.data.evaluateSize,
	        			start:this.data.evaluateStart
	        		}	
	        	}
	        }).then(res=>{
				if (res.data.code === 0) {
					let resValue = res.data.value;
					let evaluate = this.data.evaluate;
					if (isLoadMore) {//下拉加载
						if (resValue.list.length === 0) {//无返回值了
							this.setData({
								loading:true,
							});
						}
						evaluate.list= evaluate.list.concat(resValue.list);
					} else {//第一次加载
						evaluate = resValue;
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
	// 获取商品评论
	queryGoodsComments(isLoadMore){
		wxRequest({
			url:'/merchant/userClient?m=queryGoodsComments',
			method:'POST',
			data:{
				params:{
					goodsId: this.data.selectedFood.id,
					isHaveContent:this.data.isHaveContent,
					queryType: this.data.evaluateType,
					size: this.data.evaluateSize,
	        start:this.data.evaluateStart
				}	
			}
		}).then(res=>{
			if (res.data.code === 0) {
				let resValue = res.data.value;
				let evaluate = this.data.evaluate;
				if (isLoadMore) {//下拉加载
					if (resValue.list.length === 0) {//无返回值了
						this.setData({
							loading:true,
						});
					}
					evaluate.list= evaluate.list.concat(resValue.list);
				} else {//第一次加载
					evaluate = resValue;
				}
				this.setData({
					evaluate:evaluate,
				});
				}
			this.data.isEvaluate = false;
		})
	},
	//评论区，点击不同按钮加载不同数据，全部0，好评1，差评2，有图3
	evaluateBtnSwitch(e){
			var btnNum=parseInt(e.target.dataset.id);
			let {type=0}=e.target.dataset;
			//@type区分是商品还是商店的点击，进而请求不一样
		  var evaluate=this.data.evaluate;
		  if(btnNum!=this.data.selestEvaluateStatus){	//如果是一样，则不重复加载
			evaluate.list=[];//清空评论列表
			//因为更换查询条件，所以先重置
			var that=this;
			this.setData({
				selestEvaluateStatus:btnNum,//改变状态
				evaluate:evaluate,
				evaluateStart:0,//清空
				evaluateType:btnNum,//改变请求类型
				isEvaluate:false,
				loading:false
			},function(){
				if(type==0){//商品
					that.getevaluate(false);//加载商家评价
				}else{
					that.queryGoodsComments(false);//加载商家评价
				}
			})	
		  }		
	},
	//评论是否为空过滤
	merchantComIsFilterEmptySwitch(e){
		var isHaveContent=this.data.isHaveContent;
		var evaluate=this.data.evaluate;
		evaluate.list=[];//清空评论列表
		console.log("是否为空过滤",isHaveContent)
		isHaveContent=isHaveContent==0?1:0;
		//因为更换查询条件，所以先重置
		var that=this;
		this.setData({
			isHaveContent:isHaveContent,//改变状态及请求类型
			evaluate:evaluate,
			evaluateStart:0,//清空
			isEvaluate:false,//是否正在加载
			loading:false//是否加载到底
		},function(){
			that.getevaluate(false);//加载,过滤下有可能返回的数据，过滤之后没有一条
		})
	},
	valuateItemImageTap(e){//评论区图片点击事件，进入预览
		var imgs=e.target.dataset.imgs;
		var current=imgs[e.target.dataset.current];//index
		console.log("图片预览",imgs)
		wx.previewImage({
			current: current, // 当前显示图片的http链接
			urls:imgs // 需要预览的图片http链接列表
		  })
	},
	//加载更多评价
	loadMore(e){  
        this.data.evaluateStart = this.data.evaluate.list.length;
        this.getevaluate(true);
	},
	//遮罩层显示阻止滑动
	myCatchTouch(){
		return false;
	},
	// 查看商家地理位置
	merchantAddress(){
		wx.navigateTo({
			url: '/goods/mapview/mapview?latitude=' + this.data.merchantInfoObj.latitude + '&longitude=' + this.data.merchantInfoObj.longitude + '&name=' + this.data.merchantInfoObj.name
		});
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
	      phoneNumber: this.data.merchantInfoObj.contacts   //电话号码
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