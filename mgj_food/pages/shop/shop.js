const { wxRequest } = require('../../utils/util.js');
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { merchantShop } = require('../../components/shop/merchantShop.js');
const app = getApp();
let ActivityListHeight = 149;
Page(Object.assign({}, merchantShop,{
	data:{
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
	    tabIndex:0,
	    merchantId:null,
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
	    evaluate:[],
		value:{},       //确认订单后台返回信息
		pickertag:false
	},
	onLoad(options) {
		let { merchantid } = options;
		this.data.merchantId = merchantid;
		// this.data.merchantId = 402;
		this.findMerchantInfo();
		this.getShopList().then((res)=>{
			let menu = res.data.value.menu;
			menu.map((leftItem,index) =>{
				if (index != 0 ) {
					leftItem.goodsList.map(leftItemShop =>{
						leftItemShop.isImgLoadComplete = false;
					});
				} else {
					leftItem.goodsList.map(leftItemShop =>{
						leftItemShop.isImgLoadComplete = true;
					});
				}	
			});
			console.log(menu);
        	this.setData({
        		menu:menu,
        		orderList:res.data.value.orderList
        	});
        	setRightScrollItemHeight: {
		      let cate_size = [];
		      let sumscrollheight = 0;//总高度
		      let catebarheigth = 26;//单个分类bar的高度
		      let goodsviewheight = 100;//单个产品view的高度
		      this.data.menu.forEach((item,index)=> {
		        let unitheight = catebarheigth + item.goodsList.length * goodsviewheight;//每个分类单元的高度=分类bar的高度+每个产品view的高度*该分类下的产品数
		        cate_size.push({ cateno: "A"+(index+1), scrollheight: sumscrollheight });
		        sumscrollheight += unitheight;
		      });
		      this.setData({
		        catesScrollHeight: cate_size.reverse()//分类scroll数组倒序处理后写入data
		      });
		      console.log(cate_size);
		    }
        }).finally(()=>{
        	wx.hideLoading();
        });
        this.getStorageShop(this.data.merchantId);
		this.getevaluate();
		//获取系统信息 主要是为了计算产品scroll的高度
	    wx.getSystemInfo({
		    success: res => {
		        this.setData({
		          windowScrollHeight: res.windowHeight - 140
		        });
		    }
	    });
	    //设置right scroll height 实现右侧产品滚动级联左侧菜单互动   
	},
	_imgOnLoad(e){
		console.log(e)
		let { parentindex, index } = e.currentTarget.dataset; 
		let menu = this.data.menu;
		menu[parentindex].goodsList[index].isImgLoadComplete = true;
		this.setData({
			menu:menu
		});
	},
	//获取购物车缓存数据
	getStorageShop(merchantId){
		if (wx.getStorageSync('shoppingCart')) {
			let shoppingCart = wx.getStorageSync('shoppingCart');
			if (shoppingCart[merchantId]) {
				this.setData({
					selectFoods:shoppingCart[merchantId]
				});
				this.totalprice();
			}
  		}
	},
	//选择商品规格
	choiceTaste(e){
		let { taste, parentindex} = e.currentTarget.dataset;
		let selectedFood = this.data.selectedFood;
		selectedFood.goodsAttributeList[parentindex].select = taste;
		this.setData({
			selectedFood:selectedFood
		});
	},
	isMinOrderNum(){
		let goodsItem;
		let isFoodNum = 0;
		this.data.selectFoods.map((item,index)=>{
			if (item.priceObject.minOrderNum) {
				isFoodNum = 0
				this.data.selectFoods.map((food)=>{
					if (food.id === item.id) {
						if (food.priceObject.id === item.priceObject.id) {
							isFoodNum += food.count
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
	//判断是否有商品必选
	isMandatory(){
		let isMandatoryGoods;
		let menu = this.data.menu;
		let selectFoods = this.data.selectFoods;
		let index = null;
		for (let i = 0; i <  menu.length; i++) {
			if (menu[i].isMandatory) {
				let isFound = false;
				for (let j = 0; j < selectFoods.length; j++) {
					if (menu[i].id === selectFoods[j].categoryId ) {
						isFound = true;
					}		
				}
				if (!isFound) {
					isMandatoryGoods = menu[i];
					index = i+1;
					break;
				}
			}
		}
		return {isMandatoryGoods,index};
	},
	//去结算
	checkOut(){
		let that = this;
		let loginMessage = wx.getStorageSync('loginMessage');
    	let loginstatus = wx.getStorageSync('loginstatus');
		if (this.data.totalcount === 0 || this.data.totalprice < this.data.minPrice) return;
		if (loginMessage && loginstatus) {
      		// wx.setStorageSync('food',this.data.selectFoods);
      		if (!this.data.getOrderStatus) {
      			let isMinOrderNum = this.isMinOrderNum();
				if (isMinOrderNum) {
					feedbackApi.showToast({title:'[商品['+isMinOrderNum.name+isMinOrderNum.priceObject.spec+']每单'+isMinOrderNum.priceObject.minOrderNum+'份起够'});
					return;
				}
				let { isMandatoryGoods, index }= this.isMandatory();
				if (isMandatoryGoods) {
					wx.showModal({
		                content: '请选择['+isMandatoryGoods.name+' (必选) ]下的商品才可以下单哦',
		                showCancel:false,
		                confirmText:'好的',
		                success: function (res) {
		                  	if (res.confirm) {
		                    	that.setData({
							      	currentCateno: 'A'+index,
							      	rightToView: 'r_A' + index,
							      	leftScrollClick: true
							    });
		                  	} else if (res.cancel) {
		                    	console.log('用户点击取消');
		                  	}
		                }
		            });
					return;
				}
				this.data.getOrderStatus = true;
				this.orderPreview().then((res)=>{
	      			if (res.data.code === 0) {
	      				this.setData({
							value:res.data.value
	      				});
	      				wx.navigateTo({
		  					url: '/pages/queryOrder/queryOrder?merchantId='+this.data.merchantId,
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
					url:'/pages/login/login'
				})
			},1000);	
			feedbackApi.showToast({title: '你还没有登录,请先去登录'});	
    	}
	},
	//请求订单
	orderPreview(){
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		let orderItems = [];
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
		console.log(orderItems);
		data.orderItems = orderItems;
		return wxRequest({
        	url:'/merchant/userClient?m=orderPreview',
        	method:'POST',
        	data:{
        		params:{
        			data:JSON.stringify(data),
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude
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
			specIndex:index
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
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		return wxRequest({
        	url:'/merchant/userClient?m=showMerchantTakeAwayMenu',
        	method:'POST',
        	data:{
        		params:{
        			merchantId:this.data.merchantId
        		}	
        	},
        });
	},
	choice(e){
		this.maskShowAnimation();
		this.choiceShowAnimation();
		let { food } = e.currentTarget.dataset;
		let arr = [];
		for (let i = 0; i < food.goodsAttributeList.length; i++) {
			let arr = food.goodsAttributeList[i].name.split('|*|');
			food.goodsAttributeList[i].select = arr[0];
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
		
		let { food } = e.currentTarget.dataset;
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
				fold:!this.data.fold
			});
		}	
	},
	//购买商品总价和总个数
	totalprice() {
		let total = 0;
		let count = 0;
		this.data.selectFoods.forEach((food)=>{	
			total+= parseFloat(food.priceObject.price)*food.count;
			count+= food.count;
		});
		if (count === 0) {
			this.setData({
		        fold:false
		    });
		}
		if (typeof total === 'number' && total%1 != 0) {
			total = total.toFixed(2)
		}
		this.setData({
	        totalprice:total,
	        totalcount: count
	    });
	},
	//计算订单中某一商品的总数
	getCartCount: function (id,priceObject) {
		let selectFoods = this.data.selectFoods
	    let count = 0;
	    selectFoods.map((item)=>{
			if (item.id == id) {
	      		if (item.priceObject.id == priceObject.id) {
	      			count+= item.count;
	      		}  
	        }
	    })
	    return count;
	},
	//添加进购物车
	addCart(e) {
		let specIndex = e.currentTarget.dataset.specindex || 0;
		let { food, rules} = e.currentTarget.dataset;
		let attributes = '';
		let id = food.id; //选择的产品id
		let categoryId = food.categoryId;  //选择的产品分类id
    	let priceObject = {}; //产品价格对象
    	if (food.priceObject) {
			priceObject = food.priceObject; //产品价格
		} else {
			priceObject = food.goodsSpecList[specIndex]; //产品价格
		}
    	let name = food.name; //产品名称
    	console.log(food);
    	if (priceObject.stock || priceObject.orderLimit) {
			let count = this.getCartCount(id,priceObject);
			if (priceObject.stockType) {
				if (count >=priceObject.stock) {
					feedbackApi.showToast({title: '该商品库存不足'});
					return;
				}
			}
			if (priceObject.orderLimit !=0 && count>=priceObject.orderLimit) {
				feedbackApi.showToast({title: '该商品每单限购'+ count +'份'});
				return;
			}
    	}
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
		console.log(food);
		if (id) {
	      	let tmpArr = this.data.selectFoods;
	        //遍历数组 
        	let isFound = false;
        	tmpArr.map((item)=> {
	          	if (item.id == id) {
	            	if (item.priceObject.id == priceObject.id) {
	            		if (item.attributes && rules) {            //规格判断
							// let flag = true;
							if (attributes == item.attributes) {
								item.count += 1;	
								isFound = true;
							}	
	            		} else {
	            			item.count += 1;
	            			isFound = true;
	            		}	
	                }
	            } 
	        });
	        if(!isFound){
		      	if (rules) {
	      			tmpArr.push({attributes:attributes, id: id, categoryId:categoryId, name: name, priceObject: priceObject, count: 1});
	      		} else {
	      			if (priceObject.minOrderNum) {
	      				tmpArr.push({id: id, categoryId:categoryId, name: name, priceObject: priceObject, count: 1*priceObject.minOrderNum});
	      				feedbackApi.showToast({title: name+'商品最少购买'+priceObject.minOrderNum+'份'});
	      			} else {
	      				tmpArr.push({id: id, categoryId:categoryId, name: name, priceObject: priceObject, count: 1 });
	      			}
	      		}	  		
	        }
	      	console.log(tmpArr);
	      	this.setData({
		 		// choice:false,
				selectFoods: tmpArr,
				maskShow:false
		 	});
	    }
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
		console.log(food);
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
				              		item.count -= 1;
				                } else {
						        	tmpArr.splice(index, 1);
						      	}
							}
						} else {
							if (item.count > 1) {
			              		if (item.priceObject.minOrderNum === item.count) {
									tmpArr.splice(index, 1);
									feedbackApi.showToast({title: item.name+'商品最少购买'+item.priceObject.minOrderNum+'份'});
			              		} else {
			              			item.count -= 1;
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
	        console.log(isNum);
	        if (isNum === 1 && !isNumstatus) {
	        	tmpArr.map((item,index)=>{
	        		if (item.id === id) {
	        			if (item.count > 1) {
		              		if (item.priceObject.minOrderNum === item.count) {
								tmpArr.splice(index, 1);
								feedbackApi.showToast({title: item.name+'商品最少购买'+item.priceObject.minOrderNum+'份'});
		              		} else {
		              			item.count -= 1;
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
				maskShow:false,
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
	    let cateno = e.currentTarget.dataset.cateno;
	    this.setData({
		    currentCateno: cateno,
		    rightToView: 'r_' + cateno,
	      	leftScrollClick: true
	    });
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
      		path: "/pages/shop/shop?merchantid=" + this.data.merchantId,
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