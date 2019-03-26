const { wxRequest } = require('../../../utils/util.js');
const app = getApp();
Page({
	data:{
		select:null,
		currentTab:0,
		itemsPrice:0,
		redBagList:[],//红包列表
		disabledPlatformRedBagList:[],
		platformRedBagList:[],
		useRedBagList:[],       //本次订单使用的红包列表      
		promoInfoJson:[],
		merchantId:null
	},
	onLoad(){
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
		console.log("prevPage.data.redBagList",prevPage.data.redBagList);
		let redBagList=prevPage.data.redBagList;
		// 处理
		redBagList.forEach((item)=>{
			if(item.businessType==1){//类别：1外卖，6团购
				item.businessTypeText="外卖"
			}else if(item.businessType==6){
				item.businessTypeText="团购"
			}
		});
		this.setData({
			redBagList,
			disabledPlatformRedBagList:prevPage.data.disabledPlatformRedBagList,
			platformRedBagList:prevPage.data.platformRedBagList,
			useRedBagList:prevPage.data.useRedBagList || [],
			select:prevPage.data.select,
		});	
	},
	selectradio(e){
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
		let redBagList = this.data.redBagList;
		redBagList.map(item=>{
			item.selectStatus = false; 
		});
		prevPage.setData({
			redBagList:redBagList,
			useRedBagList:[],
			select:true,
		});
		wx.navigateBack({
		  	delta: 1
		});
	},
	reasonList(e){
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
		let redBagList = this.data.redBagList;
		let useRedBagList = this.data.useRedBagList;
		redBagList.map(item=>{
			item.selectStatus = false; 
		});
		redBagList[index].selectStatus = true;
		let isFound = false;
		useRedBagList.map((item,index)=>{
			if (item.promotionType === redBagList[index].promotionType) {
				useRedBagList.splice(index,1,redBagList[index]);
				isFound = true;
			}	
		});
		if (!isFound) {
			useRedBagList.push(redBagList[index]);
		}
		console.log(redBagList);
		prevPage.setData({
			redBagList:redBagList,
			useRedBagList:useRedBagList,
			select:false
		});
		wx.navigateBack({
		  	delta: 1
		});
	},
});