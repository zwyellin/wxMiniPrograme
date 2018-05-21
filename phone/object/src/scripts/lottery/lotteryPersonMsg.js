$(function(){
	var $disk=0;
$(document).ready(function(){
	$('input[name=malechoice]').click(function(){
		$disk=choiceBg();
		
	})
	
	var choiceBg=function(){
		var obj=document.getElementsByName('malechoice');
		for(var i=0;i<obj.length;i++){
			if(obj[i].checked==true){
				
				obj[i].style.background='url(images/radio_true.png) no-repeat';
				obj[i].style.backgroundSize='100% 100%';
				if(i==1){
					obj[0].style.background='url(images/radio_false.png) no-repeat';
					obj[0].style.backgroundSize='100% 100%';
				}else if(i==0){
					obj[1].style.background='url(images/radio_false.png) no-repeat';
					obj[1].style.backgroundSize='100% 100%';
				}
				return obj[i].value;
			}/*else{
				obj[i].style.background='url(images/radio_false.png) no-repeat';
				obj[i].style.backgroundSize='100% 100%';
				
			}*/
			
		}
		
	}
	
	$(".submit_confirm").click(function(){
		alert($disk)
	})
	
})
	
	
})
