// components/groupPurchaseSortBar/groupPurchaseSortBar.js
const app = getApp();
const { wxRequest } = require('../../utils/util.js');

Component({
  /**
   * 组件的属性列表
   * @入参：requestObj【必选】分类的请求参数
   * @入参：sortActive【可选】打开时，要打开那一部分的内容。是分类还是排序还是筛选
   * @出参事件：outRequestparams。具体看maskClickTap函数
   * outRequestparams对象。包含列表要请求的参数对象。同步修改父级sortBar分类排序的文字对象等
   */
  properties: {
    requestObj:{//分类的请求参数对象【必传参数,agentId】
      type:Object
    },
    sortActive:null,//根据父类，打开时要打开哪块内容
    sort0ActiveRowId:null//打开时默认要选中的哪个分类,对应其id
  },
  observers: {
    "requestObj":function(newVal,oldVal){
      if(newVal===oldVal || newVal==null) return;
      if(newVal.agentId==null || newVal.agentId==undefined) return ;
      newVal=Object.assign({//初始值
        parentCategoryId:0,//除了二级分类，该值为0
      },newVal)
      this.data._requestObj=newVal;
      this.requestData();
    },
    "sortActive":function(newVal,oldVal){
      this.setData({
        _sortActive:newVal
      })
    },
    "sort0ActiveRowId":function(newVal,oldVal){
      // 先保存起来。分类数据请求完之后。再Active并通知父级获得text
     let _sort0ActiveRowId=newVal;
     console.log("传的rowID",newVal,_sort0ActiveRowId)
     this.data._sort0ActiveRowId=_sort0ActiveRowId;
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _requestObj:null,//分类请求参数对象
    _sort0ActiveRowId:null,//要激活的分类Item 的id
    outRequestparams:{},//保存列表的请求对象，这个是要发送到父级

    _isShow:true,

    _mask_show:true,
    // 激活的是分类还是排序还是筛选
    _sortActive:null,
    // 分类 对应请求列表参数groupPurchaseCategoryId,值对应其id【如果其parentId==0,否则，参数为childGroupPurchaseCategoryId】
    sort0Content:[],
    sort0ActiveRow:null,//，默认要为null,因为这个也会涉及到sortBar名字
    // 排序 对应请求列表参数为sortType，值对应下面为1,2,3
    sort1Content:["智能排序","距离最近","好评优先"],
    sort1ActiveRow:null,
    //筛选 
    sort2Content0:[//筛选，商家服务 对应请求列表参数为groupPurchaseMerchantServices,值为对应下面的content的值
      {content:"不限",active:true},{content:"无限网络",active:false},
      {content:"刷卡支付",active:false},{content:"优雅包厢",active:false},
      {content:"景观位",active:false},{content:"露天位",active:false},
      {content:"无烟区",active:false},{content:"停车场",active:false}
    ],
    sort2Content1:[//筛选，商家活动 对应请求列表参数为groupPurchaseMerchantActivities,值为对应下面content的值
      {content:"不限",active:true},{content:"优惠买单",active:false},
      {content:"团购券",active:false},{content:"代金券",active:false}
     ],
     sort2Content2:[//筛选，人均消费。
      0,50,100,200,300,"不限"
     ],
     sliderValue:{//滑块的值。对应请求列表参数为：minAvgPersonPrice、maxAvgPersonPrice。如果不限，则省略maxAvgPersonPrice参数即可
       min:0,
       max:5
     }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //业务
    // 获取分类列表
    requestData(){
      wxRequest({
        url:'/merchant/userClient?m=findGroupPurchaseCategoryList',
        method:'POST',
        data:{
          token:app.globalData.token,
          params:this.data._requestObj
        },
      }).then(res=>{
        if (res.data.code === 0) {
          let value=this._modifyrequestData(res.data.value);
          let _sort0ActiveRowId=this.data._sort0ActiveRowId;
          if(_sort0ActiveRowId!=null){
            value.forEach((_item,_index)=>{
                if(_item.id==_sort0ActiveRowId){
                  this.setData({
                    sort0ActiveRow:_index,
                    sort0Content:value
                  })
                  this.changeFatherSort0text();
                }
            })
          }else{
            this.setData({   
              sort0Content:value
            });
          }
        }else {}
      }).finally(()=>{});
    },
    _modifyrequestData(value){
      if(value instanceof Array){
        console.log(value)
        value.unshift({name:"全部",id:0})
      }
      return value;
    },




    // 弹窗 点击,及要发送请求的点击。会触发这个函数
    maskClickTap(e){
      // 通知父级，关闭本身,
      let detail={};
      if(e){//点击了浮层，则type=false。不发送请求
        detail.type=false;
      }else{//没有传参，则是其它地方调用了该函数。通知上级要发送请求
        detail.type=true;
        // 传请求参数
        detail.params=this.data.outRequestparams;
        // 传sortBar标题
        let title0="分类";
        if(this.data.sort0ActiveRow!=null) title0=this.data.sort0Content[this.data.sort0ActiveRow].name;
        let title1="排序";
        if(this.data.sort1ActiveRow!=null) title1=this.data.sort1Content[this.data.sort1ActiveRow];
        detail.title={
          sort0Title:title0 ,
          sort1Title: title1,
        }
      }
      this.triggerEvent('outRequestparams',detail);
    },
    changeFatherSort0text(){
     
      let detail={};
      let title0="分类";
      console.log(this.data.sort0Content)
      if(this.data.sort0ActiveRow!=null) {
        title0=this.data.sort0Content[this.data.sort0ActiveRow].name;
      }
      detail.title=title0;
      this.triggerEvent('changeFatherSort0text',detail);
    },
    // bar点击
    sortTap(e){
      let {index}=e.currentTarget.dataset;
      let _sortActive;
      if(this.data._sortActive==index){
        _sortActive=null;
      }else{
        _sortActive=index;
      }
      this.setData({
        _sortActive
      })
    },

    // 分类及排序的点击事件
    sortRowTap(e){
      let {index,sort,paramskey,paramsvalue}=e.currentTarget.dataset;
      if(sort==0){//分类的
        this.setData({
          sort0ActiveRow:index
        })
      }else{//排序的
        this.setData({
          sort1ActiveRow:index
        })
      }
      // 保存，请求列表的参数对象
      let _requestParams={};_requestParams[paramskey]=paramsvalue;
      let outRequestparams=this.data.outRequestparams;
      if(sort==0 && index==0){//针对分类的全部
        delete outRequestparams.groupPurchaseCategoryId;//删除主分类
        delete outRequestparams.childGroupPurchaseCategoryId;//如果是此分类，则主分类在父页面补充，这边删除次分类
      }else{
        Object.assign(outRequestparams,_requestParams)
      }
      this.data.outRequestparams=outRequestparams;

      // 抛出事件
      this.maskClickTap();
    },

    // 筛选 商家服务点击
    sort2Content0Tap(e){
        let {index} =e.target.dataset;
        let content=this.data.sort2Content0;
        if(index==0){
          if(content[index].active) return;//已经是激活，则点击无任何反应
          content.forEach((_item,_index) => {
            if(_index==0)_item.active=true;
            else  _item.active=false;
          });
        }else{
          content[0].active=false;
          content[index].active=!content[index].active;
          // 如果都是false，则第一个置为true
          let all_NotActive=content.every((_item,_index)=>{
            if(_index==0) return true;
            else return !_item.active
          })
          if(all_NotActive) content[0].active=true;
        }
        this.setData({
          sort2Content0:content
        });    
    },

    // 筛选 商家活动点击
    sort2Content1Tap(e){
      let {index} =e.target.dataset;
      let content=this.data.sort2Content1;
      if(index==0){
        if(content[index].active) return;//已经是激活，则点击无任何反应
        content.forEach((_item,_index) => {
          if(_index==0)_item.active=true;
          else  _item.active=false;
        });
      }else{
        content[0].active=false;
        content[index].active=!content[index].active;
         // 如果都是false，则第一个置为true
         let all_NotActive=content.every((_item,_index)=>{
          if(_index==0) return true;
          else return !_item.active
        })
        if(all_NotActive) content[0].active=true;
      }
      this.setData({
      sort2Content1:content
      })
    },

    //筛选，点击人均消费
    sort2Content2Tap(e){
      let {index} =e.currentTarget.dataset;
      let sliderValue=this.data.sliderValue;
      // 修改左边滑块
      if(index<3){
        sliderValue.min=index;
      }else{//修改右边滑块
          sliderValue.max=index;
      }
      this.setData({
        sliderValue
      })
    },

    // 筛选，滑动事件 min,max
    sliderMinChange(e){
      let {value}=e.detail;
      let sliderValue=this.data.sliderValue;
      sliderValue.min=value;
      this.data.sliderValue=sliderValue;
    },
    sliderMaxChange(e){
      let {value}=e.detail;
      let sliderValue=this.data.sliderValue;
      sliderValue.max=value;
      this.data.sliderValue=sliderValue;
    },
    // 筛选，取消按钮
    sort2CancelBtnTap(e){
      let sort2Content0=this.data.sort2Content0;
      let sort2Content1=this.data.sort2Content1;
      let sliderValue=this.data.sliderValue;
      // 取消 商家服务的选择
      sort2Content0.forEach((_item,_index)=>{
        if(_index==0) _item.active=true;
        else _item.active=false;
      })
      // 取消 商家活动的选择
      sort2Content1.forEach((_item,_index)=>{
        if(_index==0) _item.active=true;
        else _item.active=false;
      })
      // 取消 人均消费的选择
      sliderValue.min=0;sliderValue.max=5;
      this.setData({
        sort2Content0,
        sort2Content1,
        sliderValue
      })
    },

    // 筛选，提交按钮
    sort2SubmitBtnTap(e){
      // 第一步，保存筛选页面的选择，并保存到outRequestparams
      let outRequestparams=this.data.outRequestparams;
      let _requestParams={};
      let content="";
      // 保存商家服务的请求参数、
      content=this.data.sort2Content0;
      if(content[0].active){//不限，如果激活了，则不用传这个参数
        delete outRequestparams.groupPurchaseMerchantServices
      }else{
        _requestParams.groupPurchaseMerchantServices="";
        content.forEach((_item,_index)=>{
          if(_index!=0 && _item.active){
            _requestParams.groupPurchaseMerchantServices+=" "+_item.content;
          } 
        })
        // 去除前后" "
        _requestParams.groupPurchaseMerchantServices=_requestParams.groupPurchaseMerchantServices.replace(/(^\s*)|(\s*$)/g, "")
        Object.assign(outRequestparams,_requestParams)
      }
      
      // 保存 商家活动的请求参数、
      content=this.data.sort2Content1;
      _requestParams={};
      if(content[0].active){
        delete outRequestparams.groupPurchaseMerchantActivities
      }else{
        _requestParams.groupPurchaseMerchantActivities="";
        content.forEach((_item,_index)=>{
          if(_index!=0 && _item.active){
            _requestParams.groupPurchaseMerchantActivities+=" "+_item.content;
          } 
        })
        // 去除前后" "
        _requestParams.groupPurchaseMerchantActivities=_requestParams.groupPurchaseMerchantActivities.replace(/(^\s*)|(\s*$)/g, "");
        Object.assign(outRequestparams,_requestParams)
      }

      // 保存人均消费的请求参数
      let sliderValue=this.data.sliderValue;
      let sort2Content2=this.data.sort2Content2;
      _requestParams={};
      if(sliderValue.max==sort2Content2.length-1){
        delete outRequestparams.maxAvgPersonPrice;
      }else{
        _requestParams.maxAvgPersonPrice=sort2Content2[sliderValue.max] 
      }
      _requestParams.mimAvgPersonPrice=sort2Content2[sliderValue.min];
      Object.assign(outRequestparams,_requestParams)
      this.data.outRequestparams=outRequestparams;
      console.log(outRequestparams) 

      // 抛出事件
      this.maskClickTap();
    }
    


  }
})
