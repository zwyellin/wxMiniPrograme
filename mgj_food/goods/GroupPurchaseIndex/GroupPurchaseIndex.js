// goods/GroupPurchaseIndex/GroupPurchaseIndex.js
const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude:"39.96606874899509",
    longitude:"116.3047862214218",

    
    bannerList:[],//轮播图,请求返回对象
    categoryList:[[]],//icon分类，请求返回对象。是一个二级数组
    publicityList:[],//广告屏

    groupPurchaseItemRequsetObj:null,//团购商家请求参数对象
    groupPurchaseItemConfig:{//团购商家请求相关的配置
      isPageReachBottom:false,//默认false
    },


    sortActive:null,//分类筛选激活第几个。0,1,2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    // 请求轮播图
    this.findGroupPurchaseBannerList();
    //请求icon分类
    this.findGroupPurchasePrimaryCategoryList();
    // 广告屏
    this.findGroupPurchasePrimaryPublicityList();
    let groupPurchaseItemRequsetObj={merchantId:748,latitude:"39.966128",longitude:"116.304782",size:3};
    this.setData({
      groupPurchaseItemRequsetObj,groupPurchaseItemRequsetObj
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 获取轮播图
  findGroupPurchaseBannerList(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseBannerList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:this.data.latitude,
          longitude:this.data.longitude,
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        this.setData({
          bannerList:res.data.value
        })
      }
    })
  },
  // 获取icon
  findGroupPurchasePrimaryCategoryList(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchasePrimaryCategoryList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:this.data.latitude,
          longitude:this.data.longitude,
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        // 5个分组
        let categoryList=[[]];
        res.data.value.forEach((item,index,arr)=>{
          if(categoryList[categoryList.length-1].length>4){
            categoryList.push([[]]);
          }else{
            categoryList[categoryList.length-1].push(item);
          }
        })
        this.setData({
          categoryList
        })
      }
    })
  },
  // 广告位
  findGroupPurchasePrimaryPublicityList(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchasePrimaryPublicityList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:this.data.latitude,
          longitude:this.data.longitude,
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
       let publicityList=res.data.value;
        this.setData({
          publicityList
        })
        console.log("publicityList",publicityList)
      }
    })
  },
  sortTap(e){
    let {index}=e.currentTarget.dataset;
    let sortActive;
    if(this.data.sortActive==index){
      sortActive=null;
    }else{
      sortActive=index;
    }
    this.setData({
      sortActive
    })
  },
  onReachBottom: function () {
    this.setData({
      'groupPurchaseItemConfig.isPageReachBottom':true
    })
  },

})