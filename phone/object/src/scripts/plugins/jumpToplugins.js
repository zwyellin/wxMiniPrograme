;(function($,window,document,undefined){
	var _content;
	var JumpToApp=function(ele,options){
		this.$element=ele;
		var defaults={
			appName:'mgjofficial',
			urlScheme:'horsegj://fleaMarketDetail',
			idVal:'3',
			contain:'.container',
			hrefHtml:'downforEShou.html',
			msgStyle:'6'	
		}
		this.options=$.extend(defaults,options||{});
	}
	JumpToApp.prototype={
		showJumpTo:function(options){
			//判断是否是微信
		    var is_weixin = (function() {
				return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1
			})();
			var winHeight = typeof window.innerHeight != 'undefined' ? window.innerHeight : document.documentElement.clientHeight; //兼容IOS，不需要的可以去掉	
			if (is_weixin || (/QQ/i.test(navigator.userAgent) && !(/MQQBrowser/i.test(navigator.userAgent)))) {
				(function(_this,_contain) {
					$(_contain).css({
						'height': ''+$(window).height()+''
					});
					$(_this).css({'display':'block'});
				})(this.$element,this.options.contain)
				_content=this.options.contain;
				$(this.$element).click(function(){
					$(this).css({'display':'none'});
					$(_content).css({height: '100%'});
				})
				
			}else{//不是微信或者qq
				if(navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){//ios
					//alert(this.options.hrefHtml)
					/*setTimeout(function(){*/			
						window.location.href=""+this.options.hrefHtml+"?id="+this.options.idVal+"&informationType="+this.options.msgStyle+"";
					/*},500)*/
					
				}else if(navigator.userAgent.match(/android/i)){//android
						testApp(""+this.options.urlScheme+"/"+this.options.msgStyle+"/"+this.options.idVal+"");	
				}
				//android 跳转函数
				var _Html=this.options.hrefHtml;
				function testApp(url) {
					var timeout, t = 200,
						hasApp = true;
					setTimeout(function() {
						if (hasApp) {
					   
						} else {
							window.location= ""+_Html+"";
						}
					}, 500);
					var t1 = Date.now();
					var ifr = document.createElement("iframe");
					ifr.setAttribute('src', url);
					ifr.setAttribute('style', 'display:none');
					document.body.appendChild(ifr);
					document.body.removeChild(ifr);
					timeout = setTimeout(function() {
						var t2 = Date.now();
						if (!t1 || t2 - t1 < t+50) {
							hasApp = false;
						}	
					}, t);
				}
		
			}

		}
	}
	
	$.fn.JumpTo=function(options){
		var showLearn=new JumpToApp(this,options);
		return showLearn.showJumpTo();
	}
	
})(jQuery,window,document);
