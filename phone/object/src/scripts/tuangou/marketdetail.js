$(function(){
	var $id=purchaseId;
	//jumpToDownload('../images/ma.jpg')
	var Market=function(opts){
		var me=this;
		this.config={
			'id':$id,
		};
		this.init(opts);
	}
	Market.prototype={
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			me.bind(defaults);
		},
		bind:function(opts){
			var me=this;
			me.flag=0;
			me.getajax(opts);
		    me.geteval(opts);	
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
				        	//me.getajax(opts);
							me.getmarket(opts);
		       			 }	   
		     		}
		     	});	
		        
			}, false); 
			
			setTimeout(function(){
				if(me.flag==0){
//					me.DialogAlert("text",opts)
					$('.market_more').css('display','none');
		            $('.noneborder').css('display','none');
				}
			},5000)
 		
 		//me.getmarket(opts);
		},
		
		getajax:function(opts){
			var me=this;
			//longitude="+opts.longitude+"&latitude="+opts.latitude+"
			//lon:116.333619 lat:39.972881
			
			var url="merchant/h5callback/findGroupPurchaseMerchantInfo?groupPurchaseMerchantId="+opts.id+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				//console.log(res)
//				opts.childGroupPurchaseCategoryId=res.childGroupPurchaseCategoryId||'';
//				opts.groupPurchaseCategoryId=res.groupPurchaseCategoryId||'';
				me.render(res,opts)
				//me.getmarket(opts);
//					me.rolling=false;
			};
			function errorcallback(res){
				//me.rolling=false;
			};
//			me.render(opts);
		},
		geteval:function(opts){
			//console.log(opts.id)
			var me=this;
			var url="merchant/h5callback/findGroupPurchaseEvaluateList?start=0&size=3&merchantId="+opts.id+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				console.log(res)
				me.rendereval(res,opts)
//					me.rolling=false;
			};
			function errorcallback(res){
				//me.rolling=false;
			};
