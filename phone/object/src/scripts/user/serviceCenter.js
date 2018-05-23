$(function(){
	var phone = null;
	// getPhone(valueObject)
	getSelectLocation();
	$('.serive-call').click(function(){
		if (!sessionStorage.agentPhone) {
			sessionStorage.agentPhone = 4009979393
		}
		window.YLJsBridge.call(
        	'callTel',{
            	phoneNum:sessionStorage.agentPhone
        	}
        )
	})
	$('#z-call').click(function(){
		window.YLJsBridge.call(
        	'callTel',{
            	phoneNum:4009979393
        	}
        )
	})
	function getSelectLocation(){
		window.YLJsBridge.call(
        	'getSelectLocation',{},function(res){
				if (res.code === 0) {
					var valueObject = a.value
					getPhone(valueObject)	
				}
        	}
        )
	}
	function getPhone(valueObject){
		var url="merchant/userClient?m=findAgentByUserXY";
		var ajaxdata = '';
		$.ajax({
			type: 'POST',
			data: {
				params:{
        			longitude:valueObject.longitude,
			        latitude:valueObject.latitude
        		}
			},
			url: 'http://120.24.16.64/'+url,
			dataType: "json",
			success: function(res){
				if (res.data.code === 0) {
					let value = res.data.value;
					if (value) {
						if (value.phone) {
							sessionStorage.agentPhone = value.phone;
						} else {
							sessionStorage.agentPhone = null;
						}
					} else {
						sessionStorage.agentPhone = null;
					}	
				}	
			},
			error: function(e){
				sessionStorage.agentPhone = null;
			}
		});		
	}
})