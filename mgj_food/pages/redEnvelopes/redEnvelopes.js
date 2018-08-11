const app = getApp();
const { wxRequest, formatTime, trackTime } = require('../../utils/util.js');
Page({
  data: {
    navbar: ['红包', '代金券'],
    currentTab: 0,
    reason:false,
    start:0,
    isDisabled:0,
    redEnvelopesObjct:{}
  },
  onLoad(){
    
    this.reasonList();
    this.queryRedBagList();
  },
 
  navbarTap(e){
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  reasonList(){
    this.setData({
        reason:!this.data.reason
    })
  },
  queryRedBagList(){
    wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 200000,
        mask: true
    });
    wxRequest({
      url:'/merchant/userClient?m=queryRedBagList',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          start:this.data.start,
          size:20,
          redBagType:1,
          isDisabled:this.data.isDisabled
        }
      },
    }).then(res=>{
      if(res.data.code === 0){
        let redEnvelopesObjct = res.data.value;
       
        this.setData({
          redEnvelopesObjct:redEnvelopesObjct,
        
        })
        

      }
    }).finally(()=>{
      wx.hideLoading()
    })

  }
})