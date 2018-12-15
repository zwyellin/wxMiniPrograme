const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
var qiniuUploader = require("../../utils/qiniuUploader.js");
const { wxRequest,formatNumber} = require('../../utils/util.js'); 
const app = getApp();

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
	data:{
        scrollIntoViewId:'',
        initInfo:{},//页面初始化时请求来的数据
        orderId:'',//订单号
        deliveryImageActiveNum:'',//0,1,2后期提交时转为1,3,5 作为deliverymanScore：配送员评分 差1，一般3 赞5
        deliverymanScore:null,//骑手评分
        deliveryCommentsArr:[
            ["提前点送达","服务态度差","餐品翻撒","送餐慢","着装脏乱","沟通困难"],
            ["穿戴工装","风雨无阻","快速准时","仪容整洁","货品完好","礼貌热情"],
            ["穿戴工装","风雨无阻","快速准时","仪容整洁","货品完好","礼貌热情"]],
        deliverymanImpress:null,//骑手评价，上一字段转数字
        deliveryBtn:[false,false,false,false,false,false],//骑手按钮选择评价，是否点击（多选）
        isAnonymous:0,//是否匿名，0为否，及未选择 1为匿名
        merchantScore:0,//商家评分,默认0，没有评分
        pickageScore:0,
        tasteScore:0,
        textareaInfo:{maxLength:300,currentLength:0,value:''},//没有评价，则为null.评价显示也，则对应显示，该用户没有做具体哦！
        textareaValue:'',
        textareaFocus:true,
        imageList:[],
        imgUrl:[],//请求返回来的src
        goodsComments:[],
        chooseImage:false,//选择是照相还是相册悬浮窗    
        isTextAreaShow:false,
        imgListMaxLength:9,//最多选择9张图片
        remainImageLength:null,//还可以选几张
    },
    onLoad:function(options){
        let {orderid}=options;
        this.data.orderId=orderid;
       //加载数据
       wxRequest({
        url:'/merchant/userClient?m=findTOrderById',
        method:'POST',
        data:{
            token:app.globalData.token,
            params:{
               orderId:this.data.orderId
            }	
        },
        }).then(res=>{
            if(res.statusCode==200){
                var resValue=res.data.value;
                //对送达时间的显示的处理
                // 兼容ios  IOS只识别2017/01/01这种格式
                 var date1 =resValue.deliveryTask.arrivalMerchantTime+"";
                 date1 = date1.replace(/-/g, '/');  // 日期格式处理
                var time=new Date(date1);
                resValue.deliveryTask.arrivalMerchantTime=formatNumber(time.getHours())+":"+formatNumber(time.getMinutes());
                //对于orderItems特别处理下
                var orderItems=resValue.orderItems;
                var goodsComments=[];
                orderItems.map(function(val,index){
                    let {goodsId,name}=val;
                    let o={
                        goodsId:goodsId,
                        goodsName:name,
                        goodsScore:''
                    };
                    goodsComments.push(o);
                })
                //渲染上去
                this.setData({
                    initInfo:resValue,
                    goodsComments:goodsComments
                })
            }else{
                console.log(res.errMsg);
            }
        })
    },
    deliveryImageTap:function(e){//骑手笑脸选择
        var num=parseInt(e.currentTarget.dataset.id);
        var deliveryBtn=this.data.deliveryBtn;
        deliveryBtn=deliveryBtn.fill(false,0,deliveryBtn.length);//重置btn是否选中状态
        this.setData({
            deliveryImageActiveNum:num,
            deliveryBtn:deliveryBtn
        })
    },
    deliveryBtnTap:function(e){//骑手按钮评价选择
        var num=parseInt(e.target.dataset.id);
        var deliveryBtn=this.data.deliveryBtn;
        deliveryBtn[num]=!deliveryBtn[num];//选中切换
        this.setData({
            deliveryBtn:deliveryBtn
        })
    },
    isAnonymousSwitch:function(e){
        let isAnonymous=this.data.isAnonymous;
        isAnonymous= isAnonymous==0?1:0;
        this.setData({
            isAnonymous:isAnonymous
        })
    },
    starNum(e){//星星点击事件
        //index是第几个星星0->   evaluate是绑定要修改的数据
		let { index, evaluate } = e.currentTarget.dataset;
		if (evaluate=='merchantScore') {
			this.setData({
				merchantScore:index+1  //星星数值是从1开始，so index+1
			})
		} else if (evaluate=='pickageScore') {
			this.setData({
				pickageScore:index+1
			});
		}else if(evaluate=='tasteScore'){
            this.setData({
				tasteScore:index+1
			});
        }
    },
    merchantTextareaInput:function(e){//textarea事件
        var textareaInfo=this.data.textareaInfo;
        textareaInfo.currentLength=e.detail.cursor;//textarea光标位置，即输入字符个数
        textareaInfo.value=e.detail.value;//textarea 的value
        this.setData({
            textareaInfo:textareaInfo
        })
    },
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
        //重新赋值
        var textareaValue=this.data.textareaInfo.value;
        this.setData({
            textareaValue:textareaValue
        })
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
    imageTap:function(e){
        var imgs=e.target.dataset.imgs;
		var current=e.target.dataset.current;
		wx.previewImage({
			current: current, // 当前显示图片的http链接
			urls:imgs // 需要预览的图片http链接列表
		  })
    },
    deleteImage:function(e){
        var index=e.target.dataset.index;
        var imageList=this.data.imageList;
        imageList.splice(index,1);//删除一项
        this.setData({
            imageList:imageList
        })
    },
    textAreaTap(){
        //置为true，则此标签就不再用了。目的就是避免一开始界面进去的时候textarea层级太高,而用的替代品，又因为要显示placeholder.故选用新的此标签
         this.setData({
            isTextAreaShow:true
         },()=>{
         this.setData({
            isTextAreaShow:true
         })
        })
    },
    goodsCommentsTap:function(e){
        let { id, type } = e.currentTarget.dataset;//id为第几项，type为赞5或踩1
        let goodsComments=this.data.goodsComments;//goodsComments[i].goodsScore 值为'' 1 5
        //console.log("赞，踩",goodsComments[id].goodsScore,type,goodsComments[id].goodsScore==type)
        if(goodsComments[id].goodsScore==type){//如果原来值和传过来的值一样，说明，是取消赞/踩
            goodsComments[id].goodsScore='';//重置为''
            this.setData({
                goodsComments:goodsComments
            })
        }else{//如果不一样，则赋值为type 1踩，5赞
            goodsComments[id].goodsScore=type;
            this.setData({
                goodsComments:goodsComments
            })
        }
    },
    submitForm(){
        var msgTitle="评价不完整";
       //检验4项，骑手分，店家评分，包裹分 和口味分
       if(this.data.deliveryImageActiveNum===''){//必传
            feedbackApi.showToast({title:msgTitle+"，请为骑手打分"});
            return;
       }
       if(this.data.merchantScore===0){//必传
        feedbackApi.showToast({title:msgTitle+"，请为店家打分"});
        return;
       }
        if(this.data.pickageScore===0){//必传
            feedbackApi.showToast({title:msgTitle+"，觉得包装如何？"});
			return;
        }
        if(this.data.tasteScore===0){//必传，
            feedbackApi.showToast({title: msgTitle+"，觉得口味怎么样？"});
			return;
        }
        //修正数据
        //骑手评分，deliveryImageActiveNum:'',//0,1,2后期提交时转为1,3,5 作为deliverymanScore：配送员评分 差1，一般3 赞5
        var deliverymanScore='';
        switch(this.data.deliveryImageActiveNum){
            case 0:deliverymanScore=1;break;
            case 1:deliverymanScore=3;break;
            case 2:deliverymanScore=5;break;
            default :deliverymanScore=5;break;
        }
        this.data.deliverymanScore=deliverymanScore;
        //骑手评价数据处理
        var deliverymanImpress='';
        this.data.deliveryBtn.filter(function(val,index){
            if(val) deliverymanImpress+=''+(index+1)+",";
        })
        deliverymanImpress=deliverymanImpress.substring(0,deliverymanImpress.length-1);
        this.data.deliverymanImpress=deliverymanImpress;
        //赞，踩数据处理，把赞，踩的项提取出来
        //过滤，及修改
        var goodsComments=this.data.goodsComments.filter(function(val,index){
            delete val.goodsName;
            if(val.goodsScore=='') return false;
            else  val.goodsScore=parseInt(val.goodsScore);
            return true;
        })
        goodsComments=JSON.stringify(goodsComments);
        this.data.goodsComments=goodsComments;
       //准备提交
		wx.showLoading({
	        title: '正在提交评价',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
        });
        //先上传图片，获取ImgUrl
        //先判断有没有图片
        if(this.data.imageList.length==0){//没有图片要提交，则直接最终提交
            this.data.imgUrl=null;
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
                            console.log("上传",data.imageURL);//获取返回来的imgUrl
                            this.data.imgUrl.push(data.imageURL);
                            if(this.data.imgUrl.length==this.data.imageList.length){
                                if(this.data.imgUrl.length>=2){
                                    this.data.imgUrl=this.data.imgUrl.join(';')
                                }else{
                                    this.data.imgUrl= this.data.imgUrl.toString();
                                }
                                console.log(this.data.imgUrl)
                               //发送最终请求
                              this.submitEvaluate();
                            }
                            }, (error) => {
                            console.log('error: ' + JSON.stringify(error));
                            }, {
                                key: key.slice(0, 17) + parseInt(Math.random() * (9999 - 1000 + 1) + 1000)+'.png',
                                uptoken: uploadToken,
                                region: 'ECN', // 华北区
                            });
                        }) 
                    })
        }

    },//submitForm函数结束
        submitEvaluate(){ 
            //请求对象
           var params={
               orderId:this.data.orderId,//订单号
               agentId:this.data.initInfo.agentId,//代理商号
               deliveryCost:this.data.initInfo.boxPrice,//配送成本
               deliverymanScore:this.data.deliverymanScore,//骑手评分
               deliverymanImpress:this.data.deliverymanImpress,//骑手印象，多个已英文  ,  分割
               merchantScore:this.data.merchantScore,//商家评分
               merchantComments:this.data.textareaInfo.value,//商家评价
               packagingScore:this.data.pickageScore,//包裹分
               tasteScore:this.data.tasteScore,//口味分
               imgUrl:this.data.imgUrl,		//图片地址
               isAnonymous:this.data.isAnonymous,	//是否匿名：0不是，1是
               goodsComments:this.data.goodsComments,//1踩，5赞 列表 
            }           
            wxRequest({
                url:'/merchant/userClient?m=createOrderComments',
                method:'POST',
                data:{
                    token: app.globalData.token,
                    params:params
                }	
            }).then(res=>{
                console.log("请求结果",res);
                if (res.data.code === 0) {
                    setTimeout(()=>{
                        wx.switchTab({
                            url:'/pages/goods/cartItem/cartItem'
                        })
                    },1000)
                    feedbackApi.showToast({title: '评价成功'});
                } else {
                    let msg = res.data.value;
                    feedbackApi.showToast({title: msg});
                }
            }).finally(()=>{
                wx.hideLoading();
            });   
        }
})