const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Page({
	data:{
        searchValueIndex:'',
        size:24,
		searchList:[],
        historyList:[]
	},
	onLoad(){
		if(wx.getStorageSync('historyList')) {
            let historyList = wx.getStorageSync('historyList')
            this.setData({
                historyList:historyList
            })
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
            url:'/merchant/userClient?m=searchTakeAwayMerchant',
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
                let searchList = res.data.value;
                searchList.map((item)=>{
                    if(!/.*(\.png|\.jpg)$/.test(item.logo)){
                        item.logo = '/images/merchant/merchantLogo.png'
                    }
                    item.isHeight = '68rpx';
                });
                this.setData({
                    searchList: searchList
                });
            } else {

            }
        }).finally(()=>{
            wx.hideLoading()
        });
    },
    moveDown(e){  
        let { item, index } = e.currentTarget.dataset;
        let searchList = this.data.searchList;
        if (item.promotionActivityList.length < 3) return;
        if (searchList[index].isHeight == '68rpx') {
            searchList[index].isHeight = 34*item.promotionActivityList.length+'rpx';
            this.setData({
                searchList:searchList
            });
        } else {
            searchList[index].isHeight = '68rpx';
            this.setData({
                searchList:searchList
            });
        }   
    },
    quickPage(e){
		let { id } = e.currentTarget.dataset;
		wx.navigateTo({
			url:"/pages/shop/shop?merchantid=" + id,
		});
	},
    setsearch(e){
        let value = e.detail.value;
        let historyList = this.data.historyList;
        if (this.data.historyList.length === 7) {
            this.data.historyList.splice(6, 1);
            this.data.historyList.unshift(value)
        } else {
            this.data.historyList.unshift(value)
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