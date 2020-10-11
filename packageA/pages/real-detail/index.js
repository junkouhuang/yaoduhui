Page({

  /**
   * 页面的初始数据
   */
  data: {
    realData:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow () {
    await this.requsetRealData()
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
  //查询实名认证信息
  async requsetRealData() {
    const res = await wx.$http.post('/ydh/user/authentication/find')
    if (!res.data.data) {
      this.setData({
        realData: {}
      })
      return

    } else {
      this.setData({
        realData: res.data.data
      })
      return
    }
  },
  //重新认证
  handleNextStop(){
    wx.navigateTo({
      url: '/pages/member/real-name/index',
    })
  }
})