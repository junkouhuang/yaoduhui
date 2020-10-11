// pages/member/manage-accout-update/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    virtualAccountId: '', //银行卡号
    accountType: '', //账户类型
    accountId: '',
    bizAddress: '',
    supplementStatus: '', //'0 待补充, 1确认中 2.成功 3.失败',
    userType: '',
    businessLicenseCode: '', //社会统一信用代码
    isHandle:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let optionsArray = JSON.parse(options.parameter);
    console.log(optionsArray);
    that.setData({
      virtualAccountId: optionsArray.virtualAccountId,
      accountType: optionsArray.accountType,
      accountId: optionsArray.accountId,
      bizAddress: optionsArray.bizAddress,
      userType: optionsArray.userType,
      businessLicenseCode: optionsArray.businessLicenseCode,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow () {
    let that = this;
    that.getfindSupplementInfo();
    if (this.data.isHandle) {
      if(this.data.accountType == '1001'){
        await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo')
      }
      if(this.data.accountType == '1002'){
        await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
      }
    } else {
      this.setData({
        isHandle: true
      })
    }
  },

  /**
   * 资料补充
   */
  async goSupplement() {
    let that = this;
    let parameter = {
      accountType: that.data.accountType,
      bizAddress: that.data.bizAddress,
      supplementStatus: that.data.supplementStatus,
      accountId: that.data.accountId,
      userType: that.data.userType,
      businessLicenseCode: that.data.businessLicenseCode,
    }
    console.log(parameter)
    parameter = JSON.stringify(parameter);
    if (that.data.supplementStatus == 0) {
      wx.navigateTo({
        url: `/pages/member/data-replenish/index?parameter=${parameter}`,
      })
    } else {
      if (that.data.accountType == 1001) {
        return wx.showToast({
          title: '资料已补充', //标题，不写默认正在加载
          icon: 'none',
          duration: 2000
        })
      }

      wx.navigateTo({
        url: `/pages/member/data-replenish-detail/index?parameter=${parameter}`,
      })
    }
  },

  /**
   * 变更银行卡
   */
  async goUpdateBankCard() {
    let that = this;
    //账户类型和银行卡号
    wx.navigateTo({
      url: `/pages/member/binging-card/index?accountType=${that.data.accountType}&virtualAccountId=${that.data.virtualAccountId}`,
    })
  },

  /**
   * 获取补充信息
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
        if (res.data.data) {
          that.setData({
            supplementStatus: res.data.data.supplementStatus, // '0 待补充, 1确认中 2.成功 3.失败',
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  },

  //修改交易密码
  async changePassword() {
    try {
      wx.showLoading({
        title: '请稍后...',
      })
      let url = "";
      if (this.data.accountType == '1001') { //个人开户
        url = "/ydh/mall/individualwalletBasic/resetPassWord";
      }
      if (this.data.accountType == '1002') { //企业开户
        url = "/ydh/mall/walletBasic/resetPassWord";
      }
      const res = await wx.$http.post(url)
      wx.hideLoading()
      if (res.data.returnCode == "ERR_0000") {
        const webUrl = encodeURIComponent(`${res.data.data.nextPageUrl}&AccessToken=${res.data.data.accessToken}`)
        wx.navigateTo({
          url: `/pages/web-view/index?url=${webUrl}`,
        })
      }else if(res.data.returnCode=='25431'){
        wx.showToast({
          title: '商户钱包未打开或状态异常请联系相关供应商',
          icon:'none',
          duration:3000
        })
      }else{
        wx.showToast({
          title: res.data.returnMsg,
          icon:'none',
          duration:'3000'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.log(err)
    }
  }
})