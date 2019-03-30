const { wxRequest, refundTime } = require('../../../utils/util.js');
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const app = getApp();
let timer = null;
let scrollHeight=0;
Page({
  	data:{
      time:new Date('2018/5/25 2:00:00').getTime(),
      loading:false,
    	loginsuccess:false,
    	orderList:[],
      orderDetail:{},   //某一个订单
      value:{},
      start:0,
      show:false,
      firstRefresh:false,
      iscartDetailBack:false,//判断是否cartDetail返回,在该页面unload会修改这个字段。如果从该页面返回。则不再刷新这个页面 
      orderListTag:0,//全部，外卖，团购
    },
    onPageScroll(e){//保存滚动
      scrollHeight=e.scrollTop;
    },
  	onShow(){
        if(this.data.iscartDetailBack){//如果cartDetail返回来的，则会修改这个字段为true
          wx.startPullDownRefresh();//开启下拉刷新,在数据请求回来后重置
          return 
        }
        let loginMessage = wx.getStorageSync('loginMessage');
        let loginStatus = wx.getStorageSync('loginstatus');
        //判断是否登入
        if (loginMessage && typeof loginMessage == "object" && loginMessage.token && loginStatus) {
            this.setData({
                start:0,
                loginsuccess:true,
            });
            //首次进入页面,如果滚动条下拉了半个item时，则滚动条上拉到顶部，再刷新
            if(scrollHeight>100){
              wx.pageScrollTo({
                scrollTop:0,
                duration:300 
              })
              setTimeout(() => {
                this.findNewUserTOrders();
              }, 500);
            }else{
              this.findNewUserTOrders();
            } 
          // if (!this.data.firstRefresh) {
          //     this.findNewUserTOrders();
          //     this.data.firstRefresh = true;
          // } else {
          //  wx.startPullDownRefresh();
          // }
            let isloginGetPlatformRedBag = wx.getStorageSync('isloginGetPlatformRedBag');  // 是否登录过领取过平台红包
            if (isloginGetPlatformRedBag) {
                this.getPlatformRedBag();
                wx.setStorageSync('isloginGetPlatformRedBag',false);
            }
        }	else {
            this.setData({
                loginsuccess:false,
                show:true
            });
        }
  	},
    checkTime(i){  
      if(i < 10 ){  
          i = "0" + i;  
      }  
      return i;  
    },
    timer(obj){  
      obj.paymentExpireTime = obj.paymentExpireTime.replace(/-/g,'/');
      obj.createTime = obj.createTime.replace(/-/g,'/');
      let nowTime =  new Date().getTime();
      let dateTime =  new Date(obj.paymentExpireTime).getTime()-3000; 
      let time = dateTime  - nowTime;
      let minute = parseInt(time/1000/60,10);   
      let second = parseInt(time/1000%60,10);  
      let min = this.checkTime(minute);  
      let sec = this.checkTime(second);   
      // return time;
      if(time < 1000) {  
          // clearInterval(timer);
          return ''; 
      } else {
        return '还剩' +  min + '分' + sec +'秒';
      } 
    },
    changeTime(){
      //2018-05-02 14:56:32
      let me = this;
      let orderList = this.data.orderList;
      let isCloseTimer = false;
      orderList.forEach(function(val,key){
        if(val.orderFlowStatus === 1){
          // 外卖
          if(val.type==1){
            isCloseTimer = true;
            val.timestamp = me.timer({
              paymentExpireTime: val.paymentExpireTime,
              createTime: val.modifyTime    // 订单未支付时，此时间等于订单创建时间
            });
            if(val.timestamp === '' ){
              val.orderFlowStatus = -1;
            }
          }else if(val.type==6){//团购
            isCloseTimer = true;
            val.timestamp = me.timer({
              paymentExpireTime: val.groupPurchaseOrder.paymentExpireTime,
              createTime: val.groupPurchaseOrder.modifyTime    // 订单未支付时，此时间等于订单创建时间
            });
            if(val.timestamp === '' ){
              val.orderFlowStatus = -1;
            }
          }
        } 
      });
      this.setData({
        show:true,
        orderList:orderList
      });
      wx.hideLoading();
      if (!isCloseTimer) {
        clearInterval(timer);
      }
    },
    changeRefundButton(item){
      if(item.type==1){
        item.createTime = item.createTime.replace(/-/g,'/');
        let time = new Date(item.createTime).getTime();
        if (time > this.data.time) {//如果创建订单的时间比2018.5还早，则？
          item.refundDetail = true;//退款详情
        } else {
          item.refundDetail = false;
        }
        item.createTime = refundTime(item.createTime);
      }
      // 修改团购的信息,有两个接口，所以处理要先判断是否有该值
      if(item.type==6){
        let orderType=undefined ;
        if(item.groupPurchaseOrder){//说明是外卖接口统一的接口返回来的对象
          orderType=item.groupPurchaseOrder.orderType
        }else if(item.orderType){
          orderType=item.orderType;
        }
        let orderTypeText="";
        // orderType:。 1, "代金券",2, "团购券",3, "优惠买单" 
        switch(orderType){
          case 1:orderTypeText="代金券";break;
          case 2:orderTypeText="团购券";break;
          case 3:orderTypeText="优惠买单";break;
          default:
        }
        if(item.groupPurchaseOrder==undefined){//说明是团购独有的接口返回来的对象
          item.orderTypeText=orderTypeText;
          item.groupPurchaseOrder=JSON.parse(JSON.stringify(item));
        }else{
          item.groupPurchaseOrder.orderTypeText=orderTypeText;
        }

        // 处理订单状态,以上已处理完不同接口导致的差异。以下统一使用item即可

        // 修改显示的时间格式
        item.groupPurchaseOrder.createTime = refundTime(item.groupPurchaseOrder.createTime.replace(/-/g,'/'));
        // @status:-1,取消订单；0，订单创建；1，等待付款；2，购买完成；3，已退款；4，等待接单；
        let status=item.groupPurchaseOrder.status;
        item.groupPurchaseOrder.childStatus=null;
     
        if(status==2){//已完成。则会有三种子状态｛待评价，待消费，已完成｝这个要自己来计算
          let usableQuantity=item.groupPurchaseOrder.usableQuantity;//还可以消费的券码数量｛未使用，锁定｝
          let useQuantity=item.groupPurchaseOrder.useQuantity;//用了的券码数量
          let hasComments=item.groupPurchaseOrder.hasComments;//是否已评价。<!-- hasComments:0,待评价；1，已评价 -->
          if(usableQuantity>0){
            item.statusText="待消费";
            item.groupPurchaseOrder.childStatus=0;
          }else if(usableQuantity==0 && useQuantity>0 && hasComments==0){
            item.statusText="待评价";
            item.groupPurchaseOrder.childStatus=1;
          }else{
            item.statusText="已完成";
            item.groupPurchaseOrder.childStatus=2;
          }
        }else if(status==-1){//取消订单
          item.statusText="已取消"
        }else if(status==0){
          item.statusText="创建订单"
        }else if(status==1){
          item.statusText="等待付款"
        }else if(status==3){
          item.statusText="已退款"
        }else if(status==4){
          item.statusText="等待接单"
        }
      }
      return item;
    },
    type6Tap(e){
      //url="/goods/GroupPurchasePay/GroupPurchaseorderDetails/server1OrderDetails/
      //server1OrderDetails?orderId={{item.groupPurchaseOrder.id}}"
      //<!-- orderType:。 1, "代金券",2, "团购券",3, "优惠买单" -->
      let {item}=e.currentTarget.dataset;
      let orderType=item.groupPurchaseOrder.orderType;
      let url="/goods/GroupPurchasePay/GroupPurchaseorderDetails";
      if(orderType===1){
        url+="/server1OrderDetails/server1OrderDetails";
      }else if(orderType===2){
        url+="/server2OrderDetails/server2OrderDetails";
      }else if(orderType===3){
        url+="/server0OrderDetails/server0OrderDetails";
      }
      url+=`?orderId=${item.groupPurchaseOrder.id}`
      wx.navigateTo({
        url:url
      })
    },
    orderListTagSwitch(e){
      let {tag}=e.target.dataset;
      this.setData({
        orderListTag:tag
      },()=>{
        this.findNewUserTOrders(false);
      })
    },
    findNewUserTOrders(status){
      if (!status) {//status false表示要展示加载小图标且是不是列表合并
        wx.showLoading({
          title: '加载中',
          mask: true
        });
      }
      let orderListTag=this.data.orderListTag;
      let reqObj={};
      reqObj.params={};
      reqObj.url="findNewUserTOrders";
      switch(orderListTag){
        case "0":break;
        case "1":{ reqObj.type=1;break;}
        case "2":{reqObj.url="findGroupPurchaseOrderList";break;}
        default:{}
      }
      reqObj.params=Object.assign({},{
        size:20,
        start:this.data.start,
        type: reqObj.type
      });
      wxRequest({
        url:'/merchant/userClient?m='+reqObj.url,
        method:'POST',
        data:{
          params:reqObj.params,
          token:app.globalData.token  
        },
      }).then(res=>{
        if (res.data.code === 0) {
          let valueArr = res.data.value;
          if (status && !this.data.iscartDetailBack) {  //!this.data.iscartDetailBack cartDeatail页面返回时重置订单列表
            if (valueArr.length != 0) {
              let orderList = this.data.orderList;
              console.log(orderList)
              valueArr.map((item)=>{
                if( reqObj.url!="findNewUserTOrders"){
                  item.type=6;
                }
                item = this.changeRefundButton(item);
                orderList.push(item);
              });
              this.data.orderList  = orderList;
              this.setData({
                loading:false
              });
            } else {
              this.setData({
                loading:true
              });
            } 
          } else {
            valueArr.map((item)=>{
              if( reqObj.url!="findNewUserTOrders"){
                item.type=6;
              }
              item = this.changeRefundButton(item);
            });
            this.data.orderList  = valueArr;
            this.setData({
              loading:false
            });
          }
          clearInterval(timer);
          timer = setInterval(this.changeTime,1000);
        } else {
          let msg = res.data.value;
          if (res.data.code === 100000) {
            setTimeout(()=>{
              wx.navigateTo({
                url:'/pages/login/login'
              });
            },1000);
          }
          this.setData({
            show:true,
            loading:false
          });
          wx.hideLoading();
          feedbackApi.showToast({title: msg});   
        } 
      }).catch(err=>{
        wx.hideLoading();
      }).finally(res=>{
        wx.stopPullDownRefresh();
        this.data.iscartDetailBack=false;//重置
        console.log("orderList",this.data.orderList);
        console.log(this.data.orderList[0].type,this.data.orderList[0].type==6)
      });
    },
    //再来一单
    nextOrder(e){
      wx.showLoading({
        title: '正在提交订单',
        mask: true
      });
      let { food } = e.currentTarget.dataset;
      wxRequest({
          url:'/merchant/userClient?m=againOrderPreview2',
          method:'POST',
          data:{
              token:app.globalData.token,
              params:{
                  orderId:food.id,
                  userId:food.userId,
                  loginToken:app.globalData.token
              } 
          },
        }).then(res=>{
          if (res.data.code === 0) {
            let value = res.data.value;
              this.setData({
                  value:res.data.value
              });
              console.log(value);
              if (value.againOrderStatus === 0 || value.againOrderStatus === 1 || value.againOrderStatus === 2) {
                let msg = value.againOrderTip
                feedbackApi.showToast({title: msg});
              } else {
                wx.navigateTo({
                  url: '/goods/queryOrder/queryOrder?merchantId='+food.merchantId
                });
              }
          } else {
              let msg = res.data.value;
              if (res.data.code === 100000) {
                setTimeout(()=>{
                  wx.navigateTo({
                    url:'/pages/login/login'
                  });
                },1000);
              }
              feedbackApi.showToast({title: msg});
          }
        }).finally(()=>{
          wx.hideLoading();
        });
    },
  	login(){
  		wx.navigateTo({
  	  		url:'/pages/login/login?switch=cartitem'
  		});
  	},
    //去支付
    payMoney(e){
      let { food,type=1} = e.currentTarget.dataset;
      if(type==1){
        wx.navigateTo({
          url: '/goods/pay/pay?orderId=' + food.id + '&price=' + food.totalPrice,
        });
      }else if(type==6){
        wx.navigateTo({
          url: '/goods/GroupPurchasePay/GroupPurchasePay?orderId=' + food.id + '&price=' + food.totalPrice,
        });
      }
    },
    //评价
    evaluateOrder(e){
      let { food,type=1} = e.currentTarget.dataset;
      this.data.orderDetail = food;
      if(type==1){
        wx.navigateTo({
          url: '/goods/createComments/createComments?orderid=' + food.id
        });
      }else if(type==6){
        wx.navigateTo({
          url: '/goods/GroupPurchaseChildPage/createEvaluate/createEvaluate?orderId=' + food.id
        });
      }
    },
    refundDetail(e){
      let { food,type=1} = e.currentTarget.dataset;
      if(type==1){
        wx.navigateTo({
          url:'/pages/goods/refundDetail/refundDetail?orderid=' + food.id
        });
      }else if(type==6){//未添加点击事件
        // /pages/goods/refundDetail/refundDetail?orderid={{orderId}}&type=6&groupPurchaseOrderCouponCodeId={{item.id}}
        wx.navigateTo({
          url:'/pages/goods/refundDetail/refundDetail?orderid=' + food.id+"&type=6&groupPurchaseOrderCouponCodeId="+""
        });
      }
    },
    // 查看券码点击事件
    lookCouponCode(e){
      let { food,type} = e.currentTarget.dataset;
      if(type==6){
        wx.navigateTo({
          url:'/goods/GroupPurchasePay/GroupPurchaseorderDetails/orderUse/orderUse?orderId=' + food.id
        });
      }
    },
    //下拉刷新
    onPullDownRefresh:function() {
      this.data.start = 0;
      this.findNewUserTOrders(this.data.iscartDetailBack);//如果是订单详情页返回来的，则不显示加载中图标
    },
    //上滑加载更多
    onReachBottom(){
      this.data.start = this.data.orderList.length;
      this.findNewUserTOrders(true);  
    },
    // 领取平台红包
    getPlatformRedBag(){
      wxRequest({
        url:'/merchant/userClient?m=getPlatformRedBag',
        method:'POST',
        data:{
          token: app.globalData.token,
          params:{
            longitude:app.globalData.longitude,
            latitude:app.globalData.latitude
          } 
        },
      }).then(res=>{
        if (res.data.code === 0) {
          if (res.data.value.status == 1) { // 该代理商有平台红包
              console.log('领取成功')
          }
        }
      });
    },
});