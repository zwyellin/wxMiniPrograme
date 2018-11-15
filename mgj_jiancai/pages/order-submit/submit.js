// pages/order-submit/submit.js
var { globalData } = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMap:true,
    isShow:"1,3",
    latitude: 23.099994,
    longitude: 113.324520,
    markers: [{
      latitude: 23.099994,
      longitude: 113.324520,
      name: 'T.I.T 创意园'
    }],
    orderItems:null,
    remark:null,
    addressData:null,
    shipmentType:1,
    chooseSort:null,
    isCashCoupon:false,
    isRedPacket:false,
    promotionCouponsId:null,
    cashCouponData: [],
    promotionCouponsData: null,
    redBagJson: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.mapCtx = wx.createMapContext('myMap')
    this.setData({ merchantId: options.merchantId});
    this.getAddress();
    this.initData();
  },
  remarks(e) { //备注
    let value = e.detail.value;
    this.setData({
      remark: value,
    });
    this.search(value)
  },
  getAddress() {  //获取地址
    let agentId = globalData.MerAgentId
    let params = {
      agentId
    }
    if (globalData.addressData){
      this.setData({ addressData: globalData.addressData});
    }else{
      wx.http.postReq('appletClient?m=findUserAddress', params, (res) => {
        let { success, value } = res;
        if (success) {
          this.setData({
            addressData: value[0]
          })
        } else {
          wx.showToast({
            title: '出错了,请联系管理员',
          })
        }
      })
    }
  },

  initData(){//订单预览
    let { 
      merchantId, shipmentType, addressData,
      promotionCouponsData, orderItems, redBagJson, chooseSort, remark
      }=this.data;
    let orderItemsReq={};
    if (orderItems){
      orderItemsReq = {...orderItems};
    }
    orderItemsReq.goodsId= globalData.selectCommodity[0].goodsId,
    orderItemsReq.goodsModelId = globalData.selectCommodity[0].goodsModelId,
    orderItemsReq.quantity = globalData.selectCommodity[0].quantity,
    orderItemsReq.price = globalData.selectCommodity[0].price
    let params={
      agentId: globalData.MerAgentId,
      userId: globalData.userInfo.id,
      merchantId,
      chooseSort: redBagJson && promotionCouponsData ? chooseSort : 0,
      shipmentType: globalData.receivingWayValue || shipmentType || 1,
      latitude: globalData.localPosition.latitude,
      longitude: globalData.localPosition.longitude,
      orderItems: JSON.stringify(globalData.selectCommodity),
      userAddressId: addressData && addressData.id,
      remark,
      //orderItems: JSON.stringify([orderItemsReq]),
      redBagJson: !redBagJson ? null : JSON.stringify([redBagJson]),
      promotionCouponsId: !promotionCouponsData ? null : promotionCouponsData.id,
    }
    wx.http.postReq('appletClient?m=buildingMaterialsOrderServicePreview', params, (res) => {
      let { success, value } = res;
      if (success) {
        value.buildingMaterialsOrderItemList = value.buildingMaterialsOrderItemList.map(i=>{
          i.img = i.img ? i.img.split(';') : []
          return i
        })
        globalData.commodityList = value.buildingMaterialsOrderItemList
        wx.setStorageSync('commodityList', globalData.commodityList)
        let isShow = value.buildingMaterialsMerchant.receivingWayValue
        let shipmentType = this.data.shipmentType
        if (isShow == 1) {
          isShow = 1
        }else if (isShow == 3) {
          isShow = 3
          shipmentType = 3
        }else{
          isShow = '1,3'
        }

        let markers = this.data.markers
        markers[0].latitude = value.buildingMaterialsMerchant.latitude
        markers[0].longitude = value.buildingMaterialsMerchant.longitude
        markers[0].name = value.buildingMaterialsMerchant.name

        value.totalP = (value.totalGoodsPrice ? value.totalGoodsPrice + value.totalPlatformSubsidiesPrice : 0).toFixed(2);
        this.setData({
          isShow,
          shipmentType,
          orderItems: value,
          latitude: value.buildingMaterialsMerchant.latitude,
          longitude: value.buildingMaterialsMerchant.longitude,
          markers
        });
        globalData.MerAgentId = value.buildingMaterialsMerchant.agentId
      } else {
        wx.showToast({
          title: value,
          icon: 'none'
        })
        if (chooseSort == 1) {
          this.setData({
            promotionCouponsData: null
          })
        }
        if (chooseSort == 2) {
          this.setData({
            redBagJson: null
          })
        }
      }
    })
  },
  changeType(e){
    let id=e.currentTarget.dataset.id;
    this.setData({ shipmentType:id});
    globalData.receivingWayValue = id
    this.initData()
  },
  orderSubmit(){
    let { 
      merchantId, shipmentType, addressData, promotionCouponsData, orderItems, redBagJson, remark
      } = this.data;
    let orderItemsReq={
      ...orderItems,
      goodsId: globalData.selectCommodity[0].goodsId,
      goodsModelId: globalData.selectCommodity[0].goodsModelId,
      quantity: globalData.selectCommodity[0].quantity,
      price: globalData.selectCommodity[0].price
    }
    //console.log(globalData.selectCommodity)
    //return false;
    let params = {
      agentId: globalData.MerAgentId,
      userId: globalData.userInfo.id,
      merchantId,
      shipmentType,
      latitude: globalData.localPosition.latitude,
      longitude: globalData.localPosition.longitude,
      userAddressId: addressData.id,
      orderItems: JSON.stringify(globalData.selectCommodity),
      remark,
      //orderItems: JSON.stringify(orderItemsReq),
      redBagJson: !redBagJson?null:JSON.stringify([redBagJson]),
      promotionCouponsId: !promotionCouponsData?null:promotionCouponsData.id,
    }
    wx.http.postReq('appletClient?m=buildingMaterialsOrderServiceSubmit', params, (res) => {
      let { success, value } = res;
      if (success) {
        globalData.orderDetail = value;
        wx.navigateTo({
          url: '../payment/payment',
        })
        let cartList = wx.getStorageSync('cart')
        cartList = cartList.filter(item => {
          return item.merchant.id != merchantId
        })
        cartList = cartList.map(item => {
          item.check = false
          item.list = item.list.map(son => {
            son.check = false
            return son
          })
          return item
        })
        wx.setStorageSync('cart', cartList)
      } 
    })
  },
  changeAddress() {
    globalData.orderBackUrl = `/${this.route}?merchantId=${this.data.merchantId}`;
    wx.navigateTo({
      url: `../user-address/address?agentId=${globalData.MerAgentId}`,
    })
  },
  seeRedPacket(){
    let { merchantId, shipmentType, addressData, promotionCouponsData, orderItems } = this.data;
    let itemsPrice =  0
    globalData.selectCommodity.map(item=>{
      itemsPrice += (item.price * 1 * item.quantity - (!promotionCouponsData ? 0 : promotionCouponsData.couponsAmt || 0)).toFixed(2);
    })
    let params = {
      agentId: globalData.MerAgentId,
      businessType: 12,
      latitude: globalData.localPosition.latitude,
      longitude: globalData.localPosition.longitude,
      userAddressId: addressData.id,
      itemsPrice: orderItems.canUseRedBagsTotalGoodsPrice,
      merchantId
      //canUseRedBagsTotalGoodsPrice: orderItems.canUseRedBagsTotalGoodsPrice,
    }
    wx.http.postReq('userClient?m=queryPlatformRedBagList', params, (res) => {
      let { success, value } = res;
      if (success) {
        this.setData({
          isMap:false,
          isRedPacket: true,
          redPacketData: value
        });
      }
    })
  },
  getRedPacket(e){
    this.setData({
      isMap: true,
      isRedPacket: false,
      redBagJson: e.currentTarget.dataset.record,
      chooseSort: !this.data.chooseSort ? 1 : 2
    },()=>{
      this.initData();
    })
  },
  seeCashCoupon(){
    let { merchantId, shipmentType, redBagJson, orderItems} = this.data;
    let curCommodity = globalData.selectCommodity[0];
    let params = {
      agentId: globalData.MerAgentId,
      userId: globalData.userInfo.id,
      merchantId,
      businessType:12,
      totalPrice: orderItems.canUsePromotionCouponsTotalGoodsPrice
      //!curCommodity.usableCoupons ? 0 : ((curCommodity.discountPrice || curCommodity.originalPrice) * 1 * curCommodity.quantity) - !redBagJson ? 0 : redBagJson.amt ||  0,
    }
    wx.http.postReq('appletClient?m=queryCouponsList', params, (res) => {
      let { success, value } = res;
      if (success) {
        this.setData({
          isMap: false,
          isCashCoupon: true,
          cashCouponData:value
         });
      }
    })
  },
  noRedPacket(){
    this.setData({
      isMap: true,
      isRedPacket: false,
      redBagJson:null
    })
    this.initData();
  },
  noCashCoupon(){
    this.setData({
      isMap: true,
      isCashCoupon: false,
      promotionCouponsData:null
    });
    this.initData();
  },
  getCashCoupon(e){
    this.setData({
      isMap: true,
      isCashCoupon: false,
      promotionCouponsData:e.currentTarget.dataset.record,
      chooseSort: !this.data.chooseSort?2:1
    }, () => {
      this.initData();
    })
  },
  why(e){ // 不可用原因
    let id = e.currentTarget.dataset.why;
    let cashCouponData = this.data.cashCouponData
    cashCouponData.noUsableCouponsList = cashCouponData.noUsableCouponsList.map((item, index) => {
      if(index === id ){
        item.isWhy = !item.isWhy
      }
      return item
    })
    this.setData({
      cashCouponData
    })
  },
  why2(e) { // 不可用原因
    let id = e.currentTarget.dataset.why;
    let redPacketData = this.data.redPacketData
    redPacketData.platformRedBagAvailableList = redPacketData.platformRedBagAvailableList.map((item, index) => {
      if (index === id) {
        item.isWhy = !item.isWhy
      }
      return item
    })
    this.setData({
      redPacketData
    })
  },
  getAll(){
    wx.navigateTo({
      url: '../order-commodity/order-commodity',
    })
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
    globalData.orderBackUrl = null
  },
})