$(function(){
	var usersid=userid||'';
	var flag=false;
	/*
	 * @param company 公司取值
	 * @param name 代理商姓名
	 * @param tell 电话
	 * @Parma provice 省份
	 * @Parma money 金额
	 * arr 数据传递
	 * */
	//验证
	var fail=function(classes,txt){
	  	classes.css('display','block').html(txt);
	  	setTimeout(function(){
	  		classes.css('display','none');
	  	},2000)
	}
	$(".btn1").on("click",function(){
		//var _tell=/^0\d{2,3}-?\d{1,8}-?\d{1,8}$/;//固定电话
		var $tell=/^[0-9]*$/;//验证电话
		var company=$('#company').val();
		var name=$('#name').val();
		var tell=$('#tell').val();
		var provice=$('#sel_Province').children('option:selected').text();
		var money=$('#money').children('option:selected').text();
		if(company.trim().length==0){//公司名字不能为空
			fail($(".company_alert"),'公司名称不能为空');
			flag=false;
			return false;
		}else{
			flag=true;
		}
		if(name.trim().length==0){//代理商姓名不能为空
			fail($(".name_alert"),'代理商姓名不能为空');
			flag=false;
			return false;
		}else{
			flag=true;	
		}
		if(!$tell.test(tell)||tell==''){//电话不能为空
			fail($('.tell_alert'),'电话未填写或填写有误');
			flag=false;
			return false;
		}else{
			flag=true;	
		}
		if(provice=="*意向省份"){//省份
			fail($('.provice_alert'),'请选择省份');
			flag=false;
			return false;
		}else{
			flag=true;	
		}
		if(money=="*请选择资金范围"){//省份
			fail($('.money_alert'),'请选择资金范围');
			flag=false;
			return false;
		}else{
			flag=true;	
		}
		var arr={
			'corporateName':company,
			'name':name,
			'mobile':tell,
			'province':idFun($('#sel_Province')),
			'city':idFun($('#sel_City')),
			'district':idFun($('#sel_County')),
			'provinceName':idFunname($('#sel_Province')),
			'cityName':idFunname($('#sel_City')),
			'districtName':idFunname($('#sel_County')),
			'capitalScope':money,
			'userId':usersid,
		}
		
		if(flag==true){
			var url="merchant/h5callback/createAgentJoin?";
			ajaxpost('get',url,arr,successcallback,errorcallback);
			function successcallback(data){
				//console.log(data)
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
	var idFun=function(_this){//得到id
		var ids='';
		_this.children('option:selected').val(function(){
			 ids=this.id||'';
		})
		return ids;
	}
	var idFunname=function(_this){
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
			//console.log(data)
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
	
		function showMsg(obj){//市区
			var url="merchant/h5callback/findRegionDataByParentId?parentId="+obj+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(data){
				//console.log(data)
				//生成市
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
		}
	
		var showdis=function(objdis){//区县
			$('#sel_County').empty();
			
			var url="merchant/h5callback/findRegionDataByParentId?parentId="+objdis+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(data){
				//console.log(data)
				//生成市
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

})
