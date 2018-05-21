var url = window.location.href;
/*var url="http://192.168.199.81/EShouMsg.html?id=1&appName=""";*/
function getParameter(paraStr, url) {
	var result = "";
	//获取URL中全部参数列表数据
	var str = "&" + url.split("?")[1];
	var paraName = paraStr + "=";
	// alert(paraName);
	//判断要获取的参数是否存在
	if (str.indexOf("&" + paraName) != -1) {
		//如果要获取的参数到结尾是否还包含“&”
		if (str.substring(str.indexOf(paraName), str.length).indexOf("&") != -1) {
			//得到要获取的参数到结尾的字符串
			var TmpStr = str.substring(str.indexOf(paraName), str.length);
			//截取从参数开始到最近的“&”出现位置间的字符
			result = TmpStr.substr(TmpStr.indexOf(paraName), TmpStr.indexOf("&") - TmpStr.indexOf(paraName));
		} else {
			result = str.substring(str.indexOf(paraName), str.length);
		}
	} else {
		result = "无此参数";
	}
	return (result.replace("&", ""));
} //调用方法：var 变量名 = getParameter("要获取的参数名", URL地址)
var r = getParameter("merchantId", url); 
var I = getParameter("id", url); 
var N = getParameter("scheme", url); 
var house=getParameter("informationType", url); 
var user=getParameter("userId", url); 
var order=getParameter("groupBuyId", url); 
var jobhunt=getParameter("informationId", url); 
var goods=getParameter("goodsId", url);
var purchase=getParameter("groupPurchaseMerchantId",url);
var conpun=getParameter("groupPurchaseCouponId",url);
var type=getParameter("jumpType",url);
var appUser = getParameter("uid",url)
//根据得到的结果可以使用
var pName = r.split("=")[0]; //获取参数名
var pValue = r.split("=")[1]; //获取参数值//测试输出：
var appname=N.split("=")[1];
var idVal=I.split("=")[1];
var inforType=house.split("=")[1];
var userid=user.split("=")[1];
var orderid=order.split("=")[1];
var inforId=jobhunt.split("=")[1];//获取求职招聘的id
var goodsid=goods.split("=")[1];//商超
var purchaseId=purchase.split("=")[1]//团购
var conpunid=conpun.split("=")[1]//代金券
var toType=type.split("=")[1]//跳转app类型判断
var uid = appUser.split("=")[1]//用户的id
