const { wxRequest, format} = require('../../utils/util.js');
const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
const app = getApp();
Page({
	data:{
		agentId:null,
		isDisable:false,
		totalPrice:0,
		discountAmt:0,
		discountGoodsDiscountAmt: 0, //订单优惠价格
		orderMessage: {},    //订单信息
		addressInfo:null,    //用户订单地址信息
		addressInfoId:null,
		deliveryTimes:[],    //配送时间信息
		expectedArrivalTime:1,

		redBagUsableCount:0,    //可用商家红包个数
		redBagList:[],          //可用的商家红包列表
		useRedBagList:null,       //本次订单使用的商家红包列表
		select:true,                //商家红包使用状态
		redBagMoney:0,               //商家红包使用金额
		redText:'暂无可用红包',      

		platformRedBagList:[],  //可用的平台红包列表  
		disabledPlatformRedBagList:[], //不可用的平台红包列表   
		usePlatformRedBagList:null,       //本次订单使用的平台红包列表
		platformSelect:true,        //平台红包使用状态
		platformRedBagMoney:0,       //平台红包使用金额
		platformRedBagCount:0,  //可使用的平台红包个数
		platformRedText:'无可用红包',

		promoInfoJson:[],       //本次订单参与的商家活动json  不明字段
		day:'',
		initTime:'',
		timeIndex:0,
		sendTime:[],
		timeArr:[],
		payIndex:0,
		payList:[],
		redPackage:[],       //红包信息
		remarks: '',          //备注信息
		maskShow:false,
		timePageShow:false,
		isOpenOrderMenu:false   //控制订单商品展开显示
	},
	onLoad(options){
		let { merchantId } = options;
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
	    console.log(prevPage.data.value);
	    this.setData({
	    	merchantId:merchantId,
			orderMessage:prevPage.data.value,
			totalPrice:prevPage.data.value.totalPrice,
			discountAmt:prevPage.data.value.discountAmt,
			discountGoodsDiscountAmt:prevPage.data.value.discountGoodsDiscountAmt,
			addressInfo:prevPage.data.value.addressInfo,
			addressInfoId:prevPage.data.value.addressInfo ? prevPage.data.value.addressInfo.id : null,
			agentId:prevPage.data.value.agentId,
			promoInfoJson:prevPage.data.value.promoList,
			redBagUsableCount:prevPage.data.value.redBagUsableCount,
			payList:prevPage.data.value.payments,
			deliveryTimes:prevPage.data.value.deliveryTimes,
			initTime:prevPage.data.value.deliveryTimes[0].times[0]['1'],
			timeArr:prevPage.data.value.deliveryTimes[0].times[0]
		});
		let arr = prevPage.data.value.deliveryTimes[this.data.timeIndex].times;
		let sendTime = [];
		for (let i = 0; i < arr.length; i++) {
			let result = Object.keys(arr[i]);
			for (let i = 0; i < result.length; i++) {
				sendTime.push(result[i]);
			}
		}
		this.setData({
			sendTime:sendTime,
			timeArr:arr
		});
		if (typeof this.data.initTime === 'undefined') {
			let expectedArrivalTime = sendTime[0];
			let initTime = arr[0][expectedArrivalTime];
			this.setData({
				initTime:initTime,
				expectedArrivalTime:expectedArrivalTime
			});
		}
		if (app.globalData.agentId == this.data.agentId) {
			
		}
		this.filterUsableRedBagList();
		this.queryPlatformRedBagList();
	},
	onShow(){
		if (this.data.useRedBagList != null || this.data.addressInfoId != null || this.data.usePlatformRedBagList != null) {
			let redBagMoney = 0;
			let platformRedBagMoney = 0;
			this.orderPreview().then(res=>{
				if (res.data.code === 0) {
					let orderMessage = res.data.value;
					let addressInfo = res.data.value.addressInfo;
					this.setData({
						orderMessage:orderMessage,
						addressInfo:addressInfo
					});
				}
	        }).finally(()=>{
	        	wx.hideLoading();
	        });
	        if (this.data.addressInfoId != null && this.data.usePlatformRedBagList === null) {
	        	this.queryPlatformRedBagList();
	        }
	        if (this.data.useRedBagList != null) {
	        	this.data.useRedBagList.map(item=>{
					redBagMoney += item.amt;
				});
				this.setData({
					redBagMoney:redBagMoney
				});
	        }
	        if (this.data.usePlatformRedBagList != null) {
	        	this.data.usePlatformRedBagList.map(item=>{
					platformRedBagMoney += item.amt;
				});
				this.setData({
					platformRedBagMoney:platformRedBagMoney
				});
	        }		
		}
	},
	//获取商家可用红包
	filterUsableRedBagList(){
		wxRequest({
        	url:'/merchant/userClient?m=filterUsableRedBagList',
        	method:'POST',
        	data:{
        		token:app.globalData.token,
        		params:{
        			itemsPrice: this.data.orderMessage.itemsPrice,
					merchantId: this.data.merchantId,
					latitude: -1,
					longitude: -1,
					discountGoodsDiscountAmt:this.data.orderMessage.discountGoodsDiscountAmt,
					promoInfoJson: JSON.stringify(this.data.promoInfoJson)
        		}	
        	},
        }).then(res=>{
        	console.log(res);
			if (res.data.code === 0) {
				let valueList = res.data.value;
				valueList.map(item=>{
					item.selectStatus = false;
					item.expirationTime = format(item.expirationTime,'-'); 
				});
				this.setData({
					redBagList:valueList
				});	
			} else {
				let msg = res.data.value;
				feedbackApi.showToast({title: msg});
			}
        });
	},
	//获取平台可用红包
	queryPlatformRedBagList(){
		wxRequest({
        	url:'/merchant/userClient?m=queryPlatformRedBagList',
        	method:'POST',
        	data:{
        		token:app.globalData.token,
        		params:{
        			itemsPrice: this.data.orderMessage.itemsPrice,
					merchantId: this.data.merchantId,
					userAddressId:this.data.addressInfoId,
					agentId:app.globalData.agentId,
					promoInfoJson: JSON.stringify(this.data.promoInfoJson),
					businessType:1,
					discountGoodsDiscountAmt:this.data.orderMessage.discountGoodsDiscountAmt
        		}	
        	},
        }).then(res=>{
        	console.log(res);
			if (res.data.code === 0) {
				console.log(res);
				let platformRedBagAvailableList = res.data.value.platformRedBagAvailableList;    //不可使用的平台红包
				let platformRedBagList = res.data.value.platformRedBagList;      //可使用的平台红包
				let platformRedBagCount = res.data.value.platformRedBagCount;      //可使用的平台红包个数
				platformRedBagAvailableList.map(item=>{
					item.lookReason = false;
				});
				this.setData({
					disabledPlatformRedBagList:platformRedBagAvailableList,
					platformRedBagCount:platformRedBagCount,
					platformRedBagList:platformRedBagList
				});
			} else {
				let msg = res.data.value;
				feedbackApi.showToast({title: msg});
			}
        });
	},
	// 选择时间
	selectData(e){
		let { index } = e.currentTarget.dataset;
		let arr = this.data.deliveryTimes[index].times;
		let day = this.data.deliveryTimes[index].day;
		let sendTime = [];
		for (let i = 0; i < arr.length; i++) {
			let result = Object.keys(arr[i]);
			for (let i = 0; i < result.length; i++) {
				sendTime.push(result[i]);
			}
		}
		this.setData({
			sendTime:sendTime,
			timeArr:arr,
			timeIndex:index,
			day:day
		});
	},
	selectSendTime(e){
		let { time, index } = e.currentTarget.dataset;
		let initTime = this.data.timeArr[index][time];
		this.data.expectedArrivalTime = time;
		if (this.data.timeIndex === 0) {
			this.setData({
				initTime:initTime,
				maskShow:false,
				timePageShow:false
			});
		} else {
			this.data.initTime = '';
			initTime = this.data.day + initTime;
			console.log(initTime)
			this.setData({
				initTime:initTime,
				maskShow:false,
				timePageShow:false
			});
		}
	},
	close(){
		this.setData({
			maskShow:false,
			timePageShow:false
		});
	},
	openTime(){
		this.setData({
			maskShow:true,
			timePageShow:true
		});
	},
	//订单商品展开显示隐藏
	openOrderMenu(){
		this.setData({
			isOpenOrderMenu:!this.data.isOpenOrderMenu
		});
	},
	//请求地址
	findUserAddress(){
		wx.navigateTo({
  			url: '/pages/address/receiving/receiving?merchantId='+this.data.merchantId
		});
	},
	//支付方式改变时触发
	bindPayChange(e){
		let payIndex = parseInt(e.detail.value)
		if (payIndex === this.data.payIndex) return
	    if (payIndex === 0) {
			this.setData({
				payIndex:payIndex,
			});
			this.orderPreview().then(res=>{
				if (res.data.code === 0) {
					let orderMessage = res.data.value
					this.setData({
						orderMessage:orderMessage
					})
				}
	        }).finally(()=>{
	        	wx.hideLoading()
	        });	
	    }
	    if (payIndex === 1) {
	    	this.setData({
				payIndex:payIndex,
			});
			this.orderPreview().then(res=>{
				if (res.data.code === 0) {
					let orderMessage = res.data.value
					this.setData({
						orderMessage:orderMessage
					})
				}
	        }).finally(()=>{
	        	wx.hideLoading()
	        	feedbackApi.showToast({title:'货到付款无法享受优惠活动'});
	        });
	    }
	},
	platformRedPage(){
		// 不可与商家优惠代金券同时使用
		if (this.data.useRedBagList && this.data.useRedBagList.length != 0) {
			if (this.data.orderMessage.redBagSharedRelation == 0) {    //不共享
				feedbackApi.showToast({title:'不可与商家优惠代金券同时使用'});
				return false;
			}
		}
		wx.navigateTo({
  			url: '/goods/redbag/platformRedbag/platformRedbag?merchantId='+this.data.merchantId+'&itemsPrice=' +this.data.orderMessage.totalPrice
		});
	},
	merchantRedPage(){
		if (this.data.usePlatformRedBagList && this.data.usePlatformRedBagList.length != 0) {
			if (this.data.orderMessage.redBagSharedRelation == 0) {    //不共享
				feedbackApi.showToast({title:'不可与平台红包优惠同时使用'});
				return false;
			}
		}
		wx.navigateTo({
  			url: '/goods/redbag/merchantRedbag/merchantRedbag?merchantId='+this.data.merchantId+'&itemsPrice=' +this.data.orderMessage.totalPrice
		});
	},
	//确认订单
	postOrder(){
		let orderItems = [];
		let that = this;
		if (!this.data.addressInfo) {
			feedbackApi.showToast({title:'收货地址不能为空'});
			return;
		}
		if (!this.data.isDisable) {
			wx.showLoading({
		        title: '正在提交订单',
		        mask: true
		    });
			this.data.isDisable = true;
			let orderUseRedBagList = [];
			if (this.data.useRedBagList) {
				this.data.useRedBagList.map(item=>{
					let json = {}
					json.id = item.id;
					json.amt = item.amt;
					json.name = item.name;
					json.promotionType = item.promotionType
					orderUseRedBagList.push(json)
				})
			}
			if (this.data.usePlatformRedBagList) {
				this.data.usePlatformRedBagList.map(item=>{
					let json = {}
					json.id = item.id;
					json.amt = item.amt;
					json.name = item.name;
					json.promotionType = item.promotionType
					orderUseRedBagList.push(json)
				})
			}
			let data = {
				loginToken:app.globalData.token,
				expectedArrivalTime:this.data.expectedArrivalTime,
				merchantId:this.data.merchantId,
				orderPayType:this.data.payIndex+1,
				userAddressId:this.data.addressInfo.id,
				userId:this.data.orderMessage.userId,
				caution:this.data.remarks,
				redBags:orderUseRedBagList.length === 0 ? null : orderUseRedBagList
			};
			data.orderItems = this.data.orderMessage.orderItems;
			wxRequest({
	        	url:'/merchant/userClient?m=orderSubmit2',
	        	method:'POST',
	        	data:{
	        		params:{
	        			data:JSON.stringify(data),
	        			longitude:app.globalData.longitude,
	        			latitude:app.globalData.latitude,	
	        		},
	        		token:app.globalData.token	
	        	},
	        }).then(res=>{
	        	console.log(res);
	        	if (res.data.code === 0) {
	        		let orderId = res.data.value.id;
	        		let price = res.data.value.totalPrice;
	        		console.log(price)
	        		if (res.data.value.paymentType ===1) {
	        			let merchantId = this.data.merchantId;
		                let shoppingCart = wx.getStorageSync('shoppingCart');
		                if (shoppingCart[merchantId]) {
		                  shoppingCart[merchantId] = []
		                }
                		wx.setStorageSync('shoppingCart',shoppingCart);
	        			wx.navigateTo({
					  		url: '/goods/pay/pay?orderId=' + orderId + '&price=' + price + '&merchantId=' + this.data.merchantId,
						});
	        		} 
	        		if (res.data.value.paymentType ===2){
	        			let merchantId = this.data.merchantId;
		                let shoppingCart = wx.getStorageSync('shoppingCart');
		                if (shoppingCart[merchantId]) {
		                  shoppingCart[merchantId] = [];
		                }
	        			setTimeout(()=> {
	        				wx.redirectTo({
		                    	url: '/pages/goods/cartDetail/cartDetail?orderid='+orderId,
                  			});
	        			},1000);
	        		}
	        	} else {
	        		let msg = res.data.value;
	        		feedbackApi.showToast({title:msg});
	        	}	
	        }).finally(()=>{
	        	wx.hideLoading();
	        	this.data.isDisable = false;
	        });
		}
	},
	//编辑地址页面
	editAddress(e){
		wx.navigateTo({
			url: '/pages/address/add/add?item='+JSON.stringify(this.data.addressInfo)
		}); 
	},
	//请求订单
	orderPreview(){
		wx.showLoading({
	        title: '正在更新订单',
	        mask: true
	    });
	    let orderUseRedBagList = []
	    if (this.data.useRedBagList) {
			this.data.useRedBagList.map(item=>{
				let json = {}
				json.id = item.id;
				json.amt = item.amt;
				json.name = item.name;
				json.promotionType = item.promotionType
				orderUseRedBagList.push(json)
			})
		}
		if (this.data.usePlatformRedBagList) {
			this.data.usePlatformRedBagList.map(item=>{
				let json = {}
				json.id = item.id;
				json.amt = item.amt;
				json.name = item.name;
				json.promotionType = item.promotionType
				orderUseRedBagList.push(json)
			})
		}
		let orderItems = [];
		let data = {loginToken:app.globalData.token,userId:app.globalData.userId,merchantId:this.data.merchantId};
		data.orderItems = this.data.orderMessage.orderItems;
		data.redBags = orderUseRedBagList.length === 0 ? null : orderUseRedBagList;
		data.orderPayType = this.data.payIndex+1;
		data.userAddressId = this.data.addressInfoId
		return wxRequest({
        	url:'/merchant/userClient?m=orderPreview2',
        	method:'POST',
        	data:{
        		params:{
        			data:JSON.stringify(data),
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude
        		},
        		token:app.globalData.token	
        	},
        })
	}
});
