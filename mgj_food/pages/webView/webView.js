// pages/webView/webView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webViewSrc:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {src}=options;
    this.setData({
      webViewSrc:src
    })
  },
  getMsg(){

  },
  webViewLoad(){

  }
 
})