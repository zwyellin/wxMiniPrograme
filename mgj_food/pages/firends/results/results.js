const app = getApp();
const { wxRequest, format } = require('../../../utils/util.js');
Page({
	data:{
		show:false,
		size:20,
		start:0,
		userList:[],
		windowScrollHeight:null,
		cashbackAmtSum:0
	},
	onLoad(){
		this.findInviteCashbackDetailList()
	},
	findInviteCashbackDetailList(){
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
	    });
		wxRequest({
	    	url:'/merchant/userClient?m=findInviteCashbackDetailList',
	    	method:'POST',
	    	data:{
	    		token: app.globalData.token,
	    		params:{
	    			size:this.data.size,
					start:this.data.start	
	    		},
	    		versionCode: 46
	    	},
	    }).then(res=>{
			if (res.data.code === 0) {
				let userList = res.data.value;
				userList.map((item)=>{
					item.inviteeMobile = item.inviteeMobile.toString();
      				item.inviteeMobile = item.inviteeMobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
				})
				this.data.userList.concat(userList)
				this.setData({
					show:true,
	      			userList:userList
	    		});
			}
	    }).finally(()=>{
	    	wx.hideLoading()
	    });
	},
	onReachBottom(){
		this.data.start+= 10;
		this.getDataList();		
	},
})