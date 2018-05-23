$(function(){
	var phone = null;
	// getPhone(valueObject)
	getAgentTel();
	$('.serive-call').click(function(){
		if (!phone) {
			phone= 4009979393;
		}
		window.YLJsBridge.call(
        	'callTel',{
            	phoneNum:phone
        	}
        );
	});
	$('#z-call').click(function(){
		window.YLJsBridge.call(
        	'callTel',{
            	phoneNum:4009979393
        	}
        );
	});
	$('.feedback').click(function(){
		window.YLJsBridge.call(
        	'feedback',{}
        );
	});
	$('#exit-app').click(function(){
		window.YLJsBridge.call(
        	'exitApp'
        );
	});
	function getAgentTel(){
		window.YLJsBridge.call(
        	'getAgentTel',{},function(res){
				phone = res.value;
        	}
        );
	}
});