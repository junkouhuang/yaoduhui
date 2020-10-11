// pages/my/template/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    realData:{}
  },

 /**
   * 生命周期函数--监听页面显示
   */
  async onShow(){
    //await this.requsetRealData();
    this.setData({
      version: wx.getAccountInfoSync().miniProgram.version || '2.1.4'
    })
  },

  /**
   * 查询用户实名信息
   * */
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

    //退出
    loginout: function () {
      wx.showModal({
        title: '',
        content: '确定退出登录？',
        success: function (res) {
          if (res.confirm) {
            wx.removeStorageSync('searchHistrory_data');
            wx.removeStorageSync('car_alreadySelectNum');
            wx.removeStorageSync('EnterpriseList');
            wx.removeStorageSync('manageAuth');
            wx.removeStorageSync('nickname');
            wx.removeStorageSync('accountId');
            wx.removeStorageSync('avatar');
            wx.reLaunch({
              url: '/packageC/pages/login/index'
            })
          }
        }
      })
    },

  /**
   * 点击实名认证
   * */
  async handleGoReal() {
    if (!this.data.realData.status && this.data.realData.status !== 0) {
      wx.navigateTo({
        url: '/pages/member/real-name/index',
      })
      return
    } else {
      wx.navigateTo({
        url: '/packageA/pages/real-detail/index',
      })
    }
  },

  /**
   * 账户与安全
   * 
   */
  account(){
    wx.navigateTo({
      url: '/packageA/pages/account/index',
    })
  }
})