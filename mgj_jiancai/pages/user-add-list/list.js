// pages/user-add-list/list.js
var { globalData } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gender:'先生',
    detailedAddress:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      editAddress: !!globalData.editAddress && globalData.editAddress,
      gender: !!globalData.editAddress ? globalData.editAddress.gender : "先生",
      detailedAddress: !!globalData.editAddress && globalData.editAddress.address ? globalData.editAddress.address : false,
    })
  },
  changeGender(e){
    let gender = e.currentTarget.dataset.gender;
    this.setData({ gender});
  },
  formSubmit(e){
    let { gender, detailedAddress, latitude, longitude, editAddress} = this.data;
    if (!latitude && !editAddress.longitude){
      wx.showToast({
        title: '请选择地址!',
        icon:'none'
      })
      return false;
    }
    let params=e.detail.value;
    if (editAddress){
      if (editAddress.agentId){
        params.agentId = editAddress.agentId; 
      }
      params.id = editAddress.id; 
    }
    params.gender = gender;
    params.detailedAddress = detailedAddress;
    params.address = detailedAddress;
    params.latitude = latitude || editAddress.latitude; 
    params.longitude = longitude || editAddress.longitude; 
    wx.http.postReq('appletClient?m=editUserAddress', params, (res) => {
      let { success, value } = res;
      if (success) {
        /**
        wx.navigateTo({
          url: globalData.backUrl,
        })
         */
        wx.navigateBack({
          delta: 1
        })
      }else{
        wx.showToast({
          title: '出错了',
        })
      }
    })
  },
  // 选择位置
  getMap() {
    let _this=this;
    wx.chooseLocation({
      success(res) {
        _this.setData({
          detailedAddress: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
        })
      }
    })
  },
})