const { wxRequest, formatTime } = require('../../../utils/util.js');
const app = getApp();
// 外卖和团购共享
Page({
	data:{
		orderId:null,
		groupPurchaseOrderCouponCodeId:null,//团购
		refundDetail:{}
	},
	onLoad(options){
		let {orderid:orderId,type=1,groupPurchaseOrderCouponCodeId}=options;
		Object.assign(this.data,{
			orderId,
			type,
			groupPurchaseOrderCouponCodeId
		})
		if(type==1){//外卖
			this.refundInfo(1);
		}else if(type==6){//团购
			this.refundInfo(6);
		}
	},
	refundInfo(type){
		wx.showLoading({
          title: '加载中',
          mask: true
		});
		let params={};
		if(type==1){
			params={
				orderId:this.data.orderId
			}
		}else if(type==6){
			params={
				orderId:this.data.orderId,
				groupPurchaseOrderCouponCodeId:this.data.groupPurchaseOrderCouponCodeId
			}
		}
		wxRequest({
	        url:'/merchant/userClient?m=refundInfo',
	        method:'POST',
	        data:{
	            token:app.globalData.token,
	            params:params
	        },
        }).then(res=>{
			if (res.data.code === 0) {
				this.setData({
					refundDetail:res.data.value
				})
			}
        }).finally(()=>{
        	wx.hideLoading()
        })
	}
});