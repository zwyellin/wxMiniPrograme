//单位切割
/*
 *@params content 内容  
 * */
var splitdanwei=function(content){
		var reg=/[\u4e00-\u9fa5]/;//中文字符正则
		var flag=content.match(reg);
		var t=content.split(flag);
		var arr=[t[0],flag+t[1]];
		return arr;
	}
//时间戳转时间
/*
 *@parmas timeobj 时间戳
 * */
var getDate=function(timeobj){
		var odate=new Date(timeobj);
		var year=odate.getFullYear();
		var months=odate.getMonth()+1;
		var days=odate.getDate();
		if(months<10){
			months="0"+months;
		}
		if(days<10){
			days="0"+days;
		}
		otime=year+"-"+months+"-"+days;
		return otime;
	}
//ajax请求
/*
 * @params type：GET POST
 * @params URL 
 * @params data 参数
 * @params successfn 成功返回函数
 * @params errorfn  失败返回函数
 * */
var ajaxpost=function(type,url, data, successfn, errorfn) {
	data = (data==null || data=="" || typeof(data)=="undefined")? {"date": new Date().getTime()} : data;
	$.ajax({
		type: type,
		data: data,
		url: 'http://123.56.15.86/'+url,
		dataType: "jsonp",
		success: function(d){
		successfn(d);
		},
		error: function(e){
		errorfn(e);
		}
	});
};

/*
 *获取url字段
 * @params string
 * */
var getURL = function(name){
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg); 
	if (r != null) return decodeURI(r[2]); return null; 
}

//复杂数组排序
function sortByKey(array,key){
	return array.sort(function(){
		var x=a[key];var y=b[key];
		return ((x<y) ? -1 : ((x>y) ? 1:0));
	})
}
//单一数组排序
function sortNumber(a,b){
	return a-b
}
//图片剪切
////用法： var w=$(window).width();
//			$('.repair_photos .swiper-slide img').load(function(){
//				chgdivimgwh(this,w,$('.repair_swiper').height(),flag=false)
//			})
function chgdivimgwh(obj,width,height,flag){
 	var image=new Image();
	image.src=obj.src; //获取图像路径
	var width1=image.width; //获取图像宽度
	var height1=image.height; //获取图像高度
	var a1=height1/width1;
	var a2=height/width;
	if(a1>a2){
	    obj.width=width;
	    obj.height=height1*width/width1;
	    if(flag==true){
	   		obj.style.marginTop='-' + Math.round(((obj.height-height)/2)/75)+ 'rem';
	    }else{
			obj.style.marginTop='-' + Math.round((obj.height-height)/2)+ 'px';			
		}
	   
	}else{
	    obj.height=height;
	    obj.width=width1*height/height1;
	    if(flag==true){
	   	    obj.style.marginLeft='-' + Math.round(((obj.width-width)/2)/75)+ 'rem';
	    }else{
	    	obj.style.marginTop='-' + Math.round((obj.height-height)/2)+ 'px';
	    }
	  
	}

}

//点击图片放大
;(function($,window,document,undefined){
	var zoomImg=function(ele,options){
		var me=this;
		this.$element=ele;
		var defaults={
			displayStates:'none',
			ImgNum:6,
			Width:'92%',//container的宽度
			Height:'100%',//container的高度
			Margin:'0 auto',
			slidewidth:'100%',//slide的宽度
			slideheight:'auto',//slide的高度
			ClassName:".job_swiper",
			pages:2,
			contain:'.container',
			imgSrc:''
		}
		this.options=$.extend(defaults,options||{});
		me.showImgZoom(this.$element,this.options)
	}
	zoomImg.prototype={
		showImgZoom:function(el,options){
			var me=this;
			$(el).css({
				'position':'fixed',
				'left':'0',
				'top':'0',
				'right':'0',
				'bottom':'0',
				'background':'rgba(0,0,0,1)',
				'z-index':'999999',
				'display':options.displayStates	
			})
			var list='';
			list+='<div class="contain">'
			list+='<div id="aui-slide4">'
			list+=' <div class="aui-slide-wrap" >'
			for(var i=0;i<options.ImgNum;i++){
				list+=' <div class="aui-slide-node bg-dark" style="background:rgba(0,0,0,0.8)">'
				var imgsrc= $("#aui-slide3").find('.aui-slide-wrap').children().eq(i).find('img').attr('src');
				list+=' <img src='+options.imgSrc[i]+' class="imgstyle">'
				list+=' </div>'
			}
			list+='</div>'
			list+='<div class="aui-slide-page-wrap"><!--分页容器--></div>'
			list+='</div>'
			list+='</div>'	
			$(el).empty();
			$(el).append(list);
			$.each($('#aui-slide4 .aui-slide-wrap img'), function(index,value) {
				var winH=$(window).height()/2;
				var imgH=$('#aui-slide4 .aui-slide-wrap img').eq(index).height()/2;			
				if(imgH>winH){
					var m=winH-imgH;
					m=m+'px';
					$('#aui-slide4 .aui-slide-wrap img').eq(index).css({	
						'margin':''+m+' auto 0rem'
					})
				}else if(imgH<winH){
					var m=winH-imgH;
					m=m+'px';
					$('#aui-slide4 .aui-slide-wrap img').eq(index).css({	
						'margin':''+m+' auto 0rem'
					})
				}
			});
			var s=$(window).height();
			var slide4 = new auiSlide({
		        container:document.getElementById("aui-slide4"),
		        // "width":300,
		       "height":s,
		        "speed":500,
		       // "autoPlay": 3000, //自动播放	
		        "loop":false,
		        "pageShow":true,
		        "pageStyle":'dot',
		        'dotPosition':'center'
		   })
//			slide4.slideTo(options.pages,0.5,true);	
			console.log(options)
			$(el).click(function(){
				$(el).css('display','none')
			})
				
		}
	}
	
	$.fn.ImgZoom=function(options){
		var showLearn=new zoomImg(this,options);
		
	}
	
})(jQuery,window,document);

