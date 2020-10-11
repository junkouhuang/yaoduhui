// pages/put_record/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerDetail:{},
    userInfo:{},
    show:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const userInfo = await wx.getStorageSync('put_record_data')
    this.setData({
      userInfo
    })
    const detail = await wx.getStorageSync('detail__data')
    this.setData({
      customerDetail:detail,
      show:true
    })
    
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
  handlePreviewImage(e){
    const item = e.currentTarget.dataset.item
    wx.previewImage({
      urls: this.data.customerDetail.qualificationsPaths[0],
      current: item
    })
  }
})