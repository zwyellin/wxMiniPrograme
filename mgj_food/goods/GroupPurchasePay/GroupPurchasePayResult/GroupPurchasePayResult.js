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
    groupPurchaseItemRequsetObjDefault:{//其实还会加入经纬度
      start:0,
      size:5
    },
    groupPurchaseItemRequsetObj:null,

    promotionList:null,//下单后的马管家券,红包等整体的对象
    promotionListShow:true,//点X后置为false
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
    this.findNewTOrderById().then(()=>{//再去请求代金券红包列表
      this.getPromotionListByOrderId();
    });
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
		return wxRequest({
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
        wx.hideLoading();
	    })
  },
  getPromotionListByOrderId(){
    wxRequest({
      url:'/merchant/userClient?m=getPromotionListByOrderId',
      method:'POST',
      data:{
          params:{
            orderId: this.data.orderId
          }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let promotionList=res.data.value;
        promotionList.hascoupons=true;
        if(promotionList.coupons.couponsAmt==undefined){
          promotionList.hascoupons=false;
        }
        promotionList.hasmerchantRedBags=true;
        if(promotionList.merchantRedBags.length==0){
          promotionList.hasmerchantRedBags=false;
        }
        this.setData({
          promotionList:res.data.value
        })
      } else {
        
      }
   })
  },
  promotionListLook(e){
    // 点查看红包，则先关闭再跳转。避免回来还展示
    this.setData({
      promotionListShow:false
    },()=>{
      wx.navigateTo({
        url:"/goods/userredBag/userredBag"
      })
    })
  },
  promotionListClose(e){
    this.setData({
      promotionListShow:false
    })
  }


})