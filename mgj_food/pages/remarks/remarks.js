const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
Page({
	data:{
		remarks:''
	},
	onShow(){
		let pages = getCurrentPages();
	  	let prevPage = pages[pages.length - 2];
	  	this.setData({
	  		remarks:prevPage.data.remarks
	  	})
	},
	bindTextAreaBlur(e){
      	let value = e.detail.value
      	this.data.remarks = value	
	},
	bindTextAreaOut(){
		if (this.data.remarks.length > 15) {
      		feedbackApi.showToast({title:'最多15个字符'});
      		return;
      	}
      	wx.showLoading({
			title:''
		})
     	let pages = getCurrentPages();
	  	let prevPage = pages[pages.length - 2];
	  	prevPage.setData({
	  		remarks:this.data.remarks
	  	})
	  	setTimeout(()=>{
			wx.navigateBack({
	  			delta: 1,
			});
			wx.hideLoading({
				title:''
			})
	  	}, 1000); 	
	}
})