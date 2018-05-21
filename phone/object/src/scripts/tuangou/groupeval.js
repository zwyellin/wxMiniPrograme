$(function(){
	var $id=purchaseId;
	
	var Eval=function(opts){
		var me=this;
		this.config={
			'id':$id,
			'initialValue':0,
		}
		this.init(opts)
	}
	Eval.prototype={
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			this.bind(defaults);
		},
		bind:function(opts){
			var me=this;
			me.loading=false;
			me.getEval(opts);	
		},
		getEval:function(opts){
			var me=this;
			var url="merchant/h5callback/findGroupPurchaseEvaluateList?merchantId="+opts.id+"&start="+opts.initialValue+"&size=10&"+new Date().getTime()+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(res){
				console.log(res)
				me.num=res;
				me.render(res,opts)
			};
			function errorcallback(res){
				
			};
			return me.num;
		},
		render:function(res,opts){
			var me=this;
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
				if(res[evali].perCapitaConsumptionAmt<=0){
					evalstr+='<p style="display:none"></p>';
				}else{
					evalstr+='<p>￥'+res[evali].perCapitaConsumptionAmt+'/人</p>';
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
			$('.eveal_contain').css('border-bottom','1px solid #e5e5e5');
			
			$('.loading').before(evalstr);
			$('.eveal_contain:last').css('border-bottom','none');

			var winH=$(window).height();
			var ListHeight = $('.eveal').height();
			if(ListHeight<winH){
				$('.aui-refresh-content').css('position','absolute');
				me.getpullrefresh(opts);

			}else{
				$('.aui-refresh-content').css('position','absolute');
				me.getpullrefresh(opts);
				me.getupload(opts);
			}
			me.clickImgRoom(opts);
			me.jumpToDetail(opts);
		},
		clickImgRoom:function(opts){
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
		jumpToDetail:function(opts){
			var me=this;
			$('.eveal_content').click(function(){
				var idnum=this.getAttribute('data-id');
				window.location.href='evealDetail.html?id='+idnum+'';
			})
		},
		getpullrefresh:function(opts){
			var me=this;
			var pullRefresh = new auiPullToRefresh({
	        container: document.querySelector('.aui-refresh-content'),
	        triggerDistance: 200
		   },function(ret){
		        if(ret.status=="success"){	  
		        	opts.initialValue=0;
		        	$('.eveal_contain').remove();
					console.log(opts+"new")
					console.log("刷新中。。。")
		        	me.getEval(opts);
		        	$(document).ready(function(){
		        		setTimeout(function(){
			        		pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏     
			        	},1000)
		        	})
		        }
		    })
		},
		getupload:function(opts){
			var me=this;
			var docuH=$(document).height();
			var winH=$(window).height();
			var ListHeight = $('.eveal').height();		
				var scroll = new auiScroll({
				    listen:true, //是否监听滚动高度，开启后将实时返回滚动高度
				    distance:0 //判断到达底部的距离，isToBottom为true
				},function(ret){			
					if(ret.isToBottom){
							$('.loading').css('display','block');
							if(me.loading==false){
								me.loading=true;
								opts.initialValue+=10;	
									//opts.initialValue=0;					
								var t=me.getEval(opts);
								$('.aui-refresh-load').remove();
			       				if(t==''){
			       				 	$('.loading').html('已经没有数据了')
			       				 }
		       					setTimeout(function(){
		       						$('.loading').css('display','none')
		       						me.loading=false;
		       					},1000)		       				       		 			       			
							}else{
								
							}
				    }else{
		           		
		      		}
				});
			
		},
	}
	window.Eval=new Eval();

	
})
