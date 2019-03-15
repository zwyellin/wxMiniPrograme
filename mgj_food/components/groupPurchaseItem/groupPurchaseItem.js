
const app = getApp();
const { wxRequest } = require('../../utils/util.js');
const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //布局一、传入单个对象，布局为单个
    itemObj:{
      type:Object,
    },
    //布局二、传入请求参数对象，布局为列表
    // @size Number,一次请求的数量【可选】，默认为10
    // @merchantId Number,商家id【必选】
    // @latitude【必选】
    // @longitude【必选】
    requestObj:{
      type:Object,
    },
    //额外参数，对布局二的补充
    //@scroll {height,isMore}【可选】
    //@isPageReachBottom
    config:{
      type:Object,
    },
  },
  observers: {
    "itemObj":function(newVal,oldVal){
      newVal=this._modifyItemObj(newVal);
      this.setData({
        _itemObj:newVal
      })
    },
    "requestObj":function(newVal,oldVal){
      let requestUrl="";
      if(newVal===oldVal || newVal==null) return;
      else{
        requestUrl=newVal.url;
        if(requestUrl==undefined) requestUrl="findNearGroupPurchaseMerchant2"//默认值
        delete newVal.url;
      }
      newVal=Object.assign({//初始值
        start:0,
        size:10,
        latitude:app.globalData.latitude,
        longitude:app.globalData.longitude
      },newVal)

      this.setData({
        _requestObj:newVal,
        _requestUrl:requestUrl,
        _listLastState:false//组件会复用，所以在数据加载前就false。避免显示之前的消息
      })
      this.requestData();
    },
    "config.isPageReachBottom":function(newVal,oldVal){
       // 如果传了该参数，则会显示加载的图标等信息
       this.setData({
        _isPageReachBottomState:true,
      })
      // 如果不是false，则执行
      if(newVal){
        if(this.data._loadingState) return;
        if(this.data._listLastState){
          return;
        }
        //发送请求
        this.requestData("",true);
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    // 固定属性
    _itemObj:null,//布局一
    _requestObj:null,//布局二
    _requestUrl:null,
    _responseList:[],//请求回来的列表
    _start:0,

    _height:null,
    _isMore:false,
    
   
    // 状态相关
    _isPageReachBottomState:false,//是否显示加载等样式
    _loadingState:false,//加载状态，标识
    _listLastState:false,//列表请求完，标识

  },
  lifetimes: {       //生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created(){
     
    },
    attached(){
    
    },
    ready(){},
    moved(){},
    detached(){
 
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //修改ItemObj方法
    _modifyItemObj(value){
      if(value instanceof Array){
        value.forEach((item,index,arr)=>{
          item=_modify(item);
        })
      }else{
        value=_modify(value)
      }
      // 内部方法
      function _modify(item){
        if(item.imgs){
            item.imgs=item.imgs.split(";");
        }else{
            item.imgs=[];
        }
        // 提取出来代金券和团购套餐对象=>对应数组
        item.voucher=[];//代金券
        item.groupSetMeal=[];//团购套餐
        item.groupPurchaseCouponList.forEach((_item,index,arr) => {
          if(_item.type==1){//代金券
            item.voucher=item.voucher.concat(_item);
          }else if(_item.type==2){//团购套餐
            item.groupSetMeal= item.groupSetMeal.concat(_item);
          }
        })
        return item;
      }
      // 内部方法结束
      return value;
    },

    // 发送请求
    requestData(loadingState,concatState){
      this.data._loadingState=true;	
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 20000
      })
      let _requestObj=this.data._requestObj;

      wxRequest({
        url:'/merchant/userClient?m='+this.data._requestUrl,
        method:'POST',
        data:{
          token:app.globalData.token,
          params:_requestObj
        },
      }).then(res=>{
        if (res.data.code === 0) {
          let value=this._modifyItemObj(res.data.value);
          if(value.length<this.data._requestObj.size){ //说明请求完了
              this.setData({
                _listLastState:true
              })
          }
          if(concatState){
            value=value.concat(this.data._responseList);
          }
       
          this.data._requestObj.start=value.length;
          this.setData({   
            _responseList:value
          });
          wx.hideToast();
        }else if(res.data.code === 500 ){//返回
          wx.hideToast();
          wx.showToast({
            title: res.data.value,
            icon: 'none',
            duration: 2000
          })
					setTimeout(()=>{
          wx.hideToast();
					wx.navigateBack({ //返回前一页
						delta: 1
            })
					},5000);	
        }
      }).finally(()=>{
          this.data._loadingState=false;
      });
    }

  }
})
