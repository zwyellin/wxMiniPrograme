// goods/GroupPurchaseChildPage/shareVouchers/shareVouchers.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    couponCodeList:null,
    merchantId:null,

    ischangeToHistoryPage:false,
   
    hasisCumulate0:false,//是否有不可叠加的被选中了
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {merchantId,isExpire=0}=options;
    if(isExpire==1){
        this.setData({
          ischangeToHistoryPage:true
        })
    }
    this.setData({
      merchantId,
    },()=>{
      this.findGroupPurchaseOrderCouponCodeList(isExpire);
    })
    
  },

  findGroupPurchaseOrderCouponCodeList(isExpire){
    let params={
      isExpire: isExpire,//0为可用券。1为历史券。ui底部可以点击查看历史券
      merchantId: this.data.merchantId,
      size: 20,
      start: 0
    }
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseOrderCouponCodeList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:params
      },
    }).then(res=>{
      if(res.data.code==0){
        let couponCodeList=this.modifyCouponCodeList(res.data.value);
        this.setData({
          couponCodeList:couponCodeList
        })
      }else{
        wxRequest.wx.showToast({
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
    couponCodeList.forEach((_item)=>{
      if(_item.checkType) num+=1;
    })
    if(num==0){//第一个
      item.checkType=!item.checkType;//同时标记选中状态
      if(item.isCumulate==0) hasisCumulate0=true;//第一个选的就是不可叠加的。做好已有不可叠加的标记
    }else{//后续只能添加可叠加的，不可叠加的只能是第一个
      if(item.isCumulate==0){//不可叠加
        wx.showToast({
          title:"你不能再选择不可叠加的代金券",
          icon:"none"
        })
      }else{//可叠加
        if(hasisCumulate0){//如果第一个有选不可叠加的
          wx.showToast({
            title:"你已选择不可叠加的代金券",
            icon:"none"
          })
        }else{//第一个不能不可叠加的
          item.checkType=!item.checkType;//同时标记选中状态
        }
      }
    }
    couponCodeList[index]=item;
    this.setData({
      couponCodeList
    })
  }
})