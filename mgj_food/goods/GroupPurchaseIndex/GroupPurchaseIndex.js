// goods/GroupPurchaseIndex/GroupPurchaseIndex.js
const app = getApp();
const { wxRequest, buttonClicked} = require('../../utils/util.js');
const { modify} = require('groupPurchasePublicJs.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude:null,
    longitude:null,
    agentId:null,//代理商id。请求分类时会返回该属性
    
    bannerList:[],//轮播图,请求返回对象
    categoryList:[[]],//icon分类，请求返回对象。是一个二级数组
    publicityList:[],//广告屏

   
    //分类浮层及商家列表相关
    groupPurchaseItemRequsetObj:null,//团购商家请求参数对象
    groupPurchaseItemRequsetObjDefault:{//其实还会加入经纬度
      url:"findGroupPurchaseMerchantBySearch",
      sign:app.globalData.sign,
      start:0,
      size:5
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

    if(app.globalData.latitude){
      this.data.latitude=app.globalData.latitude;
      this.data.longitude=app.globalData.longitude;
    }
    // 请求轮播图
    this.findGroupPurchaseBannerList();
    //请求icon分类
    this.findGroupPurchasePrimaryCategoryList();
    // 广告屏
    this.findGroupPurchasePrimaryPublicityList();
    // 开始商家列表请求,组件赋值就会请求
    let groupPurchaseItemRequsetObjDefault=this.data.groupPurchaseItemRequsetObjDefault;
    Object.assign(groupPurchaseItemRequsetObjDefault,{
      latitude:this.data.latitude,
      longitude:this.data.longitude
    })
    this.setData({
      groupPurchaseItemRequsetObj:this.data.groupPurchaseItemRequsetObjDefault
    })
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
        let value=res.data.value;
        this.setData({
          bannerList:value
        })
      }
    })
  },
  // 主分类图片加载失败事件
  BannerListSrcErr(e){
    let {index}=e.target.dataset;
    let bannerList=this.data.bannerList;
    let item= bannerList[index];
    item.picUrl="../../images/merchant/merchantLogo.png";
    this.setData({
      bannerList:bannerList
    })
  },

  // banner的跳转
  findGroupPurchaseBannerListTap(e){
    if(buttonClicked(this)) return;
    let {item}=e.currentTarget.dataset;
    let {bannerType,url,groupPurchaseMerchantId,groupPurchaseCouponId}=item;
    //@bannerType :1跳链接。2跳代金券和团购套餐。3跳团购商家。4团购分类
    //@url跳链接的地址
    if(bannerType===1){
      // wx.navigateTo({
      //   url:`/pages/webView/webView?src=${url}`
      // })
    }else if(bannerType===2){//需要请求判断，loading提示
      wx.showToast({
        title:"正在跳转",
        icon:"loading",
        mask:true,
        duration: 20000
      })
      this.findGroupPurchaseCouponInfo(groupPurchaseCouponId).then((res)=>{
        if(res.data.code === 0){
          wx.hideToast();
          if(res.data.value.type===1){//区别是type。1：代金券，2：团购套餐
            wx.navigateTo({
              url:`/goods/GroupPurchaseChildPage/serviceCategory1/serviceCategory1?groupPurchaseCouponId=${groupPurchaseCouponId}`
            })
          }else{
            wx.navigateTo({
              url:`/goods/GroupPurchaseChildPage/serviceCategory2/serviceCategory2?groupPurchaseCouponId=${groupPurchaseCouponId}`
            })
          }
        }else{
          wx.hideToast();
          wx.showToast({
            title: "跳转失败",
            icon:"none",
            mask:true,
            duration: 2000
          })
        }
      })
    }else if(bannerType===3){    
      wx.navigateTo({
        url:`/goods/GroupPurchaseShop/GroupPurchaseShop?groupPurchaseMerchantId=${groupPurchaseMerchantId}`
      })
    }else if(bannerType===4){

    }
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
        // 保存代理商id
        this.setData({
          agentId:res.data.value[0].agentId
        })
        app.globalData.agentId=res.data.value[0].agentId;
        // 此时可以请求其它的
        // 5个分组
        let categoryList=[[]];
        res.data.value.forEach((item,index,arr)=>{
          if(categoryList[categoryList.length-1].length>4){   
            categoryList.push([item]);
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
  // 主分类的跳转
  //url="/goods/GroupPurchaseIndex/GroupPurchaseSort/GroupPurchaseSort?groupPurchaseCategoryId={{item.groupPurchaseCategoryId}}&childGroupPurchaseCategoryId={{item.childGroupPurchaseCategoryId}}"
  findGroupPurchasePrimaryCategoryListTap(e){
    if(buttonClicked(this)) return;
    let {item}=e.currentTarget.dataset;
    let {gotoType,gotoUrl,groupPurchaseCategoryId,childGroupPurchaseCategoryId,name}=item;
    //name是作为跳到分类页面的标题
    //@gotoType :2跳分类。1跳链接。
    //@gotoUrl跳分类的链接
    //groupPurchaseCategoryId一级分类的id。 childGroupPurchaseCategoryId二级分类的id如果为Null则跳一级分类
    if(gotoType===1){
      // wx.navigateTo({
      //   url:`/pages/webView/webView?src=${gotoUrl}`
      // })
      wx.navigateTo({
        url:`/goods/GroupPurchaseIndex/GroupPurchaseSort/GroupPurchaseSort`
      })
    }else if(gotoType===2){
      wx.navigateTo({
        url:`/goods/GroupPurchaseIndex/GroupPurchaseSort/GroupPurchaseSort?groupPurchaseCategoryId=${groupPurchaseCategoryId}&childGroupPurchaseCategoryId=${childGroupPurchaseCategoryId}&name=${name}`
      })
    }
  },
  // 主分类图片加载失败事件
  categoryListSrcErr(e){
    let {index,index1}=e.target.dataset;
    let categoryList=this.data.categoryList;
    let item= categoryList[index1][index];
    item.picUrl="../../images/merchant/classification_eva@2x.png";
    item.grayUrl="../../images/merchant/classification_eva@2x.png";
    this.setData({
      categoryList:categoryList
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
  // 广告位的跳转
  primaryPublicityListTap(e){
    if(buttonClicked(this)) return;
    let {item}=e.currentTarget.dataset;
    let {gotoType,groupPurchaseMerchantId,groupPurchaseCouponId,linkUrl}=item;
    //@gotoType :1跳链接。2跳代金券和团购套餐。3跳团购商家。
    //@linkUrl跳链接的地址
    if(gotoType===1){
      // wx.navigateTo({
      //   url:`/pages/webView/webView?src=${linkUrl}`
      // })
    }else if(gotoType===2){//需要请求判断，loading提示
      wx.showToast({
        title:"正在跳转",
        icon:"loading",
        mask:true,
        duration: 20000
      })
      this.findGroupPurchaseCouponInfo(groupPurchaseCouponId).then((res)=>{
        if(res.data.code === 0){
          wx.hideToast();
          if(res.data.value.type===1){//区别是type。1：代金券，2：团购套餐
            wx.navigateTo({
              url:`/goods/GroupPurchaseChildPage/serviceCategory1/serviceCategory1?groupPurchaseCouponId=${groupPurchaseCouponId}`
            })
          }else{
            wx.navigateTo({
              url:`/goods/GroupPurchaseChildPage/serviceCategory2/serviceCategory2?groupPurchaseCouponId=${groupPurchaseCouponId}`
            })
          }
        }else{
          wx.hideToast();
          wx.showToast({
            title: "跳转失败",
            icon:"none",
            mask:true,
            duration: 2000
          })
        }
      })
    }else if(gotoType===3){    
      wx.navigateTo({
        url:`/goods/GroupPurchaseShop/GroupPurchaseShop?groupPurchaseMerchantId=${groupPurchaseMerchantId}`
      })
    }
  },
  // 这个接口用于加载代金券或团购套餐详情。
  // 在这里通过返回的type来区分
  //区别是type。1：代金券，2：团购套餐
  findGroupPurchaseCouponInfo(groupPurchaseCouponId){
    return wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseCouponInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:app.globalData.latitude,
          longitude:app.globalData.longitude,
          groupPurchaseCouponId:groupPurchaseCouponId,
        }	
      },
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