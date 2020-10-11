
Page({

  /**
   * 页面的初始数据
   */
  data: {
    essentialList: [
      // { qualificationsName: '员工管理', url:'/packageA/pages/shop-guanli/staff/index'},
      { qualificationsName: '起送价设置', url:'/packageA/pages/shop-guanli/price/index' },
      { qualificationsName: '纸质资料接收地址', url:'/packageA/pages/shop-guanli/receipt_address/index'}
    ]
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
  handleGoToPage(e){
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url,
    })
  }
})