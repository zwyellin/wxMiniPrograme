const feedbackApi=require('../../components/showToast/showToast.js');  //引入消息提醒暴露的接口
const { wxRequest,formatNumber} = require('../../utils/util.js'); 
const app = getApp();
Page({
	data:{
        scrollIntoViewId:'',
        initInfo:{},//页面初始化时请求来的数据
        orderId:'',//订单号
        deliveryImageActiveNum:'',//0,1,2后期提交时转为1,3,5 作为deliverymanScore：配送员评分 差1，一般3 赞5
        deliveryCommentsArr:[
            ["提前点送达","服务态度差","餐品翻撒","送餐慢","着装脏乱","沟通困难"],
            ["穿戴工装","风雨无阻","快速准时","仪容整洁","货品完好","礼貌热情"],
            ["穿戴工装","风雨无阻","快速准时","仪容整洁","货品完好","礼貌热情"]],
        deliveryBtn:[false,false,false,false,false,false],//骑手按钮选择评价，是否点击（多选）
        isAnonymous:0,//是否匿名，0为否，及未选择 1为匿名
        merchantScore:0,//商家评分,默认0，没有评分
        pickageScore:0,
        tasteScore:0,
        textareaInfo:{maxLength:800,currentLength:0,value:''},
        textareaValue:'',
        imageList:[],
        imgUrl:"",
        goodsComments:[],
        chooseImage:false,//选择是照相还是相册悬浮窗    
    },
    onLoad:function(options){
        let {orderid}=options;
        this.data.orderId=orderid;
        console.log(orderid)
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
                console.log("加载数据成功")
                var resValue=res.data.value;
                console.log(resValue);
                //对送达时间的显示的处理
                var time=new Date(resValue.deliveryTask.arrivalMerchantTime);
                resValue.deliveryTask.arrivalMerchantTime=formatNumber(time.getHours())+":"+formatNumber(time.getMinutes());
                //对于orderItems特别处理下
                var orderItems=resValue.orderItems;
                var goodsComments=[];
                orderItems.map(function(val,index){
                    let {goodsId,name}=val;
                    console.log(goodsId,name)
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
        var deliveryBtn=this.data.deliveryBtn;//重置btn是否选中状态
        deliveryBtn=deliveryBtn.fill(false,0,deliveryBtn.length);
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
        console.log(isAnonymous)
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
        //   //页面跳转
        //   console.log("选择图片跳转页面")
        //   wx.navigateTo({
        //     url: '/pages/chooseImage/chooseImage'
        //   })
       this.setData({
        chooseImage:true
       })
    },
    chooseImage:function(e){
        var dataType=e.target.dataset.id;
        var sourceType='';
        console.log(dataType);
        //这个悬浮窗弹起，则textarea会被textrich替换。关闭弹窗又会被替换回来，但原来输入的值没有了
        //重新赋值
        var textareaValue=this.data.textareaInfo.value;
        this.setData({
            textareaValue:textareaValue
        })
        //事件托管，看是哪个节点触发的
        switch(dataType){
            case "cancel":this.setData({chooseImage:false});return;
            case "camera" : case "album":sourceType=dataType;break;
            default :return;
        }
        console.log(sourceType);
        var that=this;
        wx.chooseImage({
            count: 9,//最多9张
            sizeType: ['original', 'compressed'],
            sourceType: [sourceType],
            success (res) {
              // tempFilePath可以作为img标签的src属性显示图片
              console.log("选择图片成功")
              const tempFilePaths = res.tempFilePaths;
              //var imageList=this.data.imageList.concat([],tempFilePaths)
              that.setData({
                  imageList:tempFilePaths,
                  chooseImage:false
              })
            },
            fail(res){
                if(sourceType=='camera') feedbackApi.showToast({title: '打开相机失败'});
                else feedbackApi.showToast({title: '打开相册失败'});
            }
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
        //校验
        console.log("开始校验")
       
        var msgTitle="评价不完整，请继续评价";
        // var durationTime=200;
		// if (this.data.deliveryImageActiveNum === '') {
        //     feedbackApi.showToast({title: msgTitle});
        //     // wx.pageScrollTo({
        //     //     scrollTop: 0,
        //     //     duration: durationTime
        //     //   })
		// 	return;
        // }//检验两项，包裹分和口味打分
        if(this.data.pickageScore===0){//必传
            feedbackApi.showToast({title:msgTitle});
			return;
        }
        if(this.data.tasteScore===0){//必传，
            feedbackApi.showToast({title: msgTitle});
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
        //骑手评价数据处理
        var deliverymanImpress='';
        this.data.deliveryBtn.filter(function(val,index){
            if(val) deliverymanImpress+=''+(index+1)+",";
        })
        deliverymanImpress=deliverymanImpress.substring(0,deliverymanImpress.length-1);
        //赞，踩数据处理，把赞，踩的项提取出来
        //过滤，及修改
        var goodsComments=this.data.goodsComments.filter(function(val,index){
            delete val.goodsName;
            if(val.goodsScore=='') return false;
            else  val.goodsScore=parseInt(val.goodsScore);
            return true;
        })
        // var goodsComments=this.data.goodsComments.map(function(val,index){
        //     delete val.goodsName;
        //     val.goodsScore=parseInt(val.goodsScore);
        //     return val;
        // })
        goodsComments=JSON.stringify(goodsComments);
        //请求对象
        var params={
            orderId:this.data.orderId,//订单号
            agentId:this.data.initInfo.agentId,//代理商号
            deliveryCost:this.data.initInfo.boxPrice,//配送成本
            deliverymanScore:deliverymanScore,//骑手评分
            deliverymanImpress:deliverymanImpress,//骑手印象，多个已英文  ,  分割
            merchantScore:this.data.merchantScore,//商家评分
            merchantComments:this.data.textareaInfo.value,//商家评价
            packagingScore:this.data.pickageScore,//包裹分
            tasteScore:this.data.tasteScore,//口味分
            imgUrl:this.data.imgUrl,		//图片地址
            isAnonymous:this.data.isAnonymous,	//是否匿名：0不是，1是
            goodsComments:goodsComments,//1踩，5赞 列表 
        }
		wx.showLoading({
	        title: '正在提交评价',
	        icon: 'loading',
	        duration: 200000,
	        mask: true
        });
        console.log("请求参数",params)
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