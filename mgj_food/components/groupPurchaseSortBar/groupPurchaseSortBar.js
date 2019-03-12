// components/groupPurchaseSortBar/groupPurchaseSortBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    _isShow:true,

    _mask_show:true,

    sortActive:null,
    sortActive1:["全部","第一个","第二个","第三个","第四个","四五个","四六个"],
    sortActive2Content0:[//筛选，商家服务
      {content:"不限",active:false},{content:"无限网络",active:false},
      {content:"刷卡支付",active:false},{content:"刷卡支付",active:false},
      {content:"刷卡支付",active:false},{content:"刷卡支付",active:false},
      {content:"无烟区",active:false},{content:"停车场",active:false}
    ],
    sortActive2Content1:[//筛选，商家活动
      {content:"不限",active:false},{content:"优惠买单",active:false},
      {content:"团购券",active:false},{content:"代金券",active:false}
     ],
     sortActive2Content2:[//筛选，人均消费
      0,50,100,200,300,"不限"
     ],
     sliderValue:{
       min:null,
       max:null
     },
    sortActive2ContentIndex:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 弹窗 点击取消
    maskCancelTap(e){
      this.setData({
        _mask_show:false
      })
    },
    sortTap(e){
      let {index}=e.currentTarget.dataset;
      let sortActive;
      if(this.data.sortActive==index){
        sortActive=null;
      }else{
        sortActive=index;
      }
      this.setData({
        sortActive
      })
    },


    // 筛选 商家服务点击
    sortActive2Content0Tap(e){
        let {index} =e.target.dataset;
        let content=this.data.sortActive2Content0;
        if(index==0){
          content.forEach((_item,_index) => {
            if(_index==0)_item.active=!_item.active;
            else  _item.active=false;
          });
        }else{
          content[0].active=false;
          content[index].active=!content[index].active;
        }
        this.setData({
        sortActive2Content0:content
        })
    },

    // 筛选 商家活动点击
    sortActive2Content1Tap(e){
      let {index} =e.target.dataset;
      let content=this.data.sortActive2Content1;
      if(index==0){
        content.forEach((_item,_index) => {
          if(_index==0)_item.active=!_item.active;
          else  _item.active=false;
        });
      }else{
        content[0].active=false;
        content[index].active=!content[index].active;
      }
      this.setData({
      sortActive2Content1:content
      })
    },

    //筛选，点击人均消费
    sortActive2Content3Tap(e){
      let {index} =e.currentTarget.dataset;
      let sliderValue=this.data.sliderValue;
      let sortActive2Content2=this.data.sortActive2Content2;
      // 修改左边滑块
      if(index<3){
        sliderValue.min=sortActive2Content2[index];
      }else{//修改右边滑块
        if(index==5){//无限
          sliderValue.max=400;
        }else{
          sliderValue.max=sortActive2Content2[index];
        }
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
      this.setData({
        sliderValue
      })
    },
    sliderMaxChange(e){
      let {value}=e.detail;
      let sliderValue=this.data.sliderValue;
      sliderValue.max=value;
      this.setData({
        sliderValue
      })
    },

    // 筛选，取消按钮
    sortActive2CancelBtnTap(e){
      let sortActive2Content0=this.data.sortActive2Content0;
      let sortActive2Content1=this.data.sortActive2Content1;
      let sliderValue=this.data.sliderValue;
      // 取消 商家服务的选择
      sortActive2Content0.forEach((_item,_index)=>{
        _item.active=false;
      })
      // 取消 商家活动的选择
      sortActive2Content1.forEach((_item,_index)=>{
        _item.active=false;
      })
      // 取消 人均消费的选择
      sliderValue.min=0;sliderValue.max=400;
      this.setData({
        sortActive2Content0,
        sortActive2Content1,
        sliderValue
      })
    }
    


  }
})
