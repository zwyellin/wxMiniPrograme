$(function(){
	
var turnplate={
		restaraunts:[],				//大转盘奖品名称
		colors:[],	                //大转盘奖品区块对应背景颜色
		//fontcolors:[],				//大转盘奖品区块对应文字颜色
		outsideRadius:222,			//大转盘外圆的半径
		textRadius:145,				//大转盘奖品位置距离圆心的距离
		insideRadius:65,			//大转盘内圆的半径
		startAngle:0,				//开始角度
		bRotate:false				//false:停止;ture:旋转
};

$(document).ready(function(){
	//动态添加大转盘的奖品与奖品区域背景颜色
	turnplate.restaraunts = [ "谢谢参与", "一等奖", "幸运大奖", "三等奖", "小幸运奖", "二等奖"];
	turnplate.colors = ["#FE6766", "#FED077", "#FE6766", "#FED077","#FE6766", "#FED077"];
	//turnplate.fontcolors = ["#CB0030", "#FFFFFF", "#CB0030", "#FFFFFF","#CB0030", "#FFFFFF"];
	
	var rotateTimeOut = function (){
		$('#wheelcanvas').rotate({
			angle:0,
			animateTo:2160,
			duration:6000,
			callback:function (){
				alert('网络超时，请检查您的网络设置！');
			}
		});
	};
	
	
	//旋转转盘 item:奖品位置; txt：提示语;
	var rotateFn = function (item, txt){
		var angles = item * (360 / turnplate.restaraunts.length) - (360 / (turnplate.restaraunts.length*2));
		if(angles<270){
			angles = 270 - angles; 
		}else{
			angles = 360 - angles + 270;
		}
		$('#wheelcanvas').stopRotate();
		$('#wheelcanvas').rotate({
			angle:0,
			animateTo:angles+1800,
			duration:6000,
			callback:function (){
				//中奖页面与谢谢参与页面弹窗
				//alert(txt);
				if(txt.indexOf("谢谢参与")>=0){
						//$("#ml-main").fadeIn();
						//$("#zj-main").fadeOut();
						$("#xxcy-main").fadeIn();
				}else{
					//$("#ml-main").fadeIn();
					$("#zj-main").fadeIn();
					//$("#xxcy-main").fadeOut();
					var resultTxt=txt.replace(/[\r\n]/g,"");//去掉回车换行
					$("#jiangpin").text(resultTxt);
				}								
				turnplate.bRotate = !turnplate.bRotate;
			}
		});
	};
	
	/********弹窗页面控制**********/
	
	$('.close_zj').click(function(){
		$('#zj-main').fadeOut();
		//$('#ml-main').fadeIn();
	});
	
	$('.close_xxcy').click(function(){
		$('#xxcy-main').fadeOut();
		//$('#ml-main').fadeIn();
	});
	$('.close_tjcg').click(function(){
		$('#tjcg-main').fadeOut();
		//$('#ml-main').fadeIn();
	});
	
	$('.info_tj').click(function(){
		$('#zj-main').fadeOut();
		$('#tjcg-main').fadeIn();
	});
	
	
	/********抽奖开始**********/
	$('#startbtn').click(function (){
		if(turnplate.bRotate)return;
		turnplate.bRotate = !turnplate.bRotate;
		//获取随机数(奖品个数范围内)
		var item = rnd(1,turnplate.restaraunts.length);
		
		//奖品数量等于10,指针落在对应奖品区域的中心角度[252, 216, 180, 144, 108, 72, 36, 360, 324, 288]
		rotateFn(item, turnplate.restaraunts[item-1]);
		/* switch (item) {
			case 1:
				rotateFn(252, turnplate.restaraunts[0]);
				break;
			case 2:
				rotateFn(216, turnplate.restaraunts[1]);
				break;
			case 3:
				rotateFn(180, turnplate.restaraunts[2]);
				break;
			case 4:
				rotateFn(144, turnplate.restaraunts[3]);
				break;
			case 5:
				rotateFn(108, turnplate.restaraunts[4]);
				break;
			case 6:
				rotateFn(72, turnplate.restaraunts[5]);
				break;
			case 7:
				rotateFn(36, turnplate.restaraunts[6]);
				break;
			case 8:
				rotateFn(360, turnplate.restaraunts[7]);
				break;
			case 9:
				rotateFn(324, turnplate.restaraunts[8]);
				break;
			case 10:
				rotateFn(288, turnplate.restaraunts[9]);
				break;
		} */
		console.log(item);
	})
		
});

function rnd(n, m){
	var random = Math.floor(Math.random()*(m-n+1)+n);
	return random;
	
}


//页面所有元素加载完毕后执行drawRouletteWheel()方法对转盘进行渲染
window.onload=function(){
	drawRouletteWheel();
};

function drawRouletteWheel() {    
  var canvas = document.getElementById("wheelcanvas");    
  if (canvas.getContext) {
	  //根据奖品个数计算圆周角度
	  
	  var arc = Math.PI / (turnplate.restaraunts.length/2);
	  var ctx = canvas.getContext("2d");
	  	ctx.clearRect(0,0,258,258);
	    img = new Image();  
              
        img.src = "images/turn_pan_goods.png";  
        img.onload = function() {  
        	
          ctx.drawImage(img, -100, -100);  
        }  
	  
	 
		  
		 
		  ctx.restore();
		  //----绘制奖品结束----
	  }     
  } 
  

    // 对浏览器的UserAgent进行正则匹配，不含有微信独有标识的则为其他浏览器
    /*var useragent = navigator.userAgent;
    if (useragent.match(/MicroMessenger/i) != 'MicroMessenger') {
        // 这里警告框会阻塞当前页面继续加载
        alert('已禁止本次访问：您必须使用微信内置浏览器访问本页面！');
        // 以下代码是用javascript强行关闭当前页面
        var opened = window.open('about:blank', '_self');
        opened.opener = null;
        opened.close();
    }*/



function showDialog(id) {
    document.getElementById(id).style.display = "-webkit-box";
}

function showID(id) {    
    document.getElementById(id).style.display = "block";  
}
function hideID(id) {
    document.getElementById(id).style.display = "none";
}
})
