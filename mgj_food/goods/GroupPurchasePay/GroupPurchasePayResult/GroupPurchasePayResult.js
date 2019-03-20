// goods/GroupPurchasePay/GroupPurchasePayResult/GroupPurchasePayResult.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight:null,
    groupPurchaseItemRequsetObjDefault:{//其实还会加入经纬度
      url:"findGroupPurchaseMerchantBySearch",
      start:0,
      size:5
    },
    groupPurchaseItemRequsetObj:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
			success: (res)=> {
				this.setData({
					scrollHeight: res.windowHeight - 219*2*(app.globalData.windowWidth/750)
				});
			}
		});
    if(app.globalData.latitude){
      this.data.latitude=app.globalData.latitude;
      this.data.longitude=app.globalData.longitude;
    }
    // 开始商家列表请求,组件赋值就会请求
    let groupPurchaseItemRequsetObjDefault=this.data.groupPurchaseItemRequsetObjDefault;
    Object.assign(groupPurchaseItemRequsetObjDefault,{
      latitude:this.data.latitude,
      longitude:this.data.longitude
    })
    this.setData({
      groupPurchaseItemRequsetObj:this.data.groupPurchaseItemRequsetObjDefault
    })
  },

})