// goods/GroupPurchasePay/GroupPurchasePayResult/GroupPurchasePayResult.js
const { wxRequest} = require('../../../utils/util.js');
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
    // findNewTOrderById返回来的对象
    groupPurchaseOrder:null,//订单信息
    shareRedBagInfo:null,//分享红包

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
          let shareRedBagInfo=res.data.value.shareRedBagInfo;
          let groupPurchaseMerchantName=groupPurchaseOrder.groupPurchaseMerchantName;
          this.setData({
            groupPurchaseOrder,
            shareRedBagInfo,
          })
	        } else {
	          	let msg = res.data.msg;
          } 
        wx.hideLoading();
	    })
  },

  // 分享红包
  shareRedBagHideAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).scale(0,0).step();
	      	setTimeout(()=>{
	      		this.setData({
	        		shareShow:false,
	      		});
	      	},1000);
	      	this.setData({
	        	shareRedBagAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).scale(1,1).step();//修改透明度,放大  
		this.setData({  
		   shareRedBagAnimation: animation.export()  
		}); 
	},
  clickImgShareShowWX(){
		this.shareRedBagShowAnimation();
		this.setData({
			shareShow:true
		});
	},
  	shareRedBagShowAnimation(){
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(1).scale(1,1).step();
	      	this.setData({
	        	shareRedBagAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).scale(0,0).step();//修改透明度,放大  
		this.setData({  
		   shareRedBagAnimation: animation.export()  
		}); 
  },
  	//订单完成后出现发红包按钮
	clickImgShareShowWX(){
		this.shareRedBagShowAnimation();
		this.setData({
			shareShow:true
		});
	},
  // 下单红包
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
					let expirationTime=promotionList.coupons.expirationTime-data2;
          let oneDay=24*60*60*1000;
          promotionList.coupons.expirationTime=Math.ceil(expirationTime/oneDay);
				}
        promotionList.hasmerchantRedBags=true;
        if(promotionList.merchantRedBags===undefined ||promotionList.merchantRedBags==null || promotionList.merchantRedBags.length==0){
          promotionList.hasmerchantRedBags=false;
        }else{ // 设置有效期
          let merchantRedBags=promotionList.merchantRedBags;
          merchantRedBags.forEach((_item,_index)=>{
            let data=new Date(_item.expirationTime);
            _item.expirationTime=data.getFullYear()+"."+(data.getMonth()+1)+"."+data.getDate()
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
    },()=>{
			if(this.data.shareRedBagInfo){
				this.clickImgShareShowWX();//打开分享红包
			}
		})
  },
  	//关闭红包分享页面
	closeShare(){
		this.shareRedBagHideAnimation()
	},
  
  // 分享
  onShareAppMessage(res) {
    console.log("分享红包path:",this.data.shareRedBagInfo.url)
    return {
        title: '马管家红包来袭',
        path: this.data.shareRedBagInfo.url,
        imageUrl: this.data.shareRedBagInfo.img,
        success: function(res) {
          // 转发成功
       },
        fail: function(res) {
          // 转发失败
        }
    };
  },
  myCatchTouch(){
		return false;
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