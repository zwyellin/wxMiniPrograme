$(function(){
	var sjid=inforId;//inforId;
	var appName=appname;//app名
	var msgStyle=inforType;//inforType;//二手市场:6  房屋租赁：2  求职：10  招聘：1  维修：3   教育培训：4  家政：5  风水：7
	//跳转app									//健康咨询：9    法律咨询：8  废品回收：11  家教信息：13  个人求租：14  求购12
	//判断类型 									//新招聘：15   新求职 ：16
	var $scheme;
//求职*********************************
	if(msgStyle==10||msgStyle=='10#'){
		$scheme="information";
		$('.peopleforjob').css('display','block');//求职
		$('.FengShui').css('display','none');//风水
		$('.health').css('display','none');//健康
		$('.jobforpeople').css('display','none');//招聘	
	var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
					//console.log(data)
			//head图片
			if(data.sex==0){ //判断性别0为男 1为女
				if(data.headImg){
					$('.photo_foundjob').css({
						'background':'url('+data.headImg+') no-repeat',
						'background-size':'100% 100%'
					})
				}else{
					$('.photo_foundjob').css({
						'background':'url(../../images/photo_company_male.png) no-repeat',
						'background-size':'100% 100%'
					})
				}	
				//性别图片 男
				$('.header .personalmsg .name_male_age span:nth-child(2)').css({
					'background':'url(../../images/sex_male.png) no-repeat',
					'background-size':'100% 100%'
				});
			}else if(data.sex==1){//女
				if(data.headImg){
					$('.photo_foundjob').css({
						'background':'url('+data.headImg+') no-repeat',
						'background-size':'100% 100%'
					})
				}else{
					$('.photo_foundjob').css({
						'background':'url(../../images/photo_company_famile.png) no-repeat',
						'background-size':'100% 100%'
					})
				}	
				//性别图片女
				$('.header .personalmsg .name_male_age span:nth-child(2)').css({
					'background':'url(../../images/sex_lady.png) no-repeat',
					'background-size':'100% 100%'
				});
				
			}else{//没有给定性别
				if(data.headImg){
					$('.photo_foundjob').css({
						'background':'url('+data.headImg+') no-repeat',
						'background-size':'100% 100%'
					})
				}else{
					$('.photo_foundjob').css({
						'background':'url(../../images/photo_company_famile.png) no-repeat',
						'background-size':'100% 100%'
					})
				}	
				//默认图片为女
				$('.header .personalmsg .name_male_age span:nth-child(2)').css({
					'background':'url(../../images/sex_lady.png) no-repeat',
					'background-size':'100% 100%'
				});
				
			}
			//姓名
			var nameer=data.title||'';
			$('.header .personalmsg .name_male_age span:nth-child(1)').html(nameer);
			
			//年龄
			var age=data.age||'';
			$('.header .personalmsg .name_male_age span:nth-child(3)').html(age+"岁");
			//学历
			var eduction=data.highestEducation||'';
			$(".eduction_10 span:nth-child(1)").html(eduction);
			//工作经验
			var experience=data.workExperience||'';
			$('.eduction_10 span:nth-child(3)').html(experience);
			//更新时间
			var refreshtime=data.createTime||'';
			if(refreshtime!=" "){
				 refreshtime=refreshtime.split(" ")[0];
			}
			$('.job_refreshtime span:nth-child(2)').html(refreshtime);
			//期望职位
			var Jobposition=data.expectPosition||'';
			$('._job span:nth-child(2)').html(Jobposition);
			//期望位置
			var Jobpos=data.address||'';
			if(Jobpos==""){
				$('._address').css('display','none');
			}
			$('._address span:nth-child(2)').html(Jobpos);
			//期望薪资
			var Jobsalary=splitdanwei(data.expectSalary?data.expectSalary:'');
			if(Jobsalary==""){
				$('._money').css('display','none');
			}
			$('._money span:nth-child(2)').html(Jobsalary[0]);
			$('._money i').html(Jobsalary[1]);
			
			//个人简介
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.personalDetail').html(description);
			//照片
			var photos=data.imgs||null;
			var str='';	
			var k=0;
			if(photos!=null){
				photos=photos.split(";");
					for(var i=0;i<photos.length;i++){
						if(photos[i]!=''){
							k++;
							str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"
						}
								
					}
			}else if(photos==null){
				$('.job_swiper').css('display','none')
				$('.photo_zuopin').css('display','none');
			}
			$('.personal_wish_num span i').html(k);
			$('.job_swiper_contain').append(str);
			var mySwiper = new Swiper ('.job_swiper', {//swiper初始化
		    	/*direction: 'vertical',*/
		    	slidesPerView : 3.5,
		    	slidesPerGroup : 3.5,
		 		spaceBetween :30,
		})   
		};
		function errorcallback(res){
			errorfn();
		};	
//招聘************************************
	}else if(msgStyle==1||msgStyle=='1#'){
		$('.peopleforjob').css('display','none');//求职
		$('.FengShui').css('display','none');//风水
		$('.health').css('display','none');//健康
		$('.jobforpeople').css('display','block');//招聘
		$scheme="information";
		//ajax招聘
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
				//职位说明title
			var titlename=data.title||'';
			$('.pro_name').html(titlename);
			//薪资
			var salary=splitdanwei(data.salary);
			if(salary==''){
				$('.money_provide').css('display','block');
			}
			$('.money_provide').prepend(salary[0]);
			$('.money_provide i').html(salary[1]);
			//发布时间
			var pubtime=data.createTime||'';
			if(pubtime!=''){
				pubtime=pubtime.split(" ")[0];
			}
			$('.publishtime span').html(pubtime);
			//职位
			var jobpos=data.positionName||'';
			$('.pro_name_acc span').html(jobpos);
			//要求
			if(data){
				var jobneed = data.workYears == "经验不限" ? "经验不限" : data.workYears+"工作经验"; 
				var needEduction = data.education == "学历不限" ? "学历不限" : data.education+"以上";
			}
			//var jobneed=data.workYears||'';//经验 人数
			var needpeope=data.recruitNum||'';//人数
			//var needEduction=data.education||'';//学历
			var needall=needpeope+"/"+jobneed+"/"+needEduction;
			$('.need span').append(needall);
			//福利
			var fuli=data.welfare||'';
			if(fuli!=''){
				fuli=fuli.split(",");
				var sts='';
				for(var i=0;i<fuli.length-1;i++){	
					sts+='<span>'+fuli[i]+'</span>'
				}
				$('.lottery div:nth-child(2)').append(sts);
			}else{
				$('.lottery').css('display','none');
			}
			//工作地址
			var jobaddress=data.companyAddress||'';
			$('.address_com').html(jobaddress);
			//工作描述
			var need=data.claim||'';
			if(need!=''){
				need=need.replace(/\n/ig,"<br/>"); 
			}
			$('.pro_discribe').html(need);
			//公司信息  公司名称
			var company_name=data.companyName||'';
			$('.company_name').html(company_name);
			//公司规模
			var commodule=data.companyScale||'';
			$('.company_model span').html(commodule);
			//公司性质
			var comquaility=data.companyType||'';
			$('.company_quality span').html(comquaility);
			//公司行业
			var profession=data.profession||'';
			$('.company_class span').html(profession);
			//公司地址
			var job_address=data.companyAddress||'';
			$('.company_address span').html(job_address);
			//公司描述
			var companyDes=data.description||'';
			if(companyDes!=''){
				companyDes=companyDes.replace(/\n/ig,"<br/>"); 
			}
			$('.pro_content').html(companyDes);
			//图片
			var photos=data.imgs||null;
			var str='';		
			if(photos!=null){
				photos=photos.split(";");
					for(var i=0;i<photos.length;i++){
						if(photos[i]!=''){
							str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
						}	
					}
			}else if(photos==null){
				$('.company_swiper').css('display','none');
				$('.company_picture').css('display','none');
			}
			$('.company_photos').append(str);
			//参数：图片对象，图片宽度，图片高度
			var w=$('.company_swiper').width();
			$('.company_photos .swiper-slide img').load(function(){
				chgdivimgwh(this,w,$('.company_swiper').height(),flag=false)
			})
			var mySwiper = new Swiper ('.company_swiper', {
			    // 如果需要分页器
			    pagination: '.swiper-pagination',
			    paginationType : 'fraction',
			    preventClicks : false,
			})   
			//求职招聘职位描述是否有点击事件
			var $describH=$(".pro_discribe").height();
			if($describH>'565'){
				$('.kongbais').css({
					'display':'block'
				});
				$('.click_close').css({
					'display':'block'
				});
			}
			$('.click_close').click(function(){//点击事件
				if($(this).html()=="展开信息"){
					$(this).html('收起信息');
					$(this).css({
						'background':'#fff url(../../images/shangsanjiao.png) no-repeat left 61% center',
						'background-size':'4% 22%'
					})
					$('.pro_discribe').css({//div
						'max-height':'initial'
					});
					//空白
					$('.kongbais').css({
						'display':'none'
					});
				}else{
					$('.pro_discribe').css({
						'max-height':''
					});
					$('.kongbais').css({
						'display':'block'
					});
					$(this).html('展开信息');
					$(this).css({
						'background':'#fff url(../../images/xiasanjiao.png) no-repeat left 61% center',
						'background-size':'4% 22%'
					})
				}
			})
			
		};
		function errorcallback(res){
			errorfn();
		};		
//风水大师****************************	
	}else if(msgStyle==7||msgStyle=='7#'){
		$('.peopleforjob').css('display','none');//求职
		$('.jobforpeople').css('display','none');//招聘
		$('.health').css('display','none');//健康
		$('.FengShui').css('display','block');//风水
		$scheme="information";
			//ajax招聘
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
				//图片
			var photos=data.imgs||null;
			var str='';		
			if(photos!=null){
				photos=photos.split(";");
					for(var i=0;i<photos.length;i++){
						if(photos[i]!=''){
							str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
						}	
					}
			}else if(photos==null){
				$('.FengShui_swiper').css('display','none');
			}
			$('.FengShui_photos').append(str);
			//参数：图片对象，图片宽度，图片高度
			var w=$(window).width();
			$('.FengShui_photos .swiper-slide img').load(function(){
				chgdivimgwh(this,w,$('.FengShui_swiper').height(),flag=false)
			})
			var mySwiper = new Swiper ('.FengShui_swiper', {
			    // 如果需要分页器
			    pagination: '.swiper-pagination',
			    paginationType : 'fraction',
			    preventClicks : false,
			})   
			//姓名
			var name=data.name||'';
			$('.fengshui_name_age span:nth-child(1)').html(name);
			//年龄
			var age=data.age||'';
			$('.fengshui_name_age span:nth-child(3)').html(age);
			//类别
			var classes=data.categoryName||'';
			$('.fengshui_name_age span:nth-child(4)').append(classes);
			//所在省份
			var address=data.whereProvinceName||'';
			$('.fengshui_address').html(address);
			//擅长领域
			var goodField=data.goodField||'';
			$('.fengshui_speality').append(goodField);
			//大师简介
			var personalProfile=data.personalProfile||'';
			if(personalProfile!=''){
				personalProfile=personalProfile.replace(/\n/ig,"<br/>"); 
			}
			$('.fengshui_good').html(personalProfile);
		};
		function errorcallback(res){
			errorfn();
		};	

