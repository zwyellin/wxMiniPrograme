$(function(){
	var $id=idVal;
	var Aboutcar=function(opts){
		var me=this;
		this.config={
			id:$id
		},
		this.init(opts);
	}
	Aboutcar.prototype={
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			this.bind(defaults);
		},
		bind:function(opts){
			var me=this;
			me.addressVal='';
			me.setGot(me.addressVal,opts);//查询已报名人数
			me.sendMsg();//发送填写信息
		
		},
		setGot:function(addressval,opts){
			var me=this;
			var url1="merchant/h5callback/findEnrollCarBusinessCount?trip="+addressval+"&"+new Date().getTime()+"";
			var ajaxdata='';
			ajaxpost('get',url1,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				me.num=res;
				me.render(res,opts)
//					me.rolling=false;
			};
			function errorcallback(res){
				//me.rolling=false;
			};
			return me.num;
		},
		render:function(res,opts){
			console.log(res)
			var me=this;
			me.count=$('.page4 span');
			me.count.html(res);	
		},
		sendMsg:function(opts){
			var me=this;
			me.btnmsg=$('.btn');
			me.name=$('#name');
			me.mobile=$("#tell");
			var $tell=/^[0-9]*$/;
			me.btnmsg.click(function(){	
				me.address=$("#address").children('option:selected').text();
				if(me.name.val().trim().length==0){//验证名字
					me.errorcall('姓名不能为空')
					return false;
				}
				if(!$tell.test(me.mobile.val())||me.mobile.val()==""){//验证电话
					me.errorcall('请输入正确的手机号')
					return false;
				}
				if(me.address=="请选择你的行程"){//验证地址
					me.errorcall('请选择你的行程')
					return false;
				}
				var url2="merchant/h5callback/createCarBusiness?name="+me.name.val()+"&mobile="+me.mobile.val()+"&trip="+me.address+"";
				var ajaxdata='';
				ajaxpost('get',url2,ajaxdata,successcallback,errorcallback);
				function successcallback(res){
					console.log(res)
					me.successcall(res,opts,me.address)
	//					me.rolling=false;
				};
				function errorcallback(err){
					//console.log(err)
					me.errorcall('您提交失败了哦,请稍后重新提交吧！',opts)
				};
			})
		},
		successcall:function(res,opts,address){
			var me=this;			
//			if(res){
				var t=me.setGot(me.address);
				swal({
					title: "提交成功",
					text: "<p style='color:#333;margin-bottom:0.2rem;font-size:0.55rem;text-align:left;font-weight:bold;font-family:'黑体'；'>系统抽取,抽取成功后将以短信的形式通知您</p><span style='color:#de364d;text-align:center;font-weight:bold;font-size:0.45rem;'>"+address+"&nbsp;有<span>"+t+"</span>人申请<span>",
 					html: true,
					confirmButtonText: "好  的",
					padding:60,
					confirmButtonColor:"#e01523"
				})
				$('.sweet-alert h2').css({
					'background-color':'#e01523',
    				'color': '#ffffff',
    				'height':'48px',
    				'line-height':'48px',
    				'font-weight':'bold'

				})
				$('.sweet-alert .sa-button-container').css({
					'display':'flex',
					'display':'-webkit-flex',
					'justify-content':'center',
					'-webkit-justify-content':'center'
				})
				$('.sweet-alert button').css({
					//'background-color':'#e01523',
					'border':'1px solid #e01523',
					'width':'100px',
					'padding':'0px',
					'height':'40px',
					'line-height':'40px',
					'box-shadow':'none',
					'font-size':'20px',
				})	
				setTimeout(function(){
					me.name.val('');
					me.mobile.val('');
				},500)
			//}
			
		},
		errorcall:function(errorVal){
			swal({
				title: "提交失败",
				text: errorVal,
				html: true,
				confirmButtonText: "好  的",
				padding:60,
				confirmButtonColor:"#e01523"
			})
			$('.sweet-alert h2').css({
					'background-color':'#e01523',
    				'color': '#ffffff',
    				'height':'48px',
    				'line-height':'48px',
    				'font-weight':'bold'

				})
				$('.sweet-alert .sa-button-container').css({
					'display':'flex',
					'display':'-webkit-flex',
					'justify-content':'center',
					'-webkit-justify-content':'center'
				})
				$('.sweet-alert button').css({
					//'background-color':'#e01523',
					'border':'1px solid #e01523',
					'width':'100px',
					'padding':'0px',
					'height':'40px',
					'line-height':'40px',
					'box-shadow':'none',
					'font-size':'20px',
				})
		}
	}

	window.Aboutcar=new Aboutcar();
    var $scheme='';
    var sjid='';
    var msgStyle='';
	$(document).on('click','.jumptoapp_down',function(){
//		$('#cover').JumpTo({
//			urlScheme:'horsegj://'+$scheme+'',
//			idVal:sjid,
//			hrefHtml:'../downforEShou.html',
//			msgStyle:msgStyle
//		})
		window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.horsegj.company";
	})
	
	$("input.input-lg").focus(function(){
 		$('.jumptoapp').fadeOut(); 
 		$("#addform").css({
 			'position':'absolute'
 		})
 		$('.page9_1').css({
 			'display':'none'
 		})
 		$('.page9_2').css({
 			'display':'none'
 		})
    }).bind('blur',function(){  
        $('.jumptoapp').fadeIn();  
        $("#addform").css({
 			'position':'relative'
 		})
        $('.page9_1').css({
 			'display':'block'
 		})
 		$('.page9_2').css({
 			'display':'block'
 		})
    })
	$('.zhezhao').click(function(){
		$('.zhezhao').css('display','none')
	})

	$(document).on('click','.jumptoapp_close',function(){
		$('.jumptoapp').css('display','none')
	})
	

})
	


