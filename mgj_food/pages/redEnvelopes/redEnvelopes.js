var app = getApp()
Page({
  data: {
    navbar: ['红包', '代金券'],
    currentTab: 0,
    reason:false
  },
  navbarTap: function(e){
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  reasonList(){
    this.setData({
        reason:!this.data.reason
    })
  }
})