//			me.render(opts);
		},
		getmarket:function(opts){
//			if(typeof(opts.longitude)=='undefined'){
//				me.DialogAlert("text",opts)
//			}
			//longitude=116.333619&latitude=39.972881
			//longitude="+opts.longitude+"&latitude="+opts.latitude+"
			var me=this;
			var url="merchant/h5callback/findGroupPurchaseMerchant?longitude="+opts.longitude+"&latitude="+opts.latitude+"&start=0&size=3&sortType=1";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				//console.log(res)
				me.marketrender(res,opts)
//					me.rolling=false;
			};
			function errorcallback(res){
				//me.rolling=false;
			};
		},
		marketrender:function(res,opts){
			var me=this;
			//console.log(res)
			var marketlength=res.length;
			if(marketlength==0){
				$('.market_more').css('display','none');
			}
			var marketstr='';
			for(var marketi=0;marketi<marketlength;marketi++){
				//console.log(marketi)
				marketstr+='<li class="aui-padded-15 aui-padded-t-15 aui-padded-b-15" data-id ='+res[marketi].id+'>';
				marketstr+='<div class="market_logo_img">';	
				var imgMerchant=res[marketi].imgs?true:false;
				if(imgMerchant==true){
					var haveimgMechant=res[marketi].imgs.split(';')[0];
					marketstr+='<img src='+haveimgMechant+' alt="" />';
				}else{
					marketstr+='<img src="../images/group/morenlogo.png" alt="" />';
				}
				marketstr+='</div>';
				marketstr+='<div class="market_more_msg">';
				marketstr+='<div class="market_more_name_wai">';
				marketstr+='<p class="market_more_name">'+res[marketi].name+'</p>';
				if(res[marketi].hasTakeaway==1){
					marketstr+='<i><img src="../images/group/20170306group008.png"/></i>';
				}
				marketstr+='</div>';
				marketstr+='<div class="market_more_score_person">';
				var marketscore=res[marketi].merchantScore||'';
				if(marketscore==0){
					marketstr+='<div class="market_more_score">';
					var marketWidth=2.95/5*marketscore+'rem';
					marketstr+='<span style="width:'+marketWidth+'"></span>';
					marketstr+='</div>';
				}else{
					marketstr+='<div class="market_more_score">';
					var marketWidth=2.95/5*marketscore+'rem';
					marketstr+='<span style="width:'+marketWidth+'"></span>';
					marketstr+='</div>';
				}
				marketstr+='<p class="market_more_person">￥'+res[marketi].avgPersonPrice+'/人</p>';
				marketstr+='</div>';
				marketstr+='<div class="market_more_address">';
				marketstr+='<span>'+res[marketi].merchantTag+'</span>';
				
				
				if(res[marketi].distance>=1000){
					var distance=res[marketi].distance/1000;
					marketstr+='<span>'+distance+'km</span>';
				}else{
					var distance=res[marketi].distance;
					marketstr+='<span>'+distance+'m</span>';
				}	
				marketstr+='</div>';
				marketstr+='</div>';
				marketstr+='</li>';
			}
			$('.market_more_list ul').append(marketstr);
			var marketw=$('.market_logo_img').width();
			var marketH=$('.market_logo_img').height();
			$('.market_logo_img img').load(function(){
				chgdivimgwh(this,marketw,marketH,flag=false)
			})
			
		},
		rendereval:function(res,opts){//评价渲染
			var me=this;
			//评价
			var resl=res.length;
			var evalstr='';
			for(var evali=0;evali<resl;evali++){
				evalstr+='	<div class="eveal_contain aui-padded-15">';
				if(!res[evali].appUser.headerImg){	
					evalstr+='	<img src="../images/group/morenphoto.png" alt="" class="eveal_personphoto"/>';
				}else{
					evalstr+='	<img src='+res[evali].appUser.headerImg+' alt="" class="eveal_personphoto"/>';
				}
				evalstr+='<div class="eveal_list_person">';
				evalstr+='<div class="eveal_name_time">';
				evalstr+='<p>'+res[evali].appUser.name+'</p>';		
				evalstr+='<p>'+getDate(res[evali].createTime)+'</p>';
				evalstr+='</div>';
				evalstr+='<div class="eveal_score_person">';
				var evalscore=res[evali].totalScore||'';
				if(evalscore==0){
					evalstr+='<div class="eveal_score">';
				    var evalWidth=2.95/5*evalscore+'rem';
					evalstr+='<span style="width:'+evalWidth+'"></span>';
					evalstr+='</div>';
				}else{
					evalstr+='<div class="eveal_score">';
				    var evalWidth=2.95/5*evalscore+'rem';
					evalstr+='<span style="width:'+evalWidth+'"></span>';
					evalstr+='</div>';
				}
				if(res[evali].perCapitaConsumptionAmt>0&&res[evali].perCapitaConsumptionAmt!='undefined'){
					evalstr+='<p>￥'+res[evali].perCapitaConsumptionAmt+'/人</p>';
//					evalstr+='<p style="display:none;"></p>';
				}else{
//					evalstr+='<p>￥'+res[evali].perCapitaConsumptionAmt+'/人</p>';
					evalstr+='<p style="display:none;"></p>';
				}
				evalstr+='</div>';
				if(!res[evali].content){				
					evalstr+='<div class="eveal_content" data-id='+res[evali].id+'>客户未做出具体评价</div>';
				}else{			
					evalstr+='<div class="eveal_content" data-id='+res[evali].id+'>'+res[evali].content+'</div>';
				}
	
				var images=res[evali].images||null;
				var imgstr='';
				if(images!=null){
					evalstr+='<div class="eveal_photos">';
					images=images.split(';');
					var imgdisblok=-1;
					for(var j=0;j<images.length;j++){
						if(images[j]!=''){
							imgdisblok++
							imgdisblok<3?evalstr+='<img src='+images[j]+' alt=""/>':evalstr+='<img src='+images[j]+' alt="" style="display:none;"/>'
						}
					}
					evalstr+='</div>';
				}else if(images==null){
					evalstr+='<div class="eveal_photos" style="display:none"></div>';
				}
				evalstr+='</div>';
				evalstr+='</div>';
				
			}
			$('.eveal_list').append(evalstr);
			var w=$('.eveal_photos img').width();
			$('.eveal_photos img').load(function(){
				chgdivimgwh(this,w,$('.eveal_photos img').height(),flag=false)
			})
			me.clickAllEval(opts);
		},
		render:function(res,opts){
			var me=this;
			//渲染页面
			//轮播图
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
		        "height":230,
		        "speed":500,
		        "autoPlay": 3000, //自动播放
	//	        "loop":true,
		        "pageShow":true,
		        "pageStyle":'dot',
		        'dotPosition':'center'
		    })
			document.title=res.name;
			//商家名称
			var title=res.name||'';
			$('.title_name').html(title);
			//评分
			var score=res.averageScore||'';
			if(score==0){
				var Width=2.95/5*score+'rem';
				$('.score span').css('width',Width);
			}else{
				var Width=2.95/5*score+'rem';
				$('.score span').css('width',Width);
				
			}
			//人均消费
			var avgpresonprice=res.avgPersonPrice||'';
			$('.every_body').html('人均￥'+avgpresonprice+'人');
			//地址
			var address=res.address||'';
			$('.m_distance span').html(address);
			//营业时间
			var worktime=res.workingTime||'';
			$('.m_address span').html(worktime);
			//电话
			var tel=res.contacts||'';
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
		//          destructiveTitle:'红色警告按钮',
		            buttons:arrtel
		        },function(ret){
		//          if(ret){
		//              document.getElementById("button-index").textContent = ret.buttonIndex;
		//              document.getElementById("button-title").textContent = ret.buttonTitle;
		//          }
		        })
			})
			//
			//代金券
