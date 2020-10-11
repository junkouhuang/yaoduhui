Page({

  /**
   * 页面的初始数据
   */
  data: {
    number:'',
    account:'',
    message:'',
    available:0,
    isHandle:false,
    accountType:'',
    isDisabled:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading({
      title: '加载中...',
    })
    this.data.accountType = options.accountType;
    this.setData({
      accountType: this.data.accountType
    })
  
    await this.requestAccountData()
    wx.hideLoading()
  }, 

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    if (this.data.isHandle) {
      const res = await wx.showModal({
        content: '是否转账成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        // await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
        wx.navigateBack()
      } else {
        console.log('取消')
      }
      this.setData({
        isHandle: false
      })
    } 
  },

  //下一步
  async handleNextStop(){
    if (!this.data.account) {
      wx.showToast({
        title: '请输入鑫泉账户',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.number) {
      wx.showToast({
        title: '请输入转账金额',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (this.data.number<0.01) {
      wx.showToast({
        title: '转账金额不能小于0.01',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if(this.data.number>this.data.available){
      wx.showToast({
        title: '转账金额不能大于可用余额',
        icon: 'none',
        duration: 2000
      })
      return 
    }
    try{
      const data = {
        amount: this.data.number,
        rcvAccount: this.data.account,
        memo:this.data.message,
        rcvVirlAcctType:'01'
      }
      wx.showLoading({
        title: '加载中...',
      })

      let url = "";
      if(this.data.accountType == '1001'){ //个人
        url = "/ydh/mall/individualwalletBasic/transfer";
      }
      if(this.data.accountType == '1002'){ //企业
        url = "/ydh/mall/walletBasic/transfer";
      }

      const res = await wx.$http.post(url,data)
      if(res.data.returnCode=='ERR_0000'){
        this.setData({
          isHandle: true
        })
        const webUrl = encodeURIComponent(`${res.data.data.nextPageUrl}&AccessToken=${res.data.data.accessToken}`)
        wx.hideLoading()
        wx.navigateTo({
          url: `/pages/web-view/index?url=${webUrl}`,
        })
      }else{
        wx.showToast({
          title: res.data.returnMsg,
          icon: 'none',
          duration: 2000
        })
      }
    }catch(err){
      wx.hideLoading()
      console.log(err)
    }
  },
  //获取输入的值
  handleGetInputData(e) {

    const sign = e.currentTarget.dataset.sign
    const value = e.detail.value
    this.data[sign] = value
    this.setData({
      isDisabled:this.data.account!=""&& this.data.number!="">0?false:true
    })
  },
  //获取用户信息
  async requestAccountData() {

    let url = "";
    if(this.data.accountType == '1001'){ //个人
      url = "/ydh/mall/individualwalletBasic/virtualCapitalQuery";
    }
    if(this.data.accountType == '1002'){ //企业
      url = '/ydh/mall/walletBasic/virtualCapitalQuery';
    }

    const res = await wx.$http.post(url)
    if (res.data.returnCode == 'ERR_0000') {
      const data = res.data.data
      this.setData({
        available: data.available,

      })
    }
  },
})