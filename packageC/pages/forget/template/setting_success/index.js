// pages/register_success/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clearTimer: '',
    timer: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let that = this;
    that.data.clearTimer = setInterval(() => {
      if (that.data.timer > 0) {
        that.setData({
          secode: that.data.timer--
        })
      } else {
        wx.removeStorageSync("access_token");
        clearInterval(that.data.clearTimer);
        wx.reLaunch({
          url: '/packageC/pages/login/index'
        })
      }
    }, 1000)
  },
})