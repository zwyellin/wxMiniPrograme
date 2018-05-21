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
	 * @pramas typeNum==0 跳转商家详情
	 * */
		var typeNum=toType;
		var sjid = idVal; //pValue
		var $id=goodsid;
		if (navigator.userAgent.match(/(iPhone|iPod|iPad|iOS);?/i)){
			if(typeNum==0){
				//商家
				window.location="mgjofficial://merchant/"+sjid+""; 
			}
			if(typeNum==1){
				//团购券
				window.location="mgjofficial://groupPurchaseCoupon/"+sjid+""; 
			}
		 	if(typeNum==3){//单品分享
		 		window.location="mgjofficial://merchant/"+sjid+"/"+$id+""; 
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