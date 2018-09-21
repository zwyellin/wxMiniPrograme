const app = getApp();
const { wxRequest, format } = require('../../../utils/util.js');
Page({
	data:{
		size:20,
		start:0,
		userList:[],
		windowScrollHeight:null,
		cashbackAmtSum:0
	},
	onLoad(){
		this.findInviterCodeUrl()
		this.setData({
			windowScrollHeight:app.globalData.windowHeight,
		})
	},
	findInviterCodeUrl(){
		wxRequest({
	    	url:'/merchant/userClient?m=findUserListAndCashbackAmtSum',
	    	method:'POST',
	    	data:{
	    		token: app.globalData.token,
	    		params:{
	    			size:this.data.size,
					start:this.data.start	
	    		}
	    	},
	    }).then(res=>{
			if (res.data.code === 0) {
				let userList = res.data.value.userList;
				let cashbackAmtSum = res.data.value.cashbackAmtSum;
				userList.map((item)=>{
					item.mobile = item.mobile.toString();
      				item.mobile = item.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      				item.regTime = item.regTime.replace(/-/g, '/')
      				item.regTime = new Date(item.regTime).getTime();
      				item.regTime = format(item.regTime,"-")
				})
				this.setData({
					cashbackAmtSum:cashbackAmtSum,
	      			userList:userList
	    		});
			}
	    });
	}
})