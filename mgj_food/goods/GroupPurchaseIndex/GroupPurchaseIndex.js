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

   
    //分类浮层及商家列表相关
    groupPurchaseItemRequsetObj:null,//团购商家请求参数对象
    groupPurchaseItemRequsetObjDefault:{
      merchantId:748,
      latitude:"39.966128",
      longitude:"116.304782",
      size:3
    },
    isSortBarHidden:true,//分类，筛选的浮层是否显示。
    sortBar:{//分类，筛选，信息
      sortActive:null,//分类筛选激活第几个。0,1,2
      sort0Title:"分类",//分类默认值
      sort1Title:"排序",//排序默认值
    },

    groupPurchaseItemConfig:{//团购商家请求相关的配置
      isPageReachBottom:false,//默认false
      },
  
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
    // 开始商家列表请求,组件赋值就会请求
    this.setData({
      groupPurchaseItemRequsetObj:this.data.groupPurchaseItemRequsetObjDefault
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
  //分类筛选点击
  sortTap(e){
    let {index}=e.currentTarget.dataset;
    let sortActive;
    if(this.data.sortActive==index){
      sortActive=null;
    }else{
      sortActive=index;
    }
    this.setData({
      'sortBar.sortActive':sortActive,
      isSortBarHidden:false//打开分类筛选浮层
    })
  },
  // 分类，组件触发的事件
  groupPurchaseSortBarParams(e){
      let {type,params,title}=e.detail;
      // 关闭该组件浮层
      this.setData({
        isSortBarHidden:true,//关闭分类筛选浮层
        'sortBar.sortActive':null//关闭sortBar的icon显示
      })
      if(type){//type:true。则要发送请求。且要改变，标题
        let groupPurchaseItemRequsetObjDefault=JSON.parse(JSON.stringify(this.data.groupPurchaseItemRequsetObjDefault));
        Object.assign(groupPurchaseItemRequsetObjDefault,params);
        //开始请求商家列表
        this.setData({
          groupPurchaseItemRequsetObj:groupPurchaseItemRequsetObjDefault
        })
        // 修改标题
        let sortBar=this.data.sortBar;
        Object.assign(sortBar,title);
        this.setData({
          sortBar
        })
      }
  },
  // 触底
  onReachBottom: function () {
    this.setData({
      'groupPurchaseItemConfig.isPageReachBottom':true
    })
  },

})