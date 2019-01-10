/* 店铺搜索悬浮窗 专用*/
const { wxRequest } = require('../../utils/util.js');
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 

const app=getApp();
let shopSearchData={
    //以下为商店搜索用到的属性 
    isSearchWrapperShow:true, //商店搜索，搜索悬浮窗是否展示
    searchValue:null,       //搜索框要展示的value
    searchInputValue:null,//搜索框内输入的value
    shopSearchRecord:[//搜索记录 最多6条（最新的）
        "哈哈1","哈哈2","哈哈3","哈哈4","哈哈5",
        "哈1","哈2","哈3","哈4","哈5",
        "1","2","3","4","5",
        "哈哈哈1","哈哈哈2","哈哈哈3","哈哈哈4","哈哈哈5",
    ],
    isshopSearchRecordShow:true,//搜索记录,一开始展示
    searchResList:[],//搜索 返回来的列表
}
let shopSearch={
	//shop head部分点击搜索图标 事件
	SearchIconTap(e){
        //先缓存购物车情况
       let merchantId = this.data.merchantId;
       if (!wx.getStorageSync('shoppingCart')) {
         let shoppingCart = {};
         shoppingCart[merchantId] = this.data.selectFoods;
         wx.setStorageSync('shoppingCart',shoppingCart);
       } else {
           let shoppingCart = wx.getStorageSync('shoppingCart');
           shoppingCart[merchantId] = this.data.selectFoods;
           wx.setStorageSync('shoppingCart',shoppingCart);
       }
       //缓存购物车其它信息 
        let shoppingCartOther={};
        shoppingCartOther[merchantId]={
            itemList:this.data.itemList,
			item:this.data.item,
			minPrice:this.data.minPrice,
			shipScore:this.data.shipScore,
            ruleDtoList:this.data.ruleDtoList    
        }
       wx.setStorageSync('shoppingCartOther',shoppingCartOther);   
       //导航到新的自己页面
		wx.navigateTo({
			url:"/goods/shop/shop?merchantid=" + this.data.merchantId+"&search=true",
		})
	},
    //点击搜索历史的条目 事件
    shopSearchRecordTap:function(e){
        //渲染到搜索input
       this.setData({
        searchValue:e.target.dataset.text,
        searchInputValue:e.target.dataset.text //保存搜索框的内容
       })
      
    },
    //点击搜索 事件
    shopSearchSubmit:function(e){
        /*1.搜索记录/搜索主体切换
          2.发送请求，渲染shopSearch-main
        */
       console.log("搜索提交")
       this.setData({
        isshopSearchRecordShow:false
       })
       wxRequest({
        url:'/merchant/userClient?m=searchMerchantGoodsList',
        method:'POST',
        data:{
            params:{
                merchantId:this.data.merchantId,
		        queryString: this.data.searchInputValue
            },
            client: app.globalData.client,
            clientVersion: "3.2.2"    //此参数取值版本来自于与App版本
             },
        }).then((res)=>{
            if(res.data.code==0){//请求成功
                let value=res.data.value;
                if(value.length==0){//无 内容返回
                    feedbackApi.showToast({title: '这个词组没有对应的商品,换个词试试',duration:2000});
                }else{//有 内容返回
                    this.setData({
                        searchResList:value
                    })
                }
            }else{//请求失败

            }
        })
    },
    //搜索Input  input时触发，用于获得焦点就搜索记录/搜索主体切换
    shopSearchInput:function(e){
        this.setData({
            searchInputValue:e.detail.value//保存输入内容
        })
        if(e.detail.value.length==0){//如果input没有值，则切换记录/主体
            this.setData({
                isshopSearchRecordShow:true,
               })
        }
    }
}
module.exports = {
    shopSearchData,
    shopSearch
 };