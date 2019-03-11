// goods/GroupPurchaseChildPage/serviceCategory2/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupMerchantInfo:null,
    groupSetMealItem:null,
    merchantId:null,

    pickerData:null,//日期选择器选择的时间
    sliderValue:1,//滑块选择的数量

    totalMoney:"",//小计
    realTotalMoney:"",//实付总额

    redPacketDeduction:"",//红包抵扣的金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {itemIndex}=options;
    console.log(itemIndex)
    //访问上级页面(团购商家)的对象，赋值给本页面
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; // 上一级页面
    let prev_prevPage=pages[pages.length - 3]; // 上一级页面
    let prePageReg=/GroupPurchaseShop/;//判断上一级页面的路径是不是含有GroupPurchaseShop
    let groupSetMealItem=[]; 
    let originPage=undefined;

    if(prePageReg.test(prevPage.route)){//直接点购买进来德
      console.log("店铺上一页过来的");
      originPage=prevPage;
    }else if(prePageReg.test(prev_prevPage.route)){//从详情页进来的
      console.log("店铺上上页过来的");
      originPage=prev_prevPage;
    }
    // 先修改显示数据
    groupSetMealItem=this.modifygroupSetMealItem(originPage.data.groupMerchantInfo.groupSetMeal[itemIndex]);
    this.setData({
      groupMerchantInfo:originPage.data.groupMerchantInfo,
      groupSetMealItem,
      merchantId:originPage.data.groupMerchantInfo.id
    })

    // 计算总额和小计
    this.sliderChanging();
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

  modifygroupSetMealItem(value){
    console.log("显示",value)
    // images,字符串转换为数组
    if(value.images instanceof Array){
     //访问上一页面的对象，是引用,所以。第一次进来修改为数组。返回再进来时已经是数组了
      //所以，这里doNothing  
    }else{
      if(value.images){
        value.images=value.images.split(";");
        if(value.images.length >= 4){
          value.showImgs=value.images.slice(0,3)
        }else{
          value.showImgs=value.images;
        }
      }else{
        value.showImgs=[];
        value.images=[];
      }
    }
    return value;
  },
  // 日期选择事件
  pickerDateChange(e){
    this.setData({
      pickerData:e.detail.value
    })
  },
  // 滑块滑动事件
  sliderChanging(e){
    // let value=e.detail.value;
    // // 计算小计：
    // let totalMoney=value*this.data.groupSetMealItem.price;
    // // 计算实际付款：
    // let realTotalMoney=totalMoney-this.data.redPacketDeduction;
    // this.setData({
    //   sliderValue:value,
    //   totalMoney,
    //   realTotalMoney
    // })

    // 以上为滑动模块，暂时不使用
    var type;
    try{
      type=e.target.dataset.type;
    }catch(err){
      type=0;
    }
    let sliderValue=this.data.sliderValue+parseInt(type);
     //计算小计：
    let totalMoney=sliderValue*this.data.groupSetMealItem.price;
    // 计算实际付款：
    let realTotalMoney=totalMoney-this.data.redPacketDeduction;
    this.setData({
      sliderValue,
      totalMoney,
      realTotalMoney
    })
  },

})