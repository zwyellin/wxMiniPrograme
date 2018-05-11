const { wxRequest, format } = require('../../utils/util.js');
const app = getApp();
Page({
	data:{
		isDisable:0,   //默认0，0（可用）1（不可用）
		redBagList:[],
	},
	onLoad(){
		this.findUserRedBagListNew();
	},
	findUserRedBagListNew(){
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		wxRequest({
        	url:'/merchant/userClient?m=findUserRedBagListNew',
        	method:'POST',
        	data:{
        		token:app.globalData.token,
        		params:{
        			isDisabled:0
        		}	
        	},
        }).then(res=>{
        	console.log(res);
			if (res.data.code === 0) {
				let valueList = res.data.value;
				valueList.map((item)=>{
					item.modifyTime = item.modifyTime.replace(/-/g,'/');
					item.modifyTime = new Date(item.modifyTime).getTime();
					item.modifyTime = format(item.modifyTime,".");
					item.expirationTime = format(item.expirationTime,".");
				});
				this.setData({
					redBagList:valueList
				});	
			}
        }).finally(()=>{
        	wx.hideLoading();
        });
	},
	selectTab(e){
		let { id } = e.currentTarget.dataset;
		wx.redirectTo({
		  url: '/pages/shop/shop?merchantid=' + id
		});
	}
});