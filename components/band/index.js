// components/band/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    //企业入驻
    band() {
      wx.navigateTo({
        url: '/packageB/pages/band/search/index'
      })
    },
  }
})
