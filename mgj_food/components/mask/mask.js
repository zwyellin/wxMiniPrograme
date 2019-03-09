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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    maskclick(e) {
      this.triggerEvent('maskclick')
    },

  }
})
