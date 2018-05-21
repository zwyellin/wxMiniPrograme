;(function($,window,document,undefined){
	var JsCall=function(ele,options){
		this.$element=ele;
		$(this.$element).append(''+$(this.$element).attr("href"));
		var defaults={
			Url:"http://120.24.16.64/maguanjia/share.html"
		}
		this.options=$.extend(defaults,options||{});
	}
	JsCall.prototype={
		showColor:function(options){
			if(navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){
				//ios
				/*这段代码是固定的，必须要放到js中*/
		      	function setupWebViewJavascriptBridge(callback) {
			        if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
			        if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
			        window.WVJBCallbacks = [callback];
			        var WVJBIframe = document.createElement('iframe');
			        WVJBIframe.style.display = 'none';
			        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
			        document.documentElement.appendChild(WVJBIframe);
			        setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
		      	}
		      	
		      	/*与OC交互的所有JS方法都要放在此处注册，才能调用通过JS调用OC或者让OC调用这里的JS*/
			    setupWebViewJavascriptBridge(function(bridge) {
				      var uniqueId = 1
				    function log(message, data) {
				        var log = document.getElementById('log')
				        var el = document.createElement('div')
				        el.className = 'logLine'
				        el.innerHTML = uniqueId++ + '. ' + message + ':<br/>' + JSON.stringify(data)
				        if (log.children.length) {
				            log.insertBefore(el, log.children[0])
				        } else {
				           log.appendChild(el)
				        }
				    }
				      /* Initialize your app here */
				      
				      /*我们在这注册一个js调用OC的方法，不带参数，且不用ObjC端反馈结果给JS：打开本demo对应的博文*/
				    /*bridge.registerHandler('openWebviewBridgeArticle', function() {
				        log("openWebviewBridgeArticle was called with by ObjC")
				    })*/
				      /*JS给ObjC提供公开的API，在ObjC端可以手动调用JS的这个API。接收ObjC传过来的参数，且可以回调ObjC*/
				    /*bridge.registerHandler('getUserInfos', function(data, responseCallback) {
				        log("Get user information from ObjC: ", data)
				        responseCallback({'userId': '123456', 'blog': '标哥的技术博客'})
				    })*/
				                                  
				      /*JS给ObjC提供公开的API，ObjC端通过注册，就可以在JS端调用此API时，得到回调。ObjC端可以在处理完成后，反馈给JS，这样写就是在载入页面完成时就先调用*/
				   /* bridge.callHandler('getUserIdFromObjC', function(responseData) {
				        log("JS call ObjC's getUserIdFromObjC function, and js received response:", responseData)
				    })
					*/				 
				    //document.getElementById('blogId').onclick = function (e) {
				       /* log('js call objc: getBlogNameFromObjC')*/
				    bridge.callHandler('JsCallShare', {'blogURL': this.options.Url}, function(response) {
				                          log('JS got response', response)
				                          })
				    //}
			    })
			}else if(navigator.userAgent.match(/android/i)){
				//android
				android.JsCallShare(this.options.Url);  
			}	
		}
	}
	
	$.fn.jsCallNative=function(options){
		var showLearn=new JsCall(this,options);
		return showLearn.showColor();
	}
	
})(jQuery,window,document);
