// pages/webView/webView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webViewSrc:"",
    webViewErr:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {src}=options;
   // src="http://prelaunch.horsegj.com//horsegj/dist/html/shareredbag/redbag.html?shareRedBagRulesId=3095&scheme=mgjofficial&sharedUserId=1919&from=singlemessage"
    console.log("现在在网页page",src)
    this.setData({
      webViewSrc:src
    })
  },
  getMsg(){

  },
  webViewErr(){
    this.setData({
      webViewErr:true
    })
  }
 
})