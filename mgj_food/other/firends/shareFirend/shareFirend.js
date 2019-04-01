const QR = require("../../../utils/qrcode.js"); // 二维码生成器
const app = getApp();
let qrcode;
Page({
    data: {
      canvasHidden:false,
      testUrl:'http://prelaunch.horsegj.com/horsegj/dist/html/register/register.html',
      prodUrl:'http://wx.horsegj.com/horsegj/dist/html/register/register.html',
      imagePath:'',

      // 
      contentHeight:600,//默认
      currentIndex:null,//滑块当前在第几个位置
      biaoti:["邀请好友","邀请好友"]
    },
    onLoad(options) {
      let {index=0}=options;
      this.setData({
        currentIndex:index
      })
    	let loginMessage = wx.getStorageSync('loginMessage');
      let scale = 750/(app.globalData.windowWidth)/2
          scale = Math.round(scale * 100) / 100;
          console.log(scale)
        qrcode = new QR('canvas', {
            text: "http://wx.horsegj.com/horsegj/dist/html/register/register.html?uid="+loginMessage.id,
            image:'../../images/bg.jpg',
            width: 100/scale,
            height: 100/scale,
            colorLight: "white",
            correctLevel: QR.CorrectLevel.H,
        });

      // 获取高度
      //获取系统信息 主要是为了计算产品scroll的高度
      wx.getSystemInfo({
        success: (res)=> {
          this.setData({
            contentHeight: res.windowHeight,
            shopSearchScrollHeight: res.windowHeight - 216*(app.globalData.windowWidth/750)
          });
        }
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
      		path: '/other/register/register?uid='+loginMessage.id,
      		success: function(res) {
        		// 转发成功
     		  },
      		fail: function(res) {
        		// 转发失败
      		}
    	};
    },
    gotoIndexTap(){
      wx.switchTab({
        url:"/pages/index/index",
      });
    },
    swiperChange(e){
      let {current}=e.detail;
      console.log("当前current",current)
      wx.setNavigationBarTitle({
        title: this.data.biaoti[current]
      });
    }

});