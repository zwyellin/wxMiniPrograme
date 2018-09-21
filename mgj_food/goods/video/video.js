const { wxRequest } = require('../../utils/util.js');
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const app = getApp();
Page({
	data:{
		merchantVideo:[]
	},
	onLoad() {
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
		this.setData({
			merchantVideo:prevPage.data.itemList.visualRestaurantList
		});	
	}
});