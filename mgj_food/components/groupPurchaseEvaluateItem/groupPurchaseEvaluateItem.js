// components/groupPurchaseEvaluateItem/groupPurchaseEvaluateItem.js
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
    requestObj:{
      type:Object,
    },
    //额外参数，对布局二的补充
    //@scroll {height,isMore}【可选】
    //@isPageReachBottom【可选】,选了会有加载图标等信息
    config:{
      type:Object,
    },
  },
  observers: {
    "itemObj":function(newVal,oldVal){
      newVal=this.ModifyItemObj(newVal);
      this.setData({
        _itemObj:newVal
      })
    },
    "requestObj":function(newVal,oldVal){
      if(newVal===oldVal || newVal.merchantId==null) return;
      let {size=10,merchantId}=newVal;
      this.setData({
        _requestObj:newVal,
        _size:size,
        _merchantId:merchantId,
      })
      this.findGroupPurchaseEvaluateList();
    },
    "config.isPageReachBottom":function(newVal,oldVal){
      // 如果传了该参数，则会显示加载的图标等信息
      this.setData({
        _isPageReachBottomState:true
      })
      // 如果不是false，则执行
      if(newVal){
        if(this.data._loadingState) return;
        if(this.data._listLastState){
          return;
        }
        //发送请求
        this.findGroupPurchaseEvaluateList("",true);
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _start:0,
    _size:null,
    _merchantId:null,
    _height:null,
    _isMore:false,
    _evaluateList:[],

    // 布局二相关属性
    _requestObj:null,//请求对象
    _loadingState:false,//加载状态，标识
    _listLastState:false,//列表请求完，标识
    _isPageReachBottomState:false,//是否显示加载等样式
  },
  lifetimes: {       //生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created(){
    
    },
    attached(){},
    ready(){},
    moved(){},
    detached(){}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 图片点击预览
    imageTap(e){
      let {index=0,images}=e.target.dataset;
      wx.previewImage({
        current: images[index], // 当前显示图片的http链接
        urls:images // 需要预览的图片http链接列表
        })
    },
    // 以下为布局二用到的方法
    // 发送请求
    findGroupPurchaseEvaluateList(loadingState,concatState){
      this.data._loadingState=true;	
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 20000
      })
      let _requestObj=this.data._requestObj;
      console.log("_requestObj:",_requestObj)
      wxRequest({
        url:'/merchant/userClient?m=findGroupPurchaseEvaluateList',
        method:'POST',
        data:{
          token:app.globalData.token,
          params:_requestObj
        },
      }).then(res=>{
        if (res.data.code === 0) {
          var value=this.ModifyItemObj(res.data.value);
          if(value.length<this.data._size){ //说明请求完了
            this.setData({
              _listLastState:true
            })
          }
          if(concatState){
            value=value.concat(this.data._evaluateList);
          }
          this.setData({
            _evaluateList:value,
            _start:value.length
          });
        }else {}
      }).finally(()=>{
        this.data._loadingState=false;
        setTimeout(()=>{ //数据请求好后，再显示半秒的缓存时间
          wx.hideToast();
        },500)
      });
    },
    
    // 商家评价请求-修改
    ModifyItemObj(value){
      if(value instanceof Array){
        value.forEach((item,index,arr)=>{
          // 处理images,字符串转数组
          if(item.images){
            item.images=item.images.split(";");
          }else{
            item.images=[];
          }
          //处理createTime,评论时间(去除具体时间)
          item.createTime= item.createTime.substring(0,item.createTime.indexOf(' '));
        });
      }else{
        if(value.images){
          value.images=value.images.split(";");
        }else{
          value.images=[];
        }
        //处理createTime,评论时间(去除具体时间)
        value.createTime= value.createTime.substring(0,value.createTime.indexOf(' '));
      }
      return value;
    },

    // scroll-view滚动到底事件【只有在设置了scroll-view高度时才会生效】
    scrollViewScrolltolower(){
      
    }
  }
})


