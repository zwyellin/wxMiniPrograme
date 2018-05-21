$(function(){
	var $id = idVal;
	var $uid = uid;
	var countDown = 120;
	var Register = function(opts){
		var me=this;
		this.config={
			id:$id,
			uid:$uid ? $uid : getURL("uid"),
			count:countDown,
		},
		this.init(opts);
		
	}
	Register.prototype = {
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			this.bind(defaults);
		},
		bind:function(opts){
			var me =this;
			me.codeBtn = $('#btn');
			me.tellValue = $('#tell').val();
			//图片校正
			var picW=$('.banner').width();
			var picH=$('.banner').height();
			$('.banner img').load(function(){
				chgdivimgwh(this,picW,picH,flag=false)
			})
			
			//验证是否可以开启验证码
			Number($("#tell").val().length) == 11 ? $("#btn").removeAttr('disabled') : $("#btn").attr('disabled',true);
			$('#tell').bind('input propertychange', function() {
				if(Number($("#tell").val().length) == 11){
					$("#btn").removeAttr('disabled')
				}else{
					$("#btn").attr('disabled',true)
				}
			});
			me.codeBtn.click(function(){
				$("#btn").attr('disabled',true)
				var reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/g;
				var regR = reg.test($("#tell").val());
				if(!regR){
					me.toastAlert("fail","手机号格式错误",opts)
				}else{
					//me.toastAlert("loading","",opts)
					me.getCode($("#tell").val(),opts);
				}	
			})
			//注册点击
			$(document).on('click','#reg_btn',function(){
				$("#reg_btn").attr("disabled",true);
				var reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/g;
				var regR = reg.test($("#tell").val());
				if(regR && Number($("#code").val().length) >0){
					var url="merchant/h5callback/checkH5LoginCode?mobile="+$("#tell").val()+"&code="+$("#code").val()+"&inviterAppUserId="+opts.uid;
					var ajaxdata='';
					ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
					function successcallback(res){
						//console.log(res)
						me.sendRegister(res,opts)
					};
					function errorcallback(res){
						
					};
				}else{
					if(!regR) {
						$("#reg_btn").removeAttr("disabled");
						me.toastAlert("fail","手机号格式错误",opts)
					}else if(Number($("#code").val().length) <= 0){
						$("#reg_btn").removeAttr("disabled");
						me.toastAlert("fail","请填写验证码",opts)
					}
					
				}
			})
		},
		//点击注册
		sendRegister:function(res,opts){
			var me =this;
			if(res.success){
				$("#reg_btn").removeAttr("disabled");
				window.location.href="registerSuccess.html";
			}else{
				$("#reg_btn").removeAttr("disabled");
				me.toastAlert("fail",res.value,opts)
			}
		},
		getCode:function(tellValue,opts){
			var me=this;
			//me.render(0,opts)
			var url="merchant/h5callback/checkUserMobile?mobile="+tellValue;
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				//console.log(res)
				me.render(res,opts)
			};
			function errorcallback(res){
				
			};
		},
		render:function(res,opts){
			var me =this;
			if(res.success){
				if(res.value != null){
					me.dialogAlert("text",'','您已是注册用户,可直接下载登录马管家邀请好友哦',opts)
				}else{
					var url="merchant/h5callback/sendRegisterSms?mobile="+$("#tell").val();
					var ajaxdata='';
					ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
					function successcallback(res){
						//console.log(res)
						me.sendSms(res,opts)
					};
					function errorcallback(res){
						
					};
				}
			}else{
				me.toastAlert("fail",res.value,opts)
			}
		},
		//发送短信
		sendSms:function(res,opts){
			var me =this;
			if(res.success){
				me.toastAlert("success","验证码发送成功",opts)
				me.countTimer(opts);
			}else{
				me.toastAlert("fail","验证码发送失败",opts)
				$("#btn").removeAttr('disabled');
			}
		},
		countTimer:function(opts){
			var me =this;
			TIMER = setInterval(function(){
				me.SetInter(opts)
			},1000)
			
		},
		SetInter:function(opts){
			var me =this;
			me.btn = $("#btn");
			if (opts.count == 0) {
				clearInterval(TIMER)
		        me.btn.removeAttr("disabled");    
		        me.btn.val("获取验证码"); 
		        opts.count = 120; 
		        //return false;
		   } else { 
		        me.btn.attr("disabled", true); 
		        me.btn.val(" ("+ opts.count + ")s"); 
		        opts.count--; 
		    }
		},
		dialogAlert:function(type,title,msg,opts){
			var me =this;
			var dialog = new auiDialog({})
	        switch (type) {
	            case "text":
	                dialog.alert({
	                    title:title,
	                    msg:msg,
	                    buttons:['去下载','取消']
	                },function(ret){
	                    console.log(ret)
	                    if(ret.buttonIndex == 1){
	                    	window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.horsegj.company"
	                    }
	                })
	                break;
	            case "callback":
	                dialog.alert({
	                        title:title,
	                        msg:'这里是内容',
	                        buttons:['取消','确定']
	                    },function(ret){
	                        if(ret){
	                            dialog.alert({
	                                title:"提示",
	                                msg:"您点击了第"+ret.buttonIndex+"个按钮",
	                                buttons:['确定']
	                            });
	                        }
	                    })
	                break;
	            case "input":
	                dialog.prompt({
	                    title:"弹出提示",
	                    text:'默认内容',
	                    buttons:['取消','确定']
	                },function(ret){
	                    if(ret.buttonIndex == 2){
	                        dialog.alert({
	                            title:"提示",
	                            msg: "您输入的内容是："+ret.text,
	                            buttons:['确定']
	                        });
	                    }
	                })
	                break;
	            default:
	                break;
	
	        }
		},
		toastAlert:function(type,title,opts){
			var me =this;
			apiready = function(){
		        api.parseTapmode();
		    }
		    var toast = new auiToast({
		    })
	        switch (type) {
	            case "success":
	                toast.success({
	                    title:title,
	                    duration:2000
	                });
	                break;
	            case "fail":
	                toast.fail({
	                    title:title,
	                    duration:2000
	                });
	                break;
	            case "custom":
	                toast.custom({
	                    title:title,
	                    html:'<i class="aui-iconfont aui-icon-laud"></i>',
	                    duration:2000
	                });
	                break;
	            case "loading":
	                toast.loading({
	                    title:title,
	                    duration:2000
	                },function(ret){
	                    console.log(ret);
	                    setTimeout(function(){
	                        toast.hide();
	                    }, 2000)
	                });
	                break;
	            default:
	                // statements_def
	                break;
	        }
	   
		},
	}
	
	window.Register = new Register();
})
