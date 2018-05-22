const QR = require("../../../utils/qrcode.js"); // 二维码生成器
const app = getApp();
let qrcode;
Page({
    data: {
      canvasHidden:false,
      testUrl:'http://prelaunch.horsegj.com/horsegj/dist/html/register/register.html',
      prodUrl:'http://wx.horsegj.com/horsegj/dist/html/register/register.html',
      imagePath:'',
    },
    onLoad() {
    	let loginMessage = wx.getStorageSync('loginMessage');
      let scale = 750/(app.globalData.windowWidth)/2
          scale = Math.round(scale * 100) / 100;
          console.log(scale)
        qrcode = new QR('canvas', {
            text: "http://prelaunch.horsegj.com/horsegj/dist/html/register/register.html?uid="+loginMessage.id,
            image:'/images/images/bg.jpg',
            width: 100/scale,
            height: 100/scale,
            colorLight: "white",
            correctLevel: QR.CorrectLevel.H,
        });
    },
  	onShareAppMessage(res) {
      let loginMessage = wx.getStorageSync('loginMessage');
    	if (res.from === 'button') {
      		// 来自页面内转发按钮
      		console.log(res.target);
    	}
    	return {
      		title: '邀请好友天天分钱',
      		path: '/pages/register/register?uid='+loginMessage.id,
      		success: function(res) {
        		// 转发成功
     		  },
      		fail: function(res) {
        		// 转发失败
      		}
    	};
  	}
});