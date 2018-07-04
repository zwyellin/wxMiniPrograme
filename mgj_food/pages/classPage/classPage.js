const app = getApp();
const { wxRequest } = require('../../utils/util.js');
const { merchantObj } = require('../../components/merchant/merchant.js');
Page(Object.assign({}, merchantObj, {
	data: {
		islocal:false,       //是否计算本地缓存
		loading:false,
		maskAnimation:null,
	    size:24,
		type1:'分类',
		type2:'排序',
		type3:'筛选',
		classList:[],
		cartObject:null,
		clickPage:false,
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
		let tagId = null;
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
	onShow(){
		this.data.clickPage = false;
		if (wx.getStorageSync('shoppingCart')) {
			let shoppingCart = wx.getStorageSync('shoppingCart');
			console.log(shoppingCart);
			this.setData({
				cartObject:shoppingCart
			});	
  		}
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
        	url:'/merchant/userClient?m=findTakeAwayMerchant4',
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
						list = this.seatImg(list);
		        		dataList = dataList.concat(list);
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
						list = this.seatImg(list);
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
        });
	},
}));