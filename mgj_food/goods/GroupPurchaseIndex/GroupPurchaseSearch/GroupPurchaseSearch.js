// goods/GroupPurchaseIndex/GroupPurchaseSearch/GroupPurchaseSearch.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 请求相关
    agentId:null,
    
    recommendSearch:[],//推荐搜索的请求回来的数组
    historyRecord:[],//历史搜索，缓存读取和设置
    merchantBySearchList:[],//搜索返回来的列表

    // 搜索框绑定的值、
    searchInputValue:null,
    // 搜索框输入的值
    searchInputOutValue:null,
    // 搜索框是否获得焦点
    isSearchInputFocus:true,

    recommendPageShow:true,//是否显示推荐搜索页面，而不是搜索列表

   //分类浮层及商家列表相关
   groupPurchaseItemRequsetObj:null,//团购商家请求参数对象
   groupPurchaseItemRequsetObjDefault:{//注意不能赋值，否则，分类筛选时合并默认请求参数会带上原先的请求参数
     agentId:null,
     latitude:null,
     longitude:null,
     size: 20,
     start: 0,
     queryString:""
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
    
    let {agentId,latitude,longitude}=app.globalData;
    let groupPurchaseItemRequsetObjDefault=this.data.groupPurchaseItemRequsetObjDefault;
    Object.assign(groupPurchaseItemRequsetObjDefault,{
      agentId,latitude,longitude
    })
    this.setData({
      groupPurchaseItemRequsetObjDefault,
      agentId,
      latitude,
      longitude
    })
    

    // 读取历史搜索
    this.RecordReadWrite();
    // 请求推荐搜索
    this.findGroupPurchaseHotSearch();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //业务。请求推荐搜索
  findGroupPurchaseHotSearch(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseHotSearch',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          agentId:this.data.agentId
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
       let recommendSearch=res.data.value;
        this.setData({
          recommendSearch
        })
      }
    })
  } ,
  // 搜索
  findGroupPurchaseMerchantBySearch(requestParams){
    let groupPurchaseItemRequsetObjDefault={};
    if(requestParams==undefined){//点搜索时，主动调用
      groupPurchaseItemRequsetObjDefault=this.data.groupPurchaseItemRequsetObjDefault;
    }else{
      groupPurchaseItemRequsetObjDefault=requestParams;
    }
    Object.assign(groupPurchaseItemRequsetObjDefault,{
      queryString:this.data.searchInputOutValue
    })
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseMerchantBySearch',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:groupPurchaseItemRequsetObjDefault
      },
    }).then(res=>{
      if (res.data.code === 0) {
       let merchantBySearchList=res.data.value;
       let inputValue=this.data.searchInputOutValue;
        console.log(merchantBySearchList)
        this.setData({
          merchantBySearchList
        })
        console.log(merchantBySearchList)
      }
    })
  },
  // 搜索框输入事件
  searchInputOutValue(e){
    let {value}=e.detail;
    this.data.searchInputOutValue=value;
    if(value.length==0){//输入框没有内容时，展示推荐搜索页面
      this.setData({
        recommendPageShow:true
      })
    }
  },
  // 点推荐item及历史搜索item事件
  recommendSearchItemTap(e){
    let {content}=e.target.dataset;
    this.setData({
      searchInputValue:content,
      searchInputOutValue:content,
     
    })
  },
  // 点搜索事件
  searchSubmit(){
    let value=this.data.searchInputOutValue;
    //先展示搜索pageItem
    this.setData({
      recommendPageShow:false
    })
    // 生成搜索
    this.findGroupPurchaseMerchantBySearch();

    // 保存记录
    let  historyRecord=this.RecordReadWrite(value);
    this.setData({
      historyRecord
    })
  },

  RecordReadWrite:function(val){
    let historyRecord=this.data.historyRecord;
    if(val==undefined){//读缓存
        if (!wx.getStorageSync('historyRecord')) {//记录为空
          historyRecord = [];
        }else{
          historyRecord = wx.getStorageSync('historyRecord');
        }
        this.setData({
          historyRecord
        })
    }else if(val!=''){//倒序放有值的缓存
        if (!wx.getStorageSync('historyRecord')) {//记录为空或没有该字段
          historyRecord=[];   
        }else {
          historyRecord=wx.getStorageSync('historyRecord');
            //先判断原先有没有这个字段
            historyRecord.find((item,index,arr)=>{
                if(item==val){
                    arr.splice(index,1);//如果有，则删除原来的
                }
            })
        }
        historyRecord.unshift(val);//倒序插
        if(historyRecord.length>6){//只保留6条
          historyRecord=historyRecord.slice(0,6);
        }
        wx.setStorageSync('historyRecord',historyRecord);
    }
    //都返回缓存
    return historyRecord
  },
  RecordDel:function(){
      console.log("删除搜索记录")
      wx.setStorageSync('historyRecord',[]);
      this.setData({
        historyRecord:[]     
      })
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
        console.log("params",params)
        let groupPurchaseItemRequsetObjDefault=JSON.parse(JSON.stringify(this.data.groupPurchaseItemRequsetObjDefault));
        console.log("groupPurchaseItemRequsetObjDefault",groupPurchaseItemRequsetObjDefault)
        Object.assign(groupPurchaseItemRequsetObjDefault,params);
        //开始请求商家列表
        this.findGroupPurchaseMerchantBySearch(groupPurchaseItemRequsetObjDefault);
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