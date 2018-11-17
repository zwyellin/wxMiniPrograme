// pages/commodityDetails/commodityDetails.js
let { globalData, isMobile, isLogin } = getApp();
let WxParse = require('../../wxParse/wxParse.js');
let imageUtil = require("../../utils/images.js");
const { base64src } = require('../../utils/util.js');
const { commonAnimations } = require('../../components/commonAnimation.js');
Page(Object.assign({}, commonAnimations, {
  data: {
    topNum: 0,
    isScroll: false,
    id: null,
    data: {},
    isCommodity:true,
    selectCommodity: {},
    specifications: false,
    quantity: 1,
    merchantName: null,
    isSelectCommodity: false,
    cartLength: 0,// 购物车数量,
    toView: 'commodity',
    goodsDescribe:[],
    imgUrls: [],
    imgUrlsW: [],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    server: {
      '1': '正品保价',
      '2': '专业服务',
      '3': '品质保障',
      '4': '送货到家',
      '5': '七天无理由退换',
    },
    canvasqrCode:{
      destHeight:500,
      destWidth:500,
    },
    maskAnimation:null,
    qrCodeAnimation:null,
    qrCodeUrl:null,
    maskimgShow:false,   
    qrcodeShow:false      //二维吗
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      options.id = options.scene;
    }
    isLogin(options.id, '/pages/commodityDetails/commodityDetails?id=', () => {
      this.setData({
        id: options.id
      });
      this.getData({ goodsId: options.id || 150 });
      if (wx.getStorageSync('cart').length > 0) {
        this.getCarNum();
      }
      this.getQrCode(options.id);
    });
  },
  // 返回顶部
  scroollTop() {
    this.setData({
      topNum: 0,
    });
  },
  imageLoad(e) {
    let imageSize = imageUtil.imageUtil(e)
    let imgUrlsW = this.data.imgUrlsW
    imgUrlsW = imgUrlsW.map((i)=>{
      if (i.width || i.height){
        return i
      }else{
        return { height: 0, width: 0}
      }
    })
    //console.log(imageSize)
    //console.log(imgUrlsW, e.target.dataset.index)
    if (imageSize.originalWidth > 750 && imageSize.originalHeight > 750) {
      if (imageSize.originalWidth > imageSize.originalHeight) {
        imgUrlsW[e.target.dataset.index].height = 750
        imgUrlsW[e.target.dataset.index].width = 750 / imageSize.originalScale
      } else {
        imgUrlsW[e.target.dataset.index].width = 750
        imgUrlsW[e.target.dataset.index].height = imageSize.originalScale * 750
      }
    } else {
      if (imageSize.originalWidth > imageSize.originalHeight) {
        imgUrlsW[e.target.dataset.index].width = 750
        imgUrlsW[e.target.dataset.index].height = imageSize.originalScale * 750
      } else {
        imgUrlsW[e.target.dataset.index].height = 750
        imgUrlsW[e.target.dataset.index].width = 750 / imageSize.originalScale
      }
    }
    this.setData({
      imgUrlsW
    })
    
  },

  scroll(e) {
    let scrollTop = e.detail.scrollTop; //滚动的Y轴
    //console.log(scrollTop);
    let { navboxH, commodityH, con1H, con2H, con3H, evaluateH, con5H } = this.data;
    let evaluateH1 = commodityH + con1H + con2H + con3H;
    let detailH = evaluateH1 + con5H + evaluateH;
    if (scrollTop < evaluateH1 && !this.data.isCommodity) {
      this.setData({
        isCommodity: true,
        isEvaluate: false,
        isDetail: false,
      })
    }
    if (scrollTop > evaluateH1 - 1 && scrollTop < detailH && !this.data.isEvaluate) {
      this.setData({
        isCommodity: false,
        isEvaluate: true,
        isDetail: false,
      })
    }
    if (scrollTop > detailH - 1 && !this.data.isDetail) {
      this.setData({
        isCommodity: false,
        isEvaluate: false,
        isDetail: true,
      })
    }

  },
  getData: function (params) { //获取信息
    wx.http.postReq('appletClient?m=findClientBuildingMaterialsGoodsByIdInfo', params, (res) => {
      let { success, value } = res;
      if (success) {
        globalData.receivingWayValue = + value.buildingMaterialsMerchant.receivingWayValue == 3 ? 3 : 1
        let merchantName = value.buildingMaterialsMerchant
        let selectCommodity = !value.modelList[0] ? {} : value.modelList[0];
        selectCommodity.quantity = 1;
        selectCommodity.goodsName = value.goodsName;
        selectCommodity.goodsModelId = selectCommodity.id;
        selectCommodity.platformSubsidiesPrice = selectCommodity.platformSubsidiesPrice || 0
        selectCommodity.price = (selectCommodity.discountPrice ? selectCommodity.discountPrice - selectCommodity.platformSubsidiesPrice : selectCommodity.originalPrice - selectCommodity.platformSubsidiesPrice).toFixed(2);;
        selectCommodity.prices = (selectCommodity.discountPrice ? selectCommodity.discountPrice : selectCommodity.originalPrice).toFixed(2);
        let servers = value.buildingMaterialsMerchant.merchantServices
        if (servers) {
          value.buildingMaterialsMerchant.merchantServicesStr = ''
          servers.split(',').map((i, index) => {
            value.buildingMaterialsMerchant.merchantServicesStr += this.data.server[i] + (index + 1 !== servers.split(',').length ? '、' : '')
          })
        }

        let goodsDescribe = value.goodsDescribe
        goodsDescribe = goodsDescribe.split('\n')
        if (value.comments){
          value.comments.imagesObj = value.comments.images ? value.comments.images.split(';') : []
        }
        this.setData({
          goodsDescribe,
          merchantName,
          data: value,
          selectCommodity,
          imgUrls: value.imgs.split(';'),
          imgUrlsW: value.imgs.split(';')
        }, () => {
          let obj = wx.createSelectorQuery();
          let navboxH = 0;
          let commodityH = 0;
          let con1H = 0;
          let con2H = 0;
          let con3H = 0;
          let evaluateH = 0;
          let con5H = 0;
          obj.select('#navbox').boundingClientRect(function (rect) {
            navboxH = rect.height;
            that.setData({ navboxH });
          }).exec();
          obj.select('#commodity').boundingClientRect(function (rect) {
            commodityH = rect.height;
            that.setData({ commodityH });
          }).exec();
          obj.select('#con1').boundingClientRect(function (rect) {
            con1H = rect.height;
            that.setData({ con1H });
          }).exec();
          obj.select('#con2').boundingClientRect(function (rect) {
            con2H = rect.height;
            that.setData({ con2H });
          }).exec();
          obj.select('#con3').boundingClientRect(function (rect) {
            con3H = rect.height;
            that.setData({ con3H });
          }).exec();
          obj.select('#evaluate').boundingClientRect(function (rect) {
            evaluateH = rect.height;
            that.setData({ evaluateH });
          }).exec();
          obj.select('#con5').boundingClientRect(function (rect) {
            con5H = rect.height;
            that.setData({ con5H });
          }).exec();
        });
        let goodsInfo = value.goodsInfo || "";
        let that = this;
        WxParse.wxParse('goodsInfo', 'html', goodsInfo, that, 5);
      }
    })
  },
  handleSpecifications: function () {
    this.setData({ specifications: !this.data.specifications });
  },
  /**
   * 选择规格
   */
  changeSpecifications: function (e) {
    let itemdata = e.currentTarget.dataset.itemdata;
    itemdata.quantity = this.data.quantity;
    itemdata.goodsModelId = itemdata.id;
    itemdata.goodsName = this.data.selectCommodity.goodsName;
    itemdata.platformSubsidiesPrice = itemdata.platformSubsidiesPrice || 0
    itemdata.price = (itemdata.discountPrice ? itemdata.discountPrice - itemdata.platformSubsidiesPrice : itemdata.originalPrice - itemdata.platformSubsidiesPrice).toFixed(2);;
    itemdata.prices = (itemdata.discountPrice ? itemdata.discountPrice : itemdata.originalPrice).toFixed(2);
    this.setData({ selectCommodity: itemdata, isSelectCommodity: true });
  },
  cartNum(e) { //增加减少数量 1 减少 2增加
    var carType = e.currentTarget.dataset.type;
    var selectCommodity = this.data.selectCommodity;
    var num = parseInt(this.data.quantity);
    if (carType == 2) {
      num = num + 1
    } else {
      num = num - 1 <= 1 ? 1 : num - 1
    }
    selectCommodity.quantity = num;
    this.setData({
      quantity: num,
      selectCommodity
    });
  },
  purchase: function () { //立即购买
    isMobile(() => {
      let { isSelectCommodity } = this.data;
      if (!isSelectCommodity) {
        this.setData({ specifications: !isSelectCommodity });
        wx.showToast({
          title: '请选择型号',
          icon: 'none'
        })
      } else {
        globalData.selectCommodity = [{
          goodsId: this.data.selectCommodity.goodsId,
          goodsModelId: this.data.selectCommodity.goodsModelId,
          quantity: this.data.selectCommodity.quantity,
          price: this.data.selectCommodity.price,
        }];
        globalData.agentId = this.data.data.agentId;
        globalData.MerAgentId = this.data.data.agentId

        wx.navigateTo({
          url: '../order-submit/submit?merchantId=' + this.data.data.merchantId
        });
      }
    });
  },
  pushCartShow(){
    this.setData({ specifications: true });
  },
  pushCart: function () { //加入购物车
    let { isSelectCommodity } = this.data;
    if (!isSelectCommodity) {
      this.setData({ specifications: !isSelectCommodity });
      wx.showToast({
        title: '请选择型号',
        icon: 'none'
      })
    } else {
      globalData.cart = wx.getStorageSync('cart') || []
      // 查询商家
      var isMerchant = globalData.cart.some(merchant => {
        return merchant.merchant.id == this.data.merchantName.id
      })
      if (isMerchant) {
        globalData.cart.filter((merchant, index) => {
          // 查询商品
          var isYes = globalData.cart[index].list.some(item => {
            return item.id === this.data.selectCommodity.id || item.goodsId === this.data.selectCommodity.id
          })
          if (isYes) {
            var cartItem = globalData.cart[index].list.filter(item => {
              if (item.id === this.data.selectCommodity.id) {
                item.quantity = item.quantity + this.data.quantity
              }
              return item
            })
          } else {
            if (merchant.merchant.id === this.data.merchantName.id) {
              globalData.cart[index].list.push(this.data.selectCommodity)
            }
          }
        })
      } else {
        globalData.cart.push({
          merchant: this.data.merchantName,
          list: [this.data.selectCommodity]
        })
      }
      wx.setStorageSync('cart', globalData.cart)
      this.getCarNum();
      this.setData({
        quantity: 1,
        specifications: false,
      });
      wx.showToast({
        title: '成功加入购物车!',
        icon: 'none'
      })
    }
  },
  getCarNum() { //获取商品总数
    let cartLength = 0;
    wx.getStorageSync('cart').map(item => {
      item.list.map(son => {
        cartLength += son.quantity;
      })
    })
    this.setData({
      cartLength,
    })
  },
  tel(e) { //打电话
    let phone = e.currentTarget.dataset.tel;
    console.log(phone)
    wx.makePhoneCall({
      phoneNumber: phone,
      success() {
        console.log(1)
      },
      fail() {
        console.log(2)
      }
    })
  },
  jumpTo: function (e) {
    // 获取标签元素上自定义的 data-opt 属性的值

    let target = e.currentTarget.dataset.opt;
    this.setData({
      toView: target
    })
  },
  goEvaluateList() {
    wx.navigateTo({
      url: `../commodityEvaluateList/commodityEvaluateList?merchantId=${this.data.data.merchantId}&goodsId=${this.data.selectCommodity.goodsId}&goodsScore=${this.data.data.comments.goodsScore}`,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '马管家建材',
      path: '/pages/commodityDetails/commodityDetails?id=' + this.data.id
    }
  },
  loadQrCode(){
    this.maskShowAnimation();
    this.setData({
      qrcodeShow:true,
      maskimgShow:true
    },()=>{
      base64src(this.data.qrCodeUrl).then(filepath=>{
        wx.getImageInfo({
          src: `${wx.env.USER_DATA_PATH}/tmp_base64src.png`,
          success (res) {
            let ctx = wx.createCanvasContext('qrcode')
            ctx.drawImage(res.path, 0, 0, 200, 200)
            ctx.draw()
          }
        })
      }).catch(err=>{
          wx.showToast({
            title: '二维码生成失败',
            icon: 'loading',
            duration: 1000
          })
          setTimeout(()=>{
            wx.hideToast()
          },1000);
      }) 
    })
  },
  saveQRCode(){
    wx.canvasToTempFilePath({
      canvasId: 'qrcode',
      destWidth:this.data.canvasqrCode.destWidth,
      destHeight:this.data.canvasqrCode.destHeight,
      success: (res)=> {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success:(result)=> {
            wx.showToast({
              title: '图片保存成功',
              icon: 'success',
              duration: 1000
            })
            setTimeout(()=>{
              wx.hideToast()
            },1000);
          }
        })
      }
    })
  },
  getQrCode(goodsId){
    // wx.http.postReq('wxBuildingMaterials/buildingMaterialsMerchant/getMerchantWXQRImage',{id:parseInt(merchantId)}, (data) => {
    //   if (data.success) {
    //     let base64 = wx.arrayBufferToBase64()
    //     this.setData({qrCodeUrl:"data:image/PNG;base64,"})
    //   }
    // })
    wx.request({
      responseType:'arraybuffer',
      method:'post',
      url:wx.http.domain + 'wxBuildingMaterials/buildingMaterialsGoods/getGoodsWXQRImage',
      data:{id:parseInt(goodsId)},
      success:(res)=>{
        this.data.qrCodeUrl = res.data
      }
    })
  },
  //阻止遮罩层
  myCatchTouch(){
    return false;
  },
  close(){
    this.maskHideAnimation()
    this.setData({
      qrcodeShow:false,
    })
  }
}));