//健康咨询*****************************************	
	}else if(msgStyle==9||msgStyle=='9#'){
		$('.health').css('display','block');//健康	
		$scheme="information";
			//ajax健康
			
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
				//头像
			if(data.headImg){
				$('.healphoto').css({
					'background':'url('+data.headImg+') no-repeat',
					'background-size':'100% 100%'
				})
			}else{
				$('.healphoto').css({
					'background':'url(../../images/morenphoto.png.png) no-repeat',
					'background-size':'100% 100%'
				})
			}	
			//姓名
			var name=data.name||'';
			$('.healname_male_age span:nth-child(1)').html(name);
			//类别
			var classes=data.categoryName||'';
			$('.healheader .healpersonalmsg .healname_male_age span:nth-child(2)').append(classes);
			/*//科名
			var _pro=data.departments||'';
			$('.healname_male_age span:nth-child(2)').append(_pro);*/
			//职称
			var zhicheng=data.professionalTitle||'';
			$('.healschool_preience').html(zhicheng);
			//医院
			var hospital=data.hospital||'';
			$('.healrefreshtime').html(hospital);
			//专长
			var special=data.doctorExpertise||'';
			$('.health_special').html(special);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.health_description').html(description);
		};
		function errorcallback(res){
			errorfn();
		};	
