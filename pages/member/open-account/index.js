// pages/member/open-account/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userType: '个人',
    acctName: '',
    certNo: '',
    mobilePhone: '',
    email: '',
    address: '',
    postCode: '',
    isHandle: false,
    isDisable: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (options.list != 'null') {
      let accountData = JSON.parse(options.list);
      this.setData({
        userType: '个人',
        acctName: accountData.acctName,
        certNo: accountData.certNo,
        mobilePhone: accountData.mobilePhone,
        email: accountData.email,
        address: accountData.address,
        postCode: accountData.postCode,
        isDisable: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    if (this.data.isHandle) {
      const res = await wx.showModal({
        content: '是否开户成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        console.log('确认')
        await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo')
        await wx.navigateBack()
      } else {
        console.log('取消')
        await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo')
        //wx.navigateBack()
      }
      this.setData({
        isHandle: false
      })
    }
  },

  //下一步
  async handleNextStop() {
    if (!this.data.acctName) {
      wx.showToast({
        title: '请输入您身份证上真实姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.certNo) {
      wx.showToast({
        title: '请输入您身份证号码',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(this.data.certNo))) {
      wx.showToast({
        title: '请输入正确身份证号码',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.address) {
      wx.showToast({
        title: '请输入您的地址',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.mobilePhone) {
      wx.showToast({
        title: '请输入您的手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }   
    const mobilePhoneReg = /^((13[0-9])|(14[5|7|9])|(15([0-3]|[5-9]))|(16([6]))|(17([1-3]|[5-8]))|(18([0-9]))|(19([8-9])))\d{8}$/
    if (!mobilePhoneReg.test(this.data.mobilePhone)) {
      wx.showToast({
        title: '请输入正确手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.email) {
      wx.showToast({
        title: '请输入您的电子邮箱',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(this.data.email))) {
      wx.showToast({
        title: '请输入正确的电子邮箱',
        icon: 'none',
        duration: 2000
      })
      return
    }


    if (!this.data.postCode) {

      wx.showToast({
        title: '请输入您的邮编',
        icon: 'none',
        duration: 2000
      })
      return
    }

    await this.submitAccountMsg()

  },
  //获取输入的信息
  handleGetInputValue(e) {
    const sign = e.currentTarget.dataset.sign
    const value = e.detail.value
    this.data[sign] = value

    const can = this.data.acctName != "" &&
      this.data.certNo != "" &&
      this.data.mobilePhone != "" &&
      this.data.email != "" &&
      this.data.address != "" &&
      this.data.postCode != "" ? false : true
    this.setData({
      isDisable: can
    })
  },
  //提交开户信息
  async submitAccountMsg() {
    try {

      const params = {
        userType: 1,
        acctName: this.data.acctName,
        certNo: this.data.certNo,
        mobilePhone: this.data.mobilePhone,
        email: this.data.email,
        address: this.data.address,
        postCode: this.data.postCode

      }
      wx.showLoading({
        title: '请稍后',
      })
      const res = await wx.$http.post('/ydh/mall/individualwalletBasic/individualVirtualAcctCreate', params)
      if (res.data.returnCode == "ERR_0000") {
        const webUrl = encodeURIComponent(`${res.data.data.nextPageUrl}&AccessToken=${res.data.data.accessToken}`)
        this.setData({
          isHandle: true
        })
        wx.hideLoading()
        wx.navigateTo({
          url: `/pages/web-view/index?url=${webUrl}`,
        })
      } else if (res.data.returnCode == "ERR_0001") {
        wx.showToast({
          title: "请输入正确身份证号码",
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.returnCode == "25401") {
        wx.showToast({
          title: "创建虚拟户失败",
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: res.data.returnMsg,
          icon: 'none',
          duration: 2000
        })
      }
    } catch (err) {
      console.log(err)
      wx.hideLoading()
    }
  },
})