$(function(){
	
	var PeaceBox=function(opts){
		var me=this;
		this.config={
			id:'12',
		}
		this.init(opts);
	}
	PeaceBox.prototype={
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			this.bind(defaults);
		},
		bind:function(opts){
			var me=this;
			console.log(opts)
			
			$(document).on('click','#chk',function(e){
				e.preventDefault();
				if($(this).attr('checked')=='checked'){
					$(this).attr('checked',false);
				}else{
					$(this).attr('checked',true);
				}
       			  
			   		if($(this).attr('checked')=='checked'){
			   			$(this).css({
			   				'background':'url(../../images/peaceBox/20170418002peacebox.png) no-repeat',
			   				'background-size':'100% 100%'
			   			})
			   			
			   		}else{
			   			$(this).css({
			   				'background':'url(../../images/peaceBox/20170418001peacebox.png) no-repeat',
			   				'background-size':'100% 100%'
			   			})
			   		}
			} )
		},
	}
	
	
	
	
	
	window.PeaceBox=new PeaceBox();
})
