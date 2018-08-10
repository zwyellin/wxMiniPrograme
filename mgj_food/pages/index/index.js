//index.js

//获取应用实例
const app = getApp();
const { Promise, wxRequest, getBMapLocation, wxGetLocation, qqMap, gcj02tobd09} = require('../../utils/util.js');
const { initClassList, imgUrls } = require('../../components/homeClass.js');
const { merchantObj } = require('../../components/merchant/merchant.js');
console.log(merchantObj);
let interval;
Page(Object.assign({}, merchantObj, {
  	data: {
  		islocal:false,       //是否计算本地缓存
  		moveDown:false,
  		toSearch:false,
  		loading:false,
  		isAgentId:false,
  		clickPage:false,
  		cartObject:null,
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
		maskAnimation:null,   //遮罩层动画
		start:0,
		dataList:[],      //商家列表
		initClassList:initClassList	  //分类列表
	}, 
	onLoad(){
		wxGetLocation({type:'gcj02'}).then(()=>{
			this.getSeting().then(()=>{
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
					// app.globalData.longitude = longitude;
					// app.globalData.latitude = latitude;
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
							} else {
								app.globalData.agentPhone = null;
								app.globalData.agentId = null;
							}
							this.initBanner();
							this.initClass();
							this.getDataList(false,false);
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
							console.log(res)
							address = res.result.address;
							// address =res.result.address_component.street_number
							console.log(address);
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
		}).catch(err=>{
			this.setData({
				isAgentId:true
			});
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
				app.globalData.longitude = longitude;
				app.globalData.latitude = latitude;
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
						} else {
							app.globalData.agentPhone = null;
							app.globalData.agentId = null;
						}
						this.initBanner();
						this.initClass();
						this.getDataList(false,false);
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
						console.log(res)
						address = res.result.address;
						// address =res.result.address_component.street_number
						console.log(address);
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
			        console.log(res);
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
		if (wx.getStorageSync('shoppingCart')) {
			let shoppingCart = wx.getStorageSync('shoppingCart');
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
					if (value) {
						app.globalData.agentId = value.id;
						if (value.phone) {
							app.globalData.agentPhone = value.phone;
						} else {
							app.globalData.agentPhone = null
						}
					} else {
						app.globalData.agentPhone = null
						app.globalData.agentId = null;
					}
					this.getDataList(false,false);//getinitDataList
					this.initClass();
        			this.initBanner();
        			this.findTagCategory();	
				} else {
					this.setData({
						isAgentId:true
					});
				}
				// this.runAddress(this.data.city);	
	        }).catch(err=>{
	        	this.setData({
					isAgentId:true
				});
				// this.runAddress(this.data.city);
	        });
		}
	},
	
	// runAddress(cityObject){
	// 	let { cityName } = cityObject;
	// 	let length = cityName.length * (this.data.addressSize/2);    //文字长度
	// 	console.log(this.data.city.cityName);
	//     let windowWidth = 79;// 屏幕宽度
	//     this.setData({
	//       length: length,
	//       windowWidth: windowWidth,
	//       marquee2_margin: length < windowWidth ? windowWidth - length : this.data.marquee2_margin //当文字长度小于屏幕长度时，需要增加补白
	//     });
	//     this.run();      // 第一个字消失后立即从右边出现
	// },
	// run() {
	// 	clearInterval(interval);
	//     interval = setInterval(()=>{
	//       if (-this.data.marqueeDistance2 < this.data.length) {
	//         // 如果文字滚动到出现marquee2_margin=30px的白边，就接着显示
	//         this.setData({
	//           marqueeDistance2: this.data.marqueeDistance2 - this.data.marqueePace,    //滚动距离
	//           marquee2copy_status: this.data.length + this.data.marqueeDistance2 <= this.data.windowWidth + this.data.marquee2_margin,
	//         });
	//       } else {
	//         if (-this.data.marqueeDistance2 >= this.data.marquee2_margin) { // 当第二条文字滚动到最左边时
	//           this.setData({
	//             marqueeDistance2: this.data.marquee2_margin // 直接重新滚动
	//           });
	//           clearInterval(interval);
	//           this.run();
	//         } else {
	//           clearInterval(interval);
	//           this.setData({
	//             marqueeDistance2: -this.data.windowWidth
	//           });
	//           this.run();
	//         }
	//       }
	//     }, this.data.interval);
	// },
	bannerMerchant(e){
		let { item } = e.currentTarget.dataset;
		if (item.merchantId) {
			let merchantId = item.merchantId;
			wx.navigateTo({
				url:"/pages/shop/shop?merchantid=" + merchantId,
			});
		}
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
				imgUrls.map((item)=>{
					item.picUrl = item.picUrl +'?imageView2/0/w/710/h/240';
				});
				if (imgUrls.length) {
					if (imgUrls.length === 1) {
						this.setData({
		      				swiper:Object.assign({},this.data.swiper,{imgUrls:imgUrls,autoplay:false,indicatorDots:false})
		    			});
					} else {
						this.setData({
		      				swiper:Object.assign({},this.data.swiper,{imgUrls:imgUrls,autoplay:true,indicatorDots:true})
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
					}
					if (initClassList[i].graySwitch === 1 && !initClassList[i].grayUrl || initClassList[i].picUrl && !/.*(\.png|\.jpg)$/i.test(initClassList[i].grayUrl)) {
						initClassList[i].grayUrl = '/images/merchant/classification_eva@2x.png'
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
		console.log('你好')
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
        	url:'/merchant/userClient?m=findTakeAwayMerchant4&uuid=' + parseInt(Math.random()*1000000000000000),
        	method:'POST',
        	data:{
        		uuid:parseInt(Math.random()*1000000000000000),
        		params:data
        	}	
        }).then(res=>{
			let dataList =this.data.dataList;
			let list = res.data.value;		
			if (res.data.code === 0) {
				if(Boos){
					if (status) {  
						if (res.data.value.length != 0) {
							list = this.seatImg(list);
							dataList = dataList.concat(list);
							this.setData({
								dataList:dataList,
								loading:false
							});	
						} else {
							this.setData({
								loading:true,
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
							list = this.seatImg(list);
							dataList = dataList.concat(list);
							this.setData({
								dataList:list,
								loading:false
							});
						}	
					}	
				} else {
					if (list.length === 0) {
						if (app.globalData.agentId === null) {
							this.setData({
								isAgentId:true
							});
						} else {
							setTimeout(()=>{
								this.setData({
									loading:true
								});
							},1500);
							this.setData({
								dataList:list
							});
						}	
					} else {
						list = this.seatImg(list);
						this.setData({
							isAgentId:false,
							dataList:list,
							loading:false
						});	
					}	
				}	
			}else {
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
	onReachBottom(){
		if (!this.data.islocal) {
			this.data.start+= 10;
			this.getDataList(true,true);	
		} else {
			this.data.islocal = false;
		}
	},
	//下拉刷新
    onPullDownRefresh() {
    	if (this.data.maskShow) {
    		wx.stopPullDownRefresh()
    		return false
    	}
    	this.data.start = 0
      	this.initClass();
      	this.findTagCategory();
      	this.getDataList(false,true);
    },
	// onHide() {
	// 	clearInterval(interval);
	// 	this.setData({
	// 		marqueeDistance2: 0,
	//     	marquee2copy_status: false
	// 	});
	// },
	onShareAppMessage(res) {
    	return {
      		title: '马管家外卖',
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

