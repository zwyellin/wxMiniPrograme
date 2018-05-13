//index.js

//获取应用实例
const app = getApp();
const { wxRequest, getBMapLocation, wxGetLocation, qqMap, gcj02tobd09} = require('../../utils/util.js');
// const obj = require('../../components/common/common.js');
let interval;
Page(Object.assign({}, {
  	data: {
  		loading:false,
  		isAgentId:false,
  		isClassListSwiper:false,
  		cartObject:null,
	    swiper: {
	      imgUrls: [],
	      indicatorDots: true,
	      autoplay: true,
	      interval: 3000,
	      duration: 1000
	    },
	    refreshData:false,
	    lng:116.304881,
	    lat:39.965528,
	    size:24,
		city:{
			cityName:'',
		},
		marqueePace: 1,             //滚动速度       
	    marqueeDistance2: 0,        //初始滚动距离
	    marquee2copy_status: false,
	    marquee2_margin: 20,
	    first_left:0,
	    addressSize: 22,
	    orientation: 'left',     //滚动方向
	    interval: 50,           // 时间间隔
		type1:'分类',
		type2:'排序',
		type3:'筛选',
		cartcontrol:'68rpx',
		cartcontrolStyle:{
			height:'68rpx',
			overflow:'hidden'
		},
		classList:[],
		childTagCategoryList:[],
		classShow:false,
		shipShow:false,
		timeIndex:0,
		queryType:0,  //排序类型
		sortList:["智能排序","距离最近","销量最高","起送价最低","配送速度最快","评分最高"],
		sortIndex:0,
		tagParentId:0,
		tagId:null,
		shipFilter:null,
		sortShow:false,
		maskShow:false,
		islocking:false,      //锁定滚动条
		maskAnimation:null,   //遮罩层动画
		start:0,
		dataList:[],      //商家列表
		initClassList:[]	  //分类列表
	}, 
	onLoad(){
		wxGetLocation({
			type:'gcj02'
		}).then(res=>{
			console.log(res);
			let lat = res.latitude;
			let lng = res.longitude;
			this.data.obj = {
				location:{
					longitude:lng,
					latitude:lat
				}
			}; 
			let { longitude, latitude } = gcj02tobd09(lng,lat);
			// app.globalData.longitude = latitude;
			// app.globalData.latitude = longitude;
			this.init().then((res)=>{
				if (res.data.code === 0) {
					let value = res.data.value;
					let isAgentId = value.id;
					let agentPhone = value.phone;
					app.globalData.agentId = isAgentId;
					app.globalData.agentPhone = agentPhone
					this.getinitDataList();
					this.initClass();
        			this.initBanner();
        			this.findTagCategory();	
				}	
	        }).catch(err=>{
	        	this.setData({
					isAgentId:true
				});
	        });
	        getBMapLocation(this.data.obj).then(res=>{
				console.log(res);
				let address;
				if (res.status === 0) {
					address = res.result.address;
					console.log(address);
					this.setData({
		      			city:Object.assign({},this.data.city,{cityName:address})
		    		});
		    		this.runAddress(this.data.city);
		    		this.data.isRun = false;
				}
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
	onShow(){
		if (wx.getStorageSync('shoppingCart')) {
			let shoppingCart = wx.getStorageSync('shoppingCart');
			console.log(shoppingCart);
			this.setData({
				cartObject:shoppingCart
			});	
  		}
		if (this.data.refreshData) {
			this.setData({
				type1:'分类',
				type2:'排序',
				type3:'筛选',
				tagParentId:0,
				tagId:null,
				shipFilter:null,
				queryType:0,
				sortIndex:0,
				timeIndex:0,
				start:0,
				refreshData:false
			});
			this.init().then((res)=>{
				if (res.data.code === 0) {
					let value = res.data.value;
					let isAgentId = value.id;
					let agentPhone = value.phone;
					app.globalData.agentId = isAgentId;
					app.globalData.agentPhone = agentPhone;
					this.getinitDataList();
					this.initClass();
        			this.initBanner();
        			this.findTagCategory();	
				} else {
					this.setData({
						isAgentId:true
					});
				}
				this.runAddress(this.data.city);	
	        }).catch(err=>{
	        	this.setData({
					isAgentId:true
				});
				this.runAddress(this.data.city);
	        });
		} else {
			if (interval) {
				this.runAddress(this.data.city);
			}
		}
	},
	moveDown(e){
		let { item, index } = e.currentTarget.dataset;
		let dataList = this.data.dataList; 
		if (dataList[index].height === '68rpx') {
			dataList[index].height = 34*item.promotionActivityList.length+'rpx';
			this.setData({
				dataList:dataList
			});
		} else {
			dataList[index].height = '68rpx';
			this.setData({
				dataList:dataList
			});
		}	
	},
	runAddress(cityObject){
		let { cityName } = cityObject;
		let length = cityName.length * (this.data.addressSize/2);    //文字长度
		console.log(this.data.city.cityName);
	    let windowWidth = 79;// 屏幕宽度
	    this.setData({
	      length: length,
	      windowWidth: windowWidth,
	      marquee2_margin: length < windowWidth ? windowWidth - length : this.data.marquee2_margin //当文字长度小于屏幕长度时，需要增加补白
	    });
	    this.run();      // 第一个字消失后立即从右边出现
	},
	run() {
		clearInterval(interval);
	    interval = setInterval(()=>{
	      if (-this.data.marqueeDistance2 < this.data.length) {
	        // 如果文字滚动到出现marquee2_margin=30px的白边，就接着显示
	        this.setData({
	          marqueeDistance2: this.data.marqueeDistance2 - this.data.marqueePace,    //滚动距离
	          marquee2copy_status: this.data.length + this.data.marqueeDistance2 <= this.data.windowWidth + this.data.marquee2_margin,
	        });
	      } else {
	        if (-this.data.marqueeDistance2 >= this.data.marquee2_margin) { // 当第二条文字滚动到最左边时
	          this.setData({
	            marqueeDistance2: this.data.marquee2_margin // 直接重新滚动
	            // first_left:this.data.length
	          });
	          clearInterval(interval);
	          this.run();
	        } else {
	          clearInterval(interval);
	          this.setData({
	            marqueeDistance2: -this.data.windowWidth
	          });
	          this.run();
	        }
	      }
	    }, this.data.interval);
	},
	bannerMerchant(e){
		let { item } = e.currentTarget.dataset;
		if (item.merchantId) {
			let merchantId = item.merchantId;
			wx.navigateTo({
				url:"/pages/shop/shop?merchantid=" + merchantId,
			});
		}
	},
	quickPage(e){
		let { id } = e.currentTarget.dataset;
		wx.navigateTo({
			url:"/pages/shop/shop?merchantid=" + id,
		});
	},
	//根据地理位置初始化首页轮播图
	initBanner(){
		wxRequest({
        	url:'/merchant/userClient?m=findTBanner',
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		params:{
        			agentId:app.globalData.agentId,
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude
        		}	
        	},
        }).then(res=>{
			if (res.data.code === 0) {
				let imgUrls = res.data.value;
				this.setData({
	      			swiper:Object.assign({},this.data.swiper,{imgUrls:imgUrls})
	    		});
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
        		params:{
        			agentId:app.globalData.agentId,
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude,
        			tagCategoryType: 1,
        			versionCode:46
        		}	
        	},
        }).then(res=> {
        	console.log(res)
        	if (res.data.code ===0) {
				let initClassList = res.data.value;
				let classArr = []
				for (var i = 0; i < initClassList.length; i++) {
					if (i === 8) break
					classArr.push(initClassList[i])
				}
				this.setData({
					initClassList:classArr
				})	
        	}
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
	getDataList(status){
		if (!status) {
			wx.showToast({
		        title: '加载中',
		        icon: 'loading',
		        duration: 200000,
		        mask: true
		    });
		}
		let data = {
			agentId:app.globalData.agentId,
        	longitude:app.globalData.longitude,
        	latitude:app.globalData.latitude,
        	queryType:this.data.queryType,
        	shipFilter:this.data.shipFilter,
			tagId:this.data.tagId,
        	tagParentId:this.data.tagParentId,
        	size:10,
        	start:this.data.start
		};
		wxRequest({
        	url:'/merchant/userClient?m=findTakeAwayMerchant',
        	method:'POST',
        	data:{
        		params:data
        	}	
        }).then(res=>{
			let dataList =this.data.dataList;
			let list = res.data.value;
			if (res.data.code === 0) {
				if (status) {
					if (res.data.value.length != 0) {
						list.map((item)=>{
							item.height = '68rpx';
							dataList.push(item);
						});
		        		console.log(res.data.value);
		        		this.setData({
		        			dataList:dataList,
							loading:false
		        		});	
					} else {
						this.setData({
							loading:true
						});
					}
				} else {
					if (list.length === 0) {
						setTimeout(()=>{
							this.setData({
        						loading:true
        					});
						},1500);
						this.setData({
    						dataList:list
    					});
					} else {
						list.map((item)=>{
							item.height = '68rpx';
							dataList.push(item);
						});
						this.setData({
        					dataList:list,
        					loading:false
        				});
					}	
				}	
			} 
        }).finally(()=>{
        	wx.hideLoading();
        });
	},
	getinitDataList(){
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		let data = {
			agentId:app.globalData.agentId,
        	longitude:app.globalData.longitude,
        	latitude:app.globalData.latitude,
        	queryType:this.data.queryType,
        	shipFilter:this.data.shipFilter,
			tagId:this.data.tagId,
        	tagParentId:this.data.tagParentId,
        	size:10,
        	start:this.data.start
		};
		wxRequest({
        	url:'/merchant/userClient?m=findTakeAwayMerchant',
        	method:'POST',
        	data:{
        		params:data
        	}	
        }).then(res=>{
			let dataList =this.data.dataList;
			let list = res.data.value;
			if (res.data.code === 0) {
				if (list.length === 0) {
					this.setData({
						isAgentId:true
					});
				} else {
					list.map((item)=>{
						item.height = '68rpx';
					});
					this.setData({
						isAgentId:false,
    					dataList:list,
    					loading:false
    				});
				}	
			} else {
				this.setData({
					isAgentId:true
				});
			}
			wx.hideLoading();	
        }).catch(err=>{
        	this.setData({
				isAgentId:true
			});
        	wx.hideLoading();
        });
	},
	focusToSearch(e){
		wx.navigateTo({
			url:"/pages/searchGoods/searchGoods"
		});
	},
	onReachBottom(){
		this.data.start+= 10;
		this.getDataList(true);		
	},
	setBfilterType(e){
		let { index } = e.currentTarget.dataset;
		if (!this.data.maskShow) {
			this.maskShowAnimation();
		}
		if (index == 0) {
			this.setData({
				classShow:true,
				maskShow:true,
				sortShow:false,
				shipShow:false
			});
		}
		if (index == 1) {
			this.setData({
				sortShow:true,
				maskShow:true,
				classShow:false,
				shipShow:false
			});
		}
		if (index == 2) {
			this.setData({
				shipShow:true,
				sortShow:false,
				maskShow:true,
				classShow:false
			});
		}	
	},
	//选择排序
	selectSort(e){
		this.maskHideAnimation();
		let { index } = e.currentTarget.dataset;
		let value = this.data.sortList[index];
		this.setData({
			queryType:index+1,
			start:0,
			sortShow:false,
			sortIndex:index,
			type2:value,
			loading:false
		});
		this.getDataList();
	},
	//选择分类
	selectClass(e){
		let { index, item} = e.currentTarget.dataset;
		let childTagCategoryList = item.childTagCategoryList;
		let value = item.name;
		if (index === 0) {
			this.maskHideAnimation()
			this.setData({
				childTagCategoryList:childTagCategoryList,
				timeIndex:index,
				tagParentId:item.parentId,
				tagId:null,
				classShow:false,
				start:0,
				type1:value,
				loading:false	
			});
			this.getDataList();
		} else {
			this.setData({
				childTagCategoryList:childTagCategoryList,
				tagParentId:item.id,
				start:0,
				timeIndex:index,
			});
		}
	},
	//选择第二轮分类
	selectText(e){
		let { item, index } = e.currentTarget.dataset;
		let value = item.name;
		if (index === 0) {
			this.maskHideAnimation()
			this.setData({
				tagParentId:item.parentId,
				tagId:null,
				classShow:false,
				type1:value,
				loading:false
			});
			this.getDataList();
		} else {
			this.maskHideAnimation()
			this.setData({
				tagParentId:item.parentId,
				tagId:item.id,
				classShow:false,
				type1:value,
				loading:false
			});
			this.getDataList();
		}	
	},
	//商家配送方式
	selectShip(e){
		let { index } = e.currentTarget.dataset;
		this.setData({
			shipFilter:index
		})
	},
	clear(){
		this.maskHideAnimation()
		this.setData({
			shipFilter:null,
			shipShow:false
		})
	},
	query(){
		this.maskHideAnimation()
		this.setData({
			shipShow:false,
			loading:false
		})
		this.getDataList();
	},
	close(){
		this.maskHideAnimation()
		this.setData({
			classShow:false,
			sortShow:false,
			shipShow:false,
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
	        	islocking:true,
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
	      			maskShow:false,
	      		});
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
	onHide() {
		clearInterval(interval);
		this.setData({
			marqueeDistance2: 0,
	    	marquee2copy_status: false
		});
	},
	onShareAppMessage(res) {
    	return {
      		title: '马管家',
      		desc: '自定义分享描述',
      		path: "/pages/index/index",
      		success: function(res) {
        		// 转发成功
     		},
      		fail: function(res) {
        		// 转发失败
      		}
    	};
  	}
}));

