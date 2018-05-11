const { wxRequest, format} = require('../../utils/util.js');
const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
const app = getApp();
Page({
	data:{
		isDisable:false,
		select:false,
		totalPrice:0,
		discountAmt:0,
		orderMessage: {},    //订单信息
		addressInfo:null,    //用户订单地址信息
		deliveryTimes:[],    //配送时间信息
		expectedArrivalTime:1,
		redBagUsableCount:0,    //可用红包个数
		redBagList:[],
		useRedBagList:[],       //本次订单使用的红包列表
		select:true,            //红包使用状态
		redBagMoney:0,
		promoInfoJson:[],       //本次订单使用的红包信息  不明字段
		day:'',
		initTime:'',
		timeIndex:0,
		sendTime:[],
		timeArr:[],
		payIndex:0,
		payList:[],
		redPackage:[],       //红包信息
		remarks: '',          //备注信息
		redText:'暂无可用红包',
		maskShow:false,
		timePageShow:false
	},
	onLoad(options){
		let { merchantId } = options;
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
	    console.log(prevPage.data.value)
	    this.setData({
	    	merchantId:merchantId,
			orderMessage:prevPage.data.value,
			totalPrice:prevPage.data.value.totalPrice,
			discountAmt:prevPage.data.value.discountAmt,
			addressInfo:prevPage.data.value.addressInfo,
			redBagUsableCount:prevPage.data.value.redBagUsableCount,
			payList:prevPage.data.value.payments,
			deliveryTimes:prevPage.data.value.deliveryTimes,
			initTime:prevPage.data.value.deliveryTimes[0].times[0]['1'],
			timeArr:prevPage.data.value.deliveryTimes[0].times[0]
		});
		console.log(typeof this.data.initTime)

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
			let expectedArrivalTime = sendTime[0]
			let initTime = arr[0][expectedArrivalTime]
			console.log(sendTime)
			this.setData({
				initTime:initTime,
				expectedArrivalTime:expectedArrivalTime
			})
		}
		this.filterUsableRedBagList();
	},
	onShow(){
		let redBagMoney = 0;
		this.data.totalPrice = this.data.orderMessage.totalPrice;
		this.data.discountAmt = this.data.orderMessage.discountAmt;
		this.data.useRedBagList.map(item=>{
			redBagMoney += item.amt;
		});
		let totalPrice = this.data.totalPrice - redBagMoney;
		let discountAmt = this.data.discountAmt + redBagMoney;
		this.setData({
			redBagMoney:redBagMoney,
			totalPrice:totalPrice,
			discountAmt:discountAmt
		});
	},
	//获取可用红包
	filterUsableRedBagList(){
		wxRequest({
        	url:'/merchant/userClient?m=filterUsableRedBagList',
        	method:'POST',
        	data:{
        		token:app.globalData.token,
        		params:{
        			itemsPrice: this.data.orderMessage.itemsPrice,
					merchantId: this.data.merchantId,
					promoInfoJson: this.data.promoInfoJson
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
		let totalPrice = 0
		let discountAmt = 0
		wx.showToast({
	        title: '正在更新订单',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
	    if (payIndex === 0) {
			let redBagMoney = 0;
			this.data.totalPrice = this.data.orderMessage.totalPrice;
			this.data.discountAmt = this.data.orderMessage.discountAmt;
			this.data.useRedBagList.map(item=>{
				redBagMoney += item.amt;
			});
			totalPrice = this.data.totalPrice - redBagMoney;
			discountAmt = this.data.discountAmt + redBagMoney;
	    }
	    if (payIndex === 1) {
			totalPrice = this.data.orderMessage.totalPrice + this.data.orderMessage.discountAmt;
	    }
	    setTimeout(()=>{
	    	this.setData({
				payIndex:payIndex,
				totalPrice:totalPrice,
				discountAmt:discountAmt
			});
			wx.hideLoading();
			if (payIndex === 1) {
				feedbackApi.showToast({title:'货到付款无法享受优惠活动'});
			}
	    },1500);
	},
	redPage(){
		if (!this.data.redBagUsableCount) return;
		wx.navigateTo({
  			url: '/pages/sendred/sendred?merchantId='+this.data.merchantId+'&itemsPrice=' +this.data.orderMessage.itemsPrice
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
			wx.showToast({
		        title: '正在提交订单',
		        icon: 'loading',
		        duration: 200000,
		        mask: true
		    });
			this.data.isDisable = true;
			let data = {
				loginToken:app.globalData.token,
				expectedArrivalTime:this.data.expectedArrivalTime,
				merchantId:this.data.merchantId,
				orderPayType:this.data.payIndex+1,
				userAddressId:this.data.addressInfo.id,
				userId:this.data.orderMessage.userId,
				caution:this.data.remarks,
				redBags:this.data.useRedBagList
			};
			data.orderItems = this.data.orderMessage.orderItems;
			wxRequest({
	        	url:'/merchant/userClient?m=orderSubmit',
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
	        		if (res.data.value.paymentType ===1) {
	        			wx.navigateTo({
					  		url: '/pages/pay/pay?orderId=' + orderId + '&price=' + price,
						});
	        		} 
	        		if (res.data.value.paymentType ===2){
	        			setTimeout(()=>{
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
});
