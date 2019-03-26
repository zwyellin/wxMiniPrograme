const { wxRequest, format } = require('../../utils/util.js');
const app = getApp();
Page({
	data:{
		isDisabled:0,   //默认0，0（可用）1（不可用）:请求参数
		start:0,

		show:false,//控制ui用于显示请求结果
	
		loading:false,
	
		navbar: ['红包', '代金券','马管家券'],//标题文字
		currentTab: 0,//0红包，1代金券，2马管家券
	
		platformRedBagCount:0,//平台红包数量
		vouchersCount:0,//代金券数量
		couponsCount:0,//马管家券数量

		platfromRedBagList:[],//平台红包列表
		redBagList:[],//红包列表【代金券列表】
		couponsList:[],//马管家券列表
	},
	onLoad(){
		this.queryRedBagList(false);
	},
	navbarTap: function(e){
		if (e.currentTarget.dataset.idx == 0) {
			this.data.start = this.data.platfromRedBagList.length;
		} else if(e.currentTarget.dataset.idx == 1) {
			this.data.start = this.data.redBagList.length;
		} else if(e.currentTarget.dataset.idx == 2) {
			this.data.start = this.data.couponsList.length;
		} 

		this.setData({
		  	currentTab: e.currentTarget.dataset.idx,
		  	loading:false
		});
		this.queryRedBagList(true);
  },
	queryRedBagList(isloadMore){
		if (!isloadMore) {
			wx.showLoading({
				title: '加载中',
				mask: true
			});
		}
		wxRequest({
		  	url:'/merchant/userClient?m=queryRedBagList',
		  	method:'POST',
		  	data:{
				token:app.globalData.token,
				params:{
			  		start:this.data.start,
			  		size:5,
			  		redBagType:1,//1:全部;2：平台;...
			  		isDisabled:this.data.isDisabled
				}
		  	},
		}).then(res=>{
			if(res.data.code === 0){
				if (this.data.currentTab == 0) {//我的红包
					let nowPlatfromRedBagList = this.data.platfromRedBagList;
					let platfromRedBagList = res.data.value.platformRedBagList;
					let platformRedBagCount = res.data.value.platformRedBagCount;//平台红包个数
					let vouchersCount = res.data.value.vouchersCount;//代金券个数
					nowPlatfromRedBagList = nowPlatfromRedBagList.concat(platfromRedBagList);
					if (platfromRedBagList.length === 0) {
						this.setData({
								loading:true
						});
					}
					this.setData({
							platfromRedBagList:nowPlatfromRedBagList,//更新平台红包
							platformRedBagCount:platformRedBagCount,	//更新平台红包数量
							vouchersCount:vouchersCount,//更新代金券数量
							couponsCount: res.data.value.couponsCount,//更新马管家券数量
					});
				} else if(this.data.currentTab == 1) {//我的代金券
					let nowRedBagList = this.data.redBagList;
					let vouchersList = res.data.value.vouchersList;
					let vouchersCount = res.data.value.vouchersCount;
					vouchersList.map((item)=>{
						item.modifyTime = item.modifyTime.replace(/-/g,'/');
						item.modifyTime = new Date(item.modifyTime).getTime();
						item.modifyTime = format(item.modifyTime,".");
						item.expirationTime = format(item.expirationTime,".");
						if(item.businessType==1){//类别：1外卖，6团购
							item.businessTypeText="外卖"
						}else if(item.businessType==6){
							item.businessTypeText="团购"
						}
					});
					nowRedBagList = nowRedBagList.concat(vouchersList);
					if (vouchersList.length == 0) {
						this.setData({
								loading:true
						});
					} 
					this.setData({
							redBagList:nowRedBagList,//更新代金券列表
							vouchersCount:vouchersCount,	//更新代金券数量
							platformRedBagCount:res.data.value.platformRedBagCount,//更新平台红包数量
							couponsCount: res.data.value.couponsCount//更新马管家券数量
					});
				}else if(this.data.currentTab == 2) {//马管家券
					let couponsList=this.data.couponsList;
					let nowcouponsList=res.data.value.coupons;
					nowcouponsList.map((item)=>{
						item.modifyTime = item.modifyTime.replace(/-/g,'/');
						item.modifyTime = new Date(item.modifyTime).getTime();
						item.modifyTime = format(item.modifyTime,".");
						item.expirationTime = format(item.expirationTime,".");
						if(item.businessType==1){//类别：1外卖，6团购
							item.businessTypeText="外卖"
						}else if(item.businessType==6){
							item.businessTypeText="团购"
						}
					});
					if (couponsList.length === 0) {
						this.setData({
								loading:true
						});
					}
					couponsList=couponsList.concat(nowcouponsList);
					this.setData({
						couponsList,
						couponsCount: res.data.value.couponsCount,//更新马管家券数量
						platformRedBagCount:res.data.value.platformRedBagCount,//更新平台红包数量
						vouchersCount:res.data.value.vouchersCount,	//更新代金券数量
					})
				}
			}
		}).finally(()=>{
			this.setData({
        		show:true//控制有无红包，代金券ui信息的展示
      });
		  wx.hideLoading();
		});
	},

	// 点击代金券跳转到商家
	vouchersItemTap(e){
		let { item } = e.currentTarget.dataset;
		if(item.businessType==1){//businessType==1){//类别：1外卖，6团购
			wx.redirectTo({
				url: '/goods/shop/shop?merchantid=' +item.merchantId
			});
		}else if(item.businessType==6){
			wx.redirectTo({
				url: `/goods/GroupPurchaseShop/GroupPurchaseShop?groupPurchaseMerchantId=${item.merchantId}`
			});
		}
		

	},
	// 上拉加载更多
	onReachBottom(){
		if (this.data.currentTab == 0) {
			this.data.start = this.data.platfromRedBagList.length;
			this.queryRedBagList(true);
		} else if(this.data.currentTab == 1){
			this.data.start = this.data.redBagList.length;
			this.queryRedBagList(true);
		}else if(this.data.currentTab == 2){
			this.data.start = this.data.couponsList.length;
			this.queryRedBagList(true);
		}
	}
});