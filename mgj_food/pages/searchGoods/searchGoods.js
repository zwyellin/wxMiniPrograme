const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Page({
	data:{
        searchValue:'',
        size:24,
		searchList:[],
        hotList:["肯德基","麻辣烫","米线","麻辣香锅"]
	},
	onLoad(){
		
	},
	searchGoods(e){
		let value = e.detail.value;
		this.search(value);
    },
    search(value){
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
                this.setData({
                    searchList: res.data.value
                });
            } else {

            }
        });
    },
    quickPage(e){
		let { id } = e.currentTarget.dataset;
		wx.navigateTo({
			url:"/pages/shop/shop?merchantid=" + id,
		});
	},
    hotSearch(e){
        let value = e.currentTarget.dataset.item;
        this.setData({
            searchValue:value
        });
        this.search(value);
    }
});