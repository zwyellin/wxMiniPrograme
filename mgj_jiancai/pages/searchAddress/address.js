// pages/searchAddress/address.js
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: 'R6XBZ-7B5AJ-YROFI-FVQII-DUY35-DEF5X'
});
var { globalData } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    list: [],
    dataList: [],
    items: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
    this.getItemAddress();
  },
  getData() {
    wx.http.postReq('appletClient?m=findUserAddress', {}, (res) => {
      let { success, value } = res;
      if (success) {
        let dataList = value.map(item=>{
          item.title = item.detailedAddress
          return item
        })
        this.setData({
          dataList
        })
      }
    })
  },
  searchValueInput(e) { //改变搜索框内容
    let value = e.detail.value;
    this.setData({
      searchValue: value,
    });
    this.search(value)
  },
  search(queryString) { // 搜索
    wx.showLoading({
      title: '加载中',
    })
    let _this = this;
    qqmapsdk.getSuggestion({
      keyword: queryString,
      success: function (res) {
        _this.setData({
          list: res.data
        })
      },
      complete: function (res) {
        wx.hideLoading();
      }
    })
  },
  getItemAddress() { //查询当前位置
    let _this = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        wx.showLoading({
          title: '加载中',
        })
        qqmapsdk.reverseGeocoder({
          location: {
            longitude: res.longitude,
            latitude: res.latitude
          },
          success: function (res) {
            _this.setData({
              items:{
                location: res.result.location,
                title: res.result.formatted_addresses.recommend
              },
              itemAddress: res.result.formatted_addresses.recommend
            })
          },
          complete: function (res) {
            wx.hideLoading();
          }
        });
      }
    })
  },
  getAds(e){ // 获取位置传递到全局
    let item = e.currentTarget.dataset.item;
    let localPosition = globalData.localPosition

    if (item.latitude){
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: item.latitude,
          longitude: item.longitude
        },
        coord_type: 3,//baidu经纬度
        success: function (res) {
          var location = res.result.ad_info.location;
          item.latitude = location.lat;
          item.longitude = location.lng;
        }
      });
    }



    globalData.localPosition.longitude = (item.location && item.location.lng) || item.longitude
    globalData.localPosition.latitude = (item.location && item.location.lat) || item.latitude
    localPosition.longitude = (item.location && item.location.lng) || item.longitude;
    localPosition.latitude = (item.location && item.location.lat) || item.latitude;
    //wx.setStorageSync('localPosition', localPosition)
    globalData.addressSel = item
    console.log(globalData.addressSel);
    var page = getCurrentPages()[getCurrentPages().length-2];
    wx.switchTab({
      url: '../index/index',
      success: function (e) {
        if (page == undefined || page == null) return;
        console.log("load前");
        console.log(page)
        page.onLoad();
      }
    });
  }
})