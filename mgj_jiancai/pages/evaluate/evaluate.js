// pages/evaluate/evaluate.js
var qiniuUploader = require("../../utils/qiniuUploader");
var { globalData } = getApp();


// 初始化七牛相关参数
function initQiniu(domain) {
  var options = {
    region: 'ECN', // 华北区
    uptokenURL: 'https://up-z1.qbox.me/api/uptoken',
    domain,
  };
  qiniuUploader.init(options);
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList:[],
    tempFilePaths: [],
    widthS: 0,
    widthC: 0,
    valuateContent:'',
    img:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      img: globalData.evalImg
    })
  },
  changeWidthS(e) {
    let width = e.currentTarget.dataset.width;
    this.setData({ widthS: width });
  },
  changeWidthC(e) {
    let width = e.currentTarget.dataset.width;
    this.setData({ widthC: width });
  },
  changeEvaluateContent(e){ //评价内容
    this.setData({
      valuateContent: e.detail.value
    })
  },
  submit(){
    let { widthS, widthC, valuateContent, imgList }=this.data;
    let params={
      orderId: globalData.orderDetail.id,
      orderItemId: globalData.evalId,
      content: valuateContent,
      images: imgList.join(';'),
      goodsScore: widthC,
      merchantScore: widthS
    };



    wx.http.postReq('appletClient?m=createBuildingMaterialsGoodsComments', params, (res) => {
      let { success, value } = res;
      if (success) {
        this.setData({
          addressData: value[0]
        })
        wx.showToast({
          title: '评价成功',
        })
        wx.navigateBack({
          delta: 1
        })

      } else {
        wx.showToast({
          title: value,
          icon: 'none'
        })
      }
    })
  },
  imgUpload(e) { //评价上传
    let that = this

    wx.chooseImage({
        count: 6,
        success(res) {
          wx.http.postReq('appletClient?m=getUploadImgParams', {}, (getToken) => {
            let {
              domain,
              key,
              uploadToken
            } = getToken.value

            initQiniu(domain);
            var filePath = res.tempFilePaths;
            // 交给七牛上传
            var imgList = that.data.imgList
            wx.showLoading({
              title: '上传中，请稍等...',
            })
            for (var i = 0; i < filePath.length; i++) {
              console.log(imgList.length + 1)
              if (imgList.length + filePath.length <= 6){
                qiniuUploader.upload(filePath[i], (data) => {
                  imgList.push(data.imageURL)
                  that.setData({
                    imgList
                  })
                }, (error) => {
                  console.log('error: ' + JSON.stringify(error));
                }, {
                    key: key.slice(0, 17) + parseInt(Math.random() * (9999 - 1000 + 1) + 1000)+'.png',
                    uptoken: uploadToken,
                    region: 'ECN', // 华北区
                  });
              } else {
                wx.showToast({
                  title: '最多上传6张照片请重新选择',
                  icon: 'none'
                })
              }
            }
            wx.hideLoading();
          })
        }
      })
  },
  // 删除图片
  delImg(e){
    let index = e.currentTarget.dataset.index;
    let imgList = this.data.imgList;
    imgList = imgList.filter((item,i)=>{
      return index !== i
    })
    console.log(imgList)
    this.setData({
      imgList
    })
  }
})