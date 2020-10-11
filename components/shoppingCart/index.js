// components/shoppingCart/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isHide:{
      type: Boolean,
      value: true
    },
  },
  
  pageLifetimes: {
    show: function(e) {
      // 页面被展示
      console.log("----====")
      this.carlist()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    selN: 0, //购物车选中数量
  },

  /*组件所在页面的生命周期 */
  pageLifetimes: {
    show: function () {
      // 页面被展示
      this.carlist()
    },
    hide: function () {
      // 页面被隐藏
      //console.log("页面被隐藏")
    },
    resize: function (size) {
      // 页面尺寸变化
      console.log("页面尺寸变化")
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
   * 购物车列表
   */
    async carlist() {
      const that = this;
    
      let selN = await wx.getStorageSync('car_alreadySelectNum') || 0
    
      that.setData({
        selN:selN
      })
      console.log(that.data.selN)
    },
    /**
     * 去往购物车
     */
    toCar() {
      wx.switchTab({
        url: '/pages/car/index',
      })
    }
  }
})
