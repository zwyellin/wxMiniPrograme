const { wxRequest } = require('../../../utils/util.js');
const app = getApp();
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
Page({
	data:{
		address:[],
		windowHeight:0,
		merchantId:null
	},
	onLoad(options){
		this.setData({
			merchantId:options.merchantId,
			windowHeight:app.globalData.windowHeight
		});	
	},
	onShow(){
		this.findUserAddress();
	},
	findUserAddress(){
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		wxRequest({
        	url:'/merchant/userClient?m=findUserAddress',
        	method:'POST',
        	data:{
        		params:{
        			merchantId:this.data.merchantId
        		},
        		token:app.globalData.token	
        	},
        }).then(res=>{
        	if (res.data.code === 0) {
        		this.setData({
        			address:res.data.value
        		});
        	}
			console.log(res.data);
        }).finally(()=> {
        	wx.hideLoading();
        });	
	},
	editAddress(e){
		let { item } = e.currentTarget.dataset;
		if (item) {
			wx.navigateTo({
  				url: '/pages/address/add/add?item='+JSON.stringify(item)
			});
		} else {
			wx.navigateTo({
  				url: '/pages/address/add/add'
			});
		}	
	},
	selectAddress(e){
		let { item } = e.currentTarget.dataset;
		if (parseInt(item.overShipping) === 1) {
			wx.showModal({
                title: '提示',
                content: '所选地址已超出配送范围,点击确定您可重新编辑该地址',
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
  						url: '/pages/address/add/add?item='+JSON.stringify(item)
					});
                  } else if (res.cancel) {
                    console.log('用户点击取消');
                  }
                }
            });
		} else {
			let pages = getCurrentPages();
	    	let prevPage = pages[pages.length - 2];
	    	prevPage.setData({
  				addressInfoId:item.id
		 	});
			wx.navigateBack({
		  		delta: 1
			});
		}	
	}
});