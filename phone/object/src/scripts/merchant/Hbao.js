$(function() {
	/*URL解析*/
	var $id =pValue; //pValue;
	ajax1($id);
	function ajax1($id){	
		var url="merchant/h5callback/findSimpleMerchant?merchantId=" + $id + "";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
		var oHeader=$("<div class='header'>"+data.name+"</div>");
			var oMoney=$("<div class='money_market'>扫码有惊喜！</div>");
			var oSaoma=$("<div class='saoyisao'><img src="+data.invitationCodeImg+" alt='' /></div>");
			var click=$("<div class='click_timelong'>长按扫码关注马管家，领取商家红包</div>");	
			$(".container").append(oHeader);
			$(".container").append(oMoney);
			$(".container").append(oSaoma);
			$(".container").append(click);
			setTimeout(function(){
				 ajax2($id); 
			},300)
		     
		};
		function errorcallback(res){
			
		};
}	


//活动日期接口
	function ajax2($id){
	    var url="merchant/h5callback/findValidTPromotionRedBagList?merchantId=" + $id + "";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
			var str = '';
			if(data && data.length){
				var t=data[0].promoEndDate;
			    var myDate = new Date(t);
				var year=myDate.getFullYear();
				var month=myDate.getMonth()+1;
				var day=myDate.getDate();  
				var hours=myDate.getHours();
				if(hours<10){
					hours="0"+hours;
				}
				
				var minutes=myDate.getMinutes(); 
				if(minutes<10){
					
					minutes="0"+minutes;
				}
			}
			str += '<div class="file_contain">';
			str += '<fieldset id="active_outhor">';
			str += '<legend>活动规则</legend>';
			str += '<div class="items"><p>1.扫描上面二维码</p><p>2.关注‘马管家’微信公众号</p>';
			str += '<p>3.领取商家红包</p><p>4.下载马管家APP到本店铺点餐时可使用</p>';
			data && data.length ? str += '<p>5.活动截止时间'+year+'年'+month+'月'+day+'日 '+hours+':'+minutes+'</p>':str+='';
			str += '</div>';
			str += '<div class="introd">本活动解释权，归马管家所有</div>';
			str += '</fieldset></div>';
		
			$(".container").append(str);
			
		};
		function errorcallback(res){
			
		};
}


})
