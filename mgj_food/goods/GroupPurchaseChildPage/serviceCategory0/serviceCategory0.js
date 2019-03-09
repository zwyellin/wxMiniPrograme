// goods/GroupPurchaseChildPage/serviceCategory0/serviceCategory0.js
const feedbackApi = require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    istotalAmountInputFocues:true,//input焦点控制
   
    totalAmountInputValue:"",//消费总额，实时
    excludeAmountInputValue:"",//没有优惠的金额，实时

    totalAmountNewValue:"",//消费总额，加上￥
    excludeAmountNewValue:"",//没有优惠的金额，加上￥

    excludeAmountInputActive:false,//默认不显示,显示时同时用于控制不参与优惠的input焦点

    discount:0.6,//打折

    discountActive:true,//是否开启打折

    actuallyAmount:"",//实付金额(totalAmountInputValue,[excludeAmountInputActive,excludeAmountInputValue],[discountActive,discount])
    discountAmount:"",//折扣了多少金额(totalAmountInputValue,[excludeAmountInputActive,excludeAmountInputValue],[discountActive,discount])
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 个人方法
  // 消费总额，input输入事件
  totalAmountInput(e){
    let {value,cursor,keyCode}=e.detail;
    if(value.indexOf("￥")==-1 && value.length){//找不到，并且输入了数字。则加上￥符号
      value="￥"+value;
      this.setData({
        totalAmountNewValue:value
      })
    }
    let totalValue=value.substring(1);
    if(value.length>1 && totalValue!=(parseFloat(totalValue)+"")){//判断是否输入了非数字
      feedbackApi.showToast({title:"请输入数字"});
      return;
    }
    this.setData({
      totalAmountInputValue:value,//如果为空，则不能点击优惠金额
    });

     //计算实付金额
     this.actuallyAmount();
  },
  // 没有优惠的总额
  excludeAmountInput(e){
    let {value,cursor,keyCode}=e.detail;
    if(value.indexOf("￥")==-1 && value.length){//找不到，并且输入了数字。则加上￥符号
      value="￥"+value;
    }
    let excludeValue=value.substring(1);
    if(value.length>1 && excludeValue!=(parseFloat(excludeValue)+"")){//判断是否输入了非数字
      feedbackApi.showToast({title:"请输入数字"});
      return;
    }
    let totalValue=parseFloat(this.data.totalAmountInputValue.substring(1));
    excludeValue=parseFloat(excludeValue);
    if(excludeValue>totalValue){//不参与优惠金额不能大于消费总额
      feedbackApi.showToast({title:"不参与优惠金额不能大于消费总额"});
      //则，用旧的excludeAmountInputValue来替换原先的
      this.setData({
        excludeAmountNewValue:this.data.excludeAmountInputValue
      })
      return ;
    }
    //保存输入的有效值
    this.data.excludeAmountInputValue=value;
    //因为其会关闭，重新渲染。所以每次输入要保存其值
    this.setData({
      excludeAmountNewValue:value
    })
    //计算实付金额
    this.actuallyAmount();
  },
    // 不参与优惠金额，切换
  excludeAmountSwitch(e){
    let {value}=e.detail;
    this.setData({
      excludeAmountInputActive:value
    })
    //计算实付金额
    this.actuallyAmount();
  },
  // 不参与优惠金额，tap
  excludeAmountSwitchTap(e){
    if(!this.data.totalAmountInputValue){//消费总额为空，即还没有输入
      feedbackApi.showToast({title:"请先输入消费总额"});
    }
  },
  // 打折switch切换,先要输入消费总额
  discountSwitch(e){
    let {value}=e.detail;
    this.setData({
      discountActive:value
    })
    //计算实付金额
    this.actuallyAmount();
  },
  // 计算实付金额及折扣了多少金额
  actuallyAmount(){
    if(this.data.totalAmountInputValue.length<=1) return;
    let totalAmountInputValue=parseFloat(this.data.totalAmountInputValue.substring(1));
    let discountAmount="";
    let actuallyAmount=totalAmountInputValue;
    if(this.data.discountActive){//优惠了多少金额,及实付金额 
      discountAmount=totalAmountInputValue*(1-this.data.discount);
      actuallyAmount=totalAmountInputValue-discountAmount;
      if(this.data.excludeAmountInputActive && this.data.excludeAmountInputValue.length>1){
        let excludeAmountInputValue=parseFloat(this.data.excludeAmountInputValue.substring(1));
        discountAmount=(totalAmountInputValue-excludeAmountInputValue)*(1-this.data.discount);
        actuallyAmount=totalAmountInputValue-discountAmount;
      }
      //处理好discountAmount
      discountAmount="-￥"+parseInt(discountAmount*10)/10;//保留一位小数
      //处理好actuallyAmount
      actuallyAmount="￥"+parseInt(actuallyAmount*10)/10;//保留一位小数
    }else{
      actuallyAmount="￥"+parseInt(actuallyAmount*10)/10;//保留一位小数
    }
    this.setData({
      actuallyAmount,
      discountAmount
    })
  }
})