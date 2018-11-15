// pages/cart/index.js

let { globalData, isMobile } =getApp()
Page({
  data: {
    // 编辑
    edit: true,
    // 弹窗
    cartPop: false,
    // 全选
    checkAll: false,
    carNum: 0, //数量
    carMoney: 0, //金额
    cartList: wx.getStorageSync('cart'),
    isCartList : null
  },
  initData(){
    this.setData({
      // 编辑
      edit: true,
      // 弹窗
      cartPop: false,
      // 全选
      checkAll: false,
      carMoney: 0, //金额
      cartList: wx.getStorageSync('cart'),
      isCartList: null
    })
  },
  // 编辑
  editFun() {
    this.setData({
      edit: !this.data.edit
    })
  },
  // 关闭结算弹窗
  closePop() {
    this.setData({
      cartPop: !this.data.cartPop
    })
  },
  // 计算数量
  cartNum(e) { //增加减少数量 1 减少 2增加
    var carType = e.currentTarget.dataset.type;
    var itemIndex = e.currentTarget.dataset.itemindex;
    var objIndex = e.currentTarget.dataset.objindex;
    var cartList = this.data.cartList;
    var num = parseInt(cartList[itemIndex].list[objIndex].quantity);
    if (carType == 2) {
      num = num + 1
    } else {
      num = num - 1 <= 1 ? 1 : num - 1
    }
    this.data.cartList[itemIndex].list[objIndex].quantity = num;
    this.setData({
      cartList
    });
    this.getCarNum();
    this.getCarMoney();
    wx.setStorageSync('cart', cartList)
  },
  // 删除
  delAll(){
    let cartList = this.data.cartList;
    cartList = cartList.filter(item => {
      item.list = item.list.filter(son => {
        return !son.check
      })
      return item
    }).filter(item=>{
      return !item.check
    }).filter(item=>{
      return item.list.length>0
    })
    this.setData({
      cartList
    })
    wx.setStorageSync('cart', cartList)
    this.initData();
    
  },
  // 选中
  checkItem(e) {
    let itemIndex = e.currentTarget.dataset.itemindex;
    let objIndex = e.currentTarget.dataset.objindex;
    let cartList = this.data.cartList;
    cartList[itemIndex].list[objIndex].check = !cartList[itemIndex].list[objIndex].check;

    let checkAll = cartList.every((item, index) => {
      item.check = !item.list.some(son => {
        return !son.check
      })
      if(item.check){
        return !item.list.some(son=>{
          return !son.check
        })
      }
      else{
        return false
      }
    })
    this.setData({
      cartList,
      checkAll
    });
    this.getCarMoney();
  },
  // 选中
  checkMerchant(e) {
    var itemIndex = e.currentTarget.dataset.itemindex;
    var cartList = this.data.cartList;
    cartList[itemIndex].check = !cartList[itemIndex].check
    cartList[itemIndex].list = cartList[itemIndex].list.map(i=>{
      i.check = cartList[itemIndex].check
      return i
    })


    let checkAll = !cartList.some((item, index) => {
      return !item.check
    })

    this.setData({
      cartList,
      checkAll
    });
    this.getCarMoney();
  },
  // 选中所有
  checkChangeAll() {
    var checkAll = !this.data.checkAll;
    var cartList = this.data.cartList;
    cartList = cartList.map(i => {
      i.list = i.list.map(item=>{
        item.check = checkAll
        return item
      })
      i.check = checkAll
      return i
    })
    this.setData({
      checkAll,
      cartList
    });
    this.getCarMoney();
  },
  getCarNum() { //获取商品总数
    let carNum = 0;
    this.data.cartList.map(item => {
      item.list.map(son => {
        carNum += son.quantity;
      })
    })
    this.setData({
      carNum,
    })
  },
  getCarMoney() { //获取商品总数
    let carMoney = 0;
    this.data.cartList.map(item => {
      item.list.map(son => {
        if(son.check){
          carMoney += 1*(son.quantity * son.prices);
        }
      })
    })
    this.setData({
      carMoney: carMoney.toFixed(2)
    })
  },
  zhifuOne(e){ // 单个商家支付
    isMobile(() => {
      let merchantId = e.currentTarget.dataset.id;
      let cartList = this.data.cartList;
      let cartArr = this.data.isCartList.map(item => {
        if (item.merchant.id == merchantId) {
          globalData.selectCommodity = item.list.map(item=>{
            return {
              goodsId: item.goodsId,
              goodsModelId: item.goodsModelId,
              quantity: item.quantity,
              price: item.price,
            }
          })
          globalData.receivingWayValue = item.merchant.receivingWayValue == 3 ? 3 : 1
          globalData.MerAgentId = item.merchant.agentId
        }
      })
      cartList = cartList.filter(item => {
        return item.merchant.id != merchantId
      })
      cartList = cartList.map(item=>{
        item.check = false
        item.list = item.list.map(son=>{
          son.check = false
          return son
        })
        return item
      })
      wx.navigateTo({
        url: '../order-submit/submit?merchantId=' + merchantId
      });
    })
  },
  zhifu() { // 支付
    isMobile(() => {
      let cartList = this.data.cartList;
      let isGo = cartList.some((item, index) => {
        if (item.check) {
          return true
        } else {
          if(item.list.some(son=>{
            return son.check
          })){
            return true
          }else{
            return false
          }
        }
      })
      if (!isGo) {
        wx.showToast({
          title: '请选择要结算的商品',
          icon: 'none'
        })
      } else {
        let newArr = JSON.parse(JSON.stringify(this.data.cartList))
        let isOne = newArr.filter(item=>{
          item.list = item.list.filter(son=>{
            return son.check
          })
          if (item.list.length > 0) {
            item.check = true
          }
          return item
        })
        //console.log(isOne)
        if (isOne.filter(item=>item.check).length>1){
          isOne = isOne.map(item=>{
            item.priceList = item.list.map(son=>{
              return (son.price * son.quantity).toFixed(2);
            })
            item.numPrice = item.priceList.reduce((a,b)=>{
              return (a*1 + b*1).toFixed(2);
            })
            return item
          })
          //console.log(isOne)
          //return false
          this.setData({
            cartPop:true,
            isCartList: isOne
          })
        }else{
          let merchantId = null;
          let cartArr = isOne.map(item=>{
            if(item.check){
              merchantId = item.merchant.id;
              globalData.MerAgentId = item.merchant.agentId
              globalData.receivingWayValue = item.merchant.receivingWayValue == 3 ? 3 : 1
              globalData.selectCommodity = item.list.filter(son=>{
                return son.check
              }).map(item => {
                return {
                  goodsId: item.goodsId,
                  goodsModelId: item.goodsModelId,
                  quantity: item.quantity,
                  price: item.price,
                }
              })
            }
          })
          wx.navigateTo({
            url: '../order-submit/submit?merchantId=' + merchantId
          });
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let cartList = wx.getStorageSync('cart')
    this.setData({
      cartList
    })
    if (cartList.length > 0) {
      this.getCarNum();
    }
    // wx.hideTabBar({}) 
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
    let cartList = wx.getStorageSync('cart')
    this.initData();
    this.getCarNum();
    /**
    this.setData({
      cartList
    })
    if (this.data.cartList.length > 0) {
      this.getCarNum();
    } */
  },
})