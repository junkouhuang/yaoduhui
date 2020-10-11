Page({

  /**
   * 页面的初始数据
   */
  data: {
    realData: {}
  },

  /**
    * 生命周期函数--监听页面显示
    */
  async onLoad() {
    await this.requsetRealData();
  },

  /**
   * 查询用户信息
   * */
  async requsetRealData() {
    const res = await wx.$http.post('/authorizes/user/detail', { source: "+p/LQRPTDPW2/FIr1nZO8d2VkBDTSOg2s8mo/nMOG4rOLUbvFPjowQ=="}, { 'content-type': 'application/x-www-form-urlencoded' })
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

 

  /**
   * 设置新密码
   * 
   */
  update_password() {
    wx.navigateTo({
      url: '/packageA/pages/update_password/index',
    })
  }
})