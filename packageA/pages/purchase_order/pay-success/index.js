Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLoad(options) {
    this.setData({
      type: options.type
    })
  },

  //确认支付
  paySuccess() {
    wx.navigateBack({
      delta: 1
    })
    wx.setStorageSync("orderStatus",1);
  },

  //查看订单
  xgd() {
    wx.navigateBack({
      delta: 1
    })
    wx.setStorageSync("orderStatus",2);
  },

  //完成状态列表
  jumpFinsh(){
    wx.navigateBack({
      delta: 1,
    })
    wx.setStorageSync("orderStatus",2);
  },

  //首页
  home() {
    wx.switchTab({ //关闭所有页面，打开到应用内的某个页面
      url: '/pages/home/index'
    })
  }
})