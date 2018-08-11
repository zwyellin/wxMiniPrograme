const { wxRequest, format } = require('../../utils/util.js');
const app = getApp();
Page({
	data:{
		show:false,
		isDisable:0,   //默认0，0（可用）1（不可用）
		redBagList:[],
		navbar: ['红包', '代金券'],
		currentTab: 0,
		reason:false,
		start:0,
		isDisabled:0,
		redEnvelopesObjct:{}
	},
	onLoad(){
		this.findUserRedBagListNew();
		this.reasonList();
		this.queryRedBagList()
	},
	navbarTap: function(e){
		this.setData({
		  currentTab: e.currentTarget.dataset.idx
		})
	  },
	reasonList(){
		this.setData({
			reason:!this.data.reason
		})
	},
	queryRedBagList(){
		wx.showToast({
			title: '加载中',
			icon: 'loading',
			duration: 200000,
			mask: true
		});
		wxRequest({
		  url:'/merchant/userClient?m=queryRedBagList',
		  method:'POST',
		  data:{
			token:app.globalData.token,
			params:{
			  start:this.data.start,
			  size:20,
			  redBagType:1,
			  isDisabled:this.data.isDisabled
			}
		  },
		}).then(res=>{
		  if(res.data.code === 0){
			let redEnvelopesObjct = res.data.value;
		   
			this.setData({
			  redEnvelopesObjct:redEnvelopesObjct,
			
			})
			
	
		  }
		}).finally(()=>{
		  wx.hideLoading()
		})
	
	  },
	findUserRedBagListNew(){
		wx.showToast({
	        title: '加载中',
	        icon: 'loading',
	        duration: 200000,
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
				valueList.map((item)=>{
					item.modifyTime = item.modifyTime.replace(/-/g,'/');
					item.modifyTime = new Date(item.modifyTime).getTime();
					item.modifyTime = format(item.modifyTime,".");
					item.expirationTime = format(item.expirationTime,".");
				});
				this.setData({
					redBagList:valueList
				});	
			}
        }).finally(()=>{
        	this.setData({
        		show:true
        	})
        	wx.hideLoading();
        });
	},
	selectTab(e){
		let { id } = e.currentTarget.dataset;
		wx.redirectTo({
		  url: '/pages/shop/shop?merchantid=' + id
		});
	}
});