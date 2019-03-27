// goods/GroupPurchaseIndex/GroupPurchaseSort/GroupPurchaseSort.js
const app = getApp();
// 有可能打开一级，也可能是二级分类。根据childGroupPurchaseCategoryId是否为空
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude:null,
    longitude:null,
    agent:null,
    groupPurchaseCategoryId:null,//第一级的分类id,其实也是要拿去请求的参数
    childGroupPurchaseCategoryId:null,//要显示的子分类

    // 浮层分类的请求对象
    sort1RequsetObj:{
      agentId:null,
      parentCategoryId:null
    },
    //分类浮层及商家列表相关
   groupPurchaseItemRequsetObj:null,//团购商家请求参数对象
   groupPurchaseItemRequsetObjDefault:{//注意不能赋值，否则，分类筛选时合并默认请求参数会带上原先的请求参数
     url:"findGroupPurchaseMerchantBySearch",
     latitude:null,
     longitude:null,
     size: 10,
     start: 0
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
    let {groupPurchaseCategoryId,childGroupPurchaseCategoryId,name}=options;
    let groupPurchaseItemRequsetObjDefault=this.data.groupPurchaseItemRequsetObjDefault;
    // 设置标题
    wx.setNavigationBarTitle({//修改标题
      title: name||'分类'
    })
    // sort的分类请求
    let sort1RequsetObj=this.data.sort1RequsetObj;
    Object.assign(sort1RequsetObj,{
      agentId:app.globalData.agentId,
      parentCategoryId:groupPurchaseCategoryId
    })
    // 默认列表请求
    Object.assign(groupPurchaseItemRequsetObjDefault,{
      latitude:app.globalData.latitude,
      longitude:app.globalData.longitude,
      groupPurchaseCategoryId
    })
    // 默认加载要根据二级id来，如果不是为null
    let groupPurchaseItemRequsetObj=this.data.groupPurchaseItemRequsetObj;
    groupPurchaseItemRequsetObj=JSON.parse(JSON.stringify(groupPurchaseItemRequsetObjDefault));
    if(childGroupPurchaseCategoryId!=='null'){
      Object.assign(groupPurchaseItemRequsetObj,{
        childGroupPurchaseCategoryId
      })
    }
    this.setData({
      groupPurchaseItemRequsetObjDefault,
      groupPurchaseCategoryId,
      childGroupPurchaseCategoryId,
      sort1RequsetObj,
      groupPurchaseItemRequsetObj
    })
    console.log("sort1RequsetObj",sort1RequsetObj)
  },



  // 搜索列表页相关方法
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
  // 分类触发的改变Bar分类的事件。
  changeSort0Text(e){
    console.log("修改了标题")
    let {title}=e.detail;
    // 修改标题
   
    let sortBar=this.data.sortBar;
    sortBar.sort0Title=title;
    this.setData({
      sortBar
    })
  },
    // 触底
    onReachBottom: function () {
      this.setData({
        'groupPurchaseItemConfig.isPageReachBottom':true
      })
    },
})