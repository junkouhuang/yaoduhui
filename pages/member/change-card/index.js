// pages/member/binding-card/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bankCardId: "", //银行卡
    cardOwner: "", //持卡人
    isHandle: false,
    accountType: '', //1001:个人 1002：企业
    isDisabled: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.data.accountType = options.accountType;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    if (this.data.isHandle) {
      const res = await wx.showModal({
        content: '是否绑卡成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        console.log('确认')
        await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo');
        await wx.navigateBack();
      } else {
        console.log('取消')
        await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
      }
      this.setData({
        isHandle: false
      })
    }
  },

  //获取输入的值
  getInputValue(e) {
    const sign = e.currentTarget.dataset.sign
    const value = e.detail.value
    this.data[sign] = value
    this.setData({
      isDisabled: this.data.bankCardId != "" && this.data.cardOwner != "" ? false : true
    })
  },
  //下一步
  async handleNextStop() {

    var reg = /^(\d{16}|\d{17}|\d{19})$/;
    if (!reg.test(this.data.bankCardId)) {
      wx.showToast({
        title: '请输入正确银行卡帐号',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.cardOwner) {
      wx.showToast({
        title: '请输入持卡人姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }

    await this.requsetbindingCard()
  },
  async requsetbindingCard() {
    try {
      const params = {
        acctNo: this.data.bankCardId,
        acctName: this.data.cardOwner,
        changeType: '02',
        deviceType: "MOBILE"
      }
      wx.showLoading({
        title: '请稍后',
      })
      let url = '';
      if (this.data.accountType == 1001) { //个人
        url = '/ydh/mall/individualwalletBasic/virtualAcctBaseModify';
      }
      if (this.data.accountType == 1002) { //企业
        url = '/ydh/mall/walletBasic/virtualAcctBaseModify';
      }
      const res = await wx.$http.post(url, params);
      if (res.data.returnCode == "ERR_0000") {
        this.setData({
          isHandle: true
        })
        let url = encodeURIComponent(`${res.data.data.nextPageUrl}&AccessToken=${res.data.data.accessToken}`)
        wx.hideLoading()
        wx.navigateTo({
          url: `/pages/web-view/index?url=${url}`,
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.log(err)
    }
  }
})