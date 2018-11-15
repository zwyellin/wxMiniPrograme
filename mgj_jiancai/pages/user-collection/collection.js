
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: {
      limit: 10,
      start: 0,
      isMore: true
    }
  },
  getInit(){
    var param = {
      start: 0,
      size: 10,
      merchantType: 6
    }
    wx.http.postReq('userClient?m=findUserFavorites', param, (data) => {
      if (data.success) {
        let list = this.data.list
        let page = this.data.page
        if (data.value.length>0){
          list = [...list, ...data.value]
        }
        if (data.value.length>= this.data.page.limit){
          page.start += 10;
          page.isMore = true;
        } else {
          page.isMore = false;
        }
        this.setData({
          list,
          page
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInit();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.page.isMore) {
      this.getList()
    }
  },
})