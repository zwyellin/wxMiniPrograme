$(function(){
	jumpToDownload();
	var CashLoan = function(opts){
		var me = this;
		this.config = {
			'id':1
		};
		this.init(opts);
	}
	CashLoan.prototype = {
		init:function(opts){
			var me = this;
			var defaults = $.extend(me.config,opts);
			me.bind(defaults);
		},
		bind:function(opts){
			var me = this;
			console.log("opts",opts)
		},
		render:function(opts){
			var me = this;
			
		}
	}
	
	
	window.CashLoan = new CashLoan();
})
