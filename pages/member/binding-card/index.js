// pages/member/binding-card/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bankCardId: "", //银行卡
    cardOwner: "", //持卡人
    isHandle: false,
    isDisabled:true,
    accountType:'',
    userType:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.accountType = options.accountType;
    this.setData({
      accountType: options.accountType,
      userType: options.userType
    })
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
        if(this.data.accountType == 1002){//企业开户
          await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo');
          wx.navigateBack();
        }
        if(this.data.accountType == 1001){//个人开户
          await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo');
        }
        
      
      } else {
        if(this.data.accountType == 1002){//企业开户
        await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
        }
        if(this.data.accountType == 1001){//个人开户
          await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo');
        }
        //wx.navigateBack();
        console.log('取消')
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
    let can = this.data.bankCardId != '' && this.data.cardOwner !=''?false:true;
    this.setData({
      isDisabled:can
    })
  },
  //下一步
  async handleNextStop() {
    //var reg = /^(\d{16}|\d{17}|\d{19}|\d{20})$/;
    var reg = /^(\d{10,25})$/;
    if (!reg.test(this.data.bankCardId)) {
      wx.showToast({
       title: '请输入正确银行卡帐号',
        icon: 'none',
        duration: 2000
      })
     return
    }

    if (!this.data.cardOwner) {
      const msg = this.data.accountType == '1002' ? this.data.userType == '4' ? '法人名称' : this.data.userType == '2' ? '企业名称' : '' : this.data.accountType == '1001' ? '持卡人姓名' : ''
    
      wx.showToast({
        title: '请输入' + msg,
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
        bankCardId: this.data.bankCardId,
        cardOwner: this.data.cardOwner
      }
      wx.showLoading({
        title: '请稍后',
      })
      let url = "";
      if (this.data.accountType == '1001') { //个人开户
        url = '/ydh/mall/individualwalletBasic/bindBankCard'
      }
      if (this.data.accountType == '1002') {//企业开户
        url = '/ydh/mall/walletBasic/bindBankCard'
      }
      const res = await wx.$http.post(url, params, {
        'content-type': 'application/x-www-form-urlencoded'
      })
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