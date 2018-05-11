const { wxRequest } = require('../../utils/util.js');
const app = getApp();
Page({
	data:{
		select:null,
		itemsPrice:0,
		redBagList:[],
		useRedBagList:[],       //本次订单使用的红包列表      
		promoInfoJson:[],
		merchantId:null
	},
	onLoad(){
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
		this.setData({
			redBagList:prevPage.data.redBagList,
			useRedBagList:prevPage.data.useRedBagList,
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
				useRedBagList.splice(index,1,item);
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