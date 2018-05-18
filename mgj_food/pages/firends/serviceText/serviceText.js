Page({
	data:{
		serviceText:[{
			title:'送达时间问题：',
			content:[
				'Q. 平均送达时间为多长？',
				'A. 平均送达时间为30-40分钟。如遇恶劣天气（雨.雪等）配送时间会延长，请您耐心等待。',
				'Q. 超时未送达怎么办？',
				'A. 若您下单超过40分钟还未送达，您可以直接在订单详情中找到骑手号码联系骑手催单，或者拨打客服热线反馈问题。'
			]
		},{
			title:'支付问题：',
			content:[
				'Q. 为什么会无法支付？',
				'A. 您必须在绑定手机号才能进行支付。',
				'Q. 订单取消后钱如何返还？',
				'A. 资金会直接返还在您的马管家账户余额中，请您点击“我的”-“我的余额”查看收支明细。',
				'Q. 支付过程中，订单显示未完成，支付款项却被扣了怎么办？',
				'A. 这属于第三方（银行/微信/支付宝）数据传输卡顿问题，款项会原路返回您的支付账户。'
			]
		},{
			title:'余额/提现问题：',
			content:[
				'Q. 我的余额中的资金怎么使用？',
				'A. 在您订单的付款阶段会需要选择付款方式，您可以直接勾选余额支付。若余额金额少于订单金额，您可以勾选余额之外的另一种付款方式，余额扣除后剩余的部分由另一种付款方式支付。',
				'Q. 余额提现有什么规则？',
				'A. 余额可在App内发起提现，并在三个工作日内到账。（注：工作日指周末及法定假日以外的日子，时间由发起提现的第二天为第一个工作日，若第二天为周末或者法定假日，则休息过后的第一天为第一个工作日。）',
				'Q. 为什么余额提现三天还没到账？',
				'A. 提现失败的原因可能有：1.银行卡信息错误；2.账户存在风险。以上两种情况都会导致提现被驳回。余额会回到您的马管家账户中。'
			]
		},{
			title:'活动规则问题：',
			content:[
				'Q. 我是新用户为什么不能使用新用户立减？',
				'A. 新用户是指您的下单设备，下单手机号都是第一次在马管家平台使用。以上任意条件不满足，都无法享受新用户优惠。',
				'Q. 优惠活动规则是什么',
				'A. 在活动不共享的情况下，新用户首单立减>满减活动>商家红包>满赠活动。活动是否共享由您所在区域的马管家运营中心确定。'
			]
		},{
			title:'关于首单立减：',
			content:[
				'Q. 我确定是新用户，但是我在支付的时候无法享受首单立减？',
				'A. 您如果确定需要让当前待支付订单享受首单立减，那么您必须先将订单列表中其他待支付订单取消，当前订单才会认定为"首单"'
			]
		}],
		itemObject:{}
	},
	onLoad(options){
		let { index, title } = options;
		console.log(options)
		wx.setNavigationBarTitle({
  			title: title
		})
		this.setData({
			itemObject:this.data.serviceText[index]
		})
	}
})