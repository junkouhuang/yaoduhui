// pages/member/open-complete/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: '',
    content: {
      title: '',
      detail: '',
      imgUrl: '',
      btnText: ''
    },
    accountType: '', //开户类型
    moneyNumber: '',
    rcvAccount: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let title = '';
    if (options.status == 'openSuccess') {
      title = '开户';
      this.setData({
        status: options.status,
        'content.title': '恭喜您，开户成功！',
        'content.detail': '您可以在【钱包账户】中查看账户信息',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/ok_green.png',
        'content.btnText': '知道了',
      })
    } else if (options.status == 'openFail') {
      title = '开户';
      this.setData({
        status: options.status,
        accountType: options.accountType,
        'content.title': '开户失败',
        'content.detail': '',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/error.png',
        'content.btnText': '重新开户',
      })
    } else if (options.status == 'replenishSuccessfuFail') {
      title = '补充资料';
      this.setData({
        status: options.status,
        accountType: options.accountType,
        'content.title': '补充资料失败',
        'content.detail': '',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/error.png',
        'content.btnText': '知道了',
      })
    } else if (options.status == 'rechargeSuccessfu') {
      title = '充值';
      this.setData({
        status: options.status,
        'content.title': '充值成功',
        'content.detail': '充值金额：' + options.moneyNumber ? options.moneyNumber : 0 + '元',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/ok_green.png',
        'content.btnText': '知道了',
      })
    } else if (options.status == 'withdrawalSuccessful') {
      title = '提现';
      this.setData({
        status: options.status,
        'content.title': '提现成功',
        'content.detail': '提现金额：' + options.moneyNumber ? options.moneyNumber : 0 + '元',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/ok_green.png',
        'content.btnText': '知道了',
      })
    } else if (options.status == 'replenishSuccessfu') {
      title = '提交资料结果';
      this.setData({
        status: options.status,
        'content.title': '您已成功提交资料！',
        'content.detail': '等待渤海银行确认，谢谢您对我们工作的支持！',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/ok_green.png',
        'content.btnText': '知道了',
      })
    } else if (options.status == 'transferSuccessful') {
      title = '转账';
      this.setData({
        status: options.status,
        moneyNumber: options.moneyNumber,
        rcvAccount: options.rcvAccount,
        'content.title': '转账成功',
        'content.detail': '',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/ok_green.png',
        'content.btnText': '知道了',
      })
    } else if (options.status == 'changSuccessful') {
      title = '更换银行卡';
      this.setData({
        status: options.status,
        'content.title': '银行卡变更成功',
        'content.detail': '',
        'content.imgUrl': 'https://edm.xinquanjk.com/upload/iconfont/202003/20/ok_green.png',
        'content.btnText': '知道了',
      })
    }
    wx.setNavigationBarTitle({
      title: title
    })
  },

  complete() {
    if (this.data.status != 'openFail') {
      console.log('开户成功了');
      wx.navigateTo({
        url: '/pages/member/index?again=1',
      })
    } else if (this.data.status == 'openFail') {
      console.log('开户失败了');
      if (this.data.accountType == 1001) {
        wx.navigateTo({
          url: "/pages/member/binding-card/index?accountType=" + this.data.accountType + "&userTyp='' ",
        })
      } else if (this.data.accountType == 1002) {
        wx.navigateBack({
          delta: 1,
        })
      }
    }
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
  // onShareAppMessage: function () {

  // }
})