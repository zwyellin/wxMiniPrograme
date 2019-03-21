// goods/GroupPurchasePay/GroupPurchasePayResult/GroupPurchasePayResult.js
const { wxRequest } = require('../../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight:null,
    orderId:null,
    // 订单信息
    groupPurchaseMerchantName:null,
    id:null,//订单编号
    totalPrice:null,//实付金额

    // 附近商家
    groupPurchaseItemRequsetObjDefault:{//其实还会加入经纬
      start:0,
      size:5
    },
    groupPurchaseItemRequsetObj:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId}=options;
    this.data.orderId=orderId;
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

    // 根据orderId请求数据
    this.findNewTOrderById();
  },
  onUnload(){
      wx.redirectTo({
        url:'/goods/GroupPurchaseIndex/GroupPurchaseIndex'
      })
  },
  findNewTOrderById(){
		wx.showLoading({
	        title: '加载中',
	        mask: true
	    });
		wxRequest({
	        url:'/merchant/userClient?m=findNewTOrderById',
	        method:'POST',
	        data:{
	          	params:{
	            	orderId: this.data.orderId
	          	}
	        },
	      }).then(res=>{
	        if (res.data.code === 0) {
          let groupPurchaseOrder=res.data.value.groupPurchaseOrder;
          let groupPurchaseMerchantName=groupPurchaseOrder.groupPurchaseMerchantName;
          let id=groupPurchaseOrder.id;
          let totalPrice=groupPurchaseOrder.totalPrice;
          this.setData({
            groupPurchaseMerchantName,
            id,
            totalPrice
          })
	        } else {
	          	let msg = res.data.msg;
	        } 
	    }).finally(()=>{
	    	wx.hideLoading();
	    });
	},

})