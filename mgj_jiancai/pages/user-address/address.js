// pages/user-address/address.js
var { globalData } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData(options.agentId || null);
  },
  getData(agentId = null){
    let params= {
      agentId
    }
    wx.http.postReq('appletClient?m=findUserAddress', params, (res) => {
      let { success, value } = res;
      if (success) {
        //console.log(value);
        value = value.map(item=>{
          if (item.address.indexOf(item.houseNumber) !== -1){
            item.address = item.address.replace(item.houseNumber,'')
          }
          return item
        })
        this.setData({
          dataList:value
        })
      }else{
        wx.showToast({
          title: '出错了,请联系管理员',
        })
      }
    })
  },
  addAddress(e){
    let item = e.currentTarget.dataset.item;
    globalData.backUrl = `/${this.route}`;
    globalData.editAddress = item;
    wx.navigateTo({
      url: '/pages/user-add-list/list'
    })
  },
  backOrder(e){
    let isClick = e.currentTarget.dataset.item;
    if (!isClick.overShipping){
      if (globalData.orderBackUrl) {
        globalData.addressData = e.currentTarget.dataset.item;
        wx.navigateTo({
          url: globalData.orderBackUrl,
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    this.getData();
  },
})