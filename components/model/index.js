const common = require("../../utils/common")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type:Boolean
    },
    title:{
      type:String
    },
    imgUrl:{
      type:String
    },
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
    /**
     * 我知道了
     */
    iSee() {
      this.setData({
        show: false
      })
    },

    /**
     * 浏览图片手指触摸动作点击
     */
    previewImg: function (e) {
      const imgUrl = e.currentTarget.dataset.src;
      common.previewImg(imgUrl)
    },
  }
})