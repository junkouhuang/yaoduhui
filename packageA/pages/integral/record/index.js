// pages/integral/record/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarList: ['充值', '冻结', '解冻/赎回'],
    lineLeft: ['42rpx', '317rpx', '590rpx'],
    activeIndex: 0,
    activeWidth: '64rpx'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  handleToggleNavber(e) {
    const index = e.currentTarget.dataset.index
    if (index !== this.data.activeIndex) {
      switch (index) {
        case 0:
        case 1:
          this.setData({
            activeIndex: index,
            activeWidth:'64rpx'
          })
          break;
        case 2:
          this.setData({
            activeIndex: index,
            activeWidth: '130rpx'
          })
      }
    }
  }
})