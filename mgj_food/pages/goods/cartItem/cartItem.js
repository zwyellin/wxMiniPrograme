const { wxRequest } = require('../../../utils/util.js');
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const app = getApp();
let timer = null;
Page({
  	data:{
      loading:false,
    	loginsuccess:false,
    	orderList:[],
      orderDetail:{},   //某一个订单
      value:{},
      start:0,
      show:false
  	},
  	// onLoad(){
   //    this.findNewUserTOrders();
  	// },
  	onShow(){
      let loginMessage = wx.getStorageSync('loginMessage');
      let loginstatus = wx.getStorageSync('loginstatus');
      if (loginMessage && loginstatus) {
        this.setData({
          start:0,
          loginsuccess:true,
        });
        this.findNewUserTOrders();
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
      let leftTime =  new Date().getTime();
      let dateTime =  new Date(obj.paymentExpireTime).getTime(); 
      let time = dateTime  - leftTime;
      let minute = parseInt(time/1000/60,10);   
      let second = parseInt(time/1000%60,10);  
      let min = this.checkTime(minute);  
      let sec = this.checkTime(second);   
      console.log(time)
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
      var me = this;
      let orderList = this.data.orderList;
      let isCloseTimer = false;
      orderList.forEach(function(val,key){
        if(val.orderFlowStatus === 1){
          isCloseTimer = true;
          val.timestamp = me.timer({
            paymentExpireTime:val.paymentExpireTime
          });
          if(val.timestamp === '' ){
            val.orderFlowStatus = -1;
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
    findNewUserTOrders(status){
      if (!status) {
        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 200000,
          mask: true
        });
      }
      wxRequest({
        url:'/merchant/userClient?m=findNewUserTOrders',
        method:'POST',
        data:{
          params:{
            size:20,
            start:this.data.start
          },
          token:app.globalData.token  
        },
      }).then(res=>{
        if (res.data.code === 0) {
          let valueArr = res.data.value;
          if (status) {
            if (valueArr.length != 0) {
              let orderList = this.data.orderList;
              valueArr.map((item)=>{
                orderList.push(item);
              });
              this.data.orderList  = orderList;
              this.setData({
                loading:false
              })
            } else {
              this.setData({
                loading:true
              });
            } 
          } else {
            this.data.orderList  = valueArr;
            this.setData({
              loading:false
            })
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
      });
    },
    //再来一单
    nextOrder(e){
      wx.showToast({
        title: '正在提交订单',
        icon: 'loading',
        duration: 200000,
        mask: true
      });
      let { food } = e.currentTarget.dataset;
      wxRequest({
          url:'/merchant/userClient?m=againOrderPreview',
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
                  url: '/pages/queryOrder/queryOrder?merchantId='+food.merchantId
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
      console.log(food)
      wx.navigateTo({
          url: '/pages/pay/pay?orderId=' + food.id + '&price=' + food.totalPrice,
      });
    },
    //评价
    evaluateOrder(e){
      let { food } = e.currentTarget.dataset;
      this.data.orderDetail = food;
      wx.navigateTo({
        url: '/pages/evaluate/evaluate'
      });
    },
    //下拉刷新
    onPullDownRefresh:function() {
      this.findNewUserTOrders();
    },
    //上滑加载更多
    onReachBottom(){
      this.data.start+= 10;
      this.findNewUserTOrders(true);  
    },
});