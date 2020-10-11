// pages/put_record/customer/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    customerList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options){
    const userInfo = await wx.getStorageSync('put_record_data')
    this.setData({
      userInfo
    })
    await this.requsetUserInfoData()
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
  //请求建档详情
  async requsetUserInfoData(){
    let enterpriseId = this.data.userInfo.enterpriseId
    let id = this.data.userInfo.id
    const res = await wx.$http.post(`/ydh/mall/archive/credentialInfo?enterpriseId=${enterpriseId}&id=${id}`)
    if (res.data.returnCode =='ERR_0000'){
      this.setData({
        customerList: res.data.data.qualificationsDTOList
      })
    }
  },
  //查看建档详情的每一项
  async handleLookDetail(e){
    const detail = e.currentTarget.dataset.detail
    await wx.setStorageSync('detail__data', detail)
    wx.navigateTo({
      url: '/pages/put_record/detail/index',
    })
  }
})