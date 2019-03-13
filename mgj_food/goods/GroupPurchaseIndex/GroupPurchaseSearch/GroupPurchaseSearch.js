// goods/GroupPurchaseIndex/GroupPurchaseSearch/GroupPurchaseSearch.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 请求相关
    agentId:3,
    

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {agentId}=options;

    

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
  findGroupPurchaseMerchantBySearch(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseMerchantBySearch',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          agentId: 3,
          latitude: 39.96606874899509,
          longitude: 116.3047862214218,
          size: 20,
          start: 0,
          queryString: this.data.searchInputOutValue 
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
       let merchantBySearchList=res.data.value;
       let inputValue=this.data.searchInputOutValue;
        //标记
        merchantBySearchList.forEach((_item,_index)=>{
          console.log(_index,_item.name)
          if(_item.name.indexOf(inputValue)!=-1){
            console.log("进来了")
            _item.name=_item.name.replace(inputValue,"<text style='color:red'>"+inputValue+"</text>")
          }
        })
        console.log(merchantBySearchList)
        this.setData({
          merchantBySearchList,
          recommendPageShow:false
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
  // 点推荐item事件
  recommendSearchItemTap(e){
    let {content}=e.target.dataset;
    this.setData({
      searchInputValue:content,
      searchInputOutValue:content
    })
  },
  // 点搜索事件
  searchSubmit(){
    console.log("提交")
    let value=this.data.searchInputOutValue;
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
  }

 
})