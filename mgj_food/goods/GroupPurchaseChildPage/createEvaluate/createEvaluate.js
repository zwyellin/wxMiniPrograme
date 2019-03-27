// goods/GroupPurchaseChildPage/createEvaluate/createEvaluate.js
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
var qiniuUploader = require("../../../utils/qiniuUploader.js");
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');
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
    orderId:null,
    groupPurchaseOrder:null,
    groupMerchantInfo:null,


    imageActiveNum:null,//评价icon激活的index
    // groupMerchantInfo.evaluateStatistics.value 默认0，若选中为1。//评价tag点击
    textareaValue:"",//textarea文本内容
    moneyInputValue:null,//人均消费
    // 增加图片
    imgListMaxLength:8,
    remainImageLength:8,
    imageList:[],
    imagesSrc:[],//上传后获得的图片src
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {orderId}=options;
    this.data.orderId=orderId;
    this.findNewTOrderById().then(()=>{

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
            let groupPurchaseOrder=value.groupPurchaseOrder;
            let groupMerchantInfo=groupPurchaseOrder.groupPurchaseMerchant;
            // 处理evaluateStatistics
            let evaluateStatistics=groupMerchantInfo.evaluateStatistics;
            groupMerchantInfo.evaluateStatistics=JSON.parse(evaluateStatistics)
            this.setData({
            groupPurchaseOrder,
            groupMerchantInfo
            })
        }
    })
},


  // 评价图标点击事件
  evaluateImageTap(e){
    let {index}=e.currentTarget.dataset;
    let imageActiveNum=this.data.imageActiveNum;
    if(imageActiveNum==index) imageActiveNum=null;//归零
    else imageActiveNum=index;
    this.setData({
        imageActiveNum
    })
  },

  // 评价tag点击事件
  evaluateTagTap(e){
    let {index}=e.target.dataset;
    let evaluateStatistics=this.data.groupMerchantInfo.evaluateStatistics;
    console.log(evaluateStatistics[index].value,evaluateStatistics[index].value===0,evaluateStatistics[index].value==0)
    if(evaluateStatistics[index].value===0){
        evaluateStatistics[index].value=1;
    }else{
        evaluateStatistics[index].value=0;
    }
    this.setData({
        'groupMerchantInfo.evaluateStatistics':evaluateStatistics
    })
  },

  // textarea输入事件
  textareaInput(e){
    this.data.textareaValue=e.detail.value;
  },
  //人均消费输入事件
  moneyInput(e){
    this.data.moneyInputValue=e.detail.value;
  },
  //增加图片及以下功能   
  addImageTap:function(e){
    //
    var imgListMaxLength=this.data.imgListMaxLength;
    var remainImageLength=this.data.remainImageLength;
    if(this.data.imageList.length>=9){
        remainImageLength=0;
        feedbackApi.showToast({title: '最多选择'+imgListMaxLength+"张图片!"});
        return;
    }else if(this.data.imageList.length>0){
        remainImageLength=imgListMaxLength-this.data.imageList.length;
        feedbackApi.showToast({title: '还可以选择'+remainImageLength+"张图片!"});
    }else{
        remainImageLength=imgListMaxLength;
    }
   this.setData({
    chooseImage:true,
    remainImageLength:remainImageLength
   })
},
chooseImage:function(e){
    var dataType=e.target.dataset.id;
    var sourceType='';
    //这个悬浮窗弹起，则textarea会被textrich替换。关闭弹窗又会被替换回来，但原来输入的值没有了
   
    //事件托管
    switch(dataType){
        case "cancel":
        this.setData({
            chooseImage:false
        });return;
        case "camera" : case "album":sourceType=dataType;break;
        default :return;
    }
    var that=this;
    var remainImageLength=this.data.remainImageLength;
    that.setData({
        chooseImage:false,
        textareaFocus:false             
    });
    wx.chooseImage({
        count:remainImageLength,
        sizeType: ['original', 'compressed'],
        sourceType: [sourceType],
        success (res) {
          const tempFilePaths = res.tempFilePaths;
          var imageList=that.data.imageList.concat([],tempFilePaths); //如果原来有选择，则在原来基础上，增加
          that.setData({
              imageList:imageList,
              chooseImage:false
          });
        },
        fail(res){
            if(res.errMsg.includes('cancel')){//用户选择的取消
                console.log("取消选择图片/照片")
            }else{//打开失败
                if(sourceType=='camera') feedbackApi.showToast({title: '打开相机失败'});
                else feedbackApi.showToast({title: '打开相册失败'});
            }
            //关闭选择照片相册的悬浮窗
            that.setData({
                chooseImage:false
            });
        }
    });
  },
  deleteImage:function(e){
    var index=e.target.dataset.index;
    var imageList=this.data.imageList;
    imageList.splice(index,1);//删除一项
    this.setData({
        imageList:imageList
    })
  },

  //提交
  submitForm(){
    let msgTitle="评价不完整";
    if(this.data.imageActiveNum===null){//必传
        feedbackApi.showToast({title:msgTitle+"，请为商家评价"});
        return;
    }
   //准备提交
    wx.showLoading({
      title: '正在提交评价',
      icon: 'loading',
      duration: 20000,
      mask: true
    });
    //先上传图片，获取ImgUrl
    //先判断有没有图片
    if(this.data.imageList.length==0){//没有图片要提交，则直接最终提交
        this.data.imagesSrc=null;
        this.submitEvaluate();
    }else{//否则，先提交照片，再最终提交
        wxRequest({
            url:'/merchant/appletClient?m=getUploadImgParams',
            method:'POST',
            data:{
                token:app.globalData.token,
                params:{}	
            },
            }).then(res=>{
                let {domain, key,uploadToken} = res.data.value
                initQiniu(domain);
                let imageList=this.data.imageList;//根据用户选择的图片列表
               imageList.map(val=>{
                    qiniuUploader.upload(val, (data) => {
                        console.log("上传",data.imageURL);//获取返回来的imagesSrc
                        this.data.imagesSrc.push(data.imageURL);
                        if(this.data.imagesSrc.length==this.data.imageList.length){
                            if(this.data.imagesSrc.length>=2){
                                this.data.imagesSrc=this.data.imagesSrc.join(';')
                            }else{
                                this.data.imagesSrc= this.data.imagesSrc.toString();
                            }
                            console.log(this.data.imagesSrc)
                           //发送最终请求
                          this.submitEvaluate();
                        }
                        }, (error) => {
                          console.log('error: ' + JSON.stringify(error));
                          wx.hideLoading();
                          wx.showToast({
                            title:"图片上传失败",
                            icon:"none"
                          })
                        }, {
                            key: key.slice(0, 17) + parseInt(Math.random() * (9999 - 1000 + 1) + 1000)+'.png',
                            uptoken: uploadToken,
                            region: 'ECN', // 华北区
                        });
                    }) 
                })
    }

},

