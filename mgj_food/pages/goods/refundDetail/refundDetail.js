const { wxRequest, formatTime } = require('../../../utils/util.js');
const app = getApp();

Page({
	data:{
		orderId:null,
		refundDetail:{}
	},
	onLoad(options){
		this.data.orderId = options.orderid;
		this.refundInfo()
	},
	refundInfo(){
		wx.showLoading({
          title: '加载中',
          mask: true
        });
		wxRequest({
	        url:'/merchant/userClient?m=refundInfo',
	        method:'POST',
	        data:{
	            token:app.globalData.token,
	            params:{
	                orderId:this.data.orderId,    
	            } 
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