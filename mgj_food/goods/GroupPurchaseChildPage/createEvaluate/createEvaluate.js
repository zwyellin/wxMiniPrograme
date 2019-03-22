// goods/GroupPurchaseChildPage/createEvaluate/createEvaluate.js
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
const app = getApp();
const { wxRequest } = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:null,
    groupPurchaseOrder:null,
    groupMerchantInfo:null,


    imageActiveNum:null,//评价icon激活的index
    // 增加图片
    imgListMaxLength:8,
    remainImageLength:8,
    imageList:[],
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

  createGroupPurchaseEvaluate(){
    let data={
    agentId: null,
    merchantId:null
    }
    wxRequest({
        url:'/merchant/userClient?m=createGroupPurchaseEvaluate',
        method:'POST',
        data:{
          token:app.globalData.token,
          params:{
            data:data
          }
        }
      }).then((res)=>{

      })
  },
  evaluateImageTap(e){
    let {index}=e.currentTarget.dataset;
    let imageActiveNum=this.data.imageActiveNum;
    if(imageActiveNum==index) imageActiveNum=null;//归零
    else imageActiveNum=index;
    this.setData({
        imageActiveNum
    })
  },
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
})