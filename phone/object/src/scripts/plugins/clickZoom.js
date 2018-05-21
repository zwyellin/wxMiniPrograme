;(function($,window,document,undefined){
	var zoomImg=function(ele,options){
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
			contain:'.container'
		}
		this.options=$.extend(defaults,options||{});
	}
	zoomImg.prototype={
		showImgZoom:function(options){
			/*$(this.options.contain).css({//内容消失
				'display':'none'
			})*/
			$(this.options.contain).css({
				height: ''+$(window).height()+''
			});
			$(this.$element).empty();
			$(this.$element).css({
				display: this.options.displayStates
			});
			var imgZoom='';
			imgZoom+="<div class='swiper-container job_coverswiper' style='width:"+this.options.Width+";height:"+this.options.Height+";margin:"+this.options.Margin+"'>"//swiper开始
			imgZoom+="<div class='swiper-wrapper'>"
				for(var i=0;i<this.options.ImgNum;i++){//循环img的长度
					imgZoom+="<div class='swiper-slide' style='width:"+this.options.slidewidth+";height:"+this.options.slideheight+";margin:1rem auto;'>"
				var imgSrc=$(this.options.ClassName).find('.swiper-wrapper').children().eq(i).find('img').attr('src');
					imgZoom+="<img src="+imgSrc+" class='imgstyle'/>"
					imgZoom+="</div>"
				}
				
			imgZoom+="</div>"
			imgZoom+="</div>"
			$(this.$element).append(imgZoom);

				$('img').load(function() {
					var H=$('.job_coverswiper').height()/2;
					var s=$('.imgstyle').height()/2;
					var m=H-s;
					m=m/2/100+"rem";
					$('.imgstyle').css({
						/*'width':'100%',*/
						'height':'',
						'display':'block',
						'margin':''+m+' auto 0rem'
					})

				});
			//$(document).ready(function(){//初始化swiper
				var pages=this.options.pages;
				myswiper = new Swiper('.job_coverswiper', {

			      /*	pagination: '.swiper_span',		       
			       	paginationType: 'fraction',	*/
			      /* 	slidesOffsetAfter : 100,*/
			      	slidesPerView :1,
			    	slidesPerGroup : 1,
			 		spaceBetween :30,	       
			        observer:true,		       
			        observerParents:true,		 
			       onImagesReady:function(myswiper){
			        	myswiper.slideTo(pages,0,true);		    
			       }
		    	
	        	});

				//点击任意位置退出遮盖曾
				var _this=this.options.contain;
				$(this.$element).click(function(_this) {
						/* Act on the event */
					$(this).css({//遮盖曾消失
						'display':'none'
					})
					$('.container').css({
						height: '100%'
					});

				});

			//})
		}
	}
	
	$.fn.ImgZooms=function(options){
		var showLearn=new zoomImg(this,options);
		return showLearn.showImgZoom();
	}
	
})(jQuery,window,document);
