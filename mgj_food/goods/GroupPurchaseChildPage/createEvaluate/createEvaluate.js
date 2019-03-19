// goods/GroupPurchaseChildPage/createEvaluate/createEvaluate.js
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
Page({

  /**
   * 页面的初始数据
   */
  data: {
    evaluateComments:["热情服务","环境优雅","干净卫生","价格实惠","性价比高"],
    imageActiveNum:null,//评价icon激活的index
    evaluateTagActiveArr:[false,false,false,false,false,false,false],//评价tag激活的数组
    // 增加图片
    imgListMaxLength:8,
    remainImageLength:8,
    imageList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let evaluateTagActiveArr=this.data.evaluateTagActiveArr;
    //没有则置为true
    if(evaluateTagActiveArr[index]){
        evaluateTagActiveArr[index]=false;
    }else{
        evaluateTagActiveArr[index]=true;
    }
    console.log(evaluateTagActiveArr)
    this.setData({
        evaluateTagActiveArr
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