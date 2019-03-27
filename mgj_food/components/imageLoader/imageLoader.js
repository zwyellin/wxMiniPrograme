Component({
  externalClasses: ['my-class'],
  properties: {
    //原始图片
    defaultSrc: {
      type:String,
      value:"../../images/merchant/merchantLogo.png"
    },
    src: String,
  
    //图片剪裁mode，同Image组件的mode
    mode: String
  },
  data: {
    finishLoadFlag: false
  },
  methods: {
    finishLoad: function (e) {
      this.setData({
        finishLoadFlag: true
      })
      console.log("图片加载完毕")
    }
  }
})