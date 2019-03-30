// goods/GroupPurchaseChildPage/shareVouchers/shareVouchers.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    merchantId:null,
    couponCodeList:[],//请求下来的代金券
  
    ischangeToHistoryPage:false,//是否切入到了历史代金券的本页面
   
    hasisCumulate0:false,//是否有不可叠加的被选中了

    prevPage:null,
    shareVouchersData:null,//本页面要保存的数据，同时也会保存到上个页面【共享】
    // 如果上个页面没有该值，则会重新加载本页，否则说明是本页面返回再进来这页面的，则根据data重新渲染
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {merchantId,isExpire=0}=options;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    this.data.prevPage=prevPage;
    this.data.isExpire=isExpire;
    if(isExpire==1){//说明是点击历史代金券进去的本页面
      this.setData({
        ischangeToHistoryPage:true
      })
      // 设置标题
			wx.setNavigationBarTitle({
				title:"历史代金券"
		  })
    }else{
      // 设置标题
			wx.setNavigationBarTitle({
				title: "我的代金券"
		  })
    }
    if(this.data.prevPage.data.shareVouchersData===undefined || isExpire==1){
      this.setData({
        merchantId,
      },()=>{
        this.findGroupPurchaseOrderCouponCodeList(isExpire).then(()=>{
          wx.hideToast();
        });
      })
    }else{
      console.log("读取上个页面数据，重新渲染");
      wx.showToast({
        title:"加载中",
        icon:"loading",
        duration:20000
      })
      let couponCodeList=this.data.prevPage.data.shareVouchersData.couponCodeList;
      this.setData({
        couponCodeList:couponCodeList
      },()=>{
        wx.hideToast();
      })
      // 遍历确认hasisCumulate0:false,//是否有不可叠加的被选中了
      couponCodeList.forEach((_item,_index)=>{
        if(_item.checkType && _item.isCumulate==0) this.setData({
          hasisCumulate0:true
        });
      })
    }
  },
  // 页面返回时，保存本页面要保存的数据
  onUnload(){
    let shareVouchersData={};
    shareVouchersData.couponCodeList=this.data.couponCodeList;
    this.data.prevPage.data.shareVouchersData=shareVouchersData;
  },
  // 触底事件
  onReachBottom(){
    this.findGroupPurchaseOrderCouponCodeList(this.data.isExpire,true)
  },
  findGroupPurchaseOrderCouponCodeList(isExpire,status){
    wx.showToast({
      title:"加载中",
      icon:"loading",
      duration:20000
    })
    let params={
      isExpire: isExpire,//0为可用券。1为历史券。ui底部可以点击查看历史券
      merchantId: this.data.merchantId,
      size: 20,
      start: this.data.couponCodeList.length
    }
    return wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseOrderCouponCodeList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:params
      },
    }).then(res=>{
      wx.hideToast();
      if(res.data.code==0){
        let couponCodeListNew=this.modifyCouponCodeList(res.data.value);
        let couponCodeList=this.data.couponCodeList;
        if(status) couponCodeListNew=couponCodeList.concat(couponCodeListNew);
        this.setData({
          couponCodeList:couponCodeListNew
        })
      }else{
       wx.showToast({
          title: res.data.value,
          icon: 'none',
          duration: 1500,
          mask: true
        });
      }
    })
  },
  modifyCouponCodeList(List){
    if(List instanceof Array){
      List.forEach((_item,_index)=>{
        _item=_modify(_item);
      })
    }else{
      List=_modify(List);
    }
    function _modify(_item){
      // 处理叠加状态item.isCumulate//是否叠加 0:否,1:是 
      // isCumulateText
      if(_item.isCumulate==1) _item.isCumulateText="可叠加使用";
      else _item.isCumulateText="不可叠加使用";
      _item.checkType=false;
      return _item;
    }
    return List
  },

  // 点击事件
  checkTap(e){
    let couponCodeList=this.data.couponCodeList;
    let hasisCumulate0=this.data.hasisCumulate0;
    let index=parseInt(e.currentTarget.dataset.index);
    let item=couponCodeList[index];
    let num=0;
    couponCodeList.forEach((_item,_index)=>{
      if(_item.checkType) num+=1;
    })
    if(num==0){//第一个
      hasisCumulate0=false;//重置
      item.checkType=true;//同时标记选中状态
      if(item.isCumulate==0) hasisCumulate0=true;//第一个选的就是不可叠加的。做好已有不可叠加的标记
    }else{//后续只能添加可叠加的，不可叠加的只能是第一个
      if(item.isCumulate==0){//不可叠加
        if(item.checkType){//如果已经被选中了，则取消选中
          item.checkType=false;
        }else if(hasisCumulate0){//否则提示
          wx.showToast({//已选中不可叠加情况
            title:"你不能再选择不可叠加的代金券",
            icon:"none"
          })
        }else{
          wx.showToast({//木有选中不可叠加的
            title:"这个是不可叠加的代金券",
            icon:"none"
          })
        }
      }else{//可叠加
        if(hasisCumulate0){//如果第一个有选不可叠加的
          wx.showToast({
            title:"你已选择不可叠加的代金券",
            icon:"none"
          })
        }else{//第一个是可叠加的
          item.checkType=!item.checkType;//同时标记选中状态
        }
      }
    }
    this.data.hasisCumulate0=hasisCumulate0;
    couponCodeList[index]=item;
    this.setData({
      couponCodeList
    })
  },
  // 按钮点击事件
  btnTap(){
    wx.navigateBack({
      delta:1
    })
  }
})