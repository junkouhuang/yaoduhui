// pages/member/cash-withdrawal/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carNo:'',
    moneyNumber:'',
    available:0,
    memo:'',
    accountType:'',
    isHandle:false,
    isDisabled:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.data.accountType = options.accountType;
    wx.showLoading({
      title: '加载中...',
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
        content: '是否提现成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        wx.navigateBack()
      } else {
        console.log('取消')
      }
      this.setData({
        isHandle: false
      })
    }
  },

  //获取用户信息
  async requestAccountData() {
    let url = "";

    if(this.data.accountType == '1001'){//个人
      url = '/ydh/mall/individualwalletBasic/virtualCapitalQuery';
    }

    if(this.data.accountType == '1002'){//企业
      url = '/ydh/mall/walletBasic/virtualCapitalQuery';
    }

    const res = await wx.$http.post(url)
    if (res.data.returnCode == 'ERR_0000') {
      const data = res.data.data
      this.setData({
        carNo: data.carNo,
        available: data.available
      })
    }
    console.log(res)
  },
  handleGetMoney(e) {
    const number = e.detail.value
    this.data.moneyNumber = number
    this.setData({
      isDisabled:number>0?false:true
    })
  },
  handleAll(){
    this.setData({
      moneyNumber:this.data.available
    })
    this.setData({
      isDisabled:this.data.available>0?false:true
    })
  },
  handleGetMemo(e){
    const memo = e.detail.value
    this.data.memo = memo
  },
  //下一步
  async handleNextStop(){
    if (this.data.moneyNumber < 0.01) {
      wx.showToast({
        title: '提现金额不能小于0.01',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    if(this.data.moneyNumber>this.data.available){
      wx.showToast({
        title: '提现不能超过可用余额',
        icon: 'none',
        duration: 2000
      })
      return
    }

    
    try{
      wx.showLoading({
        title: '请稍后...',
      })

      let url = "";
      if(this.data.accountType == '1001'){ //个人
        url = "/ydh/mall/individualwalletBasic/withDraw";
      }
      if(this.data.accountType == '1002'){ //企业
        url = "/ydh/mall/walletBasic/withDraw";
      }

      const res = await wx.$http.post(url,{
        amount: this.data.moneyNumber,
        memo: this.data.memo
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
      wx.hideLoading()
    }catch(err){
      wx.hideLoading()
      console.log(err)
    }
  }
})