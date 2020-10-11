// pages/confirm_order/template/pay_result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      shopEnterpriseName: options.shopEnterpriseName
    })
  },

  /**
   * 首页
   */
  xgd(){
    wx.redirectTo({
      url: '/packageA/pages/purchase_order/index?status=1',
    })
  }
})