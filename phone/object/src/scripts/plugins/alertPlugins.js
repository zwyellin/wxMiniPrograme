;(function($,window,document,undefined){
	var learn=function(ele,options){
		this.$element=ele;
		var settings={
			displayStates:"block",//抽奖完成显示隐藏弹框
			btnmsg:"去完善",
			txt:'幸运大奖'
			/*displayStatesno:"none"*/
		}
		this.options=$.extend(settings,options||{});
		/*this.$element.style.height=$(document).height();*/
		var hei=$(document).height();
		$(this.$element).find('.text_goods').html(this.options.txt);
		$(this.$element).css({
			'height':hei
		})
		/*var _this='';
			_this+="<div class='lottery_img'>"
			_this+="<span class='cancel_msg'>"+this.options.close+"</span>"	
			_this+="<p class='text_goods'>"+this.options.goods+"</p>"
			_this+="<div class='text_compete'>"+this.options.titleCompelte+"</div>"
			_this+="<a class='compete_btn'>"+this.options.btnmsg+"</a>"
			_this+="</div>"
		this.$element.append(_this);	*/
	}
	learn.prototype={
		showColor:function(options){
			return this.$element.css({
				'display':this.options.displayStates,
				/*'font-size':this.options.fontSize,
				'text-decoration':this.options.textDecoration*/
			})
		}
	}
	
	$.fn.myAlert=function(options){
		var showLearn=new learn(this,options);
		return showLearn.showColor();
	}
})(jQuery,window,document);