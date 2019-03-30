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
        let couponsAmt=JSON.parse(JSON.stringify(res.data.value.coupons.couponsAmt));
        promotionList.hascoupons=true;
        if(promotionList.coupons.couponsAmt==undefined){
          promotionList.hascoupons=false;
        }else{//获取马管家券有效期
					let data2=new Date().getTime();
					let expirationTime=new Date( promotionList.coupons.expirationTime-data2);
					promotionList.coupons.expirationTime=expirationTime.getDay()+(expirationTime.getHours()>0?1:0)
				}
        promotionList.hasmerchantRedBags=true;
        if(promotionList.merchantRedBags===undefined ||promotionList.merchantRedBags==null || promotionList.merchantRedBags.length==0){
          promotionList.hasmerchantRedBags=false;
        }else{ // 设置有效期
          let merchantRedBags=promotionList.merchantRedBags;
          merchantRedBags.forEach((_item,_index)=>{
            let data=new Date(_item.expirationTime);
            _item.expirationTime=data.getFullYear()+"."+(data.getMonth()+1)+"."+data.getDay()
          })
          promotionList.merchantRedBags=merchantRedBags
        }
        this.setData({
          promotionList
        },()=>{//显示之后数字动态改变
          let k=0
          let t1=setInterval(()=>{
            k+=1;
            if(k==10) {
              clearInterval(t1)
              console.log(couponsAmt);
              setTimeout(()=>{//避免太频繁，堵塞
                this.setData({
                  'promotionList.coupons.couponsAmt':couponsAmt
                })
              },100)
            }
            this.setData({
              'promotionList.coupons.couponsAmt':parseInt(Math.random()*10*100)/100 //保留两位的随机数
            })
          },100)
        })
      } else {
        
      }
   })
  },
  redBagsGotoTap(e){
    let {index}=e.target.dataset;
    let merchantRedBags=this.data.promotionList.merchantRedBags;
    let {merchantId,businessType}=merchantRedBags[index];
    if(businessType==1){//外卖
      wx.navigateTo({
				url:"/goods/shop/shop?merchantid=" + merchantId,
			});
    }else if(businessType==6){//团购
      wx.navigateTo({
        url:`/goods/GroupPurchaseShop/GroupPurchaseShop?groupPurchaseMerchantId=${merchantId}`
      })
    }
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