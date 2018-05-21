// 判断是不是移动设备
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i) ? true: false;
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true: false;
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true: false;
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true: false;
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};
$(document).ready(function(){
	$('.turn_pan').css('display','block');
	$('.peopleNum').css('display','block');
	$('.record_lottery').css('display','block');
})
$(function(){
	var $id=123//userid;
	var timer;
	var setting={//控制对象
		i:-1,         //图片转换参数
		keys:0,       //判断按钮点击
		clickNum:2,    //定义点击按钮执行次数
		isturn:0,         //是否正在执行，没执行
		prizeNum:3,       //对应class名的奖项等级
		shareNum:true,    //判断是不是第二次点击
		prize:['参与奖','一等奖','小幸运奖','三等奖','幸运大奖','二等奖']
	};
	
	//ajax
//	$.ajax({
//		url: "http://120.24.16.64/merchant/h5callback/findSimpleMerchant?merchantId=" + $id + "",
//		type: "GET",
//		contentType: 'application/json',
//		dataType: "jsonp",
//		async:true,
//		jsonpCallback: "callback",
//		success: function(data) {
//			//console.log(data);
//			$(".cover").css("display","none");
//		},
//		error: function() {
//			alert("请求出错(请检查相关网络状况.)");
//		}
//
//	});

	var imgSrc={
		lotteryimg:'images/lottery_choiced.gif',
		unlotteryimg:'images/lottery_unchoiced.gif',
		lotterycaideng:['images/lottery_new0.png','images/lottery_new1.png'],
		
	}
	//彩灯背景
	
	$('.turn_light').css({
		'background':'url('+imgSrc.lotterycaideng[0]+') no-repeat',
		'background-size':'100% 100%'
	})
	//彩灯转换
	var i=setting.i;//图片转换参数
		var turnLight=function(){
			if(i>=1){
				i=-1;
			}
			i++;
			$(".turn_light").css({
				'background':'url('+imgSrc.lotterycaideng[i]+') no-repeat',
				'background-size':'100% 100%'
			})
		}
	//ajax 传参函数介绍
	/*
	 * @prams type:get
	 * @prams url 地址
	 * @prams ajaxdata参数
	 * @prams successcallback 成功回调
	 * @prams errorcallback 失败回调
	 * */
	var ajaxdata={
		
	};
	var getlottery=function(z){
		console.log(z)
	
//		ajaxpost(get,url,ajaxdata,successcallback,errorcallback);
//		function successcallback(data){
//			
//		};
//		function errorcallback(res){
//			
//		};
		var deg=360-z*60;
		$("#disk").css({
			'transition-duration':'6s',
   		   '-webkit-transition-duration': '6s',
   		   "-webkit-transition-timing-function": "ease-in-out",
   		   'transform':'rotate(' + (deg + 1800) + 'deg)',
    	   '-webkit-transform': 'rotate(' + (deg + 1800) + 'deg)'
  		})
		setTimeout(function(){
		
			switch(z){
				case 0:
					$(".lottery_unchoiced").myAlert({
					//	txt:'参与奖'
					});
					break;
				case 1:
					$(".lottery_choiced").myAlert({
						txt:'一等奖'
					});
					break;
				case 2:
					$(".lottery_choiced").myAlert({
						txt:'幸运大奖'
					});
					break;
				case 3:
					$(".lottery_choiced").myAlert({
						txt:'三等奖'
					});
					break;
				case 4:
					$(".lottery_choiced").myAlert({
						txt:'小幸运奖'
					});
					break;
				case 5:
					$(".lottery_choiced").myAlert({
						txt:'二等奖'
					});
					break;
				}
		   	$("#disk").css({
		   		'transition-duration':'0s',
		       '-webkit-transition-duration': '0s',
		       'transform':'rotate(' + deg + 'deg)',
		       '-webkit-transform': 'rotate(' + deg + 'deg)'
		   })
		   	setting.isturn=false;
		   	clearInterval(timer);
	   },6500);
	   
	}
	//点击按钮执行
	document.getElementById("startbtn").addEventListener('click',function(){
		console.log(setting.isturn)
		if(setting.isturn){
			swal({
				title: "提示",
				text: "没有抽奖次数了哦!",
				confirmButtonText: "确定",
				confirmButtonColor:"#FF9A00",
				showLoaderOnConfirm:"true"
			})
			return false;
		}
			setting.isturn=true;	
		//判断抽奖次数
		if(setting.clickNum<=0){
			console.log(2)
			swal({
				title: "提示",
				text: "没有抽奖次数了哦!",
				confirmButtonText: "确定",
				confirmButtonColor:"#FF9A00"
			})
			/*return false;*/
		}else{
			setting.clickNum=setting.clickNum-1;
			if(setting.clickNum<0){
				setting.clickNum=0;
			}
			timer=setInterval(turnLight,200);
			var randNum=Math.floor(Math.random()*setting.prize.length);
			z=setting.prizeNum=randNum;
			getlottery(z);//抽奖
		}
		
	});
	//弹窗关闭X
	$(".lottery_choiced .cancel_msg").click(function(){
		/*alert(1)*/
		$(".lottery_choiced").myAlert({
			displayStates:'none'
		})
	})
	//弹窗关闭X
	$(".lottery_unchoiced .cancel_msg").click(function(){
		/*alert(1)*/
		$(".lottery_unchoiced").myAlert({
			displayStates:'none'
		})
	})
	
	//查看中奖纪录
	$(".record_lottery").click(function(){
		window.location="lottery_name.html?userid="+$id+"";
	})
	
	//中奖去完善信息
	$(".lottery_choiced .compete_btn").click(function(){
		window.location="lotteryPersonMsg.html?userid="+$id+"";
	})
	//未中奖分享
	$(".lottery_unchoiced .compete_btn").click(function(){
		
	})
	//活动规则	
	var hammer = new Hammer(document.getElementById("content"));
	hammer.on('tap',function(e){
		$('.lotteryrules_entry').animate({
			'margin-right':'0rem'
		},300);
		setTimeout(function(){
			$('.lotteryrules_entry').animate({
				'margin-right':'-1rem'
			},300)
		},3000)
	});
	
	hammer.on('panstart',function(e){
		$('.lotteryrules_entry').animate({
			'margin-right':'0rem'
		},300);
	});
	hammer.on('panend',function(e){
		setTimeout(function(){
			$('.lotteryrules_entry').animate({
				'margin-right':'-1rem'
			},300)
		},3000)
	});
		var hammers = new Hammer(document.getElementById("lottery_rules_roll"));
		hammers.on('tap',function(){
			window.location.href="LotteryRules.html";
		})
})
