// goods/GroupPurchaseChildPage/serviceCategory2/serviceCategory2.js
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tel_mask_show:false,
    groupMerchantInfo:null,//直接读取上一页的该对象
    merchantId:null,
    groupSetMealItem:null,//上一页团购套餐Item。以及加上请求回来的套餐具体内容
    groupSetMealexcludeItem:null,//剔除自身的其它团购套餐项目

    itemIndex:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得参数
    let {itemIndex}=options;
    //访问上级页面(团购商家)的对象，赋值给本页面
    let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2]; // 上一级页面
    let prePageReg=/GroupPurchaseShop/;//判断上一级页面的路径是不是含有GroupPurchaseShop
    let prePageReg1=/serviceCategory2/;//判断上一级页面的路径是不是含有serviceCategory2
		if(prePageReg.test(prevPage.route)||prePageReg1.test(prevPage.route)){
      // 修改一些显示的数据
      let groupSetMealItem=this.modifygroupSetMealItem(prevPage.data.groupMerchantInfo.groupSetMeal[itemIndex]);
      let groupSetMealexcludeItem=prevPage.data.groupMerchantInfo.groupSetMeal.filter((item,index,arr)=>{
        item.groupSetMealIndex=index;//保存原先的index。避免点本店优惠item时进去页面读取groupSetMeal时的Index出错
        return index!=itemIndex;
      })
      this.setData({
        groupMerchantInfo:prevPage.data.groupMerchantInfo,
        groupSetMealItem,
        merchantId:prevPage.data.groupMerchantInfo.id,
        groupSetMealexcludeItem,
        itemIndex
      })
    }
    // 基本信息通过上一页面可以拿到，这边请求获取套餐具体内容
    this.findGroupPurchaseCouponInfo();
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
  findGroupPurchaseCouponInfo(){
    wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseCouponInfo',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          groupPurchaseCouponId:this.data.groupSetMealItem.id,
          size:20,
          start:0
        }	
      },
    }).then(res=>{
      if (res.data.code === 0) {
        this.setData({
          'groupSetMealItem.groupPurchaseCouponGoodsTypeList':res.data.value.groupPurchaseCouponGoodsTypeList
        });
      }else {}
    });
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
    // 修改createTime
    console.log(value.createTime)
    if(value.createTime.indexOf(" ")!=-1){
      value.createTime=value.createTime.substring(0,value.createTime.indexOf(" "));
    }
  
    return value;
  },
  // 点击图片事件
  merchantInfoImageTap(e){
    let {index=0,images}=e.target.dataset;
    console.log(images,index)
    wx.previewImage({
      current: images[index], // 当前显示图片的http链接
      urls:images // 需要预览的图片http链接列表
      })
  },

  //点击电话图标事件
  callPhoneTap(e){
    this.setData({
      tel_mask_show:true
    })
  },
  telphoneTap(e){
    let {telphone}=e.target.dataset;
    wx.makePhoneCall({
      phoneNumber: telphone  //电话号码
    })
  },
  // 电话弹窗 点击取消
  maskCancelTap(e){
    this.setData({
      tel_mask_show:false
    })
  },
  // 点击团购的 按钮。注意，这里是返回
  serviceCategory2Tap(e){
    let {item_index}=e.target.dataset;
    wx.navigateTo({
      url:"/goods/GroupPurchaseChildPage/serviceCategory2/order/order?itemIndex="+item_index
    })
  }
})