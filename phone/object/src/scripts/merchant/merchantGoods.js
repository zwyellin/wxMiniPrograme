$(function(){
	var $id=goodsid;
	var Merchant=function(opts){
		var me=this;
		this.config={
			'id':$id
		}
		this.init(opts)
	}
	Merchant.prototype={
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			this.bind(defaults);
			console.log(defaults)
		},
		bind:function(opts){
			var me=this;
			me.flag=0;
			window.addEventListener('message', function(event) {
			    // 接收位置信息	 
			    var loc = event.data;  			
			    if(loc==undefined&&me.flag==2){
		     		//alert("您拒绝了使用位置共享服务，查询已取消")
					me.DialogAlert("text",opts)
	     		}             
				$.ajax({
		     		type:"get",
		     		url:"http://api.map.baidu.com/geoconv/v1/?coords="+loc.lng+","+loc.lat+"&from=3&to=5&ak=EdManNVpWNPTAw3UDl508oVq",
		     		async:true,
		     		contentType: 'application/json',
					dataType : "jsonp", 
		     		success:function(data){
		     			me.flag++;
		     			console.log(data)
		   				opts.latitude=data.result[0].y;
				        opts.longitude=data.result[0].x;	
						if(me.flag==2){					   
				        	me.merchantDetail(opts)
		       			 }	   
		     		}
		     	});	
		        
			}, false); 
			var url="merchant/h5callback/findMerchantGoodsInfo?goodsId="+opts.id+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				console.log(res)
				me.render(res,opts)
			};
			function errorcallback(res){
				
			};
		},
		render:function(res,opts){
			var me=this;			
			//图片
			var photos=res.imgs||null;
			var str='';
			if(photos!=null){
				photos=photos.split(';');
				for(var i=0;i<photos.length;i++){
					if(photos[i]!=''){
						str+='<div class="aui-slide-node bg-dark"><img src='+photos[i]+' /></div>'
					}
				}
			}else if(photos==null){
				str+='<div class="aui-slide-node bg-dark"><img src="../../images/horsegjbase.png" /></div>'
				//$('#aui-slide3').css('display','none');
			}
			$('.aui-slide-wrap').append(str);
			//参数：图片对象，图片宽度，图片高度
			var w=$('#aui-slide3').width();
			$('#aui-slide3 .aui-slide-wrap img').load(function(){
				var dH=$('#aui-slide3').height();
//				var imgH=$('#aui-slide3 .aui-slide-wrap img').height();
//				if(imgH<dH){
//					$('#aui-slide3 .aui-slide-wrap img').css('height',"100%");
//				}else{
					chgdivimgwh(this,w,dH,flag=false)
//				}
			
			})
			var slide3 = new auiSlide({
		        container:document.getElementById("aui-slide3"),
		        "height":290,
		        "speed":500,
		        "autoPlay": 3000, //自动播放
	//	        "loop":true,
		        "pageShow":true,
		        "pageStyle":'dot',
		        'dotPosition':'center'
		    })
			
			//商品名字
			var name=res.name||'';
			$('.goodstitle').html(name);
			//月售
			var monthSale=res.monthSaled;
			$('.salemonth span:nth-child(1) i').html(monthSale);
			
			//好评率
			var score=res.commentScore;
			score=(score*1)/5*100;
			score=score.toFixed();
			$('.salemonth span:nth-child(2) i').html(score+"%");
			
			//价格
			var price=res.goodsSpecList[0].price;
			$('.goodsprice span i').html(price);
			opts.merchantId=res.merchantId;
			//
			//me.merchantDetail(opts)
			me.jumpTodetail(opts);
		},
		merchantDetail:function(opts){
			var me=this;
			//&longitude="+opts.longitude+"&latitude="+opts.latitude+"
			//longitude=116.333619&latitude=39.972881
			var url="merchant/h5callback/findMerchant?merchantId="+opts.merchantId+"&longitude="+opts.longitude+"&latitude="+opts.latitude+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				console.log(res)
				me.merchants(res,opts)
			};
			function errorcallback(res){
				
			};
		},
		merchants:function(res,opts){
			var me=this;
			var result=res.merchant;
			//logo
			var logo=result.logo||null;
			var imgstr='';
			var detailstr='';
			if(logo!=null){
				imgstr+='<img src='+logo+' class="logo"/>';
			}else{
				imgstr+='<img src="../../images/horsegjbase.png" class="logo" />';
			}
			$('.merchant').prepend(imgstr);
			//name
			var name=result.name||'';
		//	$('.merchanttitle').html(name)	
			detailstr+='<p class="merchanttitle">'+name+'</p>';
			var score=result.merchantScore;
			
			if(score==0){
				detailstr+='<div class="score">"暂无评分"</div>';
			}else{
				detailstr+='<div class="score">';
				var evalWidth=2.9/5*score+'rem';
				detailstr+='<span style="width:'+evalWidth+'"></span>';
				detailstr+='</div>';
			}
			detailstr+='<p class="money">';
			var minPrice=result.minPrice;
			detailstr+='<span>起送价<i>￥'+minPrice+'</i></span>';
			detailstr+='<span class="fen"></span>';
			var shipfee=result.shipFee;
			detailstr+='<span>配送费<i>￥'+shipfee+'</i></span>';
			detailstr+='<span class="fen"></span>';
			var time=result.avgDeliveryTime;
			detailstr+='<span>'+time+'分钟</span>';
			detailstr+='</p>';
			//评分
			$('.merchant_detail').append(detailstr);
			
			//活动
			
			var promotionactivitylist=result.promotionActivityList||'';
			console.log(promotionactivitylist)
			var activityList='';
			for(var activitynum=0;activitynum<promotionactivitylist.length;activitynum++){
				activityList+='<p class="active_jian">';
				activityList+='<span class="" style="background:url('+promotionactivitylist[activitynum].promoImg+') no-repeat;background-size:100% 100%;"></span>';
				activityList+='<i>'+promotionactivitylist[activitynum].promoName+'</i>';
				activityList+='</p>';
			}
			$('.merchantactive').append(activityList);
			
		},
		jumpTodetail:function(opts){
			var me=this;
			$('.bottom').click(function(){
				if(navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){//ios
					_href='../../downapp.html?jumpType=3&id='+opts.merchantId+'&goodsId='+opts.id+'';
				}else if(navigator.userAgent.match(/android/i)){//android
					_href='horsegj://merchant/'+opts.merchantId+'';
				}
				$('#cover').JumpTo({
					'_href':_href,
					'hrefHtml':'../../downapp.html'
				})
			});
	
		},
		
		DialogAlert:function(type,opts){
			var me=this;
			var dialog = new auiDialog({})
		        switch (type) {
		            case "text":
		                dialog.alert({
		                    title:"弹出提示",
		                    msg:'您已关闭了位置共享服务，查询已取消',
		                    buttons:['确定']
		                },function(ret){
		                    console.log(ret)
		                    if(ret.buttonIndex==1){
		                 		positionError('您已关闭了位置共享服务，查询已取消')
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
	
	
	
	
	
	
	window.Merchant=new Merchant();
	
	//跳转App
//	$('.bottom').click(function(){
//		if(navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){//ios
//			_href='../../downapp.html?jumpType=3&id='+$id+'';
//		}else if(navigator.userAgent.match(/android/i)){//android
//			_href='horsegj://merchant/'+$id+'';
//		}
//		$('#cover').JumpTo({
//			'_href':_href,
//			'hrefHtml':'../../downapp.html'
//		})
//	});
	
	$('.jump_right span:nth-child(1)').click(function(){
		window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.horsegj.company";
//		if(navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){//ios
//			_href='../../downapp.html?jumpType=3&id='+$id+'';
//		}else if(navigator.userAgent.match(/android/i)){//android
//			_href='horsegj://merchant/'+$id+'';
//		}
//		$('#cover').JumpTo({
//			'_href':_href,
//			'hrefHtml':'../../downapp.html'
//		})
	});
	
	//点击顶部消失
	$('.jump_right span:nth-child(2)').click(function(){
		$('.header').css('display','none');
	})
})
