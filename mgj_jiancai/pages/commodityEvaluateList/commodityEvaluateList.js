// pages/commodityEvaluateList/commodityEvaluateList.js
var { globalData } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isTypes:1,
    list: [],
    goodsId:'',
    page: {
      limit: 10,
      start: 0,
      isMore: true
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ goodsScore: options.goodsScore, merchantId: options.merchantId, goodsId:options.goodsId})
    this.getData(options.goodsId);
  },
  getData(goodsId,types,isMore){
    let { page}=this.data;
    var params = {
      start:page.start,
      limit: page.limit,
      //merchantId: merchantId || this.data.merchantId,
      goodsId: goodsId || this.data.goodsId,
    };
    if (isMore){
      let page = this.data.page
      page.start = 0
      params.start = 0
      this.setData({
        page
      })
    }
    if(types === 2){
      params.hasImages = 1
    }else{
      delete params.hasImages
    }
    wx.http.postReq('appletClient?m=findBuildingMaterialsGoodsCommentsList', params, (data) => {
      let { success, value } = data;
      if (success) {
        let list = this.data.list
        data.value = data.value.map(i=>{
          i.imagesObj = i.images ? i.images.split(';') : []
          return i
        })
        if (isMore){
          list = data.value
        } else {
          if (data.value.length > 0) {
            list = [...list, ...data.value]
          }
        }
        if (data.value.length >= this.data.page.limit) {
          page.start += 10;
          page.isMore = true;
        } else {
          page.isMore = false;
        }
        this.setData({
          list,
          page
        })
        //console.log(this.data.list)
      }
    })
  },
  types(e){
    let isTypes = e.currentTarget.dataset.type - 0;
    this.setData({
      isTypes,
    })
    this.getData(this.data.goodsId, isTypes, true);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.page.isMore) {
      this.getData( this.data.goodsId)
    }
  },
})