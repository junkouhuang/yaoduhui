let timer1,timer2,timer3,timer4;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    opacity: 0,
    bottom: '-850rpx',
    showMask: false,
    showOneMask: true,
    verificationText: '获取验证码',
    selectList: [{
        text: '绑定企业对公帐户',
        type: 2
      },
      {
        text: '绑定企业法人/负责人对私账户',
        type: 4
      }
    ],
    bandingIndex: null,
    bindOpacity: 0,
    bindBottom: '-620rpx',
    showBindMask: false,
    bindingText: '请选择绑卡类型',
    phoneNumber: '', //电话号码
    certificateNumber: '', //证书编号
    userName: '', //负责人姓名
    idCard: '', //负责人身份证号码
    enterpriseName: '',
    userType: 0,
    isHandle: false,
    isDisable: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.getParamsData(options)
    await this.changeButton()
  },

  onUnload(){
    clearTimeout(timer1)
    clearTimeout(timer2)
    clearTimeout(timer3)
    clearTimeout(timer4)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    // await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')

    if (this.data.isHandle) {
      const res = await wx.showModal({
        content: '是否开户成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        console.log('确认')
        await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
        await wx.navigateBack()
      } else {
        await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
        console.log('取消')
        //wx.navigateBack()
      }
      this.setData({
        isHandle: false
      })
    }
  },

  handleNextStop() {
    this.setData({
      showMask: true
    })
    timer1 = setTimeout(() => {
      this.setData({
        opacity: 0.5,
        bottom: '0rpx'
      })
    }, 50)
  },
  //关闭弹窗
  closeMask() {
    this.setData({
      opacity: 0,
      bottom: '-850rpx'
    })
    timer2 = setTimeout(() => {
      this.setData({
        showMask: false
      })
    }, 300)
  },
  //弹窗点下一步
  maskNext() {
    this.setData({
      showOneMask: false
    })
  },
  //获取验证码
  async sendMessage() {
    if (this.data.verificationText == '获取验证码') {
      let number = 60
      this.setData({
        verificationText: `${number}s后重新获取`
      })
      let timerId = setInterval(() => {
        number--
        if (number > 0) {
          const verificationText = `${number}s后重新获取`
          this.setData({
            verificationText
          })
        } else {
          clearInterval(timerId)
          this.setData({
            verificationText: '获取验证码'
          })
        }
      }, 1000)
    }
  },
  //下一步
  async handleNextStop() {
    const mobilePhoneReg = /^((13[0-9])|(14[5|7|9])|(15([0-3]|[5-9]))|(16([6]))|(17([1-3]|[5-8]))|(18([0-9]))|(19([8-9])))\d{8}$/
    if (!mobilePhoneReg.test(this.data.phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (this.data.bindingText == '请选择绑卡类型') {
      wx.showToast({
        title: '请选择绑卡类型',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.certificateNumber) {
      wx.showToast({
        title: '请输入证书编号',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.userName) {
      wx.showToast({
        title: '请输入负责人姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (this.data.idCard.length !== 18) {
      wx.showToast({
        title: '请输入正确的身份证号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    await this.submitAccountMsg()
  },
  //选择绑卡类型
  async handleSelectClassify(e) {
    const {
      index,
      name,
      type
    } = e.currentTarget.dataset
    this.setData({
      bandingIndex: index,
      bindingText: name,
      userType: type
    })
    this.handleCancelMask()
  },
  //显示绑卡mask
  bindingClassify() {
    this.setData({
      showBindMask: true
    })
    timer3 = setTimeout(() => {
      this.setData({
        bindOpacity: 0.5,
        bindBottom: '0rpx'
      })
    }, 30)
  },
  //关闭绑卡Mask
  handleCancelMask() {
    this.setData({
      bindOpacity: 0,
      bindBottom: '-620rpx'
    })
    timer4 = setTimeout(() => {
      this.setData({
        showBindMask: false
      })
    }, 300)
  },
  //获取输入的值
  getInputValue(e) {
    const sign = e.currentTarget.dataset.sign
    const value = e.detail.value
    this.data[sign] = value
    this.changeButton()
  },
  //提交开户信息
  async submitAccountMsg() {
    try {
      let data = this.data
      const params = {
        acctName: data.enterpriseName,
        userType: data.userType,
        bossName: data.userName,
        certNo: data.idCard,
        mobilePhone: data.phoneNumber,
        qualificationsNumber: data.certificateNumber,
        deviceType: 'MOBILE'
      }
      wx.showLoading({
        title: '请稍后',
      })
      const res = await wx.$http.post('/ydh/mall/walletBasic/enterpriseCreateUser', params)
      wx.hideLoading()
      if (res.data.returnCode == "ERR_0000") {
        this.setData({
          isHandle: true
        })

        if (!res.data.data) {
          wx.showToast({
            title: res.data.returnMsg,
            icon: 'none',
            duration: 2000
          })
          return
        }
        const webUrl = encodeURIComponent(`${res.data.data.nextPageUrl}&AccessToken=${res.data.data.accessToken}`)
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
          title: '创建虚拟账户失败',
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
      wx.showToast({
        title: '开户失败',
        icon: 'none',
        duration: 2000
      })
      console.log(err)
      wx.hideLoading()
    }
  },
  //获取路径参数
  async getParamsData(options) {
    if (options.enterpriseName) {
      this.setData({
        enterpriseName: options.enterpriseName
      })
    }
    if (options.phoneNumber) {
      this.setData({
        phoneNumber: options.phoneNumber
      })
    }
    if (options.certificateNumber) {
      this.setData({
        certificateNumber: options.certificateNumber
      })
    }
    if (options.userName) {
      this.setData({
        userName: options.userName
      })
    }
    if (options.idCard) {
      this.setData({
        idCard: options.idCard
      })
    }
    if (options.userType) {
      let bindingText = '请选择绑卡类型',
        bandingIndex = null
      if (options.userType == 2) {
        bandingIndex = 0
        bindingText = '绑定企业对公帐户'
      } else {
        bandingIndex = 1
        bindingText = '绑定企业法人/负责人对私账户'
      }
      this.setData({
        userType: options.userType,
        bindingText,
        bandingIndex
      })
    }
  },
  async changeButton() {
    // let number = 0
    // if ((/^1[3456789]\d{9}$/.test(this.data.phoneNumber))) {
    //   number++
    // }

    // if (this.data.bindingText !== '请选择绑卡类型') {
    //   number++
    // }

    // if (this.data.certificateNumber) {
    //   number++
    // }

    // if (this.data.userName) {
    //   number++
    // }

    // if (this.data.idCard.length === 18) {
    //   number++
    // }

    // if (number == 5) {
    //   this.setData({
    //     isDisable: false
    //   })
    // } else {
      this.setData({
        isDisable: this.data.bindingText!='请选择绑卡类型' && this.data.certificateNumber && 
        this.data.userName && this.data.idCard ?false:true
      })
    // }
  }
})