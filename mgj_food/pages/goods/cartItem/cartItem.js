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
      item.createTime = item.createTime.replace(/-/g,'/');
      let time = new Date(item.createTime).getTime();
      if (time > this.data.time) {
        item.refundDetail = true;
      } else {
        item.refundDetail = false;
      }
      item.createTime = refundTime(item.createTime);
      // 修改团购的信息
      if(item.type==6){
        let orderType=undefined ;
        if(item.groupPurchaseOrder){
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
        if(item.groupPurchaseOrder==undefined){//说明时团购tag点击时是该对象
          item.orderTypeText=orderTypeText;
          item.groupPurchaseOrder=JSON.parse(JSON.stringify(item));
        }else{
          item.groupPurchaseOrder.orderTypeText=orderTypeText;
        }
      }
      return item;
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
      let { food } = e.currentTarget.dataset
      wx.navigateTo({
          url: '/goods/pay/pay?orderId=' + food.id + '&price=' + food.totalPrice,
      });
    },
    //评价
    evaluateOrder(e){
      let { food } = e.currentTarget.dataset;
      this.data.orderDetail = food;
      wx.navigateTo({
        url: '/goods/createComments/createComments?orderid=' + food.id
      });
    },
    refundDetail(e){
      let { food } = e.currentTarget.dataset;
      wx.navigateTo({
        url:'/pages/goods/refundDetail/refundDetail?orderid=' + food.id
      });
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