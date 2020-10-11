// pages/member/manage-account/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountType:'',//1001:个人 1002:企业
    isHandle:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.accountType = options.accountType;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
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

  async handleGoToPage(e){
    const sign = e.currentTarget.dataset.sign
    let url = null
    switch(sign){
      case 'phone':
        url= '/pages/member/change-phone/index?accountType='+this.data.accountType
        break;
      case 'card':
        url= '/pages/member/change-card/index?accountType='+this.data.accountType
        break;  
    }
    wx.navigateTo({
      url,
    })
  },
  //修改交易密码
  async changePassword(){
    try {
      wx.showLoading({
        title: '请稍后...',
      })
      let url = "";
      if(this.data.accountType == '1001'){ //个人开户
        url = "/ydh/mall/individualwalletBasic/resetPassWord";
      }
      if(this.data.accountType == '1002'){ //企业开户
        url = "/ydh/mall/walletBasic/resetPassWord";
      }

      const res = await wx.$http.post(url)
      if (res.data.returnCode == "ERR_0000") {
        const webUrl = encodeURIComponent(`${res.data.data.nextPageUrl}&AccessToken=${res.data.data.accessToken}`)
        wx.hideLoading()
        this.data.isHandle = true;
        wx.navigateTo({
          url: `/pages/web-view/index?url=${webUrl}`,
        })
      }
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      console.log(err)
    }
  }
})