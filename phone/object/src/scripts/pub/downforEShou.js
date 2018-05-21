$(function() {

	var tempe = 0;
	
	var msgStyle=inforType;//二手市场和房屋租赁
	
	/*/微信判断封装*/
	/*
	 *@params msgStyle==6 二手市场 
	 * //二手市场:6  房屋租赁：2  求职：10  招聘：1  维修：3   教育培训：4  家政：5  风水：7
	 *健康咨询：9    法律咨询：8  废品回收：11  家教信息：13  个人求租：14  求购12
	 * msgStyle==20// 司机
	 * msgStyle==''  商超  //新招聘：15   新求职 ：16
	 * */
	
		var sjid = idVal; //pValue
		if (navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)) {
		 	if(msgStyle==6||msgStyle=="6#"){
			/*二手市场*/
				setTimeout(function(){
				//fleaMarketDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+""; 
					//window.location="mgjofficial://fleaMarketDetail/"+sjid+"";
				},500)
				
			}else if(msgStyle==12||msgStyle=="12#"){
				setTimeout(function(){
				//fleaMarketDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+""; 
					//window.location="mgjofficial://fleaMarketDetail/"+sjid+"";
				},500)
				
			}else if(msgStyle==2||msgStyle=="2#"){
				/*房屋租赁*/
				setTimeout(function(){
					//leaseHousesDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
					//window.location="mgjofficial://leaseHousesDetail/"+sjid+"";
				},500)
				
			}else if(msgStyle==14||msgStyle=="14#"){
				setTimeout(function(){
					//leaseHousesDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
					//window.location="mgjofficial://leaseHousesDetail/"+sjid+"";
				},500)
				
			}else if(msgStyle==4||msgStyle=="4#"){
				/*家教培训*/
				setTimeout(function(){
				//educationDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
					//window.location="mgjofficial://educationDetail/"+sjid+"";
				},500)
			}else if(msgStyle==13||msgStyle=="13#"){
				/*家教培训*/
				setTimeout(function(){
				//educationDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
					//window.location="mgjofficial://educationDetail/"+sjid+"";
				},500)
				
			}else if(msgStyle==5||msgStyle=="5#"){
				/*家政没有scheme*/
				setTimeout(function(){
				//homemakingDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
					//window.location="mgjofficial://homemakingDetail/"+sjid+"";
				},500)
			}else if(msgStyle==3||msgStyle=="3#"){
				/*维修没有scheme*/
				setTimeout(function(){
				//repairDetail
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
					//window.location="mgjofficial://repairDetail/"+sjid+"";
				},500)
			}else if(msgStyle==10||msgStyle=="10#"){
				//求职
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else if(msgStyle==1||msgStyle=="1#"){
				//招聘
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else if(msgStyle==7||msgStyle=="7#"){
				//分水大师
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else if(msgStyle==8||msgStyle=="8#"){
				//法律咨询
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else if(msgStyle==11||msgStyle=="11#"){
				//废品回收
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else if(msgStyle==9||msgStyle=="9#"){
				//健康医疗
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else if(msgStyle==15||msgStyle=="15#"){
				//新招聘
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else if(msgStyle==16||msgStyle=="16#"){
				//新求职
				setTimeout(function(){
					window.location="mgjofficial://information/"+msgStyle+"/"+sjid+"";//iosurlscheme
				},500)
			}else{
				//商超
				setTimeout(function(){
					window.location="mgjofficial://";//iosurlscheme首页
				},500)
			}
				
		}
		 
	//下载客户端
				$(".btn_down").on("tap", function(e) {
					tempe++;
					if (tempe == 1) {
						setTimeout(function() {
							redirect();
							tempe = 0;
						}, 100)
					}
					
				})
	function redirect() { //跳转函数
		window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.horsegj.company";
	}
})