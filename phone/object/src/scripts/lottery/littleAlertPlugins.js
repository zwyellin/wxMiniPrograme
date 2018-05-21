;(function($,window,document,undefined){
	var learn=function(ele,options){
		this.$element=ele;
		var settings={
			displayStates:"block",//抽奖完成显示隐藏弹框
			//btnmsg:"去完善",
			txt:'网络错误了',
			width:'4rem',
			height:'1rem',
			TextAlign:'center',
			LineHeight:'1rem',
			Margin:'0 auto',
			borderRadius:'0.1rem',
			positionStates:'absolute',
			Left:'0',
			Top:'50%',
			Right:'0',
			Bottom:'0',
			ZIndex:'999',
			Background:'rgba(0,0,0,0.6)',
			Color:'#ffffff',
			FontSize:'0.4rem',
			fontFamily:'arial',
			timeOut:'2000'
		}
		this.options=$.extend(settings,options||{});
		
		$(this.$element).html(this.options.txt);
	}
	learn.prototype={
		showColor:function(options){
			 this.$element.css({
				'display':this.options.displayStates,
				'width':this.options.width,
				'height':this.options.height,
				'text-align':this.options.TextAlign,
				'line-height':this.options.LineHeight,
				'margin':this.options.Margin,
				'border-radius':this.options.borderRadius,
				'position':this.options.positionStates,
				'left':this.options.Left,
				'top':this.options.Top,
				'bottom':this.options.Bottom,
				'right':this.options.Right,
				'z-index':this.options.ZIndex,
				'background':this.options.Background,
				'color':this.options.Color,
				'font-size':this.options.FontSize,
				'font-family':this.options.FontFamily
			})
			$this=this.$element;
			 setTimeout(function(){
			 	$this.css('display','none');
			 },this.options.timeOut)
		}
	}
	
	$.fn.littleAlert=function(options){
		var showLearn=new learn(this,options);
		return showLearn.showColor();
	}
})(jQuery,window,document);