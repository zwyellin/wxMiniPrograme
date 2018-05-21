var $id=2;//userid;
var $scheme="";
(function($,window,document){
	var Lottery=function(opts){
		console.log(1)
		var me=this;
		/*
		 *@parms bg:总背景  shadows:
		 * 
		 * */
		this.config={
			container:'$("#content")',
			bg:'images/background_img001100.png',
			/*shadows:'images/bg_lottery_shaow.png',
			goodPan:'images/turn_pan_goods.png',
			clickbtn:'images/turn_btn.png',
			lotteryrecord:'images/turn_btn.png',
			rules:'images/entry201702151805.png'*/
		},
		this.init(opts)
	};
	
	
	Lottery.prototype={
		/*constructon:Lottery,*/
		init:function(opts){
			var me=this;
			var defaults=$.extend(me.config,opts);
			
			var turnLight0=new Image();//初始灯背景
			var turnlightsrc0=turnLight0.src="images/lottery_new0.png";
			var turnLight1=new Image();//第二个背景灯
			var turnlightsrc1=turnLight1.src="images/lottery_new1.png";
			var shadows=new Image();//阴影
			var shadowssrc=shadows.src="images/bg_lottery_shaow.png";
			var turnPan=new Image();//pan
			var turnPansrc=turnPan.src="images/turn_pan_goods.png";
			var clickBtnimg=new Image();//点击按钮
			var clickBtnsrc=clickBtnimg.src="images/turn_btn.png";
			var ruleimg=new Image();//rule
			var rulesrc=ruleimg.src="images/entry201702151805.png";
			var loteryrecordimg=new Image();
			var lotteryrecordsrc=loteryrecordimg.src="images/button_choujiang.png";
			var getimg=new Image();//得到奖品提示
			var getimgsrc=getimg.src="images/lottery_choiced.gif";
			var nogetimg=new Image();//没得到奖品提示
			var nogetimgsrc=getimg.src="images/lottery_unchoiced.gif";
			
			defaults.turnsrc0=turnlightsrc0;
			defaults.turnsrc1=turnlightsrc1;
			defaults.bgshadows=shadowssrc;
			defaults.bgPan=turnPansrc;
			defaults.clickbtn=clickBtnsrc;
			defaults.rulebtn=rulesrc;
			defaults.getlottery=getimgsrc;
			defaults.nogetlottery=nogetimgsrc;
			defaults.lotteryrecord=lotteryrecordsrc;
			$('body').mLoading({
				text:'加载中...',
				icon:'images/load.gif',
				mask:false
			})
			this.bind(defaults)
		},
		bind:function(opts){
			//ajax 函数
			var me=this;
//			ajaxpost(get,url,ajaxdata,successcallback,errorcallback);
//				function successcallback(res){
//					me.render(res)
//				};
//				function errorcallback(res){		
//			};
			var res=0;
			
			me.render(opts,res)
		},
		render:function(opts,res){
			console.log(opts)
			var me=this;
			//如果回调错误提示错误
			//渲染页面
			var tpl='';
			tpl+="<div class='turn_pan' style='background:url("+opts.bgshadows+") no-repeat;background-size:100% 100%'>"
			tpl+="<div class='turn_light' style='background:url("+opts.turnsrc0+") no-repeat;background-size:100% 100%' >"
			tpl+="<div id='disk' class='' style='background:url("+opts.bgPan+") no-repeat;background-size:100% 100%'></div>"
			tpl+="<div id='startbtn' style='background:url("+opts.clickbtn+") no-repeat;background-size:100% 100%'></div>"
			tpl+="</div>"
			tpl+="</div>"
			tpl+="<div class='peopleNum'>"
			tpl+="已有&nbsp;<span>234</span>&nbsp;人抽中红包"
			tpl+="</div>"
			tpl+="<a href='javascript:void(0)' class='record_lottery' style='background:url("+opts.lotteryrecord+") no-repeat;background-size:100% 100%'></a>"
			tpl+="<div class='lotteryrules_entry'>"
			tpl+="<div class='lotteryrules_entry_roll' id='lottery_rules_roll' style='background:url("+opts.rulebtn+") no-repeat;background-size:100% 100%'>"
			tpl+="</div>"
			tpl+="</div>";
			$('#content').append(tpl);
			//如果活动过期提示已过期
			//
			$('body').mLoading('hide');
			me.showDialog(1)
			me.getLottery(opts)
		},
		getLottery:function(opts){
			var me=this;
			me.weeldisk=$("#startbtn");
			var hammer = new Hammer(document.getElementById("content"));
			me.rules=$(".lotteryrules_entry");
			me.lookrecord=$('.record_lottery');
			me.rolling=false;
			me.doing=false;
			me.weeldisk.on('click',function(){
				//如果满足条件
				//继续执行
			
				me.doDraw(opts);
			});
			me.lookrecord.on('click',function(){
				window.location="lottery_name.html?userid="+$id+"";
			});
			hammer.on('tap',function(e){
				me.rules.animate({
					'margin-right':'0rem'
				},300);
				setTimeout(function(){
					me.rules.animate({
						'margin-right':'-1rem'
					},300)
				},3000)
			});
			
			hammer.on('panstart',function(e){
				me.rules.animate({
					'margin-right':'0rem'
				},300);
			});
			hammer.on('panend',function(e){
				setTimeout(function(){
					me.rules.animate({
						'margin-right':'-1rem'
					},300)
				},3000)
			});
			var hammers = new Hammer(document.getElementById("lottery_rules_roll"));
			hammers.on('tap',function(){
				window.location.href="LotteryRules.html";
			})
					
		},
		doDraw:function(opts){
			var me=this;
			if(me.rolling){
				return false;
			}
			me.doing=true;
//			ajaxpost(get,url,ajaxdata,successcallback,errorcallback);
//				function successcallback(res){
//					me.render(res)
					//me.rolling=false;
//				};
//				function errorcallback(res){
//					//me.rolling=false;
//			};
			console.log(me.rolling);
			var z=2;
			me.setGol(opts,z);
		},
		setGol:function(opts,z){
			var me=this;
			me.disk=$("#disk",me.container);
			me.lotterychoiced=$('.lottery_choiced .lottery_img');
			me.unlotterychoiced=$('.lottery_unchoiced .lottery_img');
			me.cnacellottery=$('.lottery_choiced .cancel_msg');
			me.cancelunlottery=$('.lottery_unchoiced .cancel_msg');
			me.immediateuse=$('.compete_btn');
			var deg=360-z*60;
			me.disk.css({
	   		   '-webkit-transition-duration': '6s',
	   		   "-webkit-transition-timing-function": "ease-in-out",
	    	   '-webkit-transform': 'rotate(' + (deg + 1800) + 'deg)'
	  		})
			me.lotterychoiced.css({
				'background': 'url('+opts.getlottery+') no-repeat',
				'background-size':'100% 100%'
			});
			me.unlotterychoiced.css({
				'background': 'url('+opts.nogetlottery+') no-repeat',
				'background-size':'100% 100%'
			})
			
			setTimeout(function(){
				switch(z){
				case 0:
					$(".lottery_unchoiced").myAlert({
					//	txt:'参与奖'
					});
					break;
				case 1:
					$(".lottery_choiced").myAlert({
						txt:'一等奖'
					});
					break;
				case 2:
					$(".lottery_choiced").myAlert({
						txt:'幸运大奖'
					});
					break;
				case 3:
					$(".lottery_choiced").myAlert({
						txt:'三等奖'
					});
					break;
				case 4:
					$(".lottery_choiced").myAlert({
						txt:'小幸运奖'
					});
					break;
				case 5:
					$(".lottery_choiced").myAlert({
						txt:'二等奖'
					});
					break;
				}
				me.rolling=false;
				me.disk.css({			 
			       '-webkit-transition-duration': '0s',			 
			       '-webkit-transform': 'rotate(' + deg + 'deg)'
		   		})
			},6.5e3)
			me.cnacellottery.on('click',function(){
				$(".lottery_choiced").myAlert({
					displayStates:'none'
				})
			});
			me.cancelunlottery.on('click',function(){
				$(".lottery_unchoiced").myAlert({
					displayStates:'none'
				})
			});
			me.immediateuse.on('click',function(){
				$('#cover').JumpTo({
					urlScheme:'horsegj://'+$scheme+'',
					idVal:$id,
					hrefHtml:'downforEShou.html',
					msgStyle:''
				})
			});
			
			
			me.endLottery(opts)
		},
		endLottery:function(opts){
			var me=this;
			
		},
		showDialog:function(n){
			if(n=1){
				swal({
					title: "提示",
					text: "没有抽奖次数了哦!",
					confirmButtonText: "确定",
					confirmButtonColor:"#FF9A00",
					showLoaderOnConfirm:"true",
					width:'300px'
				})
			}
		},
		
	};
	
	
	window.Lottery=new Lottery();
})(jQuery,window,document)
