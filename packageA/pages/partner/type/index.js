// pages/partner/type/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    salesmanType: '',
    platformActive: false,
    enterpriseActive: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.salesmanType = options.salesmanType;
  },

  onUnload() {
    wx.removeStorageSync("enterprise");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const result = wx.getStorageSync('enterprise');
    if (result) {
      wx.navigateTo({
        url: '/packageA/pages/partner/info/index?salesmanType=' + this.data.salesmanType,
      })
    }
  },

  platformHandle() {
    this.setData({
      platformActive: !this.data.platformActive,
      enterpriseActive: this.data.platformActive
    })

    wx.removeStorageSync('enterprise');

    wx.navigateTo({
      url: '/packageA/pages/partner/info/index?salesmanType=' + this.data.salesmanType,
    })
  },

  enterpriseHandle() {
    wx.navigateTo({
      url: '/packageA/pages/partner/enterprise/index',
    })
    this.setData({
      platformActive: this.data.enterpriseActive,
      enterpriseActive: !this.data.enterpriseActive
    })
  },
})