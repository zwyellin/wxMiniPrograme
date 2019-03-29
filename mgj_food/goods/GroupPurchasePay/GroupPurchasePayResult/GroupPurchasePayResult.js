// goods/GroupPurchasePay/GroupPurchasePayResult/GroupPurchasePayResult.js
const { wxRequest ,NumberAnimate} = require('../../../utils/util.js');
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
      size:10
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
    this.setData({
      orderId
    })
    wx.getSystemInfo({
			success: (res)=> {
				this.setData({
					scrollHeight: res.windowHeight - 219*2*(app.globalData.windowWidth/750)
				});
			}
    });
    // 设置支付页面是否触发onUnload事件
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.data.triggeronUnload=false;

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
    wx.switchTab({
      url:'/pages/index/index'
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
          this.setData({
            groupPurchaseOrder,
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
        },()=>{//显示之后数字动态改变
          let num1 = promotionList.coupons.couponsAmt
          let n1 = new NumberAnimate({
            from:num1,//开始时的数字
            speed:5000,//总时间
            refreshTime:100,//刷新一次的时间，频率
            decimals:3,//小数点后的位数
            onUpdate:()=>{
              this.setData({
              'promotionList.coupons.couponsAmt':n1.tempValue
              });
            },
            onComplete:()=>{
              //console.log("随机红包结束")
            }
          });
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
  },
  // 完成按钮点击事件
  finishBtnTap(e){
    // <!-- groupPurchaseOrder:orderType:。 1, "代金券",2, "团购券",3, "优惠买单" --> 
    let orderType=this.data.groupPurchaseOrder.orderType;
    let url="/goods/GroupPurchasePay/GroupPurchaseorderDetails";
    if(orderType===1){
      url+="/server1OrderDetails/server1OrderDetails";
    }else if(orderType===2){
      url+="/server2OrderDetails/server2OrderDetails";
    }else if(orderType===3){
      url+="/server0OrderDetails/server0OrderDetails";
    }
    url+=`?orderId=${this.data.groupPurchaseOrder.id}`;
    wx.navigateTo({
      url:url
    })
  },
})