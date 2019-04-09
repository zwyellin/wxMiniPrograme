const app = getApp();
const { wxRequest, format } = require('../../../utils/util.js');
Page({
	data:{
		size:20,
		start:0,
		start0:0,
		start1:0,
		islistLast0:false,//判断是否列表0加载完
		islistLast1:false,//判断是否列表1加载完
		userList:[],
		userList0:[],
		userList1:[],
		windowScrollHeight:null,
		cashbackAmtSum:0,
		type:0,
		isInit:true,//用于分享结果列表，标识是不是第一次发送请求
		loading:false
	},
	onLoad(){
		this.findInviterCodeUrl();
		this.findInviteCashbackDetailList(0);
		this.findInviteCashbackDetailList(1);
		wx.getSystemInfo({
			success: (res)=> {
				this.setData({
					windowScrollHeight: res.windowHeight - 370*(app.globalData.windowWidth/750),//修复box-sizing带来的问题
				});
			}
		});
	},
	findInviterCodeUrl(){
		wxRequest({
	    	url:'/merchant/userClient?m=findUserListAndCashbackAmtSum',
	    	method:'POST',
	    	data:{
	    		token: app.globalData.token,
	    		params:{
	    			size:this.data.size,
						start:0
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
	      			// userList:userList
	    		});
			}
	    });
	},
	findInviteCashbackDetailList(type){
		this.setData({
			loading:true
		});
		if(type==0){
			this.data.start=this.data.userList0.length;
		}else{
			this.data.start=this.data.userList1.length;
		}
		wxRequest({
	    	url:'/merchant/userClient?m=findInviteCashbackDetailList',
	    	method:'POST',
	    	data:{
	    		token: app.globalData.token,
	    		params:{
	    			size:this.data.size,
						start:this.data.start,
						type:type
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
				if(type==0){
					this.data.userList0=this.data.userList0.concat(userList);
					if(userList.length<this.data.size){
						this.data.islistLast0=true;
					}
					this.setData({
								userList0:this.data.userList0,
								islistLast0:this.data.islistLast0
						});
				}else{
					this.data.userList1=this.data.userList1.concat(userList);
					if(userList.length<this.data.size){
						this.data.islistLast1=true;
					}
					this.setData({
								userList1:this.data.userList1,
								islistLast1:this.data.islistLast1
						});
				}
				// 如果是第一次发送请求
				if(this.data.isInit && type==0){
					this.setData({
						userList:this.data.userList0
					})
				}
			}
	    }).finally(()=>{
	    	this.setData({
					loading:false
    		});
	    	wx.hideLoading()
	    });
	},
	shareTypeTap(e){
		let {type}=e.target.dataset;
		// type 0 人人分利
		//type 1 分享返现
		if(type==0){
			this.setData({
				type,
				userList:this.data.userList0
			})
		}else{
			this.setData({
				type,
				userList:this.data.userList1
			})
		}
	},
	shareResultsScrolltolower(e){
		if(this.data.type==0 && this.data.islistLast0 || this.data.type==1 && this.data.islistLast1){
			console.log("加载完了,type:",this.data.type)
			 return;//加载完了则不再加载
		}
		this.findInviteCashbackDetailList(this.data.type);
	}


})