// goods/GroupPurchasePay/GroupPurchaseorderDetails/orderUse/orderUse.js
const { base64src, wxRequest } = require('../../../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,
    merchantId:null,
    codeIdList:[],//代码券码Id，数组
    QrCodeList:[],//码券url，数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {couponItem,orderId,merchantId}=options;
    console.log("orderId",orderId)
    this.data.orderId=orderId;
    this.data.merchantId=merchantId;
    this.findGroupPurchaseOrderCouponCodeIDListByOrderId().then(()=>{//根据orderId获得codeId列表
      this.data.codeIdList.forEach(()=>{
        console.log("codeIdList,item")
        this.getQrCode().then(()=>{//商家id,团购类型、获取二进制数据
          this.data.QrCodeList.forEach((_item)=>{
            console.log("准备loadQrcode")
           // this.loadQrCode(_item);//根据url绘制二维码
          })
        })
      })
    })
    
  },
  findGroupPurchaseOrderCouponCodeIDListByOrderId(){
    return wxRequest({
      url:'/merchant/userClient?m=findGroupPurchaseOrderCouponCodeIDListByOrderId',
      method:'POST',
      data:{
        params:{
          orderId:this.data.orderId
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        this.data.codeIdList=res.data.value;
        console.log( this.data.codeIdList)
      }
    })
  },


  loadQrCode(qrCodeUrl){
    console.log("loadQrCode")
    this.setData({
      qrcodeShow:true
    },()=>{
      base64src(qrCodeUrl).then(filepath=>{
        wx.getImageInfo({
          src: `${wx.env.USER_DATA_PATH}/tmp_base64src.png`,
          success (res) {
            console.log("成功")
            let ctx = wx.createCanvasContext('qrcode')
            ctx.drawImage(res.path, 0, 0, 200, 200)
            ctx.draw()
          },
          fail(){
            console.log("失败")
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
  // 获取二维码不采用之前的请求配置，返回参数结构不一样
  getQrCode(goodsId){
    console.log("getQrCode",this.data.merchantId)
    wxRequest({
      responseType:'arraybuffer',
      method:'post',
      url:'/merchant/userClient?m=getMGJGoodsWXQRImage',
      data:{
        token:app.globalData.token,
        params:{
          goodsId:this.data.orderId,
          bizType:6//外卖1，团购6
        }
      }
    }).then(res=>{ 
        //this.data.QrCodeList.push(res.data);
      this.loadQrCode(res.data)
    })
  },

})