/*废品回收****************************************/
	}else if(msgStyle==11||msgStyle=='11#'){
		$('.peopleforjob').css('display','none');//求职
		$('.jobforpeople').css('display','none');//招聘
		$('.FengShui').css('display','none');//风水
		$('.health').css('display','none');//健康
		$('.waste').css('display','block');//废品回收
		$scheme="information";
			//ajax	
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
			var ajaxdata='';
			ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
			function successcallback(data){
				//console.log(res)
				//轮播图
			//图片
			var photos=data.imgs||null;
			var str='';		
			if(photos!=null){
				photos=photos.split(";");
					for(var i=0;i<photos.length;i++){
						if(photos[i]!=''){
							str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
						}	
					}
			}else if(photos==null){
				$('.waste_swiper').css('display','none');
			}
			$('.waste_photos').append(str);
			//参数：图片对象，图片宽度，图片高度
			var w=$(window).width();
			$('.waste_photos .swiper-slide img').load(function(){
				chgdivimgwh(this,w,$('.waste_swiper').height(),flag=false)
			})
			var mySwiper = new Swiper ('.waste_swiper', {
			    // 如果需要分页器
			    pagination: '.swiper-pagination',
			    paginationType : 'fraction',
			    preventClicks : false,
			})   
			//title
			var title=data.title||'';
			/*title=title.substring(0,16);*/
			$('.waste_name_age span:nth-child(1)').html(title);
			//类别
			var classes=data.categoryName||'';
			$('.waste_name_age span:nth-child(2)').html(classes);
			//评分
			var score=data.score;
			if(score==0){
				$('.waste_score').css('display','none');
				$('.waste_speality span:nth-child(1)').html("暂无评分");
			}else{
				Width=1.8/5*score+'rem';
				$('.waste_score_star span').css('width',Width);
				$('.waste_score_num').prepend(score);
				$('.waste_speality span:nth-child(1)').html("该评分来自商业综合评估");
			}
			/*if(score!=null){
				Width=1.8/5*score+'rem';
				$('.waste_score_star span').css('width',Width);
			}
			*/
			//服务类别
			var catareay=data.categoryName||'';
			$('.waste_class span').html(catareay);
			//
			//个人或商家
			var type=data.type||'';
			if(type==1){
				$('.waste_speality span:nth-child(2)').html('个人');
			}else if(type==2){
				$('.waste_speality span:nth-child(2)').html('商家');
			}
			//服务类别
			//服务特色
			var goodsfield=data.goodField||'';
			$('.wasteservise .waste_class span').html(goodsfield);
			//服务区域
			var district=data.serviceArea||'';
			$('.waste_address span').html(district);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.waste_good').html(description);
			
			};
			function errorcallback(res){
				errorfn();
			};	
			
	}else if(msgStyle==8||msgStyle=='8#'){
		//法律
		$scheme="information";
		$('.Lawyer').css('display','block');
		
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
			if(data.headImg){
				$('.Lawyerheader .Lawyerphoto').css({
					'background':'url('+data.headImg+') no-repeat',
					'background-size':'100% 100%'
				})
			}else{
				$('.Lawyerheader .Lawyerphoto').css({
					'background':'url(../../images/morenphoto.png) no-repeat',
					'background-size':'100% 100%'
				})
			}	
			//姓名
			var name=data.name||'';
			$('.Lawyername_male_age span:nth-child(1)').html(name);
			//工作年限
			var age=data.practiceTimeNum||'';
			$('.Lawyername_male_age span:nth-child(3)').prepend(age);
			//类别
			var classes=data.categoryName||'';
			$('.Lawyername_male_age span:nth-child(4)').append(classes);
			//所在省份
			var address=data.whereProvinceName||'';
			$('.Lawyerheader .Lawyerpersonalmsg .Lawyerschool_preience').html(address);
			//所在公司
			var company=data.whereCompany||'';
			$('.Lawyerrefreshtime').html(company);
			//擅长领域
			var goodField=data.goodField||'';
			$('.Lawyer_good_goodfield').html(goodField);
			//大师简介
			var personalProfile=data.personalProfile||'';
			if(personalProfile!=''){
				personalProfile=personalProfile.replace(/\n/ig,"<br/>"); 
			}
			$('.Lawyer_good_detail').html(personalProfile);
		};
		function errorcallback(res){
			errorfn();
		};
		
	}else if(msgStyle==3||msgStyle=='3#'){
		//维修
		$scheme="information";
		$('.repair').css('display','block');
		
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
			//轮播图
			//图片
			var photos=data.imgs||null;
			var str='';		
			if(photos!=null){
				photos=photos.split(";");
					for(var i=0;i<photos.length;i++){
						if(photos[i]!=''){
							str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
						}	
					}
			}else if(photos==null){
				$('.repair_swiper').css('display','none');
			}
			$('.repair_photos').append(str);
			//参数：图片对象，图片宽度，图片高度
			var w=$(window).width();
			$('.repair_photos .swiper-slide img').load(function(){
				chgdivimgwh(this,w,$('.repair_swiper').height(),flag=false)
			})
			var mySwiper = new Swiper ('.repair_swiper', {
			    // 如果需要分页器
			    pagination: '.swiper-pagination',
			    paginationType : 'fraction',
			    preventClicks : false,
			})   
			//title
			var title=data.title||'';
			/*title=title.substring(0,16);*/
			$('.repair_name_age span:nth-child(1)').html(title);
			//类别
			var classes=data.categoryName||'';
			$('.repair_name_age span:nth-child(2)').html(classes);
			//评分
			var score=data.score;
			if(score==0){
				$('.repair_score').css('display','none');
				$('.repair_speality span:nth-child(1)').html("暂无评分");
			}else{
				Width=1.8/5*score+'rem';
				$('.repair_score_star span').css('width',Width);
				$('.repair_score_num').prepend(score);
				$('.repair_speality span:nth-child(1)').html("该评分来自商业综合评估");
			}
			/*if(score!=null){
				Width=1.8/5*score+'rem';
				$('.repair_score_star span').css('width',Width);
			}
			$('.repair_score_num').prepend(score);*/
			//个人或商家
			var type=data.type||'';
			if(type==1){
				$('.repair_speality span:nth-child(2)').html('个人');
			}else if(type==2){
				$('.repair_speality span:nth-child(2)').html('商家');
			}
			//服务类别
			var catareay=data.categoryName||'';
			$('.repair_class span').html(catareay);
			//服务特色
			var goodsfield=data.serviceFeatures||'';
			$('.repairservise .repair_class span').html(goodsfield);
			//服务区域
			var district=data.serviceArea||'';
			$('.repair_address span').html(district);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.repair_good').html(description);
		};
		function errorcallback(res){
			errorfn();
		};

	}else if(msgStyle==2||msgStyle=='2#'){
		//房屋租赁
			$('.housefor').css('display','block');
		$scheme="information";
		//$('.repair').css('display','block');
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
			$('.housefor_swiper').css('display','block');
				
				//轮播图
				//图片
				var photos=data.imgs||null;
				var str='';		
				if(photos!=null){
					photos=photos.split(";");
						for(var i=0;i<photos.length;i++){
							if(photos[i]!=''){
								str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
							}	
						}
				}else if(photos==null){
					$('.housefor_swiper').css('display','none');
				}
				$('.housefor_photos').append(str);
				//参数：图片对象，图片宽度，图片高度
				var w=$(window).width();
				$('.housefor_photos .swiper-slide img').load(function(){
					chgdivimgwh(this,w,$('.housefor_swiper').height(),flag=false)
				})
				var mySwiper = new Swiper ('.housefor_swiper', {
				    // 如果需要分页器
				    pagination: '.swiper-pagination',
				    paginationType : 'fraction',
				    preventClicks : false,
				})   
				
				//title
				var title=data.title||'';
			/*	title=title.substring(0,16);*/
				$('.housefor_name_age span:nth-child(1)').html(title);
				//类别
				var classes=data.categoryName||'';
				$('.housefor_name_age span:nth-child(2)').html(classes);
				//价格
				var price=data.amt;
				$('.housefor_score_star span').html(price);
				//发布时间
				var pubtime=data.createTime||'';
				if(pubtime!=" "){
					 pubtime=pubtime.split(" ")[0];
				}
				$('.housefor_speality span:nth-child(1) i').html(pubtime);
				//户型
				var housestyle=data.houseType||'';
				$('.housefor_class span').html(housestyle);
				//面积
				var housearea=data.houseArea||'';
				$('.housefor_address span').html(housearea);
				//地段
				var address=data.sectorArea||'';
				$('.housefor_address_need span').html(address);
				//描述
				var description=data.description||'';
				if(description!=''){
					description=description.replace(/\n/ig,"<br/>"); 
				}
				$('.housefor_good').html(description);	
			//}
			
		};
		function errorcallback(res){
			errorfn();
		};
		
	}else if(msgStyle==14||msgStyle=='14#'){
		//个人求租
		//房屋租赁
		$scheme="information";
		//$('.repair').css('display','block');
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
				//var type=data.type||'';
			//求租
				$('.forhouse').css('display','block');
				//title
				var title=data.title||'';
				/*title=title.substring(0,16);*/
				$('.forhouse_name_age span:nth-child(1)').html(title);
				//类别
				var classes=data.categoryName||'';
				$('.forhouse_name_age span:nth-child(2)').html(classes);
				//价格
				/*var price=data.amt;*/
				//价格
				if(data.type==2){
					var minprice=data.minAmt;
						//minprice=minprice.split('元/月')[0];
					var maxprice=data.maxAmt;
						//maxprice=maxprice.split('元/月')[0];
					var price=minprice+'-'+maxprice;
				}else if(data.type==1){
					var price=data.amt;
				}
				$('.forhouse_score_star span').html(price);
				//发布时间
				var pubtime=data.createTime||'';
				if(pubtime!=" "){
					 pubtime=pubtime.split(" ")[0];
				}
				$('.forhouse_speality span:nth-child(1) i').html(pubtime);
				//户型
				var housestyle=data.houseType||'';
				$('.forhouse_class span').html(housestyle);
				//地段
				var address=data.sectorArea||'';
				$('.forhouse_address_need span').html(address);
				//描述
				var description=data.description||'';
				if(description!=''){
					description=description.replace(/\n/ig,"<br/>"); 
				}
				$('.forhouse_good').html(description);	
		};
		function errorcallback(res){
			errorfn();
		};
	}else if(msgStyle==4||msgStyle=='4#'){
		//教育培训
		$scheme="information";
	//	$('.repair').css('display','block');
	
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			console.log(data)
			$('.eduschool').css('display','block');
				/*	$('.housefor_swiper').css('display','block');*/
					//轮播图
					//图片
					var photos=data.imgs||null;
					var str='';		
					if(photos!=null){
						photos=photos.split(";");
							for(var i=0;i<photos.length;i++){
								if(photos[i]!=''){
									str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
								}	
							}
					}else if(photos==null){
						$('.eduschool_swiper').css('display','none');
					}
					$('.eduschool_photos').append(str);
					//参数：图片对象，图片宽度，图片高度
					var w=$(window).width();
					$('.eduschool_photos .swiper-slide img').load(function(){
						chgdivimgwh(this,w,$('.eduschool_swiper').height(),flag=false)
					})
					var mySwiper = new Swiper ('.eduschool_swiper', {
					    // 如果需要分页器
					    pagination: '.swiper-pagination',
					    paginationType : 'fraction',
					    preventClicks : false,
					})   
					
					//title
					var title=data.title||'';
					/*title=title.substring(0,16);*/
					$('.eduschool_name_age span:nth-child(1)').html(title);
					//类别
					var classes=data.categoryName||'';
					$('.eduschool_name_age span:nth-child(2)').html(classes);
					//评分
					var score=data.score;
					if(score==0){
						$('.eduschool_score').css('display','none');
						$('.eduschool_speality span:nth-child(1)').html("暂无评分");
					}else{
						Width=1.8/5*score+'rem';
						$('.eduschool_score_star span').css('width',Width);
						$('.eduschool_score_num').prepend(score);
						$('.eduschool_speality span:nth-child(1)').html("该评分来自商业综合评估");
					}
					/*if(score!=null){
						Width=1.8/5*score+'rem';
						$('.eduschool_score_star span').css('width',Width);
					}
					$('.eduschool_score_num').prepend(score);*/
					//地段
					var address=data.address||'';
					$('.eduschool_class span').html(address);
					//描述
					var description=data.description||'';
					if(description!=''){
						description=description.replace(/\n/ig,"<br/>"); 
					}
					$('.eduschool_good').html(description);	
		};
		function errorcallback(res){
			errorfn();
		};
	}else if(msgStyle==13||msgStyle=='13#'){
		//家教信息
		$scheme="information";
	//	$('.repair').css('display','block');
	
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
				$('.edupersonal').css('display','block');
					//轮播图
					//图片
					var photos=data.imgs||null;
					var str='';		
					if(photos!=null){
						photos=photos.split(";");
							for(var i=0;i<photos.length;i++){
								if(photos[i]!=''){
									str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
								}	
							}
					}else if(photos==null){
						$('.edupersonal_swiper').css('display','none');
					}
					$('.edupersonal_photos').append(str);
					//参数：图片对象，图片宽度，图片高度
					var w=$(window).width();
					$('.edupersonal_photos .swiper-slide img').load(function(){
						chgdivimgwh(this,w,$('.edupersonal_swiper').height(),flag=false)
					})
					var mySwiper = new Swiper ('.edupersonal_swiper',{
					    // 如果需要分页器
					    pagination: '.swiper-pagination',
					    paginationType : 'fraction',
					    preventClicks : false,
					})   
					//title
					var title=data.title||'';
				//	title=title.substring(0,16);
					$('.edupersonal_name_age span:nth-child(1)').html(title);
					//类别
					var classes=data.categoryName||'';
					$('.edupersonal_name_age span:nth-child(2)').html(classes);
					//评分
					var score=data.score;
					if(score==0){
						$('.edupersonal_score').css('display','none');
						$('.edupersonal_speality span:nth-child(1)').html("暂无评分");
					}else{
						Width=1.8/5*score+'rem';
						$('.edupersonal_score_star span').css('width',Width);
						$('.edupersonal_score_num').prepend(score);
						$('.edupersonal_speality span:nth-child(1)').html("该评分来自商业综合评估");
					}
					/*if(score!=null){
						Width=1.8/5*score+'rem';
						$('.edupersonal_score_star span').css('width',Width);
					}
					$('.edupersonal_score_num').prepend(score);*/
					//教师身份
					var teachertype=data.educationTeacherTypeName||'';
					$('.edupersonal_class span').html(teachertype);
					//辅导阶段
					var edustage=data.educationTutorshipStageName||'';
					$('.edupersonal_address span').html(edustage);
					//描述
					var description=data.description||'';
					if(description!=''){
						description=description.replace(/\n/ig,"<br/>"); 
					}
					$('.edupersonal_good').html(description);
		};
		function errorcallback(res){
			errorfn();
		};
	}else if(msgStyle==6||msgStyle=='6#'){
		//二手市场
		$scheme="information";
	//	$('.repair').css('display','block');
	
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
			$('.esmsgforsale').css('display','block');
			//判断type
			//出售2或求购1
			//var type=data.type||'';
		/*	if(type==1){//求购
				$('.esmsgforsale_swiper').css('display','none');
			}else if(type==2){*///出售
				$('.esmsgforsale_swiper').css('display','block');
				//轮播图
				//图片
				var photos=data.imgs||null;
				var str='';		
				if(photos!=null){
					photos=photos.split(";");
						for(var i=0;i<photos.length;i++){
							if(photos[i]!=''){
								str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
							}	
						}
				}else if(photos==null){
					$('.esmsgforsale_swiper').css('display','none');
				}
				$('.esmsgforsale_photos').append(str);
				//参数：图片对象，图片宽度，图片高度
				var w=$(window).width();
				$('.esmsgforsale_photos .swiper-slide img').load(function(){
					chgdivimgwh(this,w,$('.esmsgforsale_swiper').height(),flag=false)
				})
				var mySwiper = new Swiper ('.esmsgforsale_swiper', {
				    // 如果需要分页器
				    pagination: '.swiper-pagination',
				    paginationType : 'fraction',
				    preventClicks : false,
				})   
			//}
			
			//title
			var title=data.title||'';
			/*title=title.substring(0,16);*/
			$('.esmsgforsale_name_age span:nth-child(1)').html(title);
			//类别
			var classes=data.categoryName||'';
			$('.esmsgforsale_name_age span:nth-child(2)').html(classes);
			//价格
				var price=data.amt;
			$('.esmsgforsale_score_star span').html(price);
			//发布时间
			var pubtime=data.createTime||'';
			if(pubtime!=" "){
				 pubtime=pubtime.split(" ")[0];
			}
			$('.esmsgforsale_speality span:nth-child(1) i').html(pubtime);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.esmsgforsale_good').html(description);
		};
		function errorcallback(res){
			errorfn();
		};
	}else if(msgStyle==12||msgStyle=='12#'){
		//求购 type==2
			$scheme="information";
	//	$('.repair').css('display','block');
	
	    var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
			$('.esmsgforsale').css('display','block');
			//判断type
			//出售2或求购1
			//var type=data.type||'';
			//if(type==1){//求购
				$('.esmsgforsale_swiper').css('display','none');
			/*}else if(type==2){//出售
				$('.esmsgforsale_swiper').css('display','block');
				//轮播图
				//图片
				var photos=data.imgs||null;
				var str='';		
				if(photos!=null){
					photos=photos.split(";");
						for(var i=0;i<photos.length;i++){
							if(photos[i]!=''){
								str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
							}	
						}
				}else if(photos==null){
					$('.esmsgforsale_swiper').css('display','none');
				}
				$('.esmsgforsale_photos').append(str);
				//参数：图片对象，图片宽度，图片高度
				var w=$(window).width();
				$('.esmsgforsale_photos .swiper-slide img').load(function(){
					chgdivimgwh(this,w,$('.esmsgforsale_swiper').height(),flag=false)
				})
				var mySwiper = new Swiper ('.esmsgforsale_swiper', {
				    // 如果需要分页器
				    pagination: '.swiper-pagination',
				    paginationType : 'fraction',
				    preventClicks : false,
				})   
			}
			*/
			//title
			var title=data.title||'';
			/*title=title.substring(0,16);*/
			$('.esmsgforsale_name_age span:nth-child(1)').html(title);
			//类别
			var classes=data.categoryName||'';
			$('.esmsgforsale_name_age span:nth-child(2)').html(classes);
			//价格
				var minprice=data.minAmt;
				var maxprice=data.maxAmt;
				var price=minprice+'-'+maxprice;
			$('.esmsgforsale_score_star span').html(price);
			//发布时间
			var pubtime=data.createTime||'';
			if(pubtime!=" "){
				 pubtime=pubtime.split(" ")[0];
			}
			$('.esmsgforsale_speality span:nth-child(1) i').html(pubtime);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.esmsgforsale_good').html(description);
			
		};
		function errorcallback(res){
			errorfn();
		};
	}else if(msgStyle==5||msgStyle=='5#'){
		//家政
		$scheme="information";
		$('.home').css('display','block');
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
			//图片
			var photos=data.imgs||null;
			var str='';		
			if(photos!=null){
				photos=photos.split(";");
					for(var i=0;i<photos.length;i++){
						if(photos[i]!=''){
							str+="<div class='swiper-slide'><img src='"+photos[i]+"'/></div>"	
						}	
					}
			}else if(photos==null){
				$('.home_swiper').css('display','none');
			}
			$('.home_photos').append(str);
			//参数：图片对象，图片宽度，图片高度
			var w=$(window).width();
			$('.home_photos .swiper-slide img').load(function(){
				chgdivimgwh(this,w,$('.home_swiper').height(),flag=false)
			})
			var mySwiper = new Swiper ('.home_swiper', {
			    // 如果需要分页器
			    pagination: '.swiper-pagination',
			    paginationType : 'fraction',
			    preventClicks : false,
			})   
			//title
			var title=data.title||'';
			/*title=title.substring(0,16);*/
			$('.home_name_age span:nth-child(1)').html(title);
			//类别
			var classes=data.categoryName||'';
			$('.home_name_age span:nth-child(2)').html(classes);
			//评分
			var score=data.score;
			if(score==0){
				$('.home_score').css('display','none');
				$('.home_speality span:nth-child(1)').html("暂无评分");
			}else{
				Width=1.8/5*score+'rem';
				$('.home_score_star span').css('width',Width);
				$('.home_score_num').prepend(score);
				$('.home_speality span:nth-child(1)').html("该评分来自商业综合评估");
			}
			/*if(score!=null){
				Width=1.8/5*score+'rem';
				$('.home_score_star span').css('width',Width);
			}
			$('.home_score_num').prepend(score);*/
			//标签
			var catareay=data.categoryName||'';
			$('.home_class span').html(catareay);
			//
			//个人或商家
			var type=data.type||'';
			if(type==1){
				$('.home_speality span:nth-child(2)').html('个人');
			}else if(type==2){
				$('.home_speality span:nth-child(2)').html('商家');
			}
			//服务类别
			//服务特色
			var goodsfield=data.goodField||'';
			$('.homeservise .home_class span').html(goodsfield);
			//服务区域
			var district=data.serviceArea||'';
			$('.home_address span').html(district);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.home_good').html(description);
		};
		function errorcallback(res){
			errorfn();
		};
		
	}else if(msgStyle==15||msgStyle=='15#'){
		//新招聘
		$scheme="information";
		$('.newclassforjob').css('display','block');
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
				//title
			var title=data.positionName||'';
			/*title=title.substring(0,16);*/
			$('.newclassforjob_title').html(title);
			//发布时间
			var pubtime=data.createTime||'';
			$('.newclassforjob_pubtime span').html(pubtime);
			//类别
			var classes=data.categoryName||'';
			$('.newclassforjob_class span').html(classes);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.newclassforjob_des span').html(description);
		};
		function errorcallback(res){
			errorfn();
		};

	}else if(msgStyle==16||msgStyle=='16#'){
		$scheme="information";
		$('.newclassjobfor').css('display','block');
		//新求职
		
		var url="merchant/h5callback/findInformationDetailById?informationId="+sjid+"&informationType="+msgStyle+"";
		var ajaxdata='';
		ajaxpost('get',url,ajaxdata,successcallback,errorcallback);
		function successcallback(data){
			//console.log(res)
				//title
			var title=data.positionName||'';
			/*title=title.substring(0,16);*/
			$('.newclassjobfor_title').html(title);
			//发布时间
			var pubtime=data.createTime||'';
			$('.newclassjobfor_pubtime span').html(pubtime);
			//类别
			var classes=data.categoryName||'';
			$('.newclassjobfor_class span').html(classes);
			//描述
			var description=data.description||'';
			if(description!=''){
				description=description.replace(/\n/ig,"<br/>"); 
			}
			$('.newclassjobfor_des span').html(description);
			
		};
		function errorcallback(res){
			errorfn();
		};
	}
	
	
	//网络错误提示信息
	var errorfn=function(){
		var errstr='';
		errstr+="<div class='errorfn' style='position:absolute;width:100%;min-height:100%;font-size:0.4rem;color:#666;background:#fff;text-align:center;'><p style='margin-top:50%;'>网络错误,<a href='javascript:void()' class='errorclick'>点击</a>空白处处刷新重试！</p></div>"
		$('.container').html(errstr);
	}
	$(document).on('click','.errorfn',function(){
		window.location=window.location.href;
	})
	//跳转app
	var jumpto=$(".jumpToapp");
	jumpto.click(function(){
		//if(appName=="mgjofficial"||appName=="mgjofficial#"){//马管家
			$('#cover').JumpTo({
				urlScheme:'horsegj://'+$scheme+'',
				idVal:sjid,
				hrefHtml:'../../downforEShou.html',
				msgStyle:msgStyle
			})
		//}else{//Q悦
			/*$('#cover').JumpTo({
				urlScheme:'qyue://'+$scheme+'',
				idVal:sjid,
				hrefHtml:'qyuedownforEShou.html',
				msgStyle:msgStyle
			})
		}*/

	})
	
	
	
	
	
	
	//公司信息点击展开信息
	$(".click_show").click(function(){
		if($(this).html()=="展开信息"){
			$(this).html('收起信息');
			$(this).css({
				'background':'#fff url(../../images/shangsanjiao.png) no-repeat left 61% center',
				'background-size':'4% 22%'
			})
			$('.company_product').css({
				'display':'block'
			})
		}else{
			$('.company_product').css({
				'display':'none'
			})
			$(this).html('展开信息');
			$(this).css({
				'background':'#fff url(../../images/xiasanjiao.png) no-repeat left 61% center',
				'background-size':'4% 22%'
			})
		}
	})

  //求职点击图片放大 监听方式
  $(document).on('click','.job_swiper .swiper-wrapper .swiper-slide img',function(){
  		var num=$(this).parent().index();
	  	var imgLength=$('.job_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	    	displayStates:"block",
	    	ImgNum:imgLength,
	    	pages:num,
	    	ClassName:'.job_swiper'
	    });
  })
	//招聘点击图片放大
	$(document).on('click','.company_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.company_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.company_swiper'
	    });
      
	})
	//风水大师点击查看大图
	$(document).on('click','.FengShui_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.FengShui_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.FengShui_swiper'
	    });
      
	})
	//废品回收点击查看大图
	$(document).on('click','.waste_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.waste_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.waste_swiper'
	    });
      
	})
	//维修
	$(document).on('click','.repair_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.repair_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.repair_swiper'
	    });
      
	})
		//二手信息
	$(document).on('click','.esmsgforsale_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.esmsgforsale_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.esmsgforsale_swiper'
	    });
      
	})
		//家政
	$(document).on('click','.home_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.home_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.home_swiper'
	    });
      
	})
	//教育培训学校
	$(document).on('click','.eduschool_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.eduschool_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.eduschool_swiper'
	    });
      
	})
	//教育培训个人
	$(document).on('click','.edupersonal_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.edupersonal_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.edupersonal_swiper'
	    });
      
	})
	//租房
	$(document).on('click','.housefor_swiper .swiper-wrapper .swiper-slide img',function(){
		var num=$(this).parent().index();
	    var imgLength=$('.housefor_swiper').find('.swiper-wrapper').children().length;
	    $('.ImgZoomFrames').ImgZooms({
	      displayStates:"block",
	      ImgNum:imgLength,
	      pages:num,
	      ClassName:'.housefor_swiper'
	    });
      
	})
	
})