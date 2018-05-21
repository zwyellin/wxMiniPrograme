const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Page({
	data: {
		loading:false,
		maskAnimation:null,
	    size:24,
		type1:'分类',
		type2:'排序',
		type3:'筛选',
		classList:[],
		childTagCategoryList:[],
		classShow:false,
		shipShow:false,
		timeIndex:0,
		queryType:1,  //排序类型
		sortList:["智能排序","距离最近","销量最高","起送价最低","配送速度最快","评分最高"],
		sortIndex:0,
		tagParentId:0,
		tagId:null,
		shipFilter:null,
		sortShow:false,
		maskShow:false,
		start:0,
		dataList:[],      //商家列表
		initClassList:[]	  //分类列表
	},
	onLoad(options){
		let tagId = null
		if (options.id != "null" && parseInt(options.id) > -1) {
			tagId = parseInt(options.id);
		}
		let type1 = '分类';
		this.setData({
			tagId:tagId
		})
		this.findTagCategory().then(res=> {
        	if (res.data.code === 0) { 
        		let classList = res.data.value
        		let timeIndex = 0
        		classList.map((item,index)=>{
        			if(item.id === tagId) {
        				timeIndex = index
						item.childTagCategoryList.map((childItem)=>{
							if(childItem.id === tagId) {
								type1 = childItem.name
							}
						})
        			}
        		})
				this.setData({
					timeIndex:timeIndex,
					childTagCategoryList:classList[timeIndex].childTagCategoryList,
					type1:type1,
					classList: classList
				})
				this.getDataList();
        	}
        });
	},
	moveDown(e){
		let { item, index } = e.currentTarget.dataset;
		let dataList = this.data.dataList;
		if (item.promotionActivityList.length < 3) return;
		if (dataList[index].height === '68rpx') {
			dataList[index].height = 34*item.promotionActivityList.length+'rpx';
			this.setData({
				dataList:dataList
			});
		} else {
			dataList[index].height = '68rpx';
			this.setData({
				dataList:dataList
			});
		}	
	},
	quickPage(e){
		let { id } = e.currentTarget.dataset;
		wx.navigateTo({
			url:"/pages/shop/shop?merchantid=" + id,
		});
	},
	getDataList(status){
		if (!status) {
			wx.showToast({
		        title: '加载中',
		        icon: 'loading',
		        duration: 200000,
		        mask: true
		    });
		}
		let data = {
			agentId:app.globalData.agentId,
        	longitude:app.globalData.longitude,
        	latitude:app.globalData.latitude,
        	queryType:this.data.queryType,
        	shipFilter:this.data.shipFilter,
			tagId:this.data.tagId,
        	tagParentId:this.data.tagParentId,
        	size:10,
        	start:this.data.start
		};
		wxRequest({
        	url:'/merchant/userClient?m=findTakeAwayMerchant',
        	method:'POST',
        	data:{
        		params:data
        	}	
        }).then(res=>{
			let dataList = this.data.dataList;
			let list = res.data.value;
			if (res.data.code === 0) {
				if (status) {
					if (res.data.value.length != 0) {
						list.map((item)=>{
							item.height = '68rpx';
							dataList.push(item);
						});
		        		console.log(res.data.value);
		        		this.setData({
		        			dataList:dataList,
		        			loading:false
		        		});	
					} else {
						this.setData({
							loading:true
						});
					}
				} else {
					if (list.length === 0) {
						setTimeout(()=>{
							this.setData({
        						loading:true
        					});
						},1500);
						this.setData({
    						dataList:list
    					});
					} else {
						list.map((item)=>{
							item.height = '68rpx';
						});
						this.setData({
        					dataList:list,
        					loading:false
        				});
					}
				}	
			}	
        }).finally(()=>{
        	wx.hideLoading();
        });
	},
	setBfilterType(e){
		let { index } = e.currentTarget.dataset;
		if (!this.data.maskShow) {
			this.maskShowAnimation()
		}
		if (index == 0) {
			this.setData({
				classShow:true,
				maskShow:true,
				sortShow:false,
				shipShow:false,
			});
		}
		if (index == 1) {
			this.setData({
				sortShow:true,
				maskShow:true,
				classShow:false,
				shipShow:false,
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
		let { index } = e.currentTarget.dataset;
		let value = this.data.sortList[index];
		this.setData({
			queryType:index+1,
			start:0,
			sortIndex:index,
			sortShow:false,
			maskShow:false,
			type2:value,
			loading:false
		});
		this.maskHideAnimation()
		this.getDataList();
	},
	//选择分类
	selectClass(e){
		let { index, item} = e.currentTarget.dataset;
		let childTagCategoryList = item.childTagCategoryList;
		let value = item.name;
		if (index === 0) {
			this.setData({
				childTagCategoryList:childTagCategoryList,
				timeIndex:index,
				tagParentId:item.parentId,
				tagId:null,
				classShow:false,
				maskShow:false,
				start:0,
				type1:value,
				loading:false	
			});
			this.maskHideAnimation()
			this.getDataList();
		} else {
			this.setData({
				childTagCategoryList:childTagCategoryList,
				tagParentId:item.id,
				tagId:null,
				start:0,
				timeIndex:index,
			});
		}
	},
	//选择第二轮分类
	selectText(e){
		let { item, index } = e.currentTarget.dataset;
		let value = item.name;
		if (index === 0) {
			this.setData({
				tagParentId:item.parentId,
				classShow:false,
				maskShow:false,
				type1:value	,
				loading:false
			});
			this.maskHideAnimation()
			this.getDataList();
		} else {
			this.setData({
				tagParentId:item.parentId,
				tagId:item.id,
				classShow:false,
				maskShow:false,
				type1:value,
				loading:false
			});
			this.maskHideAnimation()
			this.getDataList();
		}	
	},
	close(){
		this.maskHideAnimation()
		this.setData({
			classShow:false,
			sortShow:false,
			shipShow:false,
		});
	},
	onReachBottom(){
		this.data.start+= 10;
		this.getDataList(true);
	},
	//根据地理位置初始化分类选项数据
	findTagCategory(){
		return wxRequest({
        	url:'/merchant/userClient?m=findTagCategory',
        	method:'POST',
        	data:{
        		token: app.globalData.token,
        		params:{
        			agentId:app.globalData.agentId,
        			longitude:app.globalData.longitude,
        			latitude:app.globalData.latitude,
        			tagCategoryType: 1
        		}	
        	},
        })
	},
	//商家配送方式
	selectShip(e){
		let { index } = e.currentTarget.dataset;
		this.setData({
			shipFilter:index
		})
	},
	clear(){
		this.maskHideAnimation()
		this.setData({
			shipFilter:null,
			shipShow:false,
			maskShow:false
		})
	},
	query(){
		this.maskHideAnimation()
		this.setData({
			shipShow:false,
			maskShow:false,
			loading:false
		})
		this.getDataList();
	},
	maskShowAnimation(){
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
	maskHideAnimation(){
		let animation = wx.createAnimation({  
		    duration: 500,  
		});
		setTimeout(()=> {
	      	animation.opacity(0).step();
	      	setTimeout(()=>{
	      		this.setData({
	      			maskShow:false,
	      		})
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
})