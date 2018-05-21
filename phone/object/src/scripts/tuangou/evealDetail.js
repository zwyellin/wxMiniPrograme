$(function(){
	var $id=idVal;
	
	var Detail=function(opts){
		var me=this;
		this.config={
			'id':$id,
			'initialValue':0,
		}
		this.init(opts)
	}
	Detail.prototype={
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			this.bind(defaults);
		},
		bind:function(opts){
			var me=this;
			me.getEvalDetail(opts);
//			me.flag=0;
//			window.addEventListener('message', function(event) {
//			    // 接收位置信息	 
//			    var loc = event.data;  			
//			    if(loc==undefined&&me.flag==2){
//		     		//alert("您拒绝了使用位置共享服务，查询已取消")
//					me.DialogAlert("text",opts)
//	     		}             
//				$.ajax({
//		     		type:"get",
//		     		url:"http://api.map.baidu.com/geoconv/v1/?coords="+loc.lng+","+loc.lat+"&from=3&to=5&ak=EdManNVpWNPTAw3UDl508oVq",
//		     		async:true,
//		     		contentType: 'application/json',
//					dataType : "jsonp", 
//		     		success:function(data){
//		     			me.flag++;
//		     			console.log(data)
//		   				opts.latitude=data.result[0].y;
//				        opts.longitude=data.result[0].x;	
//						if(me.flag==2){					   
//				        	me.getEvalDetail(opts);
//		       			 }	   
//		     		}
//		     	});	
//		        
//			}, false); 
//			setTimeout(function(){
//				if(me.flag==0){
//					me.DialogAlert("text",opts)
//				}
//			},6000)
 		//me.getEvalDetail(opts);	
		},
		getEvalDetail:function(opts){
			var me=this;
			var url="merchant/h5callback/findGroupPurchaseEvaluateById?id="+opts.id+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				console.log(res)
				me.render(res,opts)
			};
			function errorcallback(res){
				
			};
			return me.num;
		},
		render:function(res,opts){
			var me=this;
			opts.merchantId=res.merchantId;
			//头像
			var str='';
			if(res.appUser.headerImg==''){
				str+='<img src="../images/group/morenphoto.png" alt="" class="eveal_personphoto"/>';
			}else{
				str+='<img src='+res.appUser.headerImg+' alt="" class="eveal_personphoto"/>';
			}
			$('.eveal_contain').prepend(str);
			//姓名
			$('.eveal_name_time p:nth-child(1)').html(res.appUser.name);
			//时间
			$('.eveal_name_time p:nth-child(2)').html(getDate(res.createTime));
			//评分
			var score=res.totalScore||'';
			if(score==0){
				var Width=2.95/5*score+'rem';
				$('.eveal_score span').css('width',Width)
			}else{
				var Width=2.95/5*score+'rem';
				$('.eveal_score span').css('width',Width)
			}
			//平均消费
			var consum=res.perCapitaConsumptionAmt;
			if(consum)
			$(".eveal_score_person p").html("￥"+consum+"/人");
			//评价内容
			var content=res.content||'';			
			$('.eveal_content').html(content);
			
			//口味
			var strs='';
			var deltxt,sertxt,envtxt;
			var delices,services,enivr;
			delices=res.tasteScore||'';
			services=res.serviceScore||'';
			envie=res.environmentScore||'';
			var s=me.boolenreturn(delices)
			strs+='<span>口味&nbsp;:&nbsp;&nbsp;<i>'+me.boolenreturn(delices)+'</i></span>';
			strs+='<span>环境&nbsp;:&nbsp;&nbsp;<i>'+me.boolenreturn(envie)+'</i></span>';
			strs+='<span>服务&nbsp;:&nbsp;&nbsp;<i>'+me.boolenreturn(services)+'</i></span>';
			$('.environment').append(strs);
			
			//图片
			var imgstr='';
			if(!res.images){
				$('.eveal_photos').css('display','none');
			}else{
				var img=res.images.split(";");
				for(var imgls=0;imgls<img.length;imgls++){
					if(img[imgls]!=''){
						imgstr+='<img src='+img[imgls]+' alt="" class="aui-col-xs-4" />';
					}
				}
				$('.eveal_photos').append(imgstr);
			}
			me.clickImgZoom(opts);
//			me.getMerchant(opts);
		},
		clickImgZoom:function(opts){
			var me=this;
			var arr=[];			
			$(document).on('click','.eveal_photos img',function(){
				arr=[];
				for(var num=0;num<$('.eveal_photos img').length;num++){
					if($('.eveal_photos img').eq(num).attr('src')==$(this).attr('src')){
						index=num;
						arr.unshift($('.eveal_photos img').eq(num).attr('src'))
					}else{
						arr.push($('.eveal_photos img').eq(num).attr('src'))
					}	
				}
				var imglength=$('.eveal_photos img').length;
				$('#imgzoom').ImgZoom({
					'displayStates':'block',
					'ImgNum':imglength,
					'imgSrc':arr
				})
			})
		},
		getMerchant:function(opts){//得到商家信息
			//console.log(opts)
			var me=this;
			var url="merchant/h5callback/findGroupPurchaseMerchantInfo?groupPurchaseMerchantId="+opts.merchantId+"&longitude="+opts.longitude+"&latitude="+opts.latitude+"&sortType=1";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				me.marketRender(res,opts)
//					me.rolling=false;
			};
			function errorcallback(res){
				//me.rolling=false;
			};
		},
		marketRender:function(res,opts){
			var me=this;
			console.log(res)
			//商家图片
			var merchantstr="";
			if(res==""){
				$('.procook').css('display','none');
			}else{
				var images=res.imgs||'';
				if(images!=''){
				   images=images.split(';');
					merchantstr+='<img src='+images[0]+' alt="" />';
				}else{
					merchantstr+='<img src="../images/group/morenlogo.png" alt="" />';
				}
				merchantstr+='<div class="procook_pro">';
				merchantstr+='<div class="procook_title aui-padded-t-15">'+res.name+'</div>';
				merchantstr+='<div class="procook_address">';
				merchantstr+='<p><span></span><span>'+res.merchantTag+'</span><span>￥'+res.avgPersonPrice+'/人</span></p>';			
				if(res.distance>=1000){
					var distance=res.distance/1000;
					merchantstr+='<p>&lt;'+distance+'km</p>';
				}else{
					var distance=res.distance;
					merchantstr+='<p>&lt;'+distance+'m</p>';
				}
				merchantstr+='</div>';
				merchantstr+='</div>';
				$('.procook').append(merchantstr);
			}
			me.jumpToMerchant(opts);
		},
		jumpToMerchant:function(opts){
			var me=this;
			$('.procook').click(function(){
				window.location.href='marketDetail.html?groupPurchaseMerchantId='+opts.merchantId+'';
			})
		},
		boolenreturn:function(data,opts){
			var result;
			switch(data){
				case 1:
				   result="差";
				break;
				case 2:
				   result='一般';
				break;
				case 3:
				   result='好';
				break;
				case 4:
				   result='很好';
				break;
				case 5:
				   result='极好';
				break;
			}
			return result;
			
		},
		DialogAlert:function(type,opts){
			var me=this;
			var dialog = new auiDialog({})
	        switch (type) {
	            case "text":
	                dialog.alert({
	                    title:"弹出提示",
	                    msg:'您拒绝了使用位置共享服务，查询已取消',
	                    buttons:['确定']
	                },function(ret){
	                    console.log(ret)
	                    if(ret.buttonIndex==1){	
	                 		positionError('您拒绝了使用位置共享服务，查询已取消')
	                    }
	                })
	                break;
	            case "callback":
	                dialog.alert({
	                        title:"弹出提示",
	                        msg:'您拒绝了使用位置共享服务，查询已取消',
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
	}
	window.Detail=new Detail();

})
