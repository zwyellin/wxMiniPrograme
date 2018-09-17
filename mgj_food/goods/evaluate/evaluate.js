const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
const { wxRequest } = require('../../utils/util.js'); 
const app = getApp();
Page({
	data:{
		orderId:null,
		timeList:['10分钟','20分钟','30分钟','40分钟','50分钟','60分钟','70分钟','80分钟','90分钟','100分钟','120分钟'],
		timeIndex:0,
		size:48,
		orderObject:{},
		orderItems:[],
		merchantScore:0,      //商家评价
		merchantComments:'',
		deliverymanScore:0    //骑手评价
	},
	onLoad(options){
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
	    let orderObject = prevPage.data.orderDetail;
	    let orderItems = orderObject.orderItems;
	    let orderId = orderObject.id;
	    console.log(orderId)
	    orderItems.map((item)=>{
	    	item.goodsScore = 0
	    })
	    this.setData({
	    	orderObject:prevPage.data.orderDetail,
	    	orderItems:orderItems,
	    	orderId:orderId
	    })
	},
	bindTimeChange(e){
		this.setData({
			timeIndex:e.detail.value
		});
	},
	starNum(e){
		let { index, evaluate } = e.currentTarget.dataset;
		let orderItems = this.data.orderItems
		console.log(evaluate)
		if (evaluate==='merchantScore') {
			console.log(1)
			this.setData({
				merchantScore:index+1
			})
		} else if (evaluate==='deliverymanScore') {
			console.log(1)
			this.setData({
				deliverymanScore:index+1
			});
		} else {
			orderItems.map((item)=>{
			 	if (item.goodsId === evaluate) {
			 		item.goodsScore = index+1
			 	}	
	    	});
			this.setData({
				orderItems:orderItems
			});
		}
	},
	postEvaluate(){
		if (this.data.merchantScore === 0) {
			feedbackApi.showToast({title: '请为商家数星星'});
			return;
		}
		if (this.data.deliverymanScore === 0) {
			feedbackApi.showToast({title: '请为骑手数星星'});
			return;
		}
		let goodsComments = [];
		let orderItems = this.data.orderItems;
		let len = orderItems.length;
		let flag = false;
		for (var i = 0; i < len; i++) {
			let json = {};
			if (orderItems[i].goodsScore === 0) {
				feedbackApi.showToast({title: '请为商品评价'});
				flag = true;
				break;
			}
			json.goodsId = orderItems[i].goodsId;
			json.goodsScore = orderItems[i].goodsScore;
			goodsComments.push(json);
		}
		if (flag) return;
		wx.showLoading({
	        title: '正在提交评价',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		wxRequest({
        	url:'/merchant/userClient?m=createOrderComments',
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		params:{
					orderId:this.data.orderId,
					merchantScore:this.data.merchantScore,
					deliverymanScore:this.data.deliverymanScore,
					deliveryCost:parseInt(this.data.timeList[this.data.timeIndex]),
					goodsComments:JSON.stringify(goodsComments)
        		}
        	}	
        }).then(res=>{
        	console.log(res)
			if (res.data.code === 0) {
				setTimeout(()=>{
					wx.switchTab({
  						url:'/pages/goods/cartItem/cartItem'
					})
				},1000)
				feedbackApi.showToast({title: '评价成功'});
			} else {
				let msg = res.data.value;
				feedbackApi.showToast({title: msg});
			}
        }).finally(()=>{
			wx.hideLoading();
        });
	}	
});