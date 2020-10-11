
Page({

  /**
   * 页面的初始数据
   */
  data: {
    withdraw:0,
    openid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenid();
    this.setData({
      withdraw: options.withdraw
    })
  },

  /**
   * 微信提现
   */
  async settleApply(){
    const data = await wx.$http.post('/ydh/mall/agentCommissionSettlement/settleApply', { amount: this.data.withdraw, openId: this.data.openid }, { 'content-type': 'application/x-www-form-urlencoded' });
    wx.redirectTo({
      url: '/packageA/pages/earnings/success/index',
    })
  },


   async getOpenid() {
     const data =await  wx.login();
     let res = await wx.$http.get('/common/wxmp/ydh/login', { code: data.code }, { 'content-type': 'application/x-www-form-urlencoded' })
     this.data.openid = JSON.parse(res.data.data).openid;//注册②
  },
})