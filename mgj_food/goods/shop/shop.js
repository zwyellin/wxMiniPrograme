const { wxRequest } = require('../../utils/util.js');
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { merchantShop } = require('../template/shop/merchantShop.js');
const app = getApp();
let ActivityListHeight = 149;
Page(Object.assign({}, merchantShop,{
	data:{
		merchantType:null,    //商家类型
		categoryId:null,
		goodsMoreLoading:false, //加载更多
		scrollTop:0,          //设置滚动条位置
		itemCategoryList:[],  //某分类下的商品
		loading:false,
		isHide:false,         //控制本地购物车缓存
		getOrderStatus:false,
		show:true,
		maskShow:false,       // 遮罩层
		maskAnimation:null,
		choiceAnimation:null,
		orderRedAnimation:null,   //红包动画
		pickertagAnimation:null,
		tab: {
	      tabList: ["商品","评价","商家"],
	      cur: "商品",
	      name: "tab",
	      afterChange: "afterTabChange"
	    },
	    evaluateSize:5,        //评价加载数量
		evaluateStart:0,      //评价开始位置
		evaluateType:0,        //0所有，1好评，2差评，3有图
		isEvaluate:false,
		isHaveContent:1,//0表示所有，1表示要有内容的
	    tabIndex:0,
		merchantId:null,
		merchantComIsFilterEmpty:false,
	    selectParentIndex:0,
	    selectIndex:0,
	    choice:false,
	    size:24,            //星星大小
	    detailShow:false,
	    fold:false,
	    windowScrollHeight: null,//产品scroll的高度
    	leftToView: null,//左侧菜单scroll定位
    	rightToView: null,//右侧产品scroll定位
    	leftScrollClick: false,//左侧产品点击状态 用来做全局锁定，当点击左侧菜单出发右侧scroll-into-view,禁止右侧scroll事件重复处理造成的异常
    	currentCateno: 'A1',//当前所在菜单
    	catesScrollHeight: [],
    	totalprice:0,    //购买商品总价
    	totalcount:0, //购买商品总个数
    	selectFoods:[],  //添加进购物车里的商品
    	selectedFood:{}, //某一商品详情
	    menu:[],          //商家商品列表
	    redBagList:[],    //商家红包列表
	    price:'',
	    minPrice:0,       //商家起送价
	    dasteIndex:0,
	    specIndex:0,
	    merchantRedBagList:[],
	    orderList:[],
	    itemList:{},     //商家信息
	    item:{},
	    shipScore:0,
		evaluate:{},
		selestEvaluateStatus:0,
		evaluateList:[],
		value:{},       //确认订单后台返回信息
		pickertag:false,
		selects:false,
		ruleDtoList:[],
		fullPrice:{},
		isTogether:false,           //控制去凑单按钮的显示与隐藏
		isShowTogether:false,      //控制去凑单列表的显示与隐藏
		listFoods:[],
		everyOrderBuyCount:0,      //每单限购折扣商品数量
		activitySharedStatus:null,  //折扣商品与满减活动共享关系
		activitySharedShow:false,  //折扣商品与满减活动共享关系显示与隐藏控制
		isTipOne:false,            //折扣商品与满减活动不共享关系提示一次
		maskimgShow:false,          //商家资质图片弹出放大
		merchantAptitudeImg:'',
		touch: {
            distance: 0,
            scale: 1,
            baseWidth: 680,
            baseHeight: 1126,
            scaleWidth: 680,
            scaleHeight: 1126
		},
		windowWidth:750
	},
	onLoad(options) {
		//设置windowWidth
		let windowWidth=app.globalData.windowWidth*2
	    this.setData({
			windowWidth:windowWidth
		})
		let { merchantid,longitude,latitude} = options;
		this.data.merchantId = merchantid;
		// this.data.merchantId = 221;
		if (longitude && latitude) {
			app.globalData.longitude = longitude;
        	app.globalData.latitude = latitude;
		}
		// this.data.merchantId = 402;
		this.findMerchantInfo();
		this.getShopList().then((res)=>{
			let menu = res.data.value.menu;
			let type = res.data.value.type;
			// menu.map((leftItem,index) =>{
			// 	if (index != 0 ) {
			// 		leftItem.goodsList.map(leftItemShop =>{
			// 			leftItemShop.isImgLoadComplete = false;
			// 		});
			// 	} else {
			// 		leftItem.goodsList.map(leftItemShop =>{
			// 			leftItemShop.isImgLoadComplete = true;
			// 		});
			// 	}	
			// });
			if (type == 0) {
				this.setData({
	        		menu:menu,
	        		orderList:res.data.value.orderList,
	        		merchantType:type
	        	});
	        	setRightScrollItemHeight: {
			      let cate_size = [];
			      let sumscrollheight = 0;//总高度
			      let catebarheight = 26;//单个分类bar的高度
			      let goodsviewheight = 100;//单个产品view的高度
			      this.data.menu.forEach((item,index)=> {
			      	if (item.goodsList != null) {
			      		let unitheight = catebarheight + item.goodsList.length * goodsviewheight;//每个分类单元的高度=分类bar的高度+每个产品view的高度*该分类下的产品数
			        	cate_size.push({ cateno: "A"+(index+1), scrollheight: sumscrollheight });
			        	sumscrollheight += unitheight;
			      	}
			      });
			      this.setData({
			        catesScrollHeight: cate_size.reverse()//分类scroll数组倒序处理后写入data
			      });
			      this.removalMenuList();
			    }
			}
        	if (type == 1) {
        		let itemCategoryList = menu[0].goodsList;
        		let categoryId = menu[0].id;
        		let relationCategoryId = menu[0].relationCategoryId
        		itemCategoryList.map(item=>{
        			item.parentRelationCategoryId = relationCategoryId
        		})
				this.setData({
	        		menu:menu,
	        		itemCategoryList:itemCategoryList,
	        		categoryId:categoryId,
	        		orderList:res.data.value.orderList,
	        		merchantType:type
	        	});
	        	this.removalMenuList();
        	}
        }).finally(()=>{
        	wx.hideLoading();
        });
        this.getStorageShop(this.data.merchantId);
		this.getevaluate();
		// this.boosLisr();
		//获取系统信息 主要是为了计算产品scroll的高度
	    wx.getSystemInfo({
		    success: res => {
				//根据app.globalData.pixelRatio转化为像素 格式为:px/pixelRatio=px
				let heightPx=280/app.globalData.pixelRatio;
				console.log("heightPx",280*res.windowWidth/750)
		        this.setData({
		          windowScrollHeight: res.windowHeight - 280*res.windowWidth/750
				});
				console.log("onload中，高度为",res.windowHeight,app.globalData.pixelRatio)
		    }
	    });
	    //设置right scroll height 实现右侧产品滚动级联左侧菜单互动   
	},
	onShow(){
		let loginMessage = wx.getStorageSync('loginMessage');
		let loginStatus = wx.getStorageSync('loginstatus',true);
		if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
  			let isloginGetPlatformRedBag = wx.getStorageSync('isloginGetPlatformRedBag');  // 是否通过商家页登录领取过平台红包
			if (isloginGetPlatformRedBag) {
				this.getPlatformRedBag();
				wx.setStorageSync('isloginGetPlatformRedBag',false);
			}
  		}
	},
	//领取平台红包
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
              		if (res.data.value.redBagList != 0) {
            			// feedbackApi.showToast({title:''});
              		}
          		}
        	}
        });
	},
	_imgOnLoad(e){
		let { parentindex, index } = e.currentTarget.dataset; 
		let menu = this.data.menu;
		menu[parentindex].goodsList[index].isImgLoadComplete = true;
		this.setData({
			menu:menu
		});
	},
	//商家资质图片
	scaleImg(e){
		let { img } = e.currentTarget.dataset;
		this.setData({
			merchantAptitudeImg: img,
			maskimgShow:true,
		});
	},
	hideScaleImg(e){
		this.setData({
			maskimgShow:false,
			'touch.distance': 0,
            'touch.scale': 1,
            'touch.baseWidth': 680,
            'touch.baseHeight': 1126,
            'touch.scaleWidth': 680,
            'touch.scaleHeight': 1126,
           	'touch.diff': 0
		});
	},
	touchstartCallback: function(e) {
        // 单手指缩放开始，也不做任何处理 
        if(e.touches.length == 1) return;
        // 一开始我并没有这个回调函数，会出现缩小的时候有瞬间被放大过程的bug // 当两根手指放上去的时候，就将distance 初始化。 
        let xMove = e.touches[1].clientX - e.touches[0].clientX;
        let yMove = e.touches[1].clientY - e.touches[0].clientY;
        let distance = Math.sqrt(xMove * xMove + yMove * yMove);
        this.setData({
           'touch.distance': distance,
        });
    },
	touchmoveCallback(e){
		let touch = this.data.touch;
		// 单手指缩放我们不做任何操作 
		if(e.touches.length == 1) return;
		let xMove = e.touches[1].clientX - e.touches[0].clientX;
        let yMove = e.touches[1].clientY - e.touches[0].clientY;
        // 新的 ditance 
        let distance = Math.sqrt(xMove * xMove + yMove * yMove);
        let distanceDiff = distance - touch.distance;
        let newScale = touch.scale + 0.005 * distanceDiff
        // 为了防止缩放得太大，所以scale需要限制，同理最小值也是 
        if(newScale >= 2) {
            newScale = 2;
        }
        if(newScale <= 1) {
            newScale = 1;
        }
        let scaleWidth = newScale * touch.baseWidth;
        let scaleHeight = newScale * touch.baseHeight;
        this.setData({
           'touch.distance': distance,
           'touch.scale': newScale,
           'touch.scaleWidth': scaleWidth,
           'touch.scaleHeight': scaleHeight,
           'touch.diff': distanceDiff
        });
	},
	//获取购物车缓存数据
	getStorageShop(merchantId){
		if (wx.getStorageSync('shoppingCart')) {
			let shoppingCart = wx.getStorageSync('shoppingCart');
			console.log(12);
			if (shoppingCart[merchantId]) {
				this.setData({
					selectFoods:shoppingCart[merchantId]
				});
			}
  		}
	},
	boosList(){
		this.setData({
			isShowTogether:false
		});
	},
	//商家相同商品id去重
	removalMenuList(){
		let menu = this.data.menu;
		let removalMenuList = [];
		menu.map(item=>{
			if (item.goodsList != null) {
				item.goodsList.map((value,index)=>{
					value.parentRelationCategoryId = item.relationCategoryId
					removalMenuList.push(value);
					if (value.hasDiscount ===1) {
						this.data.everyOrderBuyCount = value.everyOrderBuyCount;
					}	
				});
			}
		});
		let obj = {};
		removalMenuList = removalMenuList.reduce((cur,next)=>{
			obj[next.id] ? "": obj[next.id] = true && cur.push(next);
			return cur;
		},[]);
		this.data.removalMenuList = removalMenuList;
	},
	//去凑单
	boosLisr(){
		if(this.data.isTogether){
			let fullPrice = this.data.fullPrice;       
			let removalMenuList = this.data.removalMenuList;
			let listFoods = [];			
			removalMenuList.forEach(item=>{
				let attributes = "";
				if (item.goodsAttributeList[0] && item.goodsAttributeList[0].name) {
					let attributesList = item.goodsAttributeList[0].name.split('|*|');
					attributes = attributesList[0];
				}
				item.goodsSpecList.forEach((spec)=>{
					if (spec.price > 0 && spec.price <= fullPrice.fullRange*2 && item.hasDiscount!=1) {
						if (attributes) {
							listFoods.push({attributes:attributes, id:item.id, hasDiscount: item.hasDiscount, categoryId: item.categoryId, parentRelationCategoryId: item.parentRelationCategoryId, name: item.name, priceObject: spec});
						} else {
							listFoods.push({id:item.id, hasDiscount: item.hasDiscount, categoryId: item.categoryId, parentRelationCategoryId: item.parentRelationCategoryId, name: item.name, priceObject: spec});
						}
					}	
				});
			});

			if (listFoods.length === 0) {
				removalMenuList.map(item=>{
					let attributes = "";
					if (item.goodsAttributeList[0] && item.goodsAttributeList[0].name) {
						let attributesList = item.goodsAttributeList[0].name.split('|*|');
						attributes = attributesList[0];
					}
					item.goodsSpecList.map((spec)=>{
						if (spec.price > 0 && item.hasDiscount!=1) {
							if (attributes) {
								listFoods.push({attributes:attributes, id:item.id,hasDiscount:item.hasDiscount,categoryId:item.categoryId, parentRelationCategoryId: item.parentRelationCategoryId, name: item.name, priceObject: spec});
							} else {
								listFoods.push({id:item.id,hasDiscount:item.hasDiscount,categoryId:item.categoryId, parentRelationCategoryId: item.parentRelationCategoryId, name: item.name, priceObject: spec});
							}
						}	
					});
				});
			}
			listFoods.sort((a,b)=>{
				return a.priceObject.price-b.priceObject.price;
			});
			this.setData({
				listFoods:listFoods.slice(0,10),
				isShowTogether:!this.data.isShowTogether,
				fold:false
			});
		} else {
			this.setData({
				isShowTogether:false
			});
		}
	},
	//选择商品规格
	choiceTaste(e){
		let { taste, parentindex} = e.currentTarget.dataset;
		
		let selectedFood = this.data.selectedFood;
		let selectFoods = this.data.selectFoods;

		selectedFood.goodsAttributeList[parentindex].select = taste;
		console.log(selectedFood.goodsAttributeList[parentindex])
		this.setData({
			selectedFood:selectedFood,
			
		});	
	},
	isMinOrderNum(){
		let goodsItem;
		let isFoodNum = 0;
		this.data.selectFoods.map((item,index)=>{
			if (item.priceObject.minOrderNum && item.hasDiscount === 0) {
				isFoodNum = 0;
				this.data.selectFoods.map((food)=>{
					if (food.id === item.id) {
						if (food.priceObject.id === item.priceObject.id) {
							isFoodNum += food.count;
						}
					}
				});
				if (isFoodNum < item.priceObject.minOrderNum) {
					goodsItem = item;
				}
			}	
		});
		return goodsItem;
	},
	//判断是否有商品必选   //判断所选商品的分类是否有关联分类
	isMandatory(){
		let isMandatoryGoods;
		let menu = this.data.menu;
		let selectFoods = this.data.selectFoods;
		let index = null;
		for (let i = 0; i < selectFoods.length; i++) {
			if (selectFoods[i].relationCategoryId ) {
				let isFound = false;
				for (let j = 0; j < selectFoods.length; j++) {
					if (selectFoods[i].relationCategoryId === selectFoods[j].categoryId ) {
						isFound = true;
					}		
				}
				if (!isFound) {
					for (let k = 0; k < menu.length; k++) {
						if (menu[k].id === selectFoods[i].relationCategoryId ) {
							isMandatoryGoods = menu[k];
							index = k+1;
							break;
						}
					}
					break;
				}
			}
		}
		return {isMandatoryGoods,index};
	},
	//判断每单折扣商品限购数量
	isEveryOrderBuyCount(){
		let isEveryOrderBuyCount = false;
		let count = 0;
		let selectFoods = this.data.selectFoods;
		selectFoods.forEach((food)=>{
			if (food.hasDiscount) {
				count += 1;
			}
		});
		return count > this.data.everyOrderBuyCount ? false : true;
	},
	//去结算
	checkOut(){
		let that = this;
		let loginMessage = wx.getStorageSync('loginMessage');
    	let loginstatus = wx.getStorageSync('loginstatus');
		if (this.data.totalcount === 0 || this.data.totalprice < this.data.minPrice) return;
		if (loginMessage && typeof loginMessage == "object" && loginstatus) {
      		// wx.setStorageSync('food',this.data.selectFoods);
      		if (!this.data.getOrderStatus) {
      			let isMinOrderNum = this.isMinOrderNum();
				if (isMinOrderNum) {
					feedbackApi.showToast({title:'[商品['+isMinOrderNum.name+isMinOrderNum.priceObject.spec+']每单'+isMinOrderNum.priceObject.minOrderNum+'份起购'});
					return;
				}
				if (this.data.everyOrderBuyCount) {
					if (!this.isEveryOrderBuyCount()) {
						feedbackApi.showToast({title:'折扣商品每单限购'+this.data.everyOrderBuyCount+'件'});
						return;
					}
				}
				let { isMandatoryGoods, index }= this.isMandatory();
				if (isMandatoryGoods) {
					wx.showModal({
		                content: '请选择['+isMandatoryGoods.name+' (必选) ]下的商品才可以下单哦',
		                showCancel:false,
		                confirmText:'好的',
		                success: function (res) {
		                  	if (res.confirm) {
		                  		if (that.data.merchantType == 0) {
		                  			that.setData({
							      		currentCateno: 'A'+index,
							      		rightToView: 'r_A' + index,
							      		leftScrollClick: true
							    	});
		                  		} else {
		                  			that.data.itemCategoryList = []
									that.data.categoryId = isMandatoryGoods.id
									that.loadMoreGoods()
		                  			that.setData({
							      		currentCateno: 'A'+index,
							      		scrollTop:0,
							      		goodsMoreLoading:false
							    	});
		                  		}
		                  	} else if (res.cancel) {
		                    	console.log('用户点击取消');
		                  	}
		                }
		            });
					return;
				}
				this.data.getOrderStatus = true;
				this.orderPreview(loginMessage).then((res)=>{
	      			if (res.data.code === 0) {
	      				this.setData({
							value:res.data.value
	      				});
	      				wx.navigateTo({
		  					url: '/goods/queryOrder/queryOrder?merchantId='+this.data.merchantId,
		  					complete: function(){
		  						that.data.getOrderStatus = false;
		  					}
						});
	      			} else {
	      				console.log(res)
						let msg = res.data.value;
						if (res.data.code === 100000) {
							setTimeout(()=>{
								wx.navigateTo({
									url:'/pages/login/login'
								});
							},1000);
						}
						feedbackApi.showToast({title: msg});
	      			}	
	      		}).finally(()=>{
	      			this.data.getOrderStatus = false;
	      			wx.hideLoading();
	      		});
      		}		
    	} else {
			setTimeout(()=>{
				wx.navigateTo({
					url:'/pages/login/login?switch=shop'
				})
			},1000);	
			feedbackApi.showToast({title: '你还没有登录,请先去登录'});	
    	}
	},
	//请求订单
	orderPreview(loginMessage){
		wx.showLoading({
	        title: '加载中',
	        mask: true
	    });
		let orderItems = [];
		app.globalData.token = loginMessage.token;
		app.globalData.userId = loginMessage.id;
		let data = {loginToken:app.globalData.token,userId:app.globalData.userId,merchantId:this.data.merchantId};
		this.data.selectFoods.map((item,index)=>{
			let json = {};
			json.id = item.id;
			json.specId = item.priceObject.id;
			json.quantity = item.count;
			if (item.attributes) {
				json.attributes = item.attributes;
			}
			orderItems.push(json);
		});
		data.orderItems = orderItems;
		return wxRequest({
        	url:'/merchant/userClient?m=orderPreview2',
        	method:'POST',
        	data:{
        		params:{
        			data:JSON.stringify(data),
        			longitude:app.globalData.longitude || '1',
        			latitude:app.globalData.latitude || '1'
        		},
        		token:app.globalData.token	
        	},
        });	
	},
	//选择商品大小价格
	choicespec(e){
		let { index, taste } = e.currentTarget.dataset;
		this.setData({
			price:taste.price,
			specIndex:index,
		});
	},
	selectTab(e){
		let { index } = e.currentTarget.dataset;
		this.setData({
			tab:Object.assign({},this.data.tab,{cur:this.data.tab.tabList[index]}),
			tabIndex:index
		});
	},
	getShopList(){
		wx.showLoading({
	        title: '加载中',
	        mask: true
	    });
		return wxRequest({
        	url:'/merchant/userClient?m=showMerchantTakeAwayCategory2',
        	method:'POST',
        	data:{
        		params:{
        			merchantId:this.data.merchantId
        		},
				client: app.globalData.client,
        		clientVersion: "3.2.2"    //此参数取值版本来自于与App版本
        	},
        });
	},
	choice(e){
		this.maskShowAnimation();
		this.choiceShowAnimation();
		let { food, parentIndex } = e.currentTarget.dataset;
		// let selectedFood = this.data.selectedFood;
		
		let arr = [];
		for (let i = 0; i < food.goodsAttributeList.length; i++) {
			let arr = food.goodsAttributeList[i].name.split('|*|');
			food.goodsAttributeList[i].select = arr[0];
		}
		if (parentIndex == 0 || parentIndex) {
			if (this.data.menu[parentIndex].id === null || this.data.menu[parentIndex].id < 0) {
				food.parentRelationCategoryId = food.relationCategoryId;
			} else {
				food.parentRelationCategoryId = this.data.menu[parentIndex].relationCategoryId;
			}
		} else {
			food.parentRelationCategoryId = food.parentRelationCategoryId;
		}
		this.setData({
			selectedFood:food,
			choice:true,
			detailShow:false,
			specIndex:0
		});
	},
	//点击查看商品详情
	selectefood(e){
		this.maskShowAnimation();
		this.choiceShowAnimation();
		
		let { food, parentIndex } = e.currentTarget.dataset;
		if (this.data.menu[parentIndex].id === null || this.data.menu[parentIndex].id < 0) {
			food.parentRelationCategoryId = food.relationCategoryId;
		} else {
			food.parentRelationCategoryId = this.data.menu[parentIndex].relationCategoryId;
		}
		this.setData({
	        selectedFood:food,
			detailShow:true,
	    });
	},
	//关闭查看商品详情
	close(){
		this.maskHideAnimation();
		// this.choiceHideAnimation();
		this.orderHideAnimation();
		this.setData({
			choice:false,
			detailShow:false,
			pickertag:false	
	    });
	},
	//查看购物车详情
	showFood(){
		if (this.data.totalcount > 0) {
			this.setData({
				fold:!this.data.fold,
				isShowTogether:false
			});
		}	
	},
	//购买商品总价和总个数
	totalprice() {
		let totalPrice = 0;
		let count = 0;
		let totals = 0;
		let price = 0;
		let add = 0;
		console.log(this.data.selectFoods);
		let isHasDiscountShare = false;
		this.data.selectFoods.forEach((food)=>{	
			if(food.hasDiscount){
				isHasDiscountShare = true;
				if (food.surplusDiscountStock > food.everyGoodsEveryOrderBuyCount) {
					if (food.everyGoodsEveryOrderBuyCount === 0) {
						if(food.count > food.surplusDiscountStock){
							add = parseFloat(food.priceObject.price)*food.surplusDiscountStock;
							price += food.priceObject.originalPrice*(food.count - food.surplusDiscountStock)+add;
						}else {
							price += parseFloat(food.priceObject.price)*food.count;
						}
					} else {
						if(food.count > food.everyGoodsEveryOrderBuyCount){
							add = parseFloat(food.priceObject.price)*food.everyGoodsEveryOrderBuyCount;
							price += food.priceObject.originalPrice*(food.count - food.everyGoodsEveryOrderBuyCount)+add;
						}else {
							price += parseFloat(food.priceObject.price)*food.count;
						}
					}
				} else {
					if(food.count > food.surplusDiscountStock){
						add = parseFloat(food.priceObject.price)*food.surplusDiscountStock;
						price += food.priceObject.originalPrice*(food.count - food.surplusDiscountStock)+add;
					}else {
						price += parseFloat(food.priceObject.price)*food.count;
					}
				}
			}else{
				totals+= parseFloat(food.priceObject.price)*food.count;
			}	
			totalPrice = totals + price;
			count+= food.count;
		});
		if (isHasDiscountShare && !this.data.activitySharedStatus) {
			this.setData({
				activitySharedShow:true
			});
		} else {
			this.setData({
				activitySharedShow:false
			});
		}
		if (count === 0) {
			this.setData({
		        fold:false
		    });
		}
		if (typeof totalPrice === 'number' && totalPrice%1 != 0) {
			totalPrice = totalPrice.toFixed(2);
		}
		let fullPrice = {};
		let isTogether =false;
		let ruleDtoList = this.data.ruleDtoList;
		ruleDtoList.forEach((ruleItem,index)=>{
			if (totalPrice<ruleDtoList[0].full) {
				let fullRange = ruleDtoList[0].full-totalPrice;
				let subRange = ruleDtoList[0].sub;
				isTogether = (totalPrice/ruleDtoList[0].full) > 0.8 ? true : false;   //去凑单按钮显示与隐藏
				fullPrice = {fullRange:fullRange,subRange:subRange,full:ruleDtoList[0].full}; 
			} else {
				let fullRange = 0;
				let subRange = 0;
				let present = 0;
				let fulls = 0;
				if(totalPrice<ruleItem.full || ruleDtoList[2]&&totalPrice < ruleDtoList[2].full){	
					if(totalPrice<ruleDtoList[1].full){
						fulls = ruleDtoList[1].full;
						fullRange = fulls-totalPrice;
						subRange = ruleDtoList[1].sub;
						present = ruleDtoList[0].sub;
					}else{
						fulls = ruleItem.full;
						fullRange = ruleItem.full-totalPrice;
						subRange = ruleItem.sub;
						present = ruleDtoList[1].sub;
					}
					isTogether =(totalPrice/fulls) > 0.8 ? true : false;
					fullPrice={present:present,fullRange:fullRange.toFixed(2),subRange:subRange,full:fulls}; 	
				} else {
					fullRange= ruleItem.full;
					subRange= ruleItem.sub;
					fullPrice = {fullRange:fullRange,subRange:subRange,full:ruleItem.full};
				}
			}			
		});
		this.setData({
			totalprice:totalPrice,
			totalcount: count,
			fullPrice:fullPrice,
			isTogether:isTogether	
		});	
	},
	//计算订单中某一商品的总数
	getCartCount: function (id,priceObject) {
		let selectFoods = this.data.selectFoods;
	    let count = 0;
	    selectFoods.map((item)=>{
			if (item.id == id) {
	      		if (item.priceObject.id == priceObject.id) {
	      			count+= item.count;
	      		}  
	        }
	    });
	    return count;
	},
	
	//添加进购物车
	addCart(e) {
		let specIndex = e.currentTarget.dataset.specindex || 0;
		// console.log(specIndex)
		let { food, rules, fullActivity, parentIndex } = e.currentTarget.dataset;

		// console.log(food, rules)
		let attributes = '';
		let id = food.id; //选择的产品id
		let categoryId = food.categoryId;  //选择的产品分类id
		console.log(parentIndex);
		let priceObject = {}; //产品价格对象
    	if (food.priceObject) {
			priceObject = food.priceObject; //产品价格
		} else {
			priceObject = food.goodsSpecList[specIndex]; //产品价格	
		}

		if (parentIndex == 0 || parentIndex) {
			if (this.data.menu[parentIndex].id === null || this.data.menu[parentIndex].id < 0) {
				food.parentRelationCategoryId = food.relationCategoryId
			} else {
				food.parentRelationCategoryId = this.data.menu[parentIndex].relationCategoryId
			}
		} else {
			food.parentRelationCategoryId = food.parentRelationCategoryId
		}
		let name = food.name; //产品名称
		let tmpArr = [];
		tmpArr = this.data.selectFoods;
		let count = this.getCartCount(id,priceObject);
		console.log(food.hasDiscount);
		if (priceObject.stockType && food.hasDiscount=== 0 || priceObject.orderLimit && food.hasDiscount===0) {
			console.log(count,priceObject.stock);
			if (count >=priceObject.stock && priceObject.stockType) {
				feedbackApi.showToast({title: '你购买的商品库存不足'});
				return;
			}
			if (priceObject.orderLimit !=0 && count>=priceObject.orderLimit) {
				feedbackApi.showToast({title: '该商品每单限购'+ count +'份'});
				return;
			}
    	} 
    	if(priceObject.stockType && food.hasDiscount===1 || priceObject.orderLimit && food.hasDiscount===1) {
    		if (food.surplusDiscountStock < food.everyGoodsEveryOrderBuyCount && food.surplusDiscountStock) {
    			if(count >= food.surplusDiscountStock) {
					let surCount = count - food.surplusDiscountStock;
					console.log(surCount,priceObject.stock);
					if (surCount >=priceObject.stock &&priceObject.stockType) {
						feedbackApi.showToast({title: '你购买的商品库存不足'});
						return;
					}
					if (surCount >= priceObject.orderLimit && priceObject.orderLimit) {
						feedbackApi.showToast({title: '您购买的商品已超过限购数量'});
						return;
					}	
				}
    		} else if (food.surplusDiscountStock >=food.everyGoodsEveryOrderBuyCount && food.surplusDiscountStock) {
				if (count>=food.everyGoodsEveryOrderBuyCount) {
					console.log(23343);
					let surCount
					if (food.everyGoodsEveryOrderBuyCount !=0) {
						surCount = count - food.everyGoodsEveryOrderBuyCount;
					} else {
						surCount = count - food.surplusDiscountStock;
					}
					if (surCount >= priceObject.stock && priceObject.stockType) {
						feedbackApi.showToast({title: '你购买的商品库存不足'});
						return;
					}
					if (surCount >= priceObject.orderLimit && priceObject.orderLimit) {
						feedbackApi.showToast({title: '您购买的商品已超过限购数量'});
						return;
					}
				}
			}		
    	}

		console.log(tmpArr);
		// 商品规格
		if (rules) {
			for (let i = 0; i < food.goodsAttributeList.length; i++) {
				if (i === food.goodsAttributeList.length-1) {
					attributes += food.goodsAttributeList[i].select;
				} else {
					attributes += food.goodsAttributeList[i].select+',';
				}
			}
		}
		// console.log(food);
		if (fullActivity && food.attributes) {
			attributes = food.attributes;
			rules = true;
		}
		let isToastZK = false;
		if (id) {
	        //遍历数组 
        	let isFound = false;
        	let isHasDiscount = false;
        	let isHasDiscountShare = false;
        	tmpArr.map((item)=> {
	          	if (item.id == id) {
	            	if (item.priceObject.id == priceObject.id) {
	            		if (item.attributes && rules) {            //规格判断
							if (attributes == item.attributes) {
								if (food.hasDiscount) {
									if (food.surplusDiscountStock >=food.everyGoodsEveryOrderBuyCount) {
										let orderBuyCount
										if (food.everyGoodsEveryOrderBuyCount === 0) {
											orderBuyCount = food.surplusDiscountStock;
										} else {
											orderBuyCount = food.everyGoodsEveryOrderBuyCount;
										}
										if(item.count === orderBuyCount){
											if (priceObject.minOrderNum) {
												item.count += 1*priceObject.minOrderNum;
												feedbackApi.showToast({title: item.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
											} else {
												item.count += 1;
											}
										} else {
											item.count += 1;
										}
									} else {
										if (item.count === food.surplusDiscountStock) {
											if (priceObject.minOrderNum) {
												item.count += 1*priceObject.minOrderNum;
												feedbackApi.showToast({title: item.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
											} else {
												item.count += 1;
											}
										} else {
											item.count += 1;
										}
									}
									
								} else {
									item.count += 1;
								}
								isFound = true;			
							}	
	            		} else {
	            			if (food.hasDiscount) {
								if (food.surplusDiscountStock >=food.everyGoodsEveryOrderBuyCount) {
									let orderBuyCount;
									if (food.everyGoodsEveryOrderBuyCount === 0) {
										orderBuyCount = food.surplusDiscountStock;
									} else {
										orderBuyCount = food.everyGoodsEveryOrderBuyCount;
									}
									console.log(item.count,orderBuyCount);
									if(item.count === orderBuyCount){
										if (priceObject.minOrderNum) {
											console.log()
											item.count += 1*priceObject.minOrderNum;
											feedbackApi.showToast({title: item.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
										} else {
											item.count += 1;
										}
									} else {
										item.count += 1;
									}
								} else {
									if (item.count === food.surplusDiscountStock) {
										if (priceObject.minOrderNum) {
											item.count += 1*priceObject.minOrderNum;
											feedbackApi.showToast({title: item.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
										} else {
											item.count += 1;
										}
									} else {
										item.count += 1;
									}
								}
	            			} else {
	            				item.count += 1;
	            			}
	            			isFound = true;
						}		
	                }
				} 	
	        });
	        if(!isFound){
		      	if (rules) {
		      		if (food.hasDiscount) {
		      			tmpArr.push({
		      				attributes:attributes, 
		      				id: id,
		      				hasDiscount:food.hasDiscount,
	      					surplusDiscountStock:food.surplusDiscountStock,
	      					everyGoodsEveryOrderBuyCount:food.everyGoodsEveryOrderBuyCount,
		      				categoryId:categoryId, 
		      				relationCategoryId:food.parentRelationCategoryId,
		      				name: name,
		      				priceObject:priceObject, 
		      				count: 1
		      			});
		      		} else {
						if (priceObject.minOrderNum) {
		      				tmpArr.push({
			      				attributes:attributes, 
			      				id: id,
			      				hasDiscount:food.hasDiscount,
		      					surplusDiscountStock:food.surplusDiscountStock,
		      					everyGoodsEveryOrderBuyCount:food.everyGoodsEveryOrderBuyCount,
		      					relationCategoryId:food.parentRelationCategoryId,
			      				categoryId:categoryId, 
			      				name: name, 
			      				priceObject:priceObject, 
			      				count: 1*priceObject.minOrderNum
			      			});
							feedbackApi.showToast({title: food.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
		      			} else {
							tmpArr.push({
			      				attributes:attributes, 
			      				id: id,
			      				hasDiscount:food.hasDiscount,
		      					surplusDiscountStock:food.surplusDiscountStock,
		      					everyGoodsEveryOrderBuyCount:food.everyGoodsEveryOrderBuyCount,
			      				categoryId:categoryId, 
			      				relationCategoryId:food.parentRelationCategoryId,
			      				name: name, 
			      				priceObject:priceObject, 
			      				count: 1
			      			});
		      			}
		      		} 
	      		} else {
	      			if (food.hasDiscount) {
		      			tmpArr.push({
		      				id: id,
		      				hasDiscount:food.hasDiscount,
	      					surplusDiscountStock:food.surplusDiscountStock,
	      					everyGoodsEveryOrderBuyCount:food.everyGoodsEveryOrderBuyCount,
		      				categoryId:categoryId, 
		      				relationCategoryId:food.parentRelationCategoryId,
		      				name: name, 
		      				priceObject:priceObject, 
		      				count: 1
		      			});
		      		} else {
						if (priceObject.minOrderNum) {
		      				tmpArr.push({
			      				id: id,
			      				hasDiscount:food.hasDiscount,
		      					surplusDiscountStock:food.surplusDiscountStock,
		      					everyGoodsEveryOrderBuyCount:food.everyGoodsEveryOrderBuyCount,
			      				categoryId:categoryId, 
			      				relationCategoryId:food.parentRelationCategoryId,
			      				name: name, 
			      				priceObject:priceObject, 
			      				count: 1*priceObject.minOrderNum
			      			});
							feedbackApi.showToast({title: food.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
		      			} else {
							tmpArr.push({
			      				id: id,
			      				hasDiscount:food.hasDiscount,
		      					surplusDiscountStock:food.surplusDiscountStock,
		      					everyGoodsEveryOrderBuyCount:food.everyGoodsEveryOrderBuyCount,
			      				categoryId:categoryId, 
			      				relationCategoryId:food.parentRelationCategoryId,
			      				name: name, 
			      				priceObject:priceObject, 
			      				count: 1
			      			});
		      			}
		      		} 
	      		}	  		
	        }
			console.log(tmpArr);		
	    }
	    
		if (food.hasDiscount) {
			if (!this.data.activitySharedStatus) {
				if (!this.data.isTipOne) {
					feedbackApi.showToast({title: '满减活动与折扣商品不共享'});
					isToastZK = true;
					this.data.isTipOne = true;
				}	
			} 
			let everyCount = this.getCartCount(id,priceObject);
			if (food.surplusDiscountStock) {
				if(food.surplusDiscountStock >=food.everyGoodsEveryOrderBuyCount){
					let isToastTip = false;
					if (priceObject.stockType) {
						if (priceObject.stock === 0) {
							// feedbackApi.showToast({title: '该商品库存不足'});
							isToastTip = true;
						}
					}
					if (!isToastTip) {
						if (food.everyGoodsEveryOrderBuyCount === 0) {
							if(everyCount===food.surplusDiscountStock && !isToastZK){//商品数量等于限购数量按原价购买
								feedbackApi.showToast({title: '当前折扣商品库存不足,多余部分需原价购买'});
							}
						} else {
							if(everyCount===food.everyGoodsEveryOrderBuyCount && !isToastZK){//商品数量等于限购数量按原价购买
								feedbackApi.showToast({title: '当前折扣商品限购'+ food.everyGoodsEveryOrderBuyCount +'件，多余部分需原价购买'});
							} 
						}
					}	
				} else {
					let isToastTip = false;
					if (priceObject.stockType) {
						if (priceObject.stock === 0) {
							// feedbackApi.showToast({title: '该商品库存不足'});
							isToastTip = true;
						}
					}
					if (!isToastTip) {
						if (everyCount===food.surplusDiscountStock && !isToastZK) {
							feedbackApi.showToast({title: '当前折扣商品库存不足，多余部分需原价购买'});
						}	
					}	
				}
			} 
		}
		console.log(12);
		this.setData({
			selectFoods: tmpArr,
			maskShow:true,
		});
	 	this.totalprice();
	},
	decrease(e){
		let specIndex = e.currentTarget.dataset.specindex || 0;
		let { food, rules} = e.currentTarget.dataset;
		let priceObject = {};
		let attributes = '';
		let id = food.id; //选择的产品id
		//购物车多规格删减匹配
		if (food.attributes) {
			attributes = food.attributes;
			console.log(attributes)
		}
		if (food.priceObject) {
			priceObject = food.priceObject; //产品价格
		}
		//弹出层多规格删减匹配
		if (food.goodsAttributeList && food.goodsAttributeList.length > 0) {
			attributes = '';
			for (var i = 0; i < food.goodsAttributeList.length; i++) {
				if (i === food.goodsAttributeList.length-1) {
					attributes += food.goodsAttributeList[i].select;
				} else {
					attributes += food.goodsAttributeList[i].select+',';
				}
			}
		}
		if (food.goodsSpecList && rules) {
			console.log(2345);
			priceObject = food.goodsSpecList[specIndex];
		} 
		let isNum = 0;
		let isNumstatus = false;
    	if (id) {
	      	let tmpArr = this.data.selectFoods;
	        //便利数组
        	tmpArr.map((item,index)=> {
	          	if (item.id === id) {
	          		if (item.priceObject.id == priceObject.id) {
	          			if (attributes) {
		          			if (attributes == item.attributes) {
								if (item.count > 1) {
									if (food.hasDiscount) {
										
										if (food.surplusDiscountStock >=food.everyGoodsEveryOrderBuyCount) {
											let orderBuyCount;
											if (food.everyGoodsEveryOrderBuyCount === 0) {
												orderBuyCount = food.surplusDiscountStock;
											} else {
												orderBuyCount = food.everyGoodsEveryOrderBuyCount;
											}
											if (item.count-orderBuyCount === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
												item.count -= item.priceObject.minOrderNum;
											} else {
												item.count -= 1;
											}
										} else {
											if (item.count-food.surplusDiscountStock === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
												item.count -= item.priceObject.minOrderNum;
											} else {
												item.count -= 1;
											}
										}	
									} else {
										if (item.priceObject.minOrderNum === item.count) {
											tmpArr.splice(index, 1);
											feedbackApi.showToast({title: item.name+'商品最少购买'+item.priceObject.minOrderNum+'份'});
					              		} else {
					              			item.count -= 1;
					              		} 
									}
									
				                } else {
						        	tmpArr.splice(index, 1);
						      	}
							}
						} else {
							if (item.count > 1) {
								if (food.hasDiscount) {
									console.log(123);
									if (food.surplusDiscountStock >=food.everyGoodsEveryOrderBuyCount) {
										let orderBuyCount;
										if (food.everyGoodsEveryOrderBuyCount === 0) {
											orderBuyCount = food.surplusDiscountStock;
										} else {
											orderBuyCount = food.everyGoodsEveryOrderBuyCount;
										}
										if (item.count-orderBuyCount === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
											item.count -= item.priceObject.minOrderNum;
										} else {
											item.count -= 1;
										}
									} else {
										if (item.count-food.surplusDiscountStock === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
											item.count -= item.priceObject.minOrderNum;
										} else {
											item.count -= 1;
										}
									}
								} else {
									if (item.priceObject.minOrderNum === item.count) {
										tmpArr.splice(index, 1);
										feedbackApi.showToast({title: item.name+'商品最少购买'+item.priceObject.minOrderNum+'份'});
				              		} else {
				              			item.count -= 1;
				              		}
								}
			              		
			                } else {
					        	tmpArr.splice(index, 1);
					      	}
						}
						isNumstatus = true;
	                }
	                isNum++;
	            }
	        });
	        // console.log(isNum);
	        if (isNum === 1 && !isNumstatus) {
	        	console.log(345);
	        	tmpArr.map((item,index)=>{
	        		if (item.id === id) {
	        			if (item.count > 1) {
	        				if (food.hasDiscount) {
								if (food.surplusDiscountStock >=food.everyGoodsEveryOrderBuyCount) {
									let orderBuyCount;
									if (food.everyGoodsEveryOrderBuyCount === 0) {
										orderBuyCount = food.surplusDiscountStock;
									} else {
										orderBuyCount = food.everyGoodsEveryOrderBuyCount;
									}
									if (item.count-orderBuyCount === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
										item.count -= item.priceObject.minOrderNum;
									} else {
										item.count -= 1;
									}
								} else {
									if (item.count-food.surplusDiscountStock === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
										item.count -= item.priceObject.minOrderNum;
									} else {
										item.count -= 1;
									}
								}
							} else {
								if (item.priceObject.minOrderNum === item.count) {
									tmpArr.splice(index, 1);
									feedbackApi.showToast({title: item.name+'商品最少购买'+item.priceObject.minOrderNum+'份'});
			              		} else {
			              			item.count -= 1;
			              		}
							}
		                } else {
				        	tmpArr.splice(index, 1);
				      	}
	        		}
	        	});
	        } else {
	        	if (!food.priceObject && !rules) {
					wx.showModal({
			            content: '多种规格,请在购物车里删除',
			            success: function (res) {
			              if (res.confirm) {
			              	console.log('用户点击确定');	
			              } else if (res.cancel) {
			                console.log('用户点击取消');
			              }
			            }
			        });
	        	}	
	        }
	      	this.setData({
				selectFoods: tmpArr,
				maskShow:true	
			});
	    }
	    this.totalprice();
	},
	//清空购物车
	empty(){
		this.setData({
	      selectFoods: [],
	      fold: false
	    });
	    this.totalprice();
	},
	//产品左侧分类菜单点击事件
	scrollLeftTap(e) {
		let { cateno,index } = e.currentTarget.dataset
		if (this.data.merchantType == 0) {
		    this.setData({
			    currentCateno: cateno,
			    rightToView: 'r_' + cateno,
		      	leftScrollClick: true
		    });
		} else {
			let categoryId = this.data.menu[index].id
			let goodsList = this.data.menu[index].goodsList
			let relationCategoryId = this.data.menu[index].relationCategoryId
			if (goodsList === null) {
				this.data.itemCategoryList = []
				this.data.categoryId = categoryId
				this.loadMoreGoods()
				this.setData({
					currentCateno: cateno,
					scrollTop:0
				})
			} else {
				goodsList.map(item=>{
        			item.parentRelationCategoryId = relationCategoryId
        		})
				this.setData({
					itemCategoryList:goodsList,
					categoryId : categoryId,
					currentCateno: cateno,
					goodsMoreLoading:false,
					scrollTop:0
				})
			}	
		}   
	},
	// 外卖大容量，scroll-view加载更多商品
	loadMoreGoods() {
		if (this.data.categoryId != null) {
			if (!this.data.isLoadCategoryMoreGoods) {
				this.data.isLoadCategoryMoreGoods = true;
				this.showMerchantTakeAwayFindByCategoryId2().then(res=>{
					if (res.data.code === 0) {
						let searchList = res.data.value
						let itemCategoryList = this.data.itemCategoryList;
						if (searchList.length != 0) {
							this.data.menu.map((item,index)=>{
								if (item.id == this.data.categoryId) {
									searchList.map(loadItem=>{
										loadItem.parentRelationCategoryId =item.relationCategoryId 
									})
									if (item.goodsList === null) {
										item.goodsList = searchList
									} else {
										item.goodsList = item.goodsList.concat(searchList)
									}
								}	
							})
							itemCategoryList = itemCategoryList.concat(searchList)
							this.setData({
								itemCategoryList:itemCategoryList,
								goodsMoreLoading:false
							})
							setTimeout(()=>{
								this.removalMenuList()
							}, 0);
						} else {
							this.setData({
								goodsMoreLoading:true
							})
						}
		    		}
		    		this.data.isLoadCategoryMoreGoods = false;
				}).catch(()=>{
					this.data.isLoadCategoryMoreGoods = false;
				})
			}
		} else {
			this.setData({
				goodsMoreLoading:true
			})
		}		
	},
	// 外卖大容量，针对大容量商品加载分类下的商品
	showMerchantTakeAwayFindByCategoryId2(){
		return wxRequest({
        	url:'/merchant/userClient?m=showMerchantTakeAwayFindByCategoryId2',
        	method:'POST',
        	data:{
        		params:{
        			categoryId: this.data.categoryId,
					size: 20,
					start: this.data.itemCategoryList.length
        		}	
        	}
        })
	},
	//产品右侧滚动事件
	rightScroll(e) {
	    if (!this.data.leftScrollClick) {
	      	var currentcate = this.data.catesScrollHeight.find((n) => n.scrollheight <= e.detail.scrollTop).cateno;
	        //修改当前选择的菜单分类编码
	      	if (currentcate != this.data.currentCateno) {
	      		this.setData({
		        	currentCateno: currentcate,
		        	leftToView: 'l_' + currentcate,
		     	});
	      	}
	    } else {
	    	this.data.leftScrollClick = false;
	    }
	},
	onShareAppMessage(res) {
    	return {
      		title: '马管家外卖',
      		path: '/goods/shop/shop?merchantid='+ this.data.merchantId+'&longitude='+app.globalData.longitude+'&latitude='+app.globalData.latitude,
      		success: function(res) {
        		// 转发成功
     		},
      		fail: function(res) {
        		// 转发失败
      		}
    	};
  	},
  	onHide(){
		this.data.isHide = true;
  	},
  	onUnload(){
  		if (!this.data.isHide) {
	  		let merchantId = this.data.merchantId;
	  		if (!wx.getStorageSync('shoppingCart')) {
				let shoppingCart = {};
				shoppingCart[merchantId] = this.data.selectFoods;
				wx.setStorageSync('shoppingCart',shoppingCart);
	  			console.log(shoppingCart);
	  		} else {
	  			let shoppingCart = wx.getStorageSync('shoppingCart');
	  			shoppingCart[merchantId] = this.data.selectFoods;
	  			wx.setStorageSync('shoppingCart',shoppingCart);
	  		}
  		}	
  	}
}));