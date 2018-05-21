$(function(){
	var $id=conpunid;
	var Cash=function(opts){
		var me=this;
		this.config={
			'id':$id
		}
		this.init(opts)
	}
	Cash.prototype={
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			this.bind(defaults);
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
		     			//console.log(data)
		   				opts.latitude=data.result[0].y;
				        opts.longitude=data.result[0].x;	
						if(me.flag==2){					   
				        	me.getCoupon(opts);
		       			 }	   
		     		}
		     	});	
		        
			}, false); 
			setTimeout(function(){			
				if(me.flag==0){
					window.removeEventListener('message', function(event) {},false)
					me.getCouponNoLat(opts);
					//me.DialogAlert("text",opts)
				}	
			},5000)
			//me.getCoupon(opts);
			
		},
		getCoupon:function(opts){
		//	console.log(opts.id)
		//longitude=116.333619&latitude=39.972881
		//longitude="+opts.longitude+"&latitude="+opts.latitude+"
			var me=this;
			var url="merchant/h5callback/findGroupPurchaseCouponInfo?groupPurchaseCouponId="+opts.id+"&longitude="+opts.longitude+"&latitude="+opts.latitude+"&start=0&size=3";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				//console.log(res)
				me.render(res,opts)
			};
			function errorcallback(res){
				
			};
		},
		getCouponNoLat:function(opts){
			//console.log(opts.id)
			var me=this;
			//longitude=116.333619&latitude=39.972881
			//longitude="+opts.longitude+"&latitude="+opts.latitude+"
			var url="merchant/h5callback/findGroupPurchaseCouponInfo?groupPurchaseCouponId="+opts.id+"";
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
			var me=this;
			//渲染
			var photos=res.images||null;
			var str='';
			if(photos!=null){
				photos=photos.split(';');
				for(var i=0;i<photos.length;i++){
					if(photos[i]!=''){
						str+='<div class="aui-slide-node bg-dark"><img src='+photos[i]+' /></div>'
					}
				}
			}else if(photos==null){
				str+='<div class="aui-slide-node bg-dark"><img src="../images/horsegjbase.png" /></div>'
				//$('#aui-slide3').css('display','none');
			}
			$('.aui-slide-wrap').append(str);
			//参数：图片对象，图片宽度，图片高度
			var w=$(window).width();
			$('#aui-slide3 .aui-slide-wrap img').load(function(){
				chgdivimgwh(this,w,$('#aui-slide3').height(),flag=false)
			})
			var slide3 = new auiSlide({
		        container:document.getElementById("aui-slide3"),
		        "height":190,
		        "speed":500,
		        "autoPlay": 3000, //自动播放
	//	        "loop":true,
		        "pageShow":true,
		        "pageStyle":'dot',
		        'dotPosition':'center'
		    })
			
			//价格
			var pricestr='';
			pricestr+='<div class="price">';
			pricestr+='<span>￥<b>'+res.price+'</b></span>';
			pricestr+='<span>门市价￥<i>'+res.sumGroupPurchaseCouponGoodsOriginPrice+'</i></span>';
			pricestr+='</div>';
			$('.price_button').prepend(pricestr);
			//规则
			var txt='',
				txtyue='';
			if(res.isCumulate==0){
				txt="不可叠加";
			}else if(res.isCumulate==1){
				txt="可叠加";
			}
			if(res.isBespeak==0){
				txtyue="免预约";
			}else if(res.isBespeak==1){
				txtyue="需预约";
			}
			var struserule='';
			struserule+='<span><i class="iconfont">&#xe6a6;</i><b>'+txtyue+'</b></span>';
			struserule+='<span><i class="iconfont">&#xe6a6;</i><b>'+txt+'</b></span>';
			$('.policy').append(struserule);
			//商家信息
			var marketMsg=res.groupPurchaseMerchant;
			var marketName=marketMsg.name;
			document.title=marketName+"团购券"
			$('.m_name').html(marketName);
			var marketAddress=marketMsg.address;
			$('.m_address').html(marketAddress);
			if(marketMsg.distance>=1000){
				var marketDistance=marketMsg.distance/1000;
				$('.m_distance span').html(marketDistance+"km");
			}else{
				var marketDistance=marketMsg.distance;
				if(typeof(marketDistance)==='undefined'){
					$('.m_distance span').html("暂时无法获取距离");
				}else{
					$('.m_distance span').html(marketDistance+"m");
				}
			}
			//电话
			//电话
			var tel=marketMsg.contacts||'';
			var strtel='';
			var arrtel=[];
			var reg=/[,]/g;
			var reg1=/[;]/g;
			if(reg.test(tel)){
				tel=tel.split(',');
				for(var tell=0;tell<tel.length;tell++){
					if(tel[tell]!=''){
						arrtel.push('<a href="tel:'+tel[tell]+'">客服电话:'+tel[tell]+'</a>')
					}
				}
			}else if(reg1.test(tel)){
				tel=tel.split(';');
				for(var tell=0;tell<tel.length;tell++){
					if(tel[tell]!=''){
						arrtel.push('<a href="tel:'+tel[tell]+'">客服电话:'+tel[tell]+'</a>')
					}
				}
			}else{
				arrtel.push('<a href="tel:'+tel+'">客服电话:'+tel+'</a>')
			}
			strtel='<p class="tellclick"><i class="iconfont">&#xe630;</i></p>'
			$('.msg_right').append(strtel);
			$('.tellclick').click(function(){
				apiready = function(){
				    api.parseTapmode();
				}
			    var actionsheet = new auiActionsheet();
				actionsheet.init({
		            frameBounces:true,//当前页面是否弹动，（主要针对安卓端）
		            title:"拨打电话",
		            cancelTitle:'取消',
		            buttons:arrtel
		        },function(ret){

		        })
			})
			//团购套餐
			var grouplist=res.groupPurchaseCouponGoodsTypeList||'';
			
			var liststr='';
			if(grouplist.length==0){
				$('.grouppackage').css('display','none');
				$('.grouppackage').next().css('display','none');
			}else{
				for(var typelistnum=0;typelistnum<grouplist.length;typelistnum++){
					var goodslist=grouplist[typelistnum].groupPurchaseCouponGoodsList||'';
					var typeName=grouplist[typelistnum].typeName||'';
					liststr+='<ul class="aui-list aui-list-in">';
					liststr+='<li class="aui-list-header group_name">'+typeName+'</li>';
//					alert(goodslist.length)
					for(var goodslistnum=0;goodslistnum<goodslist.length;goodslistnum++){
					liststr+='<li class="aui-list-item">';	
					liststr+='   <div class="aui-list-item-inner group_msg">';	
					liststr+=' <div class="aui-list-item-title" style="width:33%;text-align:left;">'+goodslist[goodslistnum].name+'</div>';	
					liststr+=' <div class="aui-list-item-title" style="width:33%;text-align:center;">'+goodslist[goodslistnum].quantity+'份</div>';	
					liststr+='<div class="aui-list-item-title" style="width:33%;text-align:right;">￥'+goodslist[goodslistnum].quantity*goodslist[goodslistnum].originPrice+'</div>';	
					
					}
					liststr+='</ul>';	
				}
				$('.group_list').append(liststr);
			}
			
			
			//
			
			
			
			//购买须知
			//适用范围
			var userange=res.applyRange||'';
			if(userange!=''){
				var userangestr='';
				if((/\n/g).test(userange)){
					var userangelength=userange.split('\n').length;
					for(var userangeNum=0;userangeNum<userangelength;userangeNum++){
						if(userange.split('\n')[userangeNum]!=''){
							userangestr+='<span><i class="iconfont">&#xe628;</i>'+userange.split('\n')[userangeNum]+'</span><br/>';
						}
					}
					$('.userange').append(userangestr);
				}else{
					userangestr+='<span><i class="iconfont">&#xe628;</i>'+userange+'</span><br/>';
					$('.userange').append(userangestr);
				}
			}else{
				$('.userange').css('display','none');
			}
			
			
			
			//有效期
			var endtime=res.endTime||'';
			var creatime=getDate(res.createTime||'');
			endtime=endtime.replace(/-/g, ".");
			creatime=creatime.replace(/-/g, ".");
			if(endtime!=''){
				$('.endtime span').append(creatime+'至'+endtime);
			}else{
				$('.endtime').css('display','none');
			}
			
			//使用时间
			var consumtime=res.consumeTime||'';
			if(consumtime!=''){
				$('.consumeTime span').append(consumtime);
			}else{
				$('.consumeTime').css('display','none');
			}
			
			//使用规则
			var userule=res.useRule||'';
			//str=str.replace(/\n/ig,"<br/>"); 
			
			if(userule!=''){
				var userulestr='';
				if((/\n/g).test(userule)){
					var userulelength=userule.split('\n').length;
					for(var userruleNum=0;userruleNum<userulelength;userruleNum++){
						if(userule.split('\n')[userruleNum]!=''){
							userulestr+='<span><i class="iconfont">&#xe628;</i>'+userule.split('\n')[userruleNum]+'</span><br/>';
						}
					}
					$('.useRule').append(userulestr);
				}else{
					userulestr+='<span><i class="iconfont">&#xe628;</i>'+userule+'</span><br/>';
					$('.useRule').append(userulestr);
				}
			}else{
				$('.useRule').css('display','none');
			}
			me.getMsg(opts);
		},
		getMsg:function(opts){
			var me=this;
			$(document).on('click','#aui-slide3 .aui-slide-wrap .aui-slide-node img',function(){
				arr=[];
				var index=$(this).parent().index();
				var imglength=$(this).parent().parent().children().length
				for(var i=0;i<$("#aui-slide3 .aui-slide-wrap img").length;i++){	
					if($("#aui-slide3").find('.aui-slide-wrap').children().eq(i).find('img').attr('src')==$(this).attr('src')){
						arr.unshift($("#aui-slide3").find('.aui-slide-wrap').children().eq(i).find('img').attr('src'))
					}else{
						arr.push($("#aui-slide3").find('.aui-slide-wrap').children().eq(i).find('img').attr('src'))
					}		
				}
				$('#imgzoom').ImgZoom({
					'displayStates':'block',
					'ImgNum':imglength,	
					'imgSrc':arr
				})
			})
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
	                    //console.log(ret)
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
	
	
	window.Cash=new Cash();
	$('.buy_immedia').click(function(){
		if(navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){//ios
			_href='../downapp.html?jumpType=1&id='+$id+'';
		}else if(navigator.userAgent.match(/android/i)){//android
			_href='horsegj://groupPurchaseCoupon/'+$id+'';
		}
		$('#cover').JumpTo({
			'_href':_href,
			'hrefHtml':'../downapp.html'
		})
	})
})