submitEvaluate(){ 
  // 因为是新界面，旧接口
  // 部分字段要从新界面，转化成对应的值
  // imageActiveNum(0,1,2,3,4)=>服务分(1,2,3,4,5)
  // tasteScore和totalScore采用和服务分一样的值。
  // 暂没用到。groupMerchantInfo.evaluateStatistics.value 默认0，若选中为1。//评价tag点击
  let imageActiveNum=parseInt(this.data.imageActiveNum);
  if(imageActiveNum!==null) imageActiveNum+=1;
  let params={
    agentId: app.globalData.agentId,
    content:this.data.textareaValue,
    groupPurchaseCouponType: this.data.groupPurchaseOrder.groupPurchaseCouponType||0,//优惠买单取不到，则为0,
    groupPurchaseOrderId: this.data.orderId,
    images: this.data.imagesSrc,
    merchantId: this.data.groupMerchantInfo.id,
    perCapitaConsumptionAmt: this.data.moneyInputValue,
    serviceScore: imageActiveNum,
    environmentScore: imageActiveNum,
    tasteScore: imageActiveNum,
    totalScore: imageActiveNum
  }
  wxRequest({
      url:'/merchant/userClient?m=createGroupPurchaseEvaluate',
      method:'POST',
      data:{
        token:app.globalData.token,
        params:params
      }
    }).then((res)=>{
            if (res.data.code === 0) {
                wx.hideLoading();
                wx.showToast({
                  title:"评价成功",
                  icon:"success",
                  mask:true,
                  success:()=>{
                    setTimeout(() => {
                      wx.navigateBack({
                        delta:1
                      })
                    }, 2000);
                  }
                })
            } else {
                let msg = res.data.value;
                feedbackApi.showToast({title: msg});
            }
        }).finally(()=>{
            wx.hideLoading();
        });   
  },
})