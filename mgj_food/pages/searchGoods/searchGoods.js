const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Page({
	data:{
        searchValueIndex:-1,
        size:24,
		dataList:[],
        historyList:[],
        cartObject:null,
        clickPage:false,
	},
	onLoad(){
		if(wx.getStorageSync('historyList')) {
            let historyList = wx.getStorageSync('historyList');
            this.setData({
                historyList:historyList
            });
        }
	},
    onShow(){
        this.data.clickPage = false;
        if (wx.getStorageSync('shoppingCart')) {
            let shoppingCart = wx.getStorageSync('shoppingCart');
            this.setData({
                cartObject:shoppingCart
            }); 
        }
    },
	searchGoods(e){
		let value = e.detail.value;
		this.search(value);
    },
    search(value,status){
        if (status) {
            wx.showToast({
                title: '加载中',
                icon: 'loading',
                duration: 200000,
                mask: true
            });
        }
        wxRequest({
            url:'/merchant/userClient?m=searchTakeAwayMerchant2',
            method:'POST',
            data:{
                token: app.globalData.token,
                params:{
                    agentId:app.globalData.agentId,
                    longitude:app.globalData.longitude,
                    latitude:app.globalData.latitude,
                    searchParam:value,
                    start:0
                }   
            },
        }).then(res=> {
            console.log(res);
            if (res.data.code ===0) {
                let dataList = res.data.value;
                dataList.map((item)=>{
                    if(!item.logo || !/.*(\.png|\.jpg)$/i.test(item.logo)){
                        item.logo = '/images/merchant/merchantLogo.png';
                    } else {
                        item.logo = item.logo+'?imageView2/0/w/170/h/130';
                    }
                    item.isHeight = '68rpx';
                });
                this.setData({
                    dataList: dataList
                });
            } else {

            }
        }).finally(()=>{
            wx.hideLoading();
        });
    },
    moveDown(e){  
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
    setsearch(e){
        let value = e.detail.value;
        if (value == '') return;
        let historyList = this.data.historyList;
        if (this.data.historyList.length === 7) {
            this.data.historyList.splice(6, 1);
            this.data.historyList.unshift(value);
        } else {
            this.data.historyList.unshift(value);
        }
    },
    hotSearch(e){
        let { value, index } = e.currentTarget.dataset;
        if (index == this.data.searchValueIndex) {
            this.setData({
                searchValueIndex:-1
            });
            this.search('',true);
        } else {
            this.setData({
                searchValueIndex:index
            });
           this.search(value,true);
        }   
    },
    onUnload(){
        let historyList = this.data.historyList
        wx.setStorageSync('historyList',historyList)
    }
});