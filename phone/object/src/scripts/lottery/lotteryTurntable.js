$(function(){ 
	//背景图转换
	//变量t已经用了
	var $id=123//useid;//userId
	var angle=2160;
	var setting={
		i:0,         //图片转换参数
		keys:0,       //判断按钮点击
		clickNum:6,    //定义点击按钮执行次数
		isTrue:0,         //是否正在执行，没执行
		prizeNum:3,       //对应class名的奖项等级
		shareNum:true    //判断是不是第二次点击
		
	};
	//ajax
	/*$.ajax({
		url: "http://120.24.16.64/merchant/h5callback/findSimpleMerchant?merchantId=" + $id + "",
		type: "GET",
		contentType: 'application/json',
		dataType: "jsonp",
		async:true,
		jsonpCallback: "callback",
		success: function(data) {
			//console.log(data);
			$(".cover").css("display","none");
		},
		error: function() {
			alert("请求出错(请检查相关网络状况.)");
		}

	});*/
	
	
	
	var arr=['anim_disk','anim_disk_second','anim_disk_join','anim_disk_third','anim_disk_thank','anim_disk_first'];//不同角度class名
	//var arrays=['参与奖','二等奖','小幸运奖','三等奖','幸运大奖','一等奖'];
	//点击按钮
	var clickNum=setting.clickNum;
	var isTrue=setting.isTrue;
	var z;
	$("#startbtn").unbind().click(function(){	
		if(isTrue) return;//如果正在执行 ，就退出
		isTrue=true;       //在执行
		if(clickNum<=0){
			$(".alert_msg").fadeIn(300);
			setTimeout(function(){
				$(".alert_msg").fadeOut(300);
			},1000);
			isTrue=false;
		}else{
			$("#disk").removeClass();
			(function(){
				$("#disk").removeClass();
			})()
			//有次数可以执行			
			clickNum=clickNum-1;
			if(clickNum<0){
				clickNum=0;
			}
			
			
			var randNum=Math.floor(Math.random()*arr.length);
			 z=setting.prizeNum=randNum;
			 
			/* $.ajax({
			 	
			 })*/
			// lottery(z)
				console.log(z+"old")
			setTimeout(function(){
				lottery(z)
			},30)
		}	
	})
	
	
	//背景图转换
	var i=setting.i;//图片转换参数
	var bgTurn=function(){
		i++;
		$(".turn_light").css({
			'background':'url(images/lottery_new'+i+'.png) no-repeat',
			'background-size':'100% 100%'
		})
		if(i>=2){
			i=0;
		}
	}
	
	function whichTransitionEvent(){//判断内核
		var t,
        el = document.createElement('surface'),
        animations = {
         'WebkitAnimation':'webkitAnimationEnd',
         'animation':'animationend',
         'MozAnimation':'mozAnimationEnd',
         'MsAnimation':'MSAnimationEnd'
        }
        
        for(t in animations){
           if( el.style[t] !== undefined ){
               return animations[t];
           }
      	}    
	}
	
 /*  var z=setting.prizeNum;*/
  
  var $disk=document.getElementById("disk");
   //监听结束转动   移除class名
	var lottery=function(z){
		isTrue=true;
    $("#disk").removeClass().addClass(arr[z]);
   
    var animationEvent = whichTransitionEvent();
     console.log(animationEvent)
    	$disk.addEventListener(animationEvent,endHandler);
    	 timer=setInterval(bgTurn,30);//切换背景图的定时器
    	function endHandler(){
			clearInterval(timer);
			isTrue=false;
			setTimeout(function(){	
				switch(z){
				case 0:
					$(".lottery_unchoiced").myAlert({
					//	txt:'参与奖'
					});
					break;
				case 1:
					$(".lottery_choiced").myAlert({
						txt:'二等奖'
					});
					break;
				case 2:
					$(".lottery_choiced").myAlert({
						txt:'小幸运奖'
					});
					break;
				case 3:
					$(".lottery_choiced").myAlert({
						txt:'三等奖'
					});
					break;
				case 4:
					$(".lottery_choiced").myAlert({
						txt:'幸运大奖'
					});
					break;
				case 5:
					$(".lottery_choiced").myAlert({
						txt:'一等奖'
					});
					break;
				}
				//$(".lottery_choiced").myAlert();
				$disk.removeEventListener(animationEvent,endHandler);
			},500)
			//isTrue=false;
		}
    	
    	
	}
	
	
	
	
	
	
	
	
	
	
	
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
}); 