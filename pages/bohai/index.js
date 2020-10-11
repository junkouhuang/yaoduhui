// pages/web-view/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    const url = decodeURIComponent(options.url).replace('https://app.cbhb.com.cn', "https://www.xinquanjk.com")
    that.setData({
      url: url
    })
  },
  onUnload(){
    wx.navigateBack({
      delta: 1,
    })
  }
})