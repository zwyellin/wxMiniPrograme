
Page({
	data:{
		service:['送达时间问题','支付问题','余额/提现问题','活动规则问题','关于首单立减']
	},
	serviceIndex(e){
		let { index, title } = e.currentTarget.dataset;
		wx.navigateTo({
			url: '/other/firends/serviceText/serviceText?index='+ index + '&title=' + title,
		});
	}
});