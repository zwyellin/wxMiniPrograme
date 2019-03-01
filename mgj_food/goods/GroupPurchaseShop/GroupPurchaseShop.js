// goods/GroupPurchaseShop/GroupPurchaseShop.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      merchantInfoObj:{
        name:"建材团购",
        images:["../image/good-face.png","../image/good-face.png","../image/good-face.png","../image/good-face.png","../image/good-face.png","../image/good-face.png"],
        showImages:[],
        averageConsume:300,
        businessHours:"6:00-18:30",
        averageScore:4.3,
        type:1,//是不是外卖商家
        latitude:39.966128,
        longitude: 116.304782,
        address:"北京市海淀区北三环西路甲18号大钟寺c座605号",
        distance:2234,//距离：顾客位置到店家的距离
        serverType:[
          {type:0,discount:5.0,sold:200},
          {type:1,total:120,value:100,tags:["需预约","可折叠","需预约","可折叠","需预约","可折叠"],sold:100},
          {type:2,name:"窗帘",total:330,value:100,tags:["需预约","可折叠","需预约","可折叠","需预约","可折叠"],sold:400,img:"../image/good-face.png"}
        ],
        phoneNumber:"13456789432"
      },
      merchantRecommend:["推荐第一个","推荐第二个","推荐第三个","推荐的第四个","推荐的第五个","推荐的第六个"],
      merchantServe:["无烟区","刷卡","停车","包厢","景观位","无烟区","刷卡","停车","包厢","景观位","无烟区","刷卡","停车","包厢","景观位"],
      intro:"建材行业第一品牌，品质保障"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //这边设置要显示的商家图片列表

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let showImages=undefined;
    if(this.data.merchantInfoObj.images.length>=4){
     showImages=this.data.merchantInfoObj.images.slice(0,3);
    }else{
     showImages=this.data.merchantInfoObj.images;
    }
    this.setData({
     'merchantInfoObj.showImages':showImages
    })
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

  //以下为个人方法

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
  callPhoneTap:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.merchantInfoObj.phoneNumber   //电话号码
    })
  }
})