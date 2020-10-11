// pages/register_success/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let that = this;
    let data = {
      // username: getApp().globalData.reg2.username,
      // password: getApp().globalData.reg2.password,
      // rookie: '',
      // passcode: ''
      phone: getApp().globalData.reg2.phone,
      sign: getApp().globalData.reg2.sign,
    }
    that.passport(data)
  },

  home(){
    wx.switchTab({
      url: '/pages/home/index',
    })
  },

  /**
   * 绑定企业
   */
  band(){
    wx.reLaunch({
      url: '/packageB/pages/band/search/index',
    })
  },
  /**
   * 静默登录
   */
  async passport(data) {
    let that = this;
    // let res = await wx.$http.post('/authorize/security/user/passport', data, { 'content-type': 'application/x-www-form-urlencoded' })
    // if (res.data.returnCode == "ERR_0000") {
    //   wx.setStorageSync('access_token', res.data.data.token.access_token);
    // }
    let res = await wx.$http.post('/authorize/security/passcode', data, { 'content-type': 'application/x-www-form-urlencoded' })
    if (res.data.returnCode == "ERR_0000") {
      const token_type = res.data.data.token.token_type;
      const access_token = res.data.data.token.access_token;
      wx.setStorageSync('access_token', `${token_type} ${access_token}`);
    }
  }
})