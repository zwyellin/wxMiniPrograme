//获取应用实例
const app = getApp();
const { Promise, wxRequest, getBMapLocation, wxGetLocation, qqMap, gcj02tobd09,buttonClicked} = require('../../utils/util.js');
const { initClassList, imgUrls, merchantFeature, merchantActive } = require('../../components/homeClass.js');
const { merchantObj } = require('../../components/merchant/merchant.js');
let interval;
const dataListSize = 40;//商家列表的二维数组大小
Page(Object.assign({}, merchantObj, {
  	data: {
  		islocal:false,       //是否计算本地缓存
  		moveDown:false,
  		toSearch:false,
  		loading:false,
  		isAgentId:false,//
  		clickPage:false,
  		cartObject:null,
  		isSwipper:false,
  		isShoppingCart:false,                                                                              
	    swiper: {
	      imgUrls: imgUrls,
	      imageShow:false,
	      indicatorDots: true,
	      autoplay: true,
	      interval: 3000,
	      duration: 1000
	    },
	    refreshData:false,
	    size:24,
	    region:'',                  //当前城市
		city:{
			cityName:'',
		},
		marqueePace: 1,             //滚动速度       
	    marqueeDistance2: 0,        //初始滚动距离
	    marquee2copy_status: false,
	    marquee2_margin: 20,
	    addressSize: 22,
	    orientation: 'left',     //滚动方向
	    interval: 50,           // 时间间隔
		type1:'分类',
		type2:'排序',
		type3:'筛选',
		isPaiXunTop:false,
		classList:[],
		childTagCategoryList:[],
		classShow:false,
		shipShow:false,
		timeIndex:0,
		secondIndex:0,        //选择第二轮分类
		queryType:1,         //排序类型
		sortList:["智能排序","距离最近","销量最高","起送价最低","配送速度最快","评分最高"],
		merchantActive:merchantActive,
		merchantFeature:merchantFeature,
		sortIndex:0,
		tagParentId:0,
		tagId:null,
		shipFilter:null,
		merchantTagsList:[],  //筛选类型
		sortShow:false,
		maskShow:false,
		maskAnimation:null,   //遮罩层动画
		start:0, 
		dataList1:[],
		dataList2:[],
		dataList3:[],
		dataList4:[],
		dataList5:[],
		dataList6:[],
		dataList7:[],
		dataList8:[],
		dataList9:[],
		dataList10:[],
		dataListIndex:0,//用于确定要放哪个数组里面,
		skeletonScreen:true,//是否展示骨架屏,一开始为true。加载数据前置为true，加载后false
		initClassList:initClassList,	  //分类列表
		platformRedList:[],               //平台红包列表
		isloginGetPlatformRedBag:false,   //是否登录领取过平台红包
		isRegisterGetRedBag:false,
		platformNoRedAnimation:null,        // 平台未注册动画
		platformGetRedAnimation:null,        // 领取平台红包动画
	}, 
	onLoad(){
		wxGetLocation({type:'gcj02'}).then(()=>{
			this.appLocationMessage();
		}).catch(err=>{
			this.setData({
				isAgentId:true
			});
			console.log(1)
			this.appLocationMessage();
		});	
	},
	appLocationMessage(){
		this.getSeting().then(()=>{
			this.setData({
				isAgentId:false
			});
			wxGetLocation({
				type:'gcj02'
			}).then(res=>{
				let lat = res.latitude;
				let lng = res.longitude;
				this.data.obj = {
					location:{
						longitude:lng,
						latitude:lat
					}
				}; 
				let { longitude, latitude } = gcj02tobd09(lng,lat);
				if(false){
					console.log("测试地址:longitude",app.globalData.longitude)
					app.globalData.longitude= "116.304782";
					app.globalData.latitude="39.966128";
				}else{
					app.globalData.longitude = longitude;
					app.globalData.latitude = latitude;
				}
				
				this.init().then((res)=>{
					if (res.data.code === 0) {
						let value = res.data.value;
						if (value) {
							app.globalData.agentId = value.id;
							if (value.phone) {
								app.globalData.agentPhone = value.phone;
							} else {
								app.globalData.agentPhone = null;
							}
							app.globalData.sign=value.sign;
						} else {
							app.globalData.agentPhone = null;
							app.globalData.agentId = null;
						}
						this.initBanner();
						this.initClass();
						this.getDataList(false,true);
	        			this.findTagCategory();	
					}	
		        }).catch(err=>{
		        	this.setData({
						isAgentId:true
					});
		        });
		        getBMapLocation(this.data.obj).then(res=>{
					let address;
					if (res.status === 0) {
						address = res.result.address;
						this.data.region = res.result.address_component.city;
						this.setData({
			      			city:Object.assign({},this.data.city,{cityName:address})
			    		});
			    		// this.runAddress(this.data.city);
					}
			    }).catch(err=>{
			    	this.setData({
						isAgentId:true
					});
			    });
			    app.findAppUserByToken((token)=>{
		  			app.globalData.token = token;
					this.getPlatformRedBag();
		  		});
			}).catch(err=>{
				this.setData({
					isAgentId:true
				});
			}); 
		}).catch(err=>{
			this.setData({
				isAgentId:true
			});
		});
	},
	//调起授权
	getSeting(){
		let that = this;
		return new Promise((resolve,reject)=>{
			wx.getSetting({
			    success: (res) => {
			        if (res.authSetting["scope.userLocation"] !=true) {
			        	this.setData({
							isAgentId:true
						});
			          	wx.showModal({
				            title: '用户未授权',
				            content: '如需正常使用马管家小程序功能，请按确定进入小程序设置界面，勾选地理位置并点击确定。',
				            showCancel: false,
				            success: (res)=> {
				              	if (res.confirm) {
					                wx.openSetting({
						                success: (res) => {
						                    if (res.authSetting["scope.userLocation"] ===true) {
												resolve();
						                    }else {
						                    	reject(err);
						                    }
						                },
						                fail: (err)=>{
						                	reject(err);
						                }
					                });
				              	}
				            },
				            fail: (err)=>{
				            	reject(err);
				            }
				        });
			        } else {
			        	resolve();
			        }
			    }
	    	});
		});	
	},
	onShow(){
		this.data.clickPage = false;
		let loginMessage = wx.getStorageSync('loginMessage');
		let loginStatus = wx.getStorageSync('loginstatus');
		if (wx.getStorageSync('shoppingCart')) {
			let shoppingCart = wx.getStorageSync('shoppingCart');
			this.setData({
				cartObject:shoppingCart
			});	
  		}
  		if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
  			let isloginGetPlatformRedBag = wx.getStorageSync('isloginGetPlatformRedBag');  // 是否通过首页登录领取过平台红包
			if (isloginGetPlatformRedBag) {
				this.getPlatformRedBag();
				wx.setStorageSync('isloginGetPlatformRedBag',false);
			}
  		}
		if (this.data.refreshData) {
			this.setData({
				type1:'分类',
				type2:'排序',
				type3:'筛选',
				tagParentId:0,
				tagId:null,
				shipFilter:null,
				queryType:1,
				sortIndex:0,
				timeIndex:0,
				start:0,
				refreshData:false
			});
			this.init().then((res)=>{
				if (res.data.code === 0) {
					let value = res.data.value;
					if (value) {
						app.globalData.agentId = value.id;
						if (value.phone) {
							app.globalData.agentPhone = value.phone;
						} else {
							app.globalData.agentPhone = null;
						}
						app.globalData.sign=value.sign;
					} else {
						app.globalData.agentPhone = null;
						app.globalData.agentId = null;
					}
					this.getDataList(false,true);//getinitDataList
					this.initClass();
        			this.initBanner();
        			this.findTagCategory();
        			this.getPlatformRedBag();	
				} else {
					this.setData({
						isAgentId:true
					});
				}
	        }).catch(err=>{
	        	this.setData({
					isAgentId:true
				});
	        });
		}
	},
	// 跳转地址页
	redirectToAddress(e){
		wx.navigateTo({
			url:"/pages/address/address/address?switch=index&region=" + this.data.region
		});
	},
	// onPageScroll(e){ //监听商家筛选的高度
	// 	if (parseInt(e.scrollTop) > 399 && this.data.isPaiXunTop === false) {
	// 		this.setData({
	// 			isPaiXunTop:true
	// 		});
	// 	}
	// 	if(parseInt(e.scrollTop) < 399 && this.data.isPaiXunTop === true) {
	// 		this.setData({
	// 			isPaiXunTop:false
	// 		});
	// 	}
 //  	},
	// 领取平台红包
	getPlatformRedBag(){
		wxRequest({
        	url:'/merchant/userClient?m=getPlatformRedBag',
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		params:{
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude
        		}	
        	},
        }).then(res=>{
			if (res.data.code === 0) {
				if (res.data.value.status == 1) { // 该代理商有平台红包
					let loginMessage = wx.getStorageSync('loginMessage');
					let loginStatus = wx.getStorageSync('loginstatus',true);
					if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
						let platformRedList = res.data.value.redBagList;
						if (platformRedList.length != 0) {
							this.maskShowAnimation();
							this.platfromRedShowAnimation();
							this.setData({
								platformRedList: platformRedList,
								maskShow:true
							});
						}
					} else {
						this.maskShowAnimation();
						this.platformRegisterShowAnimation();
						this.setData({
							isRegisterGetRedBag:true,
							maskShow:true
						});
					}
				}
			}
        });
	},
	registerGetRedBag(){
		let that = this;
		wx.navigateTo({
			url:'/pages/login/login?switch=homepage',
			success:function(){
				that.setData({
					isRegisterGetRedBag: false,
					maskShow: false
				})	
			}
		});
	},
	bannerMerchant(e){
		let { item } = e.currentTarget.dataset;
		if (item.bannerType == 3) {
			let merchantId = item.merchantId;
			wx.navigateTo({
				url:"/goods/shop/shop?merchantid=" + merchantId,
			});
		}
		if (item.bannerType == 2) {
			let tagCategoryId = item.firstCategoryId;
			let secondCategoryId = item.secondCategoryId;
			wx.navigateTo({
				url:"/pages/classPage/classPage?id=" + tagCategoryId+"&secondid="+secondCategoryId
			});
		}
	},
	//根据地理位置初始化首页轮播图
	initBanner(){
		wxRequest({
        	url:'/merchant/userClient?m=findTBanner&uuid=' + parseInt(Math.random()*1000000000000000),
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		uuid:parseInt(Math.random()*1000000000000000),
        		params:{
        			agentId:app.globalData.agentId,
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude
        		}	
        	},
        }).then(res=>{
			if (res.data.code === 0) {
				let imgUrls = res.data.value;
				imgUrls.map((item)=>{
					if(!item.picUrl || !/.*(\.png|\.jpg)$/i.test(item.picUrl)){
						item.picUrl = '/images/merchant/advertisement.png'
					} else {
						item.picUrl = item.picUrl +'?imageView2/0/w/710/h/240';
					}
				});
				if (imgUrls.length) {
					if (imgUrls.length == 1) {
						this.setData({
		      				swiper:Object.assign({},this.data.swiper,{imgUrls:imgUrls,autoplay:false,indicatorDots:false}),
		      				isSwipper:true
		    			});
					} else {
						this.setData({
		      				swiper:Object.assign({},this.data.swiper,{imgUrls:imgUrls,autoplay:true,indicatorDots:true}),
		      				isSwipper:false
		    			});
					}
				}	
			}
        });
	},
	//根据地理位置初始化首页商家数据
	init(){
		return wxRequest({
        	url:'/merchant/userClient?m=findAgentByUserXY',
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		params:{
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude
        		}	
        	},
        });
	},
	//根据地理位置初始化首页分类数据
	initClass(){
		wxRequest({
        	url:'/merchant/userClient?m=findPrimaryCategoryList',
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		client: app.globalData.client,
        		clientVersion:app.globalData.clientVersion,
        		params:{
        			agentId:app.globalData.agentId,
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude,
        			tagCategoryType: 1,
        			versionCode:46
        		}	
        	},
        }).then(res=> {
        	if (res.data.code ===0) {
				let initClassList = res.data.value;
				let classArr = []
				for (var i = 0; i < initClassList.length; i++) {
					if (i === 8) break
					if (initClassList[i].graySwitch === 0 && !initClassList[i].picUrl || initClassList[i].picUrl && !/.*(\.png|\.jpg)$/i.test(initClassList[i].picUrl)) {
						initClassList[i].picUrl = '/images/merchant/classification_eva@2x.png'
					} else {
						initClassList[i].picUrl = initClassList[i].picUrl +'?imageView2/0/w/86/h/86';
					}
					if (initClassList[i].graySwitch === 1 && !initClassList[i].grayUrl || initClassList[i].picUrl && !/.*(\.png|\.jpg)$/i.test(initClassList[i].grayUrl)) {
						initClassList[i].grayUrl = '/images/merchant/classification_eva@2x.png'
					} else {
						initClassList[i].grayUrl = initClassList[i].grayUrl +'?imageView2/0/w/86/h/86';
					}
					classArr.push(initClassList[i])
				}
				this.setData({
					initClassList:classArr
				});	
        	}
        });
	},
	imageLoad(e){
		this.data.swiper.imageShow = true;
		this.setData({
  			swiper:this.data.swiper
		});
	},
	//根据地理位置初始化分类选项数据
	findTagCategory(){
		wxRequest({
        	url:'/merchant/userClient?m=findTagCategory',
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		params:{
        			agentId:app.globalData.agentId,
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude,
        			tagCategoryType: 1,
        			versionCode:46
        		}	
        	},
        }).then(res=> {
        	console.log(res);
        	if (res.data.code ===0) {
        		let classList = res.data.value;
        		this.setData({
					classList:classList
        		});
        	}
        });
	},
	getDataList(status,Boos){
		//status:判断需不需要加载中小图标,false为需要
		//Boos:判断需不需要重置，true为需要重置
		if (!status) {
			wx.showLoading({
		        title: '加载中',
		        icon: 'loading',
		        duration: 200000,
		        mask: true
			});	
		}
		if(Boos){
			this.data.dataListIndex=0;//重置
			this.setData({//重置数组,这边setData是为了不显示这个，而显示骨架屏
				dataList1:[],
				dataList2:[],
				dataList3:[],
				dataList4:[],
				dataList5:[],
				dataList6:[],
				dataList7:[],
				dataList8:[],
				dataList9:[],
				dataList10:[],
				loading:false,
				isAgentId:false //重置时，置为false。再根据返回状态来改变
			})
		}
		let dataListIndex=this.data.dataListIndex;
		this.data.start=dataListIndex*dataListSize+this.data['dataList'+(dataListIndex+1)].length;
		let data = {
			agentId:app.globalData.agentId,
        	longitude:app.globalData.longitude,
        	latitude:app.globalData.latitude,
        	queryType:this.data.queryType,
        	merchantTags:this.data.merchantTagsList.join(' '),
        	// shipFilter:this.data.shipFilter,
			tagId:this.data.tagId,
        	tagParentId:this.data.tagParentId,
        	size:10,
			start:this.data.start,
			sign:app.globalData.sign
		};
		//加载数据前，展示骨架屏
		this.setData({
			skeletonScreen:true
		});
		wxRequest({
        	url:'/merchant/userClient?m=findTakeAwayMerchant4&uuid=' + parseInt(Math.random()*1000000000000000),
        	method:'POST',
        	data:{
        		uuid:parseInt(Math.random()*1000000000000000),
        		params:data
        	}	
        }).then(res=>{
			//mapList在merchant.js中定义的，用于对原数据进行精简，返回精简数组
			let list=this.mapList(res.data.value);
		    //放到固定的几个数组中
		   	let  dataListIndex=this.data.dataListIndex;
			if(this.data['dataList'+(dataListIndex+1)].length>=dataListSize){//如果该数组的已经放了这么多，则放到下一组
				dataListIndex+=1;
				if(dataListIndex>9){//剩余数据，直接放到最后一组
					dataListIndex=9;
				}
				this.data.dataListIndex=dataListIndex;
			}
			if(res.data.code === 0) {//返回状态成功
				//loading:如果还有数据可以加载，则置为false:会显示列表加载loaging
				//列表加载loading和数据加载小图标是不一样的哦
				if(list.length==0){//如果没有数据返回
					setTimeout(()=>{//加载loading，多转一下=>加载痕迹更明显
						this.setData({
							loading:true,
							skeletonScreen:false//关闭骨架屏
						});
					},1500);
					//没有返回值时，有可能没有代理商，则不显示内容
					if (Boos && app.globalData.agentId === null) {
						this.setData({
							isAgentId:true,
							skeletonScreen:false
						});
					} 
				}else{//有数据返回
					list = this.seatImg(list);
					this.setData({
						['dataList'+(dataListIndex+1)]:this.data['dataList'+(dataListIndex+1)].concat(list),				
						loading:false,
						skeletonScreen:false
					});
					if(list.length<10){//最后几项数据
						setTimeout(()=>{//加载loading，多转一下=>加载痕迹更明显
							this.setData({
								loading:true
							});
						},1500);
					}
				}
			}else{//返回状态出错			
				this.setData({
					isAgentId:true	
				});
			}
        }).catch(err=>{
				this.setData({
					isAgentId:false
				});
        }).finally(()=>{
			wx.stopPullDownRefresh();
			wx.hideLoading();
        });
	},
	focusToSearch(e){
		if (!this.data.toSearch) {
			this.data.toSearch = true;
			wx.navigateTo({
				url:"/pages/searchGoods/searchGoods"
			});
			setTimeout(()=>{
				this.data.toSearch = false;
			}, 1000);
		}	
	},
	//触拉到底刷新
	onReachBottom(){
		if(!this.data.skeletonScreen){//true:表示还在显示骨架屏，说明还没有返回数据，则数据返回前不重新加载数据
			this.getDataList(true,false);
		}
	},
	//微信额头下拉刷新
    onPullDownRefresh() {
    	if (this.data.maskShow) {
    		wx.stopPullDownRefresh();
    		return false;
    	}
    	this.data.start = 0;
    	this.initBanner();
      	this.initClass();
      	this.findTagCategory();
      	this.getDataList(false,true);
    },
	onHide() {
		if (this.data.isRegisterGetRedBag) {
			this.setData({
				isRegisterGetRedBag: false,
				maskShow: false
			})
		}
	},
	onShareAppMessage(res) {		
    	return {
      		title: '马管家',
      		path: "/pages/index/index",
      		success: function(res) {
        		// 转发成功
     		},
      		fail: function(res) {
        		// 转发失败
      		}
    	};
  	},
  	platformRegisterShowAnimation(){
  		let redBagLeft = (app.globalData.windowWidth-290)/2;
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).scale(1,1).left(redBagLeft+'px').step();
	      	this.setData({
	        	platformNoRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).scale(0,0).step();//修改透明度,放大  
		this.setData({  
		   platformNoRedAnimation: animation.export()  
		}); 
	},
	platformRegisterHideAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).scale(0,0).translateX(-50+'%').step();
	      	this.setData({
	        	platformNoRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).scale(1,1).translateX(-50+'%').step();//修改透明度,放大  
		this.setData({  
		   platformNoRedAnimation: animation.export()  
		}); 
	},
}));
