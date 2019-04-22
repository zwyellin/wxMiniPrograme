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
   src="https://www.saibaojt.com/appDownload.html";////horsegj/dist/html/shareredbag/redbag.html?shareRedBagRulesId=3095&scheme=mgjofficial&sharedUserId=1919&from=singlemessage
   let src1="https://prelaunch.horsegj.com";
   let src2="https://wxapi.horsegj.com" 
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
  },
 

  // 
  formSubmit(e){
    console.log('form发生了submit事件，携带数据为：', e.detail);
    this.xx(e);
  },
  xx(e){
    console.log("被电击了",e)
  }
})