//不允许定位提示页面
function positionError(content){
	var str="";
	str+='<div class="positionAlert" style="width: 100%;height: 100%;position: fixed;top: 0px;bottom: 0px;left: 0px;right: 0px;background: #FFFFFF;">';
	str+='<div class="icon_refresh" style=" position: relative;top: 30%;text-align: center;padding: 0rem 0.75rem;">';
	str+='<i class="iconfont" style=" display: block;font-size: 2rem;color: #999999;">&#xe646;</i>';
	str+='<span style="font-size:0.55rem;color: #666666;">'+content+'</span>';
	str+='</div>';
	str+='<div class="down" style=" position: relative;top:30%;padding: 0rem 0.75rem;font-size: 0.55rem;color: #999999;text-align: center;margin-top: 1rem;line-height: 1rem;">';
	str+='您可以点击<a href="http://a.app.qq.com/o/simple.jsp?pkgname=com.horsegj.company">&nbsp;此处&nbsp;</a>下载马管家APP查看更多详情，或者点击<a href="">&nbsp;&nbsp;刷新&nbsp;&nbsp;</a>重新查看！';
	str+='</div>';
	str+='</div>';
	$('body').append(str)
}

//跳转app广告
function jumpToDownload(src){
	var str='';
	str+='<div class="header" style=" padding:0.55rem;display: flex;display: -webkit-flex;align-items: center;-webkit-align-items: center;width: 100%;height: 3rem;position: fixed; top: 0rem;background: rgba(33,33,33,0.5);">';
	str+='<img src='+src+' style="width:2.3rem;height: 2.3rem;border-radius:0.2rem;margin-right: 0.4rem;" />';
	str+='<div class="jump" style=" height: 3rem;flex: 1;display: flex;display: -webkit-flex;align-items: center;-webkit-align-items: center;justify-content: space-between;-webkit-justify-content: space-between;">';
	str+='<div class="jump_left" style=" font-family: "黑体";">';
	str+='<p style="font-size: 0.6rem;color: #FFFFFF; margin-bottom: 0.3rem;font-size: 0.6rem;color: #FFFFFF;">使用马管家APP</p>';
	str+='<p style="font-size: 0.6rem;color: #FFFFFF;">查看更多详情</p>';
	str+='</div>';
	str+='<div class="jump_right">';
	str+='<span style=" font-size: 0.75rem;color: #333333;padding: 0.2rem 0.3rem;border-radius: 0.2rem;background: #FB965D;">下载APP</span>';
	str+='<span style=" position: relative;top: -0.8rem;margin-left:0.2rem;align-self: flex-start;font-size: 0.55rem;color: #333333;line-height: 0.6rem;padding: 0.05rem 0.25rem;border-radius: 50%;margin-top: -1rem;background: rgba(255,255,255,0.2);">X</span>';
	str+='</div>';
	str+='</div>';
	str+='</div>';
	$('body').append(str)
	$(document).on('click','.jump_right span:nth-child(1)',function(){
		window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.horsegj.company";
	})
}

