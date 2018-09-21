const { wxRequest, format } = require('../../utils/util.js');
const app = getApp();
Page({
	data:{
		show:false,
		isDisabled:0,   //默认0，0（可用）1（不可用）
		loading:false,
		redBagList:[],
		navbar: ['红包', '代金券'],
		currentTab: 0,
		reason:false,
		start:0,
		vouchersCount:0,
		platformRedBagCount:0,
		redEnvelopesObjct:{},
		platfromRedBagList:[]
	},
	onLoad(){
		this.queryRedBagList(false);
		// this.findUserRedBagListNew();
		this.reasonList();
	},
	navbarTap: function(e){
		if (e.currentTarget.dataset.idx == 0) {
			this.data.start = this.data.platfromRedBagList.length;
		} else {
			this.data.start = this.data.redBagList.length;
		}
		this.setData({
		  	currentTab: e.currentTarget.dataset.idx,
		  	loading:false
		});
		this.queryRedBagList(true);
  	},
	reasonList(){
		this.setData({
			reason:!this.data.reason
		});
	},
	queryRedBagList(isloadMore){
		if (!isloadMore) {
			wx.showLoading({
				title: '加载中',
				mask: true
			});
		}
		wxRequest({
		  	url:'/merchant/userClient?m=queryRedBagList',
		  	method:'POST',
		  	data:{
				token:app.globalData.token,
				params:{
			  		start:this.data.start,
			  		size:5,
			  		redBagType:1,
			  		isDisabled:this.data.isDisabled
				}
		  	},
		}).then(res=>{
			if(res.data.code === 0){
				if (this.data.currentTab == 0) {
					let nowPlatfromRedBagList = this.data.platfromRedBagList;
					let platfromRedBagList = res.data.value.platformRedBagList;
					let platformRedBagCount = res.data.value.platformRedBagCount;
					let vouchersCount = res.data.value.vouchersCount;
					nowPlatfromRedBagList = nowPlatfromRedBagList.concat(platfromRedBagList);
					if (platfromRedBagList.length === 0) {
						this.setData({
					  		platfromRedBagList:nowPlatfromRedBagList,
					  		platformRedBagCount:platformRedBagCount,
					  		vouchersCount:vouchersCount,
							loading:true
						});
					} else {
						this.setData({
					  		platfromRedBagList:nowPlatfromRedBagList,
					  		vouchersCount:vouchersCount,
					  		platformRedBagCount:platformRedBagCount,	
						});
					}
				} else {
					let nowRedBagList = this.data.redBagList;
					let vouchersList = res.data.value.vouchersList;
					let vouchersCount = res.data.value.vouchersCount;
					vouchersList.map((item)=>{
						item.modifyTime = item.modifyTime.replace(/-/g,'/');
						item.modifyTime = new Date(item.modifyTime).getTime();
						item.modifyTime = format(item.modifyTime,".");
						item.expirationTime = format(item.expirationTime,".");
					});
					nowRedBagList = nowRedBagList.concat(vouchersList);
					if (vouchersList.length == 0) {
						this.setData({
					  		redBagList:nowRedBagList,
					  		vouchersCount:vouchersCount,
							loading:true
						});
					} else {
						this.setData({
					  		redBagList:nowRedBagList,
					  		vouchersCount:vouchersCount	
						});
					}
				}	
			}
		}).finally(()=>{
			this.setData({
        		show:true
        	});
		  	wx.hideLoading();
		});
	},
	findUserRedBagListNew(){
		wx.showLoading({
	        title: '加载中',
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
				
				this.setData({
					redBagList:valueList
				});	
			}
        }).finally(()=>{
        	this.setData({
        		show:true
        	});
        	wx.hideLoading();
        });
	},
	selectTab(e){
		let { id } = e.currentTarget.dataset;
		wx.redirectTo({
		  url: '/goods/shop/shop?merchantid=' + id
		});
	},
	// 上拉加载更多
	onReachBottom(){
		if (this.data.currentTab == 0) {
			this.data.start = this.data.platfromRedBagList.length;
			this.queryRedBagList(true);
		} else {
			this.data.start = this.data.redBagList.length;
			this.queryRedBagList(true);
		}
	}
});