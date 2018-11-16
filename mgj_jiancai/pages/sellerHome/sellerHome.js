// pages/sellerCommodity/sellerCommodity.js
let { globalData, isLogin } = getApp();
const { base64src } = require('../../utils/util.js');
Page({
  data: {
    id: null,
    isIndex: true,
    sellerInfo: false,
    info: {}, //信息
    list: [], //数据
    page: { //分页
      limit: 10,
      start: 0,
      isMore: true
    },
    canvasqrCode:{
      destHeight:500,
      destWidth:500,
    },
    maskimgShow:false,
    qrcodeShow:false,
    isMoreMessage:false, //更多
    qrCodeUrl:'',   // 下载二维码路径
    base64:null,
    queryType: 10, //0：全部商品，1：促销商品，2：上新商品, 10 首页
    sortType: 0, // 0, "默认升" ，1, "默认降" ，2, "销量升" ，3, "销量降"，4, "价格升"，5, "价格降"
    sortType1: 0,
    sortType2: 2,
    sortType3: 4,
  },
  getInit(merchantId = '834') { //商家信息
    var param = {
      merchantId
    }
    wx.http.postReq('appletClient?m=findClientMerchantHome', param, (data) => {
      if (data.success) {
        var info = data.value;
        this.setData({
          info,
          id: merchantId
        })
        if (!info.homeRecommendedList || info.homeRecommendedList.length===0){
          this.queryTypeList(0)
        }
      }
    })
  },
  getList(merchantId = '834', queryType = 0, sortType = 0, types = false) { //商家列表
    let page = this.data.page
    let param = {
      merchantId,
      queryType,
      sortType,
      start: this.data.page.start,
      limit: this.data.page.limit
    }
    wx.http.postReq('appletClient?m=searchBuildingMaterialsGoodsList', param, (data) => {
      if (data.success) {
        let list = this.data.list
        if (data.value.length > 0) {
          console.log(types)
          list = types ? [...list, ...data.value] : data.value
        }
        if (data.value.length >= this.data.page.limit) {
          page.start += 10;
          page.isMore = true;
        } else {
          page.isMore = false;
        }
        this.setData({
          list,
          page,
          queryType,
          sortType,
        })
        //console.log(list)
      }
    })
  },
  queryTypeList(e) { // 通过类型查商品
    let queryType = e.currentTarget ? e.currentTarget.dataset.type - 0 : e;
    let page = {
      limit: 10,
      start: 0,
      isMore: true
    }
    this.setData({
      page,
      isIndex: false
    })
    if (queryType !== 10) {
      this.getList(this.data.info.id, queryType, 0)
      console.log(1)
    } else {
      console.log(2)
      this.setData({
        isIndex: true,
        queryType
      })
    }
    console.log(this.data.isIndex)
  },
  sortTypeList(e) { // 通过排序查商品
    let sortType = e.currentTarget.dataset.type - 0;
    let sortType1 = this.data.sortType1;
    let sortType2 = this.data.sortType2;
    let sortType3 = this.data.sortType3;
    if (sortType == 0){
      sortType = 1
      sortType1 = 1
    } else if (sortType == 1) {
      sortType = 0
      sortType1 = 0
    } else if (sortType == 2) {
      sortType = 3
      sortType2 = 3
    } else if (sortType == 3) {
      sortType = 2
      sortType2 = 2
    } else if (sortType == 4) {
      sortType = 5
      sortType3 = 5
    } else if (sortType == 5) {
      sortType = 4
      sortType3 = 4
    }
    let page = {
      limit: 10,
      start: 0,
      isMore: true
    }
    this.setData({
      page,
      sortType1,
      sortType2,
      sortType3
    })
    this.getList(this.data.info.id, this.data.queryType, sortType)
  },
  // 收藏
  collection(e) {
    let isCollection = e.currentTarget.dataset.type;
    var param = {
      merchantId: this.data.info.id,
      merchantType: 6
    }
    wx.http.postReq(isCollection === 0 ? 'userClient?m=createUserFavorites' : 'userClient?m=cancelUserFavorites', param, (data) => {
      if (data.success) {
        /**
         *
        this.info.collectionNum + 1
         */
        var info = this.data.info;
        info.isCollection = isCollection ? 0 : 1
        info.collectionNum = isCollection ? info.collectionNum*1 - 1 : info.collectionNum*1 +1
        this.setData({
          info
        })
        wx.showToast({
          title: isCollection ? '取消收藏成功！' : '收藏成功！',
          icon: 'none'
        })
      }
    })
  },
  seeSellerInfo: function () {
    this.setData({ sellerInfo: !this.data.sellerInfo });
  },
  isShowMore(){
    this.setData({ isMoreMessage: !this.data.isMoreMessage });
  },
  loadQrCode(){
    this.setData({
      qrcodeShow:true,
      maskimgShow:true,
      isMoreMessage:false
    },()=>{
      let filepath = base64src(this.data.qrCodeUrl)
      wx.getImageInfo({
        src: `${wx.env.USER_DATA_PATH}/tmp_base64src.png`,
        success (res) {
          let ctx = wx.createCanvasContext('qrcode')
          ctx.drawImage(res.path, 0, 0, 200, 200)
          ctx.draw()
        }
      })
    }) 
  },
  saveQRCode(){
    wx.canvasToTempFilePath({
      canvasId: 'qrcode',
      destWidth:500,
      destHeight:500,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(result) {
            wx.showToast({
              title: '图片保存成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
    })
  },
  getQrCode(merchantId){
    // wx.http.postReq('wxBuildingMaterials/buildingMaterialsMerchant/getMerchantWXQRImage',{id:parseInt(merchantId)}, (data) => {
    //   if (data.success) {
    //     let base64 = wx.arrayBufferToBase64()
    //     this.setData({qrCodeUrl:"data:image/PNG;base64,"})
    //   }
    // })
    wx.request({
      responseType:'arraybuffer',
      method:'post',
      url:'https://prelaunch.horsegj.com/merchant/wxBuildingMaterials/buildingMaterialsMerchant/getMerchantWXQRImage',
      data:{id:parseInt(merchantId)},
      success:(res)=>{
        let base64 = wx.arrayBufferToBase64(res.data)
        this.data.qrCodeUrl = "data:image/png;base64," + base64
        // this.setData({qrCodeUrl:"data:image/png;base64,"+base64})
      }
    })
  },
  
  receive(e) {
    let couponsRulesId = e.currentTarget.dataset.id;
    wx.http.postReq('/appletClient?m=getCouponsGetRecord', { couponsRulesId }, (data) => {
      if (data.success) {
        wx.showToast({
          title: '领取成功',
          icon: 'none'
        })
      }
    })
  },
  onShareAppMessage: function (res) { //分享
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '马管家建材',
      path: '/pages/accredit/accredit'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      options.id = options.scene
    }
    // let options = {id:842}
    isLogin(options.id, '/pages/sellerHome/sellerHome?id=',()=>{
      this.getInit(options.id)
      this.getList(options.id, 10, 0)
      this.getQrCode(options.id)
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (options) {
    if(this.data.page.isMore){
      if(this.data.queryType !== 10){
        this.getList(this.data.id, this.data.queryType, this.data.sortType, true)
      }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '马管家建材',
      path: '/pages/sellerHome/sellerHome?id=' + this.data.id
    }
  },
  //阻止遮罩层
  myCatchTouch(){
    return false;
  },
  close(){
    this.setData({
      qrcodeShow:false,
      maskimgShow:false
    })
  }
})