//			var couponcount=res.groupPurchaseCount;
//			if(couponcount==0){
//				$('.cashtickets').css('display','none');
//			}else{
				var couponstr='';
				var couponlist=res.groupPurchaseCouponList;	
					if(couponlist.length==0){
						$('.cashtickets').css('display','none');
					}else{
						for(var couponnum=0;couponnum<couponlist.length;couponnum++){
							if(couponlist[couponnum].type==1){
								couponstr+='<li class="aui-padded-l-15" data-id='+couponlist[couponnum].id+'>';
								couponstr+='<div class="quan_price">';
								couponstr+='<p><span>￥'+couponlist[couponnum].price+'</span>&nbsp;<i>代￥'+couponlist[couponnum].originPrice+'</i></p>';
								var txt='',
									txtyue='';
								if(couponlist[couponnum].isCumulate==0){
									txt="不可叠加";
								}else if(couponlist[couponnum].isCumulate==1){
									txt="可叠加";
								}
								if(couponlist[couponnum].isBespeak==0){
									txtyue="免预约";
								}else if(couponlist[couponnum].isBespeak==1){
									txtyue="需预约";
								}
								couponstr+='<div class="quan_userules">'+txtyue+'&nbsp;&nbsp;|&nbsp;&nbsp;'+txt+'</div>';
								couponstr+='</div>';
								couponstr+='<i class="aui-iconfont aui-icon-right arraw_i"></i>';
								couponstr+='</li>';
							}
							
						}
					
						$('.quan_msg').append(couponstr);
					}
					
//			}

			//团购套餐
//			var count=res.groupPurchaseCount;
//			if(count==0){
//				$('.tuantickets').css('display','none');
//			}else{
				var purchasestr='';
				var purchaselist=res.groupPurchaseCouponList;
					if(purchaselist.length==0){
						$('.tuantickets').css('display','none');
					}else{
						for(var purchasenum=0;purchasenum<purchaselist.length;purchasenum++){
							if(purchaselist[purchasenum].type==2){
								purchasestr+='<li class="aui-padded-l-15" data-id='+purchaselist[purchasenum].id+'>';
								purchasestr+='<a href="javascript:void()" style="text-decoration: none;">';
								purchasestr+='<div class="tuan_list_licontain">';
								purchasestr+='<div class="logo_img">';
								if(purchaselist[purchasenum].images==undefined){			
									purchasestr+='<img src="../images/group/morenlogo.png">';
								}else{						
									purchasestr+='<img src='+purchaselist[purchasenum].images+'>';
								}
								purchasestr+='</div>';
								//purchasestr+='<img src="../images/group/morenlogo.png"/>';   
								purchasestr+='<div class="tuan_msg aui-padded-t-10">';
								purchasestr+='<p class="tuan_msg_name">'+purchaselist[purchasenum].groupPurchaseName+'</p>';
								var txt1='',
									txtyue1='';
								if(purchaselist[purchasenum].isCumulate==0){
									txt1="不可叠加";
								}else if(purchaselist[purchasenum].isCumulate==1){
									txt1="可叠加";
								}
								if(purchaselist[purchasenum].isBespeak==0){
									txtyue1="免预约";
								}else if(purchaselist[purchasenum].isBespeak==1){
									txtyue1="需预约";
								}
								purchasestr+='<p class="tuan_msg_userules">'+txtyue1+'&nbsp;&nbsp;|&nbsp;&nbsp;'+txt1+'</p>';
								purchasestr+='<p class="tuan_msg_price">';
								purchasestr+='<span>￥'+purchaselist[purchasenum].price+'</span>&nbsp;门市价:<i>￥'+purchaselist[purchasenum].sumGroupPurchaseCouponGoodsOriginPrice+'</i>';
								purchasestr+='</p>';
								purchasestr+='</div>';
								purchasestr+='</div>';
								purchasestr+='<i class="aui-iconfont aui-icon-right arraw_i"></i>';
								purchasestr+='</a>';
								purchasestr+='</li>';
							}
						}
					$('.tuan_list').append(purchasestr);
					var logow=$('.logo_img').width();
					var logoH=$('.logo_img').height();
					$('.tuan_list_licontain img').load(function(){
						chgdivimgwh(this,logow,logoH,flag=false)
					})
					}
					
//			}
			//商家推荐
			var merchantrecommend=res.merchantRecommend||'';
			if(merchantrecommend!=''){
				$('.special_goods').html(merchantrecommend);
			}else if(merchantrecommend==''){
				$('.market_special').css('display','block');
			}
			//评价数量
			var evelcount=res.merchantCommentNum;
			if(evelcount==0){
				$('.eveal').css('display','none');
				$('.eveal+div[class=border_hou]').css('display','none');
			}else{
				$('.eval_top span').html(evelcount);
			}
			//商家服务
			
			var wifi=res.hasWifi;
			var pay=res.hasPOSPayment;//卡
			var room=res.hasRooms;//包厢
			var park=res.hasDepot;//停车场
			var seat=res.hasScenerySeat;//景观位
			var airseat=res.hasAlfrescoSeat;//露天位
			var smokearea=res.hasNoSmokIngArea;//无烟区
			if(wifi==0){
				$('.wifi').css('display','none');
			}
			if(pay==0){
				$('.pay').css('display','none');
			}
			if(room==0){
				$('.room').css('display','none');
			}
			if(park==0){
				$('.park').css('display','none');
			}
			if(seat==0){
				$('.seat').css('display','none');
			}
			if(airseat==0){
				$('.airseat').css('display','none');
			}
			if(smokearea==0){
				$('.smokearea').css('display','none');
			}
			if(wifi==0&&pay==0&&room==0&&park==0&&seat==0&&airseat==0&&smokearea==0){
				$('.provide_list').css('display','none');
			}
			var description=res.description||'';
			if(description!=''){
				$('.provide_pro').html(description);
			}
			if(wifi==0&&pay==0&&room==0&&park==0&&seat==0&&airseat==0&&smokearea==0&&description==''){
				$('.market_provide').css('display','none');
			}
			//渲染完毕
			me.eveal(opts)//评价图片点击放大
			me.clickImg(opts)//轮播图点击放大
			me.jumptomerchant(opts)//商家跳转
			me.jumptopurchase(opts)//团购套餐跳转  代金券跳转
		},
		clickImg:function(opts){
			var arr=[];
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
		eveal:function(opts){
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
		jumptomerchant:function(opts){//商家跳转
			var me=this;
			me.clicktomerchant=$('.market_more_list ul li');
			$(document).on('click','.market_more_list ul li',function(){
				var idnum=this.getAttribute('data-id');
				window.location.href='marketDetail.html?groupPurchaseMerchantId='+idnum+'';
			})
//			$('.market_more_list ul li').click(function(){
//				alert(11)
//				var idnum=this.getAttribute('data-id');
//				window.location.href='marketDetail.html?groupPurchaseMerchantId='+idnum+'';
//			})
		},
		jumptopurchase:function(opts){//跳转商家 和代金券
			var me=this;
			me.clicktopurchase=$('.tuan_list li');
			me.clicktoconpun=$('.quan_msg li');
			me.clicktopurchase.click(function(){
				var idnummerchant=this.getAttribute('data-id');
				window.location.href='groupPackage.html?groupPurchaseCouponId='+idnummerchant+'';
			})
			me.clicktoconpun.click(function(){
				var idnumconpun=this.getAttribute('data-id');
				window.location.href='cashCoupon.html?groupPurchaseCouponId='+idnumconpun+'';
			})
			
			
		},
		clickAllEval:function(opts){//全部评价跳转
			var me=this;
			$('.eveal_all').click(function(){
				window.location.href='groupeveal.html?groupPurchaseMerchantId='+opts.id+'';
			});
			$('.eveal_content').click(function(){
				var idevalDetail=this.getAttribute('data-id');
				window.location.href='evealDetail.html?id='+idevalDetail+'';
			})
		},
		DialogAlert:function(type,opts){
			var me=this;
			var dialog = new auiDialog({})
		        switch (type) {
		            case "text":
		                dialog.alert({
		                    title:"弹出提示",
		                    msg:'您已关闭了位置共享服务，查询更多商家列表已取消',
		                    buttons:['确定']
		                },function(ret){
		                    //console.log(ret)
		                    if(ret.buttonIndex==1){
		                    	$('.market_more').css('display','none');
		                    	$('.noneborder').css('display','none');
//		                 		positionError('您已关闭了位置共享服务，查询已取消')
		                    }
		                })
		                break;
		            case "callback":
		                dialog.alert({
		                        title:"弹出提示",
		                        msg:'您拒绝了使用位置共享服务，查询更多商家列表已取消',
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
	

	
	window.Market=new Market();
	
	
	
	
	$('.buy_immedia').click(function(){
		if(navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){//ios
			_href='../downapp.html?jumpType=0&id='+$id+'';
		}else if(navigator.userAgent.match(/android/i)){//android
			_href='horsegj://merchant/'+$id+'';
		}
		$('#cover').JumpTo({
			'_href':_href,
			'hrefHtml':'../downapp.html'
		})
	})
	
	
})
