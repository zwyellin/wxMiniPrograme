const { wxRequest } = require('../../../utils/util.js');
const app = getApp();
Page({
	data:{
		platformSelect:null,
		currentTab:0,
		itemsPrice:0,
		redBagList:[],
		disabledPlatformRedBagList:[],
		platformRedBagList:[],
		usePlatformRedBagList:[],       //本次订单使用的平台红包列表      
		promoInfoJson:[],
		merchantId:null
	},
	onLoad(){
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
		this.setData({
			disabledPlatformRedBagList:prevPage.data.disabledPlatformRedBagList,
			platformRedBagList:prevPage.data.platformRedBagList,
			usePlatformRedBagList:prevPage.data.usePlatformRedBagList || [],
			platformSelect:prevPage.data.platformSelect,
		});	
	},
	selectradio(e){
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
		let platformRedBagList = this.data.platformRedBagList;
		platformRedBagList.map(item=>{
			item.selectStatus = false; 
		});
		prevPage.setData({
			platformRedBagList:platformRedBagList,
			usePlatformRedBagList:[],
			platformSelect:true,
		});
		wx.navigateBack({
		  	delta: 1
		});
	},
	reasonList(e) {
		let { index } = e.currentTarget.dataset;
		if (this.data.disabledPlatformRedBagList[index].lookReason) {
			this.data.disabledPlatformRedBagList[index].lookReason = false;
			this.setData({
				disabledPlatformRedBagList:this.data.disabledPlatformRedBagList
			});
		} else {
			this.data.disabledPlatformRedBagList[index].lookReason = true;
			this.setData({
				disabledPlatformRedBagList:this.data.disabledPlatformRedBagList
			});
		}
	},
	selectTab(e){
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
		let { index } = e.currentTarget.dataset;
		let platformRedBagList = this.data.platformRedBagList;
		let usePlatformRedBagList = this.data.usePlatformRedBagList;
		platformRedBagList.map(item=>{
			item.selectStatus = false; 
		});
		platformRedBagList[index].selectStatus = true;
		let isFound = false;
		usePlatformRedBagList.map((item,idx)=>{
			if (item.promotionType === platformRedBagList[index].promotionType) {
				usePlatformRedBagList.splice(idx,1,platformRedBagList[index]);
				isFound = true;
			}	
		});
		if (!isFound) {
			usePlatformRedBagList.push(platformRedBagList[index]);
		}
		prevPage.setData({
			platformRedBagList:platformRedBagList,
			usePlatformRedBagList:usePlatformRedBagList,
			platformSelect:false
		});
		wx.navigateBack({
		  	delta: 1
		});
	},
});