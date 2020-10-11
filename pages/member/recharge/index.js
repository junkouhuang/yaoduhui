// pages/member/transfer/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moneyNumber:'',
    carNo:'',
    available:0,
    accountType:'',
    isHandle:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    wx.showLoading({
      title: '加载中...',
    })
    this.data.accountType = options.accountType;
    await this.requestAccountData()
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow () {
    if (this.data.isHandle) {
      const res = await wx.showModal({
        content: '是否充值成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        console.log('确认')

        if(this.data.accountType == "1001"){
          await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo');
        }

        if(this.data.accountType == "1002"){
          await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
        }
        wx.navigateBack();

      } else {
        console.log('取消')
        if(this.data.accountType == "1001"){
          await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo');
        }

        if(this.data.accountType == "1002"){
          await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
        }
        wx.navigateBack();
      }
      this.setData({
        isHandle: false
      })
    } 
  },

  //下一步
  async handleNextStop() {
    try{
      if (this.data.moneyNumber < 0.01) {
        wx.showToast({
          title: '充值金额不能小于0.01',
          icon: 'none',
          duration: 2000
        })
        return
      }
      const data = {
        amount:this.data.moneyNumber
      }
      wx.showLoading({
        title: '请稍后...',
      })
      let url = "";
      if(this.data.accountType == '1001'){ //个人开户
        url = "/ydh/mall/individualwalletBasic/recharge";
      }
      if(this.data.accountType == '1002'){ //企业开户
        url = "/ydh/mall/walletBasic/recharge";
      }
      const res = await wx.$http.post(url,data)
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
      if (res.data.returnCode == "ERR_0040") {
        wx.showToast({
          title: '充值失败', //标题，不写默认正在加载
          duration: 2000, //延时关闭，默认2000
          icon: 'none',
        })
      }
    }catch(err){
      wx.hideLoading()
      console.log(err)
    }
  },
  //获取用户信息
  async requestAccountData(){
    let url = "";
    if(this.data.accountType == '1001'){ //个人开户
      url = "/ydh/mall/individualwalletBasic/virtualCapitalQuery";
    }
    if(this.data.accountType == '1002'){ //企业开户
      url = "/ydh/mall/walletBasic/virtualCapitalQuery";
    }
    const res = await wx.$http.post(url)
    if(res.data.returnCode=='ERR_0000'){
      const data = res.data.data
      this.setData({
        available: data.available,
        carNo: data.carNo
      })
    }
  },
  handleGetMoney(e){
    const number = e.detail.value
    this.data.moneyNumber = number
  }
})