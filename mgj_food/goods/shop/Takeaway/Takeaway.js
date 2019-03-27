// goods/shop/Takeaway/Takeaway.js
let userDiscountGoodsList = [];//保存折扣商品每个客户最多买的请求返回值
let discountGoodsIdList = [];//这里是保存折扣商品每个客户最多买的商品id
const DiscountGoodsMaxRequest=20;//折扣商品每个客户最多买的数组最大数。如果大于该数，则不一次性发请求
const app = getApp();
const feedbackApi = require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const { wxRequest, Promise } = require('../../../utils/util.js');
const { merchantShop } = require('../../template/shop/merchantShop.js');

let WxParse = require('../../../wxParse/wxParse.js');//富文本

Page(Object.assign({}, merchantShop,{
  /**
   * 页面的初始数据
   */
  data: {
		sharedUserId:null,
		// 方式一：通过商品id，请求商品数据，再加载商家信息（ruleDtoList）
		// findMerchantInfo会设置方式二的那些属性
		goodsId:null,//商品id,

		// 方式二：读取上个页面信息，区别：这个方式返回商店时要共享数据
		//上页面或请求回来的数据
		// 【要共享购物车信息部分的属性】返回商店时渲染到商店页面
		// 要共享回去的数据selectFoods，listFoods，totalprice，totalcount,fullPrice
		selectedFood:{}, //某一商品详情。在这里是页面要显示的商品数据
    merchantInfoObj:null,
		merchantId:null,
			// 以下为购物车信息
		selectFoods:[],  //添加进购物车里的商品
		listFoods:[],			//点购物车展开的购买了的列表
		minPrice:0,       //商家起送价
			//以下为购物车满减部分信息 
		ruleDtoList:null,//活动规则，用于计算总价
		fullPrice:{},			//满减
    totalprice:0,    //购买商品总价
    totalcount:0,   //购买商品总个数
		isTogether:false,  //控制去凑单按钮的显示与隐藏
			// 以下为去凑单需要用的对象
		removalMenuList:{},


		WXQRImage:"data:image/png;base64,",//店家二维码
		QRcode_mask_show:false,
		
		// 评价
		selestEvaluateStatus:0,
		evaluate:{},
		evaluateList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let {goodsId,sharedUserId}=options;
		this.data.sharedUserId=sharedUserId;
    //分享传goodsId,商店进来则读取其selectedFood。
    if(goodsId!==undefined){//分享进来的 //goodsId!==undefined
			//根据goodsId发送请求
			this.data.goodsId=goodsId;
			this.findTGoodsById().then(()=>{
				console.log("ruleDtoList",this.data.ruleDtoList)
				this.findMerchantInfo();

				this.queryGoodsComments();
				this.getMGJMerchantWXQRImage();
				this.showTakeAwayGoodsDetail();
			});
    }else{
      // 从上一页面读取数据。要显示的是selectedFood
			this.getPrevData();
    }
  },
	onUnload(){
		// 店铺进来，是返回回去商家。触发onunload来共享这边数据
		// 分享进来，是重定向到商家。传参过去
		// 要共享回去的数据selectFoods，listFoods，totalprice，totalcount,fullPrice
		// 及sharedUserId
		let shareTakeawayData={};
		var pages = getCurrentPages();
		if(pages.length>1){//店铺进来德，而非分享进来德
			var prevPage = pages[pages.length - 2]; // 上一级页面
			shareTakeawayData={
				selectFoods:this.data.selectFoods,
				listFoods:this.data.listFoods,
				totalprice:this.data.totalprice,
				totalcount:this.data.totalcount,
				fullPrice:this.data.fullPrice,
				sharedUserId:this.data.sharedUserId
			}
			prevPage.data.shareTakeawayData=shareTakeawayData;//设置上一页面数据
			// 那边onshow时会判断
		}
	},
	// 进店按钮点击事件
	gotoShopBtnTap(e){
		// 分享进来，是重定向到商家。传参过去
		// 要共享回去的数据selectFoods，listFoods，totalprice，totalcount,fullPrice
		let shareTakeawayData={};
		shareTakeawayData={
			selectFoods:this.data.selectFoods,
			listFoods:this.data.listFoods,
			totalprice:this.data.totalprice,
			totalcount:this.data.totalcount,
			fullPrice:this.data.fullPrice,
			sharedUserId:this.data.sharedUserId
		}
		wx.showToast({
			title:"正在跳转",
			icon:"loading",
			mask:true,
			duration:20000
		})
		wx.setStorageSync('shareTakeawayData',shareTakeawayData);
		wx.redirectTo({
			url:`/goods/shop/shop?merchantid=${this.data.selectedFood.merchantId}&sharedUserId=${this.data.sharedUserId}`,
			success:()=>{
				wx.hideToast();
			}
		})
	},
	// 分享
	onShareAppMessage(res) {
		return {
				title:this.data.selectedFood.name ,
				path: '/goods/shop/Takeaway/Takeaway?goodsId='+ this.data.selectedFood.id+'&sharedUserId='+app.globalData.userId,
		};
  },
	
	// 从上一页面读取
  getPrevData(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; // 上一级页面
    if (/goods\/shop\/shop/.test(prevPage.route)) {//商店。这边没有区分商店搜索页
      // 获取商家信息
      let selectedFood=prevPage.data.selectedFood;//要显示的商品
      let selectFoods=prevPage.data.selectFoods;//全部选择了的商品
      let merchantInfoObj=prevPage.data.merchantInfoObj;//商家信息
      let ruleDtoList=prevPage.data.ruleDtoList;
			let {totalcount,totalprice,minPrice,listFoods,merchantId,isTogether,fullPrice,removalMenuList}=prevPage.data;
			// 修改选择了的商品对象
			selectedFood=this._modifySelectFoods(selectedFood);
      this.setData({
        selectedFood,//商品对象
        merchantInfoObj,//渲染需要
				merchantId,
				// 以下为购物车信息
				selectFoods,
				listFoods,
				minPrice,
				// 以下为购物车满减部分信息
				ruleDtoList,
				totalprice,
				totalcount,
				isTogether,
				fullPrice,
				// 以下为去凑单需要用的对象
				removalMenuList
			},()=>{
				this.getMGJMerchantWXQRImage();
				this.queryGoodsComments();
				this.showTakeAwayGoodsDetail();
			})
    }
	},
	 _modifySelectFoods(value){
		// 修改imgs
		let imgs=value.imgs;
		let images=[];
		if(imgs!=null && imgs!=""){
			if(imgs.indexOf(";")==-1) images.push(imgs);
			else{
				images=imgs.split(';')
			}
		}
		value.images=images;
		return value;
	},

		// 请求商品
		findTGoodsById(){
			return wxRequest({
				url:'/merchant/userClient?m=findTGoodsById',
				method:'POST',
				data:{
					params:{
						goodsId: this.data.goodsId
					}	
				}
			}).then(res=>{
				if(res.data.code==0){
					let selectedFood=this._modifySelectFoods(res.data.value);
					this.setData({
						selectedFood
					})
					this.data.merchantId=selectedFood.merchantId
				}
			})
		},

	//富文本
	showTakeAwayGoodsDetail(){
		return wxRequest({
			url:'/merchant/userClient?m=showTakeAwayGoodsDetail',
			method:'POST',
			data:{
				params:{
					goodsId: this.data.selectedFood.id
				}	
			}
		}).then(res=>{
			if(res.data.code==0){
				let that = this;
				WxParse.wxParse('goodsInfo', 'html', res.data.value.data, that, 5);
				console.log(res.value.data)
			}
		})
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

  //选择商品大小价格
	choicespec(e){
		let { index, taste } = e.currentTarget.dataset;
		this.setData({
			price:taste.price,
			specIndex:index,
		});
  },
  //选规格
  choice(e){
		this.maskShowAnimation();
		this.choiceShowAnimation();
		let { food, parentIndex } = e.currentTarget.dataset;
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
	// 关闭去凑单
	boosList(){
		this.setData({
			isShowTogether:false
		});
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
        			longitude:app.globalData.longitude || '1',
							latitude:app.globalData.latitude || '1'
        		},
        		token:app.globalData.token	
        	},
        });	
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

	// 二维码
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
			let WXQRImage=this.data.WXQRImage;
			WXQRImage+=res.data.value;
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
	
}))