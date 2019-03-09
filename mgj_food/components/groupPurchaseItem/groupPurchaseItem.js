
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
      if(newVal===oldVal) return;
      let {size=10,merchantId,latitude,longitude}=newVal;
      this.setData({
        _size:size,
        _merchantId:merchantId,
        _latitude:latitude,
        _longitude:longitude
      })
      this.requestData();
    },
    "config.isPageReachBottom":function(newVal,oldVal){
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
    _itemObj:null,
    _responseList:null,
    _start:0,
    _size:10,
    _id:null,
    _height:null,
    _isMore:false,
    // 状态相关
    _loadingState:false,//加载状态，标识
    _listLastState:false,//列表请求完，标识
    // 额外请求参数属性
    _latitude:null,
    _longitude:null
  },
  lifetimes: {       //生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created(){},
    attached(){},
    ready(){},
    moved(){},
    detached(){}
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
        if(value.imgs){
            value.imgs=value.imgs.split(";");
        }else{
            value.imgs=[];
        }
        // 提取出来代金券和团购套餐对象=>对应数组
        value.voucher=[];//代金券
        value.groupSetMeal=[];//团购套餐
        value.groupPurchaseCouponList.forEach((item,index,arr) => {
          if(item.type==1){//代金券
            value.voucher=value.voucher.concat(item);
          }else if(item.type==2){//团购套餐
            value.groupSetMeal= value.groupSetMeal.concat(item);
          }
        })
        return item;
      }
      // 内部方法结束
      return value;
    }
  }
})
