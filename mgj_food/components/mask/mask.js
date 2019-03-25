// components/mask/mask.js
Component({
  /**
   * 组件的属性列表
   * @position布局位置
   * @maskTap事件，父捕获
   */
  properties: {
    position:{
      type: String,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    contentShow:false
  },

  /**
   * 组件的方法列表
   */
  lifetimes: {       //生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created(){
     
    },
    attached(){

    },
    ready(){
      setTimeout(()=>{
        this.setData({
          contentShow:true
        })
      },200)

    },
    moved(){},
    detached(){
 
    }
  },
  methods: {
    maskclick(e) {
      console.log("mask click")
      this.triggerEvent('maskclick')
    },
    move(e){
      return false;
    }
  }
})
