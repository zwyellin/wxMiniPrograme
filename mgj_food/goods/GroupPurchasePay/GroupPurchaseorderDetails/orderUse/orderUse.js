// goods/GroupPurchasePay/GroupPurchaseorderDetails/orderUse/orderUse.js
const { base64src, wxRequest } = require('../../../../utils/util.js');
const {modify} =require("../../../GroupPurchaseIndex/groupPurchasePublicJs.js")
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,
    merchantId:null,
   
    groupPurchaseOrder:null,
    groupMerchantInfo:null,
    groupPurchaseOrderCouponCodeList:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {couponItem,orderId,merchantId}=options;
    console.log("orderId",orderId)
    this.data.orderId=orderId;
    this.data.merchantId=merchantId;
    this.findNewTOrderById().then(()=>{
      this.data.groupPurchaseOrderCouponCodeList.forEach((_item)=>{
         // this.createQRImage(_item.couponCode)
      })
    })

    // 
    this.getQrCode();
    
  },

  createQRImage(_item){
    wxRequest({
      url:'/merchant/userClient?m=createQRImage',
      method:'POST',
      data:{
        params:{
         content:_item
        }
      },
    }).then(res=>{
        this.loadQrCode(res.data);   
    })
  },
  findNewTOrderById(){
    return wxRequest({
      url:'/merchant/userClient?m=findNewTOrderById',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:{
          orderId:this.data.orderId
        }
      },
    }).then(res=>{
      if (res.data.code === 0) {
        let value=res.data.value;
        // 处理券码
        let groupPurchaseOrderCouponCodeList=this.voucherItemModify(value.groupPurchaseOrder.groupPurchaseOrderCouponCodeList);
        this.data.groupPurchaseOrderCouponCodeList=groupPurchaseOrderCouponCodeList;
        //处理商家信息
        let groupMerchantInfo=modify.GrouopMerchantModify(value.groupPurchaseOrder.groupPurchaseMerchant);
        this.setData({
          groupPurchaseOrder:value.groupPurchaseOrder,
          groupMerchantInfo:groupMerchantInfo,
          groupPurchaseOrderCouponCodeList:groupPurchaseOrderCouponCodeList
        })
      }
    })
  },
  voucherItemModify(item){
    if(item instanceof Array){
      item.forEach((_item,_index)=>{
        _item=_modify(_item);
      })
    }else{
      item=_modify(item)
    }
    function _modify(item){
      // 处理是否叠加
      if(item.isCumulate){//是否叠加 0:否,1:是 
        item.isCumulateText="可叠加"
      }else{
      item.isCumulateText="不可叠加"
      }
      //处理是否预约  
      if(item.isBespeak){//0:否,1:是 
        item.isBespeakText="需预约"
      }else{
        item.isBespeakText="免预约"
      }
      // 处理劵码情况
      // 0：未使用；1：已使用；2：已退款；
      if(item.status==0) item.statusText="未使用";
      else if(item.status==1) item.statusText="已使用";
      else if(item.status==2) item.statusText="已退款";
      return item;
    }
    return item;
  },








  // 
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
    this.setData({
      qrcodeShow:true
    },()=>{
      
      base64src(qrCodeUrl).then(filepath=>{
        wx.getImageInfo({
          src: `${wx.env.USER_DATA_PATH}/tmp_base64src.png`,
          success (res) {
            console.log("成功",res.path)
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
  getQrCode(){
    console.log("getQrCode",this.data.merchantId)
    wxRequest({
      responseType:'arraybuffer',
      method:'post',
      url:'/merchant/appletClient?m=getBuildingMaterialsGoodsWXQRImage',
      data:{
        token:app.globalData.token,
        params:{
          id:122,
        }
      }
    }).then(res=>{ 
        //this.data.QrCodeList.push(res.data);
      this.loadQrCode(res.data)
    })
  },

})