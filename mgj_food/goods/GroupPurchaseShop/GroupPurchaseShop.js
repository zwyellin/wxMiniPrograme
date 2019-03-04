const app = getApp();
const { wxRequest } = require('../../utils/util.js');
const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
// goods/GroupPurchaseShop/GroupPurchaseShop.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupMerchantInfo:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.requestGrouopMerchantInfo();
      
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 商家信息修改
  GrouopMerchantModify:function(value){
    value.imgs=value.imgs.split(";");
    if(value.imgs.length >= 4){
      value.showImgs=value.imgs.slice(0,3)
    }else{
      value.showImgs=value.imgs;
    }
    return value;
  },
   //以下为个人方法
   requestGrouopMerchantInfo:function(){
    console.log("调用成功")
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseMerchantInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          latitude:"39.966128",
          longitude:"116.304782",
          groupPurchaseMerchantId:748
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        var value=this.GrouopMerchantModify(res.data.value);
          this.setData({
            groupMerchantInfo:value
          },function(){
            console.log(this.data.groupMerchantInfo)
          })
      }else {
      
				let msg = res.data.value;
				if (res.data.code === 100000 ) {
					setTimeout(()=>{
						wx.navigateTo({
							url:'/pages/login/login'
						});
					},1000);	
				}
				if(res.data.code === 500 && res.data.value=="商家未关联代理商"){//返回
					setTimeout(()=>{
					wx.navigateBack({ //返回前一页
						delta: 1
					  })
					},2000);	
        }
        console.log("else");
        console.log(msg)
				feedbackApi.showToast({title: msg});
			}
    })
  },
  // 点击商家图片事件
  merchantInfoImageTap:function(e){
    let {index=0,images}=e.target.dataset;
    console.log(images,index)
    wx.previewImage({
			current: images[index], // 当前显示图片的http链接
			urls:images // 需要预览的图片http链接列表
		  })
  },
  //点击电话图标事件
  callPhoneTap:function(e){
    let {contacts}=e.target.dataset;
    wx.makePhoneCall({
      phoneNumber: contacts  //电话号码
    })
  }
})