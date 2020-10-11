// pages/member/data-replenish-detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    supplementStatus: '', //提交状态
    visaDate: '',
    lostDate: '',
    businessLicenseImg: '',
    idImgFront: '',
    idImgBank: '',
    accountId: '',
    businessLicenseCode: '',
    bizAddress: '',
    optionsArray:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let optionsArray = JSON.parse(options.parameter);
    that.setData({
      accountId: optionsArray.accountId,
      bizAddress: optionsArray.bizAddress,
      optionsArray:optionsArray
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
    let that = this;
    that.getfindSupplementInfo();
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
   * 重新提交资料
   */
  handleNextStop() {
    //返回上一页
    // wx.navigateBack({
    //   delta: 1,
    // })
    
    let  array=JSON.stringify(this.data.optionsArray)
    wx.navigateTo({
      url: `/pages/member/data-replenish/index?parameter=${array}`,
    })
  },

  /**
   * 查看补充资料
   */
  async getfindSupplementInfo() {
    let that = this;
    try {
      const data = {
        virtualBsyId: this.data.accountId,
      }
      const res = await wx.$http.post('/ydh/mall/walletBasic/findSupplementInfo', data, {
        'content-type': 'application/x-www-form-urlencoded'
      });
      if (res.data.returnCode == 'ERR_0000') {
        that.setData({
          visaDate: res.data.data.visaDate,
          lostDate: res.data.data.lostDate,
          businessLicenseImg: res.data.data.businessLicenseImg,
          //idImgFront: res.data.data.idImgFront,
          //idImgBank: res.data.data.idImgBank,
          supplementStatus: res.data.data.supplementStatus,
          bizAddress: res.data.data.bizAddress ? res.data.data.bizAddress : that.data.bizAddress,
          businessLicenseCode: res.data.data.businessLicenseCode
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

})