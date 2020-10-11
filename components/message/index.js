// components/confirm.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
    },
    show: {
      type: Boolean,
    },
  },


  /**
   * 组件的初始数据
   */
  data: {

  },
  attached: function () {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //明白了
    isee() {
      this.setData({
        show: false
      })
      this.triggerEvent('getData', false)
    }
  }
})