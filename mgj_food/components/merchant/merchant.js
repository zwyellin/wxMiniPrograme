const app = getApp();
let merchantObj = {
	moveDown(e){
		if (!this.data.moveDown) {
			this.data.moveDown = true;
			let { item, index } = e.currentTarget.dataset;
			let dataList = this.data.dataList;
			if (item.promotionActivityList.length < 3) return;
			if (dataList[index].isHeight == '68rpx') {
				dataList[index].isHeight = 34*item.promotionActivityList.length+'rpx';
				this.setData({
					dataList:dataList
				});
			} else {
				dataList[index].isHeight = '68rpx';
				this.setData({
					dataList:dataList
				});
			}	
			this.data.moveDown = false;	
		}
	},
	//阻止遮罩层
	myCatchTouch(){
		return false;
	},
	quickPage(e){
		let { id } = e.currentTarget.dataset;
		if (!this.data.clickPage) {
			this.data.clickPage = true;
			wx.navigateTo({
				url:"/pages/shop/shop?merchantid=" + id,
			});
		}
	},
	setBfilterType(e){
		this.data.islocal = true;
		let { index } = e.currentTarget.dataset;
		if (!this.data.maskShow) {
			this.maskShowAnimation();
		}
		if (index == 0) {
			this.setData({
				classShow:true,
				maskShow:true,
				sortShow:false,
				shipShow:false
			});
		}
		if (index == 1) {
			this.setData({
				sortShow:true,
				maskShow:true,
				classShow:false,
				shipShow:false
			});
		}
		if (index == 2) {
			this.setData({
				shipShow:true,
				sortShow:false,
				maskShow:true,
				classShow:false
			});
		}	
	},
	//选择排序
	selectSort(e){
		this.maskHideAnimation();
		let { index } = e.currentTarget.dataset;
		let value = this.data.sortList[index];
		this.setData({
			queryType:index+1,
			start:0,
			sortShow:false,
			sortIndex:index,
			type2:value,
			loading:false
		});
		this.getDataList(false,true);
	},
	//选择分类
	selectClass(e){
		let { index, item} = e.currentTarget.dataset;
		let childTagCategoryList = item.childTagCategoryList;
		let value = item.name;
		if (index === 0) {
			this.maskHideAnimation()
			this.setData({
				childTagCategoryList:childTagCategoryList,
				timeIndex:index,
				tagParentId:item.parentId,
				tagId:null,
				classShow:false,
				start:0,
				type1:value,
				loading:false	
			});
			this.getDataList(false,true);
		} else {
			this.setData({
				childTagCategoryList:childTagCategoryList,
				tagParentId:item.id,
				start:0,
				timeIndex:index,
			});
		}
	},
	//选择第二轮分类
	selectText(e){
		let { item, index } = e.currentTarget.dataset;
		let value = item.name;
		this.maskHideAnimation()
		if (index === 0) {
			this.setData({
				tagParentId:item.parentId,
				tagId:null,
				classShow:false,
				type1:value,
				loading:false
			});
			this.getDataList(false,true);
		} else {
			this.setData({
				tagParentId:item.parentId,
				tagId:item.id,
				classShow:false,
				type1:value,
				loading:false
			});
			this.getDataList(false,true);
		}	
	},
	//商家配送方式
	selectShip(e){
		let { index } = e.currentTarget.dataset;
		this.setData({
			shipFilter:index
		})
	},
	close(){//关闭弹窗
		this.maskHideAnimation();
		this.platfromRedHideAnimation();
		this.setData({
			classShow:false,
			sortShow:false,
			shipShow:false,
			islocal:false,
			isRegisterGetRedBag:false
		});
	},
	//处理商家无logo占位图
	seatImg(merchantList) {
		merchantList.map((item)=>{
			if(!item.logo || !/.*(\.png|\.jpg)$/i.test(item.logo)){
				item.logo = '/images/merchant/merchantLogo.png'
			} else {
				item.logo = item.logo+'?imageView2/0/w/170/h/130/q/100!';
			}
			item.isHeight = '68rpx';
		});
		return merchantList;
	},
	clear(){
		this.maskHideAnimation();
		this.setData({
			shipFilter:null,
			shipShow:false,
			maskShow:false
		});
	},
	query(){
		this.maskHideAnimation();
		this.setData({
			shipShow:false,
			maskShow:false,
			loading:false
		});
		this.getDataList(false,true);
	},
	maskShowAnimation(){//遮罩层显示动画
		let animation = wx.createAnimation({  
		    transformOrigin: "50% 50%",
			duration: 1000,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(0.3).step();
	      	this.setData({
	        	maskAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).step();//修改透明度,放大  
		this.setData({  
		   maskAnimation: animation.export()  
		}); 
	},
	maskHideAnimation(){//遮罩层隐藏动画
		let animation = wx.createAnimation({  
		    duration: 500,  
		});
		setTimeout(()=> {
	      	animation.opacity(0).step();
	      	setTimeout(()=>{
	      		this.setData({
	      			maskShow:false,
	      		});
	      	},500);
	      	this.setData({
	        	maskAnimation: animation.export(),	
	      	});	
	    }, 20);
		animation.opacity(0.3).step();//修改透明度,放大  
		this.setData({  
		   maskAnimation: animation.export()  
		}); 
	},
	platfromRedShowAnimation(){
		let redBagLeft = (app.globalData.windowWidth-290)/2;
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.left(redBagLeft+'px').top(13+'%').step();
	      	this.setData({
	        	platformGetRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.top(-1000+'rpx').step();
		this.setData({  
		   platformGetRedAnimation: animation.export()  
		}); 
	},
	platfromRedHideAnimation(){
		let redBagLeft = (app.globalData.windowWidth-290)/2;
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.left(redBagLeft+'px').top(150+'%').step();
	      	setTimeout(()=>{
	      		this.setData({
	        		platformRedList:[]
	      		});
	      	},1000);
	      	this.setData({
	        	platformGetRedAnimation: animation.export(),
	      	});
	    }, 200);
		animation.left(redBagLeft+'px').top(13+'%').step(); 
		this.setData({  
		   platformGetRedAnimation: animation.export()  
		}); 
	},
};
module.exports = {
    merchantObj
};
