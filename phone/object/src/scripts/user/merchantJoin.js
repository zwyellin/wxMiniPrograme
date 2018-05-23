$(function(){
	var usersid=userid||'';
	var datas={};//数据整合
	var flag=false;//定义变量
	  //验证
	  var regtest=function(classes,txt){
	  	classes.css('display','block').html(txt);
	  	setTimeout(function(){
	  		classes.css('display','none');
	  	},2000)
	  }
	   ////^0\d{2,3}-?\d{1,8}-?\d{1,8}$/
			//电话正则 ：/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/  
			//手机正则：/^1[0-9]{10}$/
	$('.btn1').click(function(){
		//var _tell=/^0\d{2,3}-?\d{1,8}-?\d{1,8}$/;//固定电话
		var $tell=/^[0-9]*$/;
		var name=$('#merchantCompany').val().trim().length;//商家名称
		var company=$('#name').val().trim().length;//店铺名称
		var tell=$("#tell").val();//电话
		var provice_reg=$("#sel_Province").children('option:selected').text();
		var money_reg=$('#s_money').children('option:selected').text();
		if(name==0){
			regtest($('.name_alert'),'商家类型不能为空');
			flag=false;
			return ;
		}else{
			flag=true;
		}
		if(company==''||company==0){
			regtest($('.one_alert'),'商家名称不能为空');
			flag=false;
			return ;
		}else{
			flag=true;
		}
		if(!$tell.test(tell)||tell==""){
			regtest($('.tell_alert'),'电话未填写或填写有误');
			flag=false;
			return ;
		}else{
			flag=true;
		}
		if(provice_reg=="*意向省份"){
			regtest($('.provice_alert'),'请选择省份');
			flag=false;
			return ;
		}else{
			flag=true;
		}
		if(money_reg=="*请选择资金范围"){
			regtest($('.money_alert'),'请选择资金范围');
			flag=false
			return ;
		}else{
			flag=true;
		}
		var datastring={
			'merchantsName':$('#merchantCompany').val(),//商家名字
			'storeNname':$('#name').val(),//商店名字
			'mobile':$('#tell').val(),//电话
			'province':idvals($('#sel_Province')),//省份id
			'city':idvals($('#sel_City')),
			'district':idvals($('#sel_County')),
			'provinceName':idname($('#sel_Province')),
			'cityName':idname($('#sel_City')),
			'districtName':idname($('#sel_County')),
			'capitalScope':$('#s_money option:selected').text(),
			'userId':usersid,
//			'callback':'callback'
		}
		/*datastring=JSON.stringify(datastring);*/
		if(flag==true){
			var url="merchant/h5callback/createMerchantsSettled?";
			ajaxpost('get',url,datastring,successcallback,errorcallback);
			function successcallback(res){
				$('.cover').fadeIn(300).find('div').html('提交成功');
//					$('.success_alert').html('提交成功').fadeIn(300);
				setTimeout(function(){
					$('.cover').fadeOut();
					window.location.href=window.location.href+"?&"+new Date().getTime()+"";
				},1000)
			};
			function errorcallback(res){
				$('.cover').fadeIn(300).find('div').html('信息错误');
				setTimeout(function(){
					$('.cover').fadeOut(300);	
				},1000)
			};

	}
	})
	//得到id
	var idvals=function(_this){
		var ids='';
		_this.children('option:selected').val(function(){
			 ids=this.id||'';
		})
		return ids;
	}
	//得到名字
	var idname=function(_this){
		if(_this.children('option:selected').text()=='意向区县'){
			return null;
		}else{
			return _this.children('option:selected').text();
		}
		
	}
	//初始化省份
		var url="merchant/h5callback/findRegionDataByLevel?level=1";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			var str='';
			for(var i=0;i<data.length;i++){
				str+='<option id='+data[i].id+'>'+data[i].name+'</option>'
			}
			$('#sel_Province').append(str);	
		};
		function errorcallback(res){
			alert("请求出错(请检查相关网络状况.)");
		};


		$('#sel_Province').change(function(){//省份改变触发事件
			$(this).children('option:selected').val(function(){
				$("#sel_City").find("option").remove(); 
				showMsg(this.id)
			})
		})
	 function showMsg(obj){//显示市区
	 	
	 	var url="merchant/h5callback/findRegionDataByParentId?parentId="+obj+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			var str='';
			for(var i=0;i<data.length;i++){
				str+='<option id='+data[i].id+'>'+data[i].name+'</option>'
			}
			$('#sel_City').append(str);	
			if(data.length<=1){
				$("#sel_City").children('option:selected').val(function(){
					showdis(this.id)
				})
			}else{
				$('#sel_City').change(function(){
					$(this).children('option:selected').val(function(){
						showdis(this.id)
					})
				})
			}
		};
		function errorcallback(res){
			alert("请求出错(请检查相关网络状况.)");
		};

		var showdis=function(objdis){//区县
			$('#sel_County').empty();
			var url="merchant/h5callback/findRegionDataByParentId?parentId="+objdis+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(data){
				var str='';
				str+='<option>意向区县</option>'
				for(var i=0;i<data.length;i++){
					str+='<option id='+data[i].id+'>'+data[i].name+'</option>'
				}
				$('#sel_County').append(str);	
			};
			function errorcallback(res){
				alert("请求出错(请检查相关网络状况.)");
			};
		}
		
	}	 
})
//var loaclHeight = $("section").height();//获取可视宽度
//$("input,textarea").focus(function() {
//var keyboardHeight = localHeight - $("section").height();//获取键盘的高度
//var keyboardY = localHeight - keyboardHeight;
//var addBottom = (parseInt($(this).position().top) + parseInt($(this).height()));//文本域的底部
//var offset = addBottom - keyboardY;//计算上滑的距离
//$("section").scrollTop(offset);
//});