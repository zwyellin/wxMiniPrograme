const { wxRequest, Promise ,buttonClicked} = require('../../utils/util.js');
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { merchantShop } = require('../template/shop/merchantShop.js');
const { shopSearch,shopSearchData } = require('shopSearch.js');
const app = getApp();
let ActivityListHeight = 149;
let userDiscountGoodsList = [];//保存折扣商品每个客户最多买的请求返回值
let discountGoodsIdList = [];//这里是保存折扣商品每个客户最多买的商品id
const DiscountGoodsMaxRequest=20;//折扣商品每个客户最多买的数组最大数。如果大于该数，则不一次性发请求
Page(Object.assign({}, merchantShop,shopSearch,{
	data:Object.assign({},{
		sharedUserId:null,//分享者id
		merchantType:null,    //商家类型
		categoryId:null,
		goodsMoreLoading:false, //加载更多
		scrollTop:0,          //设置滚动条位置
		itemCategoryList:[],  //某分类下的商品
		loading:false,
		getOrderStatus:false,
		show:true,
		maskShow:false,            // 遮罩层
		maskAnimation:null,
		choiceAnimation:null,
		orderRedAnimation:null,      //红包动画
		pickertagAnimation:null,
		isHide:false,                //控制本地购物车缓存   
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
	    merchantInfoObj:{},     //商家信息
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
		merchantAptitudeImg:'',
		windowWidth:750,
		isonLoadRun:false,           //onload是否执行，用于show。
		isShopSkeletonScreenShow:true,  //商店整体骨架屏显示控制

		WXQRImage:"",//店家二维码
    QRcode_mask_show:false
		},shopSearchData),          //data 对象合并
	onLoad(options) {
		//初始化工作
		this.data.isonLoadRun=true;//标识 onload是否执行

		let { merchantid,sharedUserId,search} = options;
		const scene = decodeURIComponent(options.scene);//,分割 id:merchantid,sharedUserId
		console.log("options",options);
		console.log("scene",scene);
		//search为商店搜索，点击后跳转自身商店(用于标识)
		if(scene==undefined || scene=="undefined"){
			this.data.merchantId =merchantid;
			this.data.sharedUserId=sharedUserId;
		}else{//扫码进来的
			console.log("扫码进来的");
			if(scene.indexOf(",")==-1){
				this.data.merchantId=scene;
			}else{
				let sceneArr=scene.split(",");
				this.data.merchantId =sceneArr[0];
				this.data.sharedUserId=sceneArr[1];
			}
		}
		// 分享者id
		sharedUserId=this.data.sharedUserId;
		if(sharedUserId==undefined || sharedUserId=="undefined") this.data.sharedUserId=null;

		// 获取自己定位
		console.log("重新调用前的经纬度,",app.globalData.longitude)
		if(!app.globalData.latitude){//如果app.json也没有，则是外部进来的，要重新获取经纬度
			app.getLocation();
		}
		//获取系统信息 主要是为了计算产品scroll的高度
		wx.getSystemInfo({
			success: (res)=> {
				this.setData({
					windowScrollHeight: res.windowHeight - 374*(app.globalData.windowWidth/750),
					shopSearchScrollHeight: res.windowHeight - 216*(app.globalData.windowWidth/750)
				});
			}
		});
		
		// this.data.merchantId = 402;	
		//获取购物车缓存
		this.getStorageShop(this.data.merchantId);
		
		//如果传了search参数，并且为true，则显示的搜索页悬浮窗。其下内容不加载
		if(search){//这部分用到变量方法在shopSearch文件
			//先设置isSearchWrapperShow
			this.setData({
				isSearchWrapperShow:true,
				isShopSkeletonScreenShow:false
			})
			//读取购物车其它信息，等价于this.findMerchantInfo();的初始化(这边为了显示优化)
			let shoppingCartOthers=wx.getStorageSync('shoppingCartOther');
			let shoppingCartOther=shoppingCartOthers[this.data.merchantId];
			let setdata=Object.assign({},shoppingCartOther);
			this.setData(setdata);
			this.totalprice();
			this.shopSearchRecord();//读搜索记录缓存
			wx.setNavigationBarTitle({//修改标题
				title: this.data.merchantInfoObj.name+"---店内搜索"
		  	})
			return;
		}
		//获取商家详情
		this.findMerchantInfo().then(()=>{
			// 查看是否有商品页面的缓存，有说明时商品页跳过来的，则要合并数据
			console.log("shareTakeawayData",wx.getStorageSync('shareTakeawayData'))
			if (wx.getStorageSync('shareTakeawayData')) {//说明有缓存
				wx.showToast({
					title:"更新中",
					icon:"loading",
					mask:true,
					duration:20000
				})
				
				// 商品也返回来时，合并信息
				let shareTakeawayData=wx.getStorageSync('shareTakeawayData');
				wx.hideToast();
				this.setData(shareTakeawayData,()=>{
					wx.setStorageSync('shareTakeawayData',null);//清空
				})
			} else {
		
			}
		})

		//返回商家商品(热销榜，好评榜等) 
		this.getShopList().then((res)=>{
			let menu = res.data.value.menu;
			let type = res.data.value.type;
			if (type == 0) {//普通
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
        	if (type == 1) {//大容量
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
			this.setData({
				isShopSkeletonScreenShow:false //关闭骨架屏
			})
		});
		
		//获取商家评价信息
		this.getevaluate();
	},
	onShow(){
		let loginMessage = wx.getStorageSync('loginMessage');
		let loginStatus = wx.getStorageSync('loginstatus',true);
		if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
  			let isloginGetPlatformRedBag = wx.getStorageSync('isloginGetPlatformRedBag');  // 是否通过商家页登录领取过平台红包
  			let isloginGetDiscountUserNum = wx.getStorageSync('isloginGetDiscountUserNum');  // 商家页登录获取平台信息
			if (isloginGetPlatformRedBag) {
				this.getPlatformRedBag();
				wx.setStorageSync('isloginGetPlatformRedBag',false);
			}
			if (isloginGetDiscountUserNum) {
				this.removalMenuList();
				wx.setStorageSync('isloginGetDiscountUserNum',false);
			}
		}
		//返回页面时，加载购物车缓存，比如商店搜索会改变购物车情况
		//条件：onload没有重复读取缓存，并且这个页面是shop本身页面。不是商店搜索页面时才执行
		//触发场景：从商家搜索返回来时
		var pages = getCurrentPages();
		var prevPage=null;
		if(pages.length>=2){
			prevPage= pages[pages.length - 2]; // 上一级页面
		}else{//有可能是分享进来的，此时页面栈长度为1
			prevPage={
				route:""
			}
		}
		if(!this.data.isonLoadRun){
			// 商店搜索返回来的
			if (!/goods\/shop\/shop/.test(prevPage.route)) {
				this.getStorageShop(this.data.merchantId);
				this.totalprice();
			}
			//也可能是商品页面返回来的。	// 要共享回去的数据selectFoods，listFoods，totalprice，totalcount,fullPrice
			// 及sharedUserId
			if(this.data.shareTakeawayData!==undefined){
				wx.showToast({
					title:"更新中",
					icon:"loading",
					mask:true,
					duration:20000
				})
				this.setData(this.data.shareTakeawayData,()=>{
					wx.hideToast();
					delete this.data.shareTakeawayData;	// 重置为undefined,避免非商品页也触发这里
				});
			}
			// 如果是分享进来的，则是已本地缓存形式传输
		}else{

		}
		wx.setStorageSync('isPayPageRoute',false);
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
		let { id,imgs } = e.currentTarget.dataset;
		console.log(id,imgs)
		wx.previewImage({
			current: imgs[id], // 当前显示图片的http链接
			urls:imgs // 需要预览的图片http链接列表
		  })
	},
	//获取购物车缓存数据
	getStorageShop(merchantId){
		if (wx.getStorageSync('shoppingCart')) {
			let shoppingCart = wx.getStorageSync('shoppingCart');
			if (shoppingCart[merchantId]) {
				this.setData({
					selectFoods:shoppingCart[merchantId]
				});
			}
		}
	},
	//设置购物车缓存
	setStorageShop(merchantId){
		if (!wx.getStorageSync('shoppingCart')) {
			let shoppingCart = {};
			shoppingCart[merchantId] = this.data.selectFoods;
			wx.setStorageSync('shoppingCart',shoppingCart);
		} else {
			let shoppingCart = wx.getStorageSync('shoppingCart');
			shoppingCart[merchantId] = this.data.selectFoods;
			wx.setStorageSync('shoppingCart',shoppingCart);
		}	
	},
	boosList(){
		this.setData({
			isShowTogether:false
		});
	},
	//每个客户最多买，的请求，
	//@goodsSpecIds:goodsSpecId的数组。
	findGoodsSpecIdBuyNum(goodsSpecIds){
		let discountGoodsList=[];
		//区分是为了，解决promise.all(单个).then 不触发的问题
		if(typeof goodsSpecIds=="number"){
			discountGoodsList=wxRequest({
				url:'/merchant/userClient?m=findGoodsSpecIdBuyNum',
				method:'POST',
				data:{
						params:{
							merchantId:this.data.merchantId,
							goodsSpecId:goodsSpecIds      //折扣商品为单规格
						},
					},
				})
			return discountGoodsList
		}else{
			goodsSpecIds.forEach((item,index,arr)=>{
				discountGoodsList.push(wxRequest({
					url:'/merchant/userClient?m=findGoodsSpecIdBuyNum',
					method:'POST',
					data:{
							params:{
								merchantId:this.data.merchantId,
								goodsSpecId:item      //折扣商品为单规格
							},
						},
					})
				)
			});
			return Promise.all(discountGoodsList);
		}
	},
	//商家相同商品id去重
	removalMenuList(){
		let menu = this.data.menu;
		let removalMenuList = [];
		discountGoodsIdList = [];
		let loginMessage = wx.getStorageSync('loginMessage');
		let loginStatus = wx.getStorageSync('loginstatus');
		menu.map(item=>{
			if (item.goodsList != null) {
				item.goodsList.map((value,index)=>{
					value.parentRelationCategoryId = item.relationCategoryId
					removalMenuList.push(value);
					if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
  						if (value.hasDiscount ===1) {
							if (value.discountedGoods.maxBuyNum != null) {
								discountGoodsIdList.push(value.goodsSpecList[0].id);
								this.data.everyOrderBuyCount = value.discountedGoods.goodsRestrictedPurchaseRule.everyOrderBuyCount;
							}
						}
					}	
				});
			}
		});
		//如果折扣每个客户最多买的数组太大，则不一次性发请求.换成==>在购物时发请求判断
		if(discountGoodsIdList.length<=DiscountGoodsMaxRequest){//小于则发请求
			userDiscountGoodsList = []
			this.findGoodsSpecIdBuyNum(discountGoodsIdList).then((res)=>{
				res.forEach(item=>{
					if (item.data.code === 0) {
						userDiscountGoodsList.push(item.data.value)
					}
				})
			}).catch(err=>{
				console.log(err)
			});
		}
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
	//判断每个折扣商品该用户还可购买的数量
	isEveryUserBuyNum(priceObject){
		let isRequestData = false, buyNum = -1;//isRequestData表示，是不是服务器返回来的.主要区分buyNum-1
		for (let i = 0; i < userDiscountGoodsList.length; i++) {
			if (userDiscountGoodsList[i].goodsSpecId === priceObject.id) {
				buyNum = userDiscountGoodsList[i].buyNum;
				isRequestData = true;
				break;
			}	
		}
		return { isRequestData, buyNum }
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
							console.log("进入前的调用",app.globalData.longitude)
	      			if (res.data.code === 0) {
	      				this.setData({
									value:res.data.value
	      				});
	      				wx.navigateTo({
		  					url: '/goods/queryOrder/queryOrder?merchantId='+this.data.merchantId+"&sharedUserId="+this.data.sharedUserId,
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
									url:'/pages/login/login?switch=shop'
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
		data.sharedUserId=this.data.sharedUserId;
		console.log("ok")
		console.log(data);
		return wxRequest({
        	url:'/merchant/userClient?m=orderPreview2',
        	method:'POST',
        	data:{
        		params:{
        			data:JSON.stringify(data),
        			longitude:app.globalData.longitude || this.data.merchantInfoObj.longitude,
        			latitude:app.globalData.latitude ||  this.data.merchantInfoObj.longitude
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
	//返回商家商品(热销榜，好评榜等) 
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
        	},
        });
	},
	choice(e){
		this.maskShowAnimation();
		this.choiceShowAnimation();
		let { food, parentIndex } = e.currentTarget.dataset;
		let ccfood=JSON.parse(JSON.stringify(food));
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
		// this.maskShowAnimation();
		// this.choiceShowAnimation();
		if(buttonClicked(this)) return;
		let { food, parentIndex } = e.currentTarget.dataset;
		if(this.data.isSearchWrapperShow){//如果是商店页面
			food.parentRelationCategoryId = food.relationCategoryId;
		}else{
			if (parentIndex==undefined && this.data.menu[parentIndex].id === null  || this.data.menu[parentIndex].id < 0) {
				food.parentRelationCategoryId = food.relationCategoryId;
			} else {
				food.parentRelationCategoryId = this.data.menu[parentIndex].relationCategoryId;
			}
		}
		this.setData({
					selectedFood:food,
		
					// detailShow:true,
	  },()=>{//设置成功后，跳转到商品页面
				wx.navigateTo({
					url:'/goods/shop/Takeaway/Takeaway?sharedUserId='+this.data.sharedUserId
				})
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
		let isHasDiscountShare = false;
		this.data.selectFoods.forEach((food)=>{	
			if(food.hasDiscount){
				isHasDiscountShare = true;
				let discountArr=[food.surplusDiscountStock,food.count]
				if(food.everyGoodsEveryOrderBuyCount != 0) discountArr.push(food.everyGoodsEveryOrderBuyCount)
				if(food.isEveryUserBuyNum.buyNum != -1) discountArr.push(food.isEveryUserBuyNum.buyNum)
				//得走折扣，的数量为
				let discountNum = Math.min.apply(null, discountArr);
				add = parseFloat(food.priceObject.price)*discountNum;
				price += food.priceObject.originalPrice*(food.count -discountNum)+add;
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
		let { food, rules, fullActivity, parentIndex } = e.currentTarget.dataset;

		let attributes = '';
		let id = food.id; //选择的产品id
		let categoryId = food.categoryId;  //选择的产品分类id
		let priceObject = {}; //产品价格对象  
    	if (food.priceObject) {
			priceObject = food.priceObject; //产品价格
			if (food.hasDiscount) {
				let discountedGoods = {}
				discountedGoods.maxBuyNum = food.userMaxBuyNum
				food.discountedGoods = discountedGoods
			}
		} else {
			priceObject = food.goodsSpecList[specIndex]; //产品价格	
		}
		//关联parentRelationCategoryId
		if (parentIndex == 0 || parentIndex) {//如果传了parentIndex，普通购买和点详情进去的购买
			if (this.data.menu[parentIndex].id === null || this.data.menu[parentIndex].id < 0) {
				food.parentRelationCategoryId = food.relationCategoryId
			} else {
				food.parentRelationCategoryId = this.data.menu[parentIndex].relationCategoryId
			}
		} else {
			food.parentRelationCategoryId = food.parentRelationCategoryId
		}
		let name = food.name; //产品名称
		let tmpArr =  this.data.selectFoods;
		let count = this.getCartCount(id,priceObject);

		//点击之后就判断能否购买 
		//普通商品库存有限 或 有限购要求 或 最少购买数量>库存数
		if (food.hasDiscount=== 0  &&  (priceObject.stockType || priceObject.orderLimit) ) {
			if (priceObject.minOrderNum > priceObject.stock && priceObject.stockType) {
				feedbackApi.showToast({title: '该商品库存不足'});
				return;
			}
			if (count >=priceObject.stock && priceObject.stockType) {
				feedbackApi.showToast({title: '你购买的商品库存不足'});
				return;
			}
			if (priceObject.orderLimit !=0 && count>=priceObject.orderLimit) {
				feedbackApi.showToast({title: '该商品每单限购'+ count +'份'});
				return;
			}
		} 
		//针对折扣商品 库存有限 或 有限购要求
    if( food.hasDiscount===1  && (priceObject.stockType || priceObject.orderLimit)) {
			let isEveryUserBuyNum = this.isEveryUserBuyNum(priceObject)
			let discountArr=[food.surplusDiscountStock]
			if(food.everyGoodsEveryOrderBuyCount != 0) discountArr.push(food.everyGoodsEveryOrderBuyCount)
			if(isEveryUserBuyNum.buyNum != -1) discountArr.push(isEveryUserBuyNum.buyNum)
			//折扣最多购买数量
			let orderBuyCount = Math.min.apply(null, discountArr);
			let surCount = count - orderBuyCount;
			if (surCount >=0 && priceObject.minOrderNum > priceObject.stock && priceObject.stockType) {
				feedbackApi.showToast({title: '该商品库存不足'});
				return;
			}
			if (surCount >=priceObject.stock && priceObject.stockType) {
				feedbackApi.showToast({title: '你购买的商品库存不足'});
				return;
			}
			if (surCount >= priceObject.orderLimit && priceObject.orderLimit) {
				feedbackApi.showToast({title: '您购买的商品已超过限购数量'});
				return;
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
		//购物车那里，如果这个商品是有属性的,则置rules为true
		if (fullActivity && food.attributes) {
			attributes = food.attributes;
			rules = true;
		}
		if (id) {//选择的产品id
	        //遍历数组 
        	let isFound = false;
        	tmpArr.map((item)=> {    //selectfood []
	          	if (item.id == id) {//如果之前有买
	            	if (item.priceObject.id == priceObject.id) {
	            		if (item.attributes && rules) { //如果是有属性的
							if (item.attributes  == attributes) {
								if (food.hasDiscount) {//折扣商品
									//如果折扣库存还很多
									//走折扣的数量 受，折扣库存，折扣每天最多买，折扣每个客户还可以买的约束
									//即走折扣的数量 为：它们之间的最小值
									let discountArr=[food.surplusDiscountStock]
									if(food.everyGoodsEveryOrderBuyCount != 0) discountArr.push(food.everyGoodsEveryOrderBuyCount)
									if(item.isEveryUserBuyNum.buyNum != -1) discountArr.push(item.isEveryUserBuyNum.buyNum)
									//折扣最多购买数量
									let orderBuyCount = Math.min.apply(null, discountArr);	
									if(item.count === orderBuyCount){//说明，不能再走折扣商品了。则走普通商品购买
										if (priceObject.minOrderNum) {
											item.count += 1*priceObject.minOrderNum;
											feedbackApi.showToast({title: item.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
										} else {
											item.count += 1;
										}
									} else {//走折扣商品，折扣商品没有最少购买数量
										item.count += 1;
									}
								} else { //普通商品
									item.count += 1;
								}
								isFound = true;			
							}	
	            		} else {  //没有属性的
	            			if (food.hasDiscount) {
								let discountArr=[food.surplusDiscountStock]
								if(food.everyGoodsEveryOrderBuyCount != 0) discountArr.push(food.everyGoodsEveryOrderBuyCount)
								if(item.isEveryUserBuyNum.buyNum != -1) discountArr.push(item.isEveryUserBuyNum.buyNum)
								//折扣最多购买数量
								let orderBuyCount = Math.min.apply(null, discountArr);
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
	            			} else { //普通商品
	            				item.count += 1;
	            			}
	            			isFound = true;
						}		
	                }
				} 	
			});
			//没有找到，第一次添加该商品(或规格)
	        if(!isFound){
				let isEveryUserBuyNum = -1;//初始值 
				//if 自己发请求获取isEveryUserBuyNum  else之前有发请求，直接读取
				//针对折扣商品，即在规格id 在 discountGoodsIdList 中的商品 && 如果找到了，则不再发请求
				if(discountGoodsIdList.indexOf(priceObject.id)!=-1 && !this.isEveryUserBuyNum(priceObject).isRequestData){
					this.findGoodsSpecIdBuyNum(priceObject.id).then((res)=>{
						if (res.data.code === 0) {
							isEveryUserBuyNum=res.data.value;
							//保存起来
							userDiscountGoodsList.push(res.data.value);
						}else{
							console.log("折扣商品每个客户请求失败")
						}
						//添加进购物车
						this.firstAddIntoCart(food,tmpArr,rules,attributes,isEveryUserBuyNum,categoryId,priceObject)
						//折扣消息
						this.addCartDiscountMsg(food,priceObject);
						this.setData({
							selectFoods: tmpArr,
							maskShow:true,
						});
						this.totalprice();
					}).catch(()=>{
				
					})
				}else{
					isEveryUserBuyNum=this.isEveryUserBuyNum(priceObject);
					//添加进购物车
					this.firstAddIntoCart(food,tmpArr,rules,attributes,isEveryUserBuyNum,categoryId,priceObject)
					//折扣消息
					this.addCartDiscountMsg(food,priceObject);
					this.setData({
						selectFoods: tmpArr,
						maskShow:true,
					});
					this.totalprice();
				}
	        }else{//除 第一次购买
				this.addCartDiscountMsg(food,priceObject);
				this.setData({
					selectFoods: tmpArr,
					maskShow:true,
				});
				this.totalprice();
			}			
	    }//添加进购物车流程结束
	},
	//第一次添加购物车
	firstAddIntoCart(food,tmpArr,rules,attributes,isEveryUserBuyNum,categoryId,priceObject){
		/*@food 
		  @attributes 
		  @isEveryUserBuyNum 折扣独有，每个客户折扣最多买
		  @categoryId 
		  @priceObject
		  @rules
		*/
		let _userMaxBuyNum,_isEveryUserBuyNum,_attributes,_count=1;
		if(rules){//如果多规格，则该属性有值
			_attributes=attributes;
		}
		if(food.hasDiscount){//如果该商品是折扣商品
			_userMaxBuyNum=food.discountedGoods.maxBuyNum; //折扣独有
			_isEveryUserBuyNum=isEveryUserBuyNum;//折扣商品独有
			//折扣商品时，count+1     _count=1;
		}
		if(priceObject.minOrderNum && !food.hasDiscount){//如果有最低购买要求 并且不是在折扣阶段
			_count= 1*priceObject.minOrderNum;
			feedbackApi.showToast({title: food.name+'商品最少购买'+priceObject.minOrderNum+'份哦'});
		}
		tmpArr.push({
			attributes:_attributes,
			id: food.id,
			hasDiscount:food.hasDiscount,
			surplusDiscountStock:food.surplusDiscountStock,
			everyGoodsEveryOrderBuyCount:food.everyGoodsEveryOrderBuyCount,
			userMaxBuyNum:_userMaxBuyNum,  
			isEveryUserBuyNum:_isEveryUserBuyNum,
			categoryId:categoryId, 
			relationCategoryId:food.parentRelationCategoryId,
			name: food.name, 
			priceObject:priceObject, 
			count: _count
		});	
	},
	//购物车 添加时 折扣商品的消息提醒
	addCartDiscountMsg(food,priceObject){
		let isToastZK=false;
		if (food.hasDiscount) {
			if (!this.data.activitySharedStatus && this.data.ruleDtoList.length>0) {//
				if (!this.data.isTipOne) {
					feedbackApi.showToast({title: '满减活动与折扣商品不共享'});
					isToastZK = true;
					this.data.isTipOne = true;
				}	
			} 
			let everyCount = this.getCartCount(food.id,priceObject);
			let isEveryUserBuyNum = this.isEveryUserBuyNum(priceObject)
			if (food.surplusDiscountStock) {
				if(food.surplusDiscountStock > food.everyGoodsEveryOrderBuyCount){
					let isToastTip = false;
					if (priceObject.stockType) {
						if (priceObject.stock === 0) {
							// feedbackApi.showToast({title: '该商品库存不足'});
							isToastTip = true;
						}
					}
					if (!isToastTip && !isToastZK) {
						if (food.everyGoodsEveryOrderBuyCount === 0) {
							if (isEveryUserBuyNum.buyNum != -1 && food.surplusDiscountStock > isEveryUserBuyNum.buyNum) {   //每个用户是否还可购买的折扣数量
								if(everyCount===isEveryUserBuyNum.buyNum){//商品数量等于用户限购数量按原价购买
									feedbackApi.showToast({title: '当前折扣商品用户最多购买'+food.discountedGoods.maxBuyNum+'件,多余部分需原价购买'});
								}
							} else {
								if(everyCount===food.surplusDiscountStock){//商品数量等于限购数量按原价购买
									feedbackApi.showToast({title: '当前折扣商品库存不足,多余部分需原价购买'});
								}
							}	
						} else {
							if (isEveryUserBuyNum.buyNum != -1 && food.everyGoodsEveryOrderBuyCount >= isEveryUserBuyNum.buyNum) {
								if(everyCount===isEveryUserBuyNum.buyNum){//商品数量等于用户限购数量按原价购买
									feedbackApi.showToast({title: '当前折扣商品用户最多购买'+food.discountedGoods.maxBuyNum+'件,多余部分需原价购买'});
								}
							} else {
								if(everyCount===food.everyGoodsEveryOrderBuyCount){//商品数量等于限购数量按原价购买
									feedbackApi.showToast({title: '当前折扣商品限购'+ food.everyGoodsEveryOrderBuyCount +'件，多余部分需原价购买'});
								} 
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
						if (isEveryUserBuyNum.buyNum != -1 && food.surplusDiscountStock > isEveryUserBuyNum.buyNum) {
							feedbackApi.showToast({title: '当前折扣商品用户最多购买'+food.discountedGoods.maxBuyNum+'件,多余部分需原价购买'});
						} else {
							if (everyCount===food.surplusDiscountStock && !isToastZK) {
								feedbackApi.showToast({title: '当前折扣商品库存不足，多余部分需原价购买'});
							}
						}		
					}	
				}
			} 
		}
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
										let discountArr=[food.surplusDiscountStock]
										if(food.everyGoodsEveryOrderBuyCount != 0) discountArr.push(food.everyGoodsEveryOrderBuyCount)
										if(item.isEveryUserBuyNum.buyNum != -1) discountArr.push(item.isEveryUserBuyNum.buyNum)
										//折扣最多购买数量
										let orderBuyCount = Math.min.apply(null, discountArr);
										
										if (item.count-orderBuyCount === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
											item.count -= item.priceObject.minOrderNum;
										} else {
											item.count -= 1;
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
									let discountArr=[food.surplusDiscountStock]
									if(food.everyGoodsEveryOrderBuyCount != 0) discountArr.push(food.everyGoodsEveryOrderBuyCount)
									if(item.isEveryUserBuyNum.buyNum != -1) discountArr.push(item.isEveryUserBuyNum.buyNum)
									//折扣最多购买数量
									let orderBuyCount = Math.min.apply(null, discountArr);
									if (item.count-orderBuyCount === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
										item.count -= item.priceObject.minOrderNum;
									} else {
										item.count -= 1;
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
	        if (isNum === 1 && !isNumstatus) {
	        	tmpArr.map((item,index)=>{
	        		if (item.id === id) {
	        			if (item.count > 1) {
	        				if (food.hasDiscount) {
								let discountArr=[food.surplusDiscountStock]
								if(food.everyGoodsEveryOrderBuyCount != 0) discountArr.push(food.everyGoodsEveryOrderBuyCount)
								if(item.isEveryUserBuyNum.buyNum != -1) discountArr.push(item.isEveryUserBuyNum.buyNum)
								//折扣最多购买数量
								let orderBuyCount = Math.min.apply(null, discountArr);
								if (item.count-orderBuyCount === item.priceObject.minOrderNum && item.priceObject.minOrderNum) {
									item.count -= item.priceObject.minOrderNum;
								} else {
									item.count -= 1;
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

	//店家二维码
	getMGJMerchantWXQRImage(){
		return wxRequest({
			url:'/merchant/userClient?m=getMGJMerchantWXQRImage',
			method:'POST',
			data:{
				token:app.globalData.token,
				params:{
					bizType:1,
					merchantId:this.data.merchantId
				}	
			},
		}).then(res=>{
			let WXQRImage="data:image/png;base64,"+res.data.value;
			this.setData({
				WXQRImage
			})
		})
	},
	//QRcodeIconTap
	QRcodeIconTap(){
		this.setData({
			QRcode_mask_show:true
		})
		let WXQRImage=this.data.WXQRImage;
    if(WXQRImage.length==0){//说明还没有发请求
      wx.showToast({
        title:"加载中",
        icon:"loading",
        duration:2000
      })
      this.getMGJMerchantWXQRImage().then(()=>{
        wx.hideToast();
      })
    }
	},
	// 保存二维码
	saveQRCode(e){
		let {images}=e.currentTarget.dataset;
		let that=this;
		wx.previewImage({
			current: images, // 当前显示图片的http链接
			urls:[images],// 需要预览的图片http链接列表
			success:function(){
				that.setData({
					QRcode_mask_show:false
				})
			}
		})
	},
	// 关闭二维码显示
	maskCancelTap(e){
    this.setData({
      QRcode_mask_show:false
    })
  },

onShareAppMessage(res) {
	console.log("分享成功",app.globalData.userId)
		return {
				title: '马管家',
				path: '/goods/shop/shop?merchantid='+ this.data.merchantId+'&sharedUserId='+app.globalData.userId,
		};
},
onHide(){
	this.data.isonLoadRun=false;//标识 onload是否执行 这边重置
	let merchantId = this.data.merchantId;
	this.setStorageShop(merchantId)
	},
onUnload(){
	//如果销毁是因为支付完成之后的订单详情页面，则返回时不存储购物车
	let isPayPageRoute = wx.getStorageSync('isPayPageRoute');
		if (!isPayPageRoute) {
			let merchantId = this.data.merchantId;
			this.setStorageShop(merchantId)
		}		
	}
}));