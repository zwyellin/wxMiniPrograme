const { wxRequest } = require('../../../utils/util.js');
const app = getApp();
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 

var timer=null;

Page({
	data:{
		address:[],
		windowHeight:0,
		merchantId:null,
		editIndex:0,
		delBtnWidth:100,
		
	},
	onLoad(options){
		this.setData({
			merchantId:options.merchantId,
			windowHeight:app.globalData.windowHeight,
			
		});	
	},
	onShow(){
		this.findUserAddress();
	},
	findUserAddress(){
		wx.showLoading({
	        title: '加载中',
	        mask: true
	    });
		wxRequest({
        	url:'/merchant/userClient?m=findUserAddress',
        	method:'POST',
        	data:{
        		params:{
        			merchantId:this.data.merchantId
        		},
        		token:app.globalData.token	
        	},
        }).then(res=>{
        	if (res.data.code === 0) {
        		this.setData({
        			address:res.data.value
        		});
        	}
			console.log(res.data);
        }).finally(()=> {
        	wx.hideLoading();
        });	
	},
	editAddress(e){
		let { item } = e.currentTarget.dataset;
		if (item) {
			wx.navigateTo({
  				url: '/pages/address/add/add?item='+JSON.stringify(item)
			});
		} else {
			wx.navigateTo({
  				url: '/pages/address/add/add'
			});
		}		
	},
	drawStart(e){//手指刚放到屏幕触发
		console.log(e.touches)
		if(e.touches.length == 1){
			this.setData({
				startX:e.touches[0].clientX
			})
		}
	},
	drawMove(e){//触发时触发，手指在屏幕上没移动一次，触发一次
		var index = e.currentTarget.dataset.index;
		var that = this;
		if (this.data.address[index].btnStyle == 'right:0px') return;
		if(e.touches.length == 1){
			var moveX = e.touches[0].clientX;
			var disX = that.data.startX - moveX;
			console.log(disX);
			var delBtnWidth = that.data.delBtnWidth;
			let txtStyle = "";
			let btnStyle= "";
			if(disX == 0 || disX < 0){
				txtStyle = "left:0px";
				btnStyle = "right:-100px";

			}else if(disX > 0){
				if (list[index].btnStyle == 'right:0px') return
				txtStyle = "left:-"+disX+"px";
				btnStyle = "right:"+(-100+disX)+"px";
				if(disX >= delBtnWidth){
					txtStyle = "left:-"+delBtnWidth+"px";
					btnStyle = "right:0px";
				}
			}
			var list = that.data.address;
			list[index].txtStyle = txtStyle;
			list[index].btnStyle = btnStyle;
			console.log(list[index].txtStyle);
			this.setData({
				address:list
			});
		}
	},
	// angle(start,end){
	// 	let _X = end.X - start.X;
	// 	let _Y = end.Y - start.Y;
	// 	return 360 * Math.atan(_Y/_X) / (2 * Math.PI);
	// },
	drawEnd(e){//手指移动结束后触发位置
		console.log(3333)
		clearInterval(timer);
		var that = this;
		if(e.changedTouches.length == 1){
			var endX = e.changedTouches[0].clientX;
			var disX = that.data.startX - endX;
			var delBtnWidth = that.data.delBtnWidth;
			var txtStyle = disX > delBtnWidth/2 ? "left:-"+delBtnWidth+"px":"left:0px";
			var btnStyle = disX > delBtnWidth/2 ? "right:0px":"right:-100px";
			var index = e.currentTarget.dataset.index;
			console.log(index)
			console.log(txtStyle)
			var list = that.data.address;
			
			list[index].txtStyle = txtStyle;
			list[index].btnStyle = btnStyle;
			this.setData({
				address:list
			})
		}
	},
	removeAddress(e){
		let that = this;
		let { id } = e.currentTarget.dataset
		console.log('sss')
		wx.showModal({
	        title: '删除地址',
	        content: '确定删除该收货地址吗？',
	        success: function (res) {
	          if (res.confirm) {
	          	wxRequest({
		        	url:'/merchant/userClient?m=delUserAddress',
		        	method:'POST',
		        	data:{
		        		params:{
		        			id:id
		        		},
		        		token:app.globalData.token	
		        	},
		        }).then(res=>{
		        	if (res.data.code === 0) {
		        		that.findUserAddress();
						feedbackApi.showToast({title:'删除成功'});
		        	} else {
		        		let msg = res.data.value;
		        		feedbackApi.showToast({title:msg});
		        	}
		        });
	          } else if (res.cancel) {
	            console.log('用户点击取消')
	          }
	        }
	    });
	},
	selectAddress(e){
		let { item } = e.currentTarget.dataset;
		console.log(item)
		if (parseInt(item.overShipping) === 1) {
			wx.showModal({
                title: '提示',
                content: '所选地址已超出配送范围,点击确定您可重新编辑该地址',
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
  						url: '/pages/address/add/add?item='+JSON.stringify(item)
					});
                  } else if (res.cancel) {
                    console.log('用户点击取消');
                  }
                }
            });
		} else {
			let pages = getCurrentPages();
	    	let prevPage = pages[pages.length - 2];
	    	prevPage.setData({
  				addressInfoId:item.id
		 	});
			wx.navigateBack({
		  		delta: 1
			});
		}	
	}
});