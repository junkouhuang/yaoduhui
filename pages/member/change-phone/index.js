// pages/member/change-phone/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: '',
    isHandle:'',
    accountType:'',//1001:个人 1002：企业
    isDisabled:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.accountType = options.accountType;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    if (this.data.isHandle) {
      const res = await wx.showModal({
        content: '是否修改成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
      } else {
        console.log('取消')
      }
      this.setData({
        isHandle: false
      })
    }
  },

  handleGetPhone(e) {
    const number = e.detail.value
    this.data.phoneNumber = number
    if ((/^1[3456789]\d{9}$/.test(this.data.phoneNumber))) {
      this.setData({
        isDisabled:false
      })
    }else{
      this.setData({
        isDisabled: true
      })
    }
  },
  async handleNextStop() {
    if (!(/^1[3456789]\d{9}$/.test(this.data.phoneNumber))) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    try{
      wx.showLoading({
        title: '请稍后...',
      })
      let url = '';
      if(this.data.accountType == 1001){ 
        url = '/ydh/mall/individualwalletBasic/virtualAcctBaseModify';
      }
      if(this.data.accountType == 1002){
        url = '/ydh/mall/walletBasic/virtualAcctBaseModify';
      }
      const res = await wx.$http.post(url, {
        mobilePhone: this.data.phoneNumber,
        changeType: '01',
        deviceType: 'MOBILE'
      })
      if (res.data.returnCode == "ERR_0000") {
        this.setData({
          isHandle: true
        })
        const webUrl = encodeURIComponent(`${res.data.data.nextPageUrl}&AccessToken=${res.data.data.accessToken}`)
        wx.hideLoading()
        wx.navigateTo({
          url: `/pages/web-view/index?url=${webUrl}`,
        })
      }

    }catch(err){
      console.log(err)
      wx.hideLoading()
    }
  }
})