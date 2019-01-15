/* 店铺搜索悬浮窗 专用*/
/*思路：点击搜索之后，进入一个页面，但因为要复用太大shop的方法和ui。
*则，点搜索后，导航到新的自己页面。然后根据路由参数search来区分这个页面到底是给商店用还是商店搜索用
*/
const { wxRequest } = require('../../utils/util.js');
const feedbackApi = require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 

const app=getApp();
let isAbleSearchIconTap=true;//是否允许再次点击，防止重复点击
let shopSearchData={
    //以下为商店搜索用到的属性 
    shopSearchScrollHeight:null,//商店搜索滚动列表高度，在shop会初始化
    isSearchWrapperShow:false, //商店搜索，搜索悬浮窗是否展示
    isshopSearchRecordShow:true,//搜索记录
    shopSearchRecord:[],//搜索记录 最多6条（最新的）
    searchValue:null,       //搜索框要展示的value,点击搜索记录渲染到搜索框
    isShopSearchInputFocus:false,//搜索框是否获得焦点，用于搜索没有返回结果时，搜索框自动获得焦点
    //以下为请求参数
    searchInputValue:null,//搜索框内输入的value,绑定事件。实时获取
    shopSearchStart:0,
    shopSearchSize:10,
    searchResList:[],//搜索 返回来的列表
    shopSearchLoading:true,//滚动列表加载loading,最后返回值时置为false
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
            merchantInfoObj:this.data.merchantInfoObj,//商家信息(以下信息都是这个字段的属性)
			minPrice:this.data.minPrice,
			shipScore:this.data.shipScore,
            ruleDtoList:this.data.ruleDtoList,
            removalMenuList:this.data.removalMenuList,
            activitySharedShow:this.data.activitySharedShow,
            activitySharedStatus:this.data.activitySharedStatus
        }
       wx.setStorageSync('shoppingCartOther',shoppingCartOther);   
       //设置不允许再点击
       isAbleSearchIconTap=false;
       //导航到新的自己页面
		wx.navigateTo({
            url:"/goods/shop/shop?merchantid=" + this.data.merchantId+"&search=true",
            success:function(e){
                isAbleSearchIconTap=true;
            }
		})
	},
    //点击搜索历史的条目 事件
    shopSearchRecordTap:function(e){
        //渲染到搜索input
       this.setData({
        searchValue:e.target.dataset.text,
        searchInputValue:e.target.dataset.text, //保存搜索框的内容
       })
      
    },
    //点击搜索 事件
    shopSearchSubmit:function(e){
        /*1.搜索记录/搜索主体切换
          2.发送请求，渲染shopSearch-main
          @reset boolen true:需要重置列表
        */
       //请求前 
       let reset=e.currentTarget.dataset.reset;
       if(reset){//重置
            this.setData({
                searchResList:[],
                isshopSearchRecordShow:false,
                shopSearchLoading:true
            })
       }
       //准备发送请求
       wxRequest({
        url:'/merchant/userClient?m=searchMerchantGoodsList',
        method:'POST',
        data:{
            params:{
                merchantId:this.data.merchantId,
                queryString: this.data.searchInputValue,
                size:this.data.shopSearchSize,
                start:this.data.searchResList.length
            },
            client: app.globalData.client,
            clientVersion: "3.2.2"    //此参数取值版本来自于与App版本
             },
        }).then((res)=>{
            this.shopSearchRecord(this.data.searchInputValue);
            if(res.data.code==0){//请求成功
                let value=res.data.value;
                let isShopSearchInputFocus;
                let searchResList=this.data.searchResList;
                let isLastdata=false;//判断返回的是不是最后的数据
                if(value.length==0){//无 内容返回 
                    if(searchResList.length==0){//并且列表为空(初始请求时)
                        feedbackApi.showToast({title: '这个词组没有对应的商品,换个词试试',duration:2000});
                        isShopSearchInputFocus=true;
                    }
                    isLastdata=true;
                }else{//有 内容返回
                    //缓存 搜索记录（显示搜索历史时，会读取记录）只缓存有返回值的搜索
                    //this.shopSearchRecord(this.data.searchInputValue);
                    isShopSearchInputFocus=false;
                    searchResList=searchResList.concat(value);
                    if(value.length<this.data.shopSearchSize){
                        isLastdata=true;
                    }
                }
                //保存 返回来的结果
                this.setData({
                    searchResList,
                    isShopSearchInputFocus,
                    shopSearchLoading:!isLastdata //如果是最后数据true，则shopSearchLoading关闭置为false
                })
            }else{//请求失败
                feedbackApi.showToast({title: res.data.value});
            }
        })
    },
    //搜索Input  input时触发，用于获得焦点就搜索记录/搜索主体切换
    shopSearchInput:function(e){
        this.setData({
            searchInputValue:e.detail.value//保存输入内容
        })
        if(e.detail.value.length==0){//如果input没有值，则显示搜索历史
            //读取搜索历史缓存,input获得焦点/输入 且长度为0是读取缓存，且展示,且清空搜索列表(避免闪现)
            this.shopSearchRecord();
            this.setData({
                isshopSearchRecordShow:true,
                searchResList:[]
               })
        }
    },
    shopSearchRecord:function(val){
        let shopSearchRecord;
        if(val==undefined){//读缓存
            if (!wx.getStorageSync('shopSearchRecord')) {//记录为空
                shopSearchRecord = [];
            }else{
                shopSearchRecord = wx.getStorageSync('shopSearchRecord');
            }
            this.setData({
                shopSearchRecord
            })
        }else if(val!=''){//倒序放有值的缓存
            if (!wx.getStorageSync('shopSearchRecord')) {//记录为空或没有该字段
                shopSearchRecord=[];   
            }else {
                shopSearchRecord=wx.getStorageSync('shopSearchRecord');
                //先判断原先有没有这个字段
                shopSearchRecord.find((item,index,arr)=>{
                    if(item==val){
                        arr.splice(index,1);//如果有，则删除原来的
                    }
                })
            }
            shopSearchRecord.unshift(val);//倒序插
            if(shopSearchRecord.length>6){//只保留6条
                shopSearchRecord=shopSearchRecord.slice(0,6);
            }
            wx.setStorageSync('shopSearchRecord',shopSearchRecord);
        }
        //都返回缓存
        return shopSearchRecord
    },
    shopSearchRecordDel:function(){
        console.log("删除搜索记录")
        wx.setStorageSync('shopSearchRecord',[]);
        this.setData({
           shopSearchRecord:[]     
        })
    }
}
module.exports = {
    shopSearchData,
    shopSearch
 };