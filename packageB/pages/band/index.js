
Page({

  /**
   * 页面的初始数据
   */
  data: {
    optionsList: [],
    modeIndex: null,
    show: false,
    enterpriseName: '', //企业全称
    registerAddress: -1, //注册地址
    location: '', //详细地址
    contacts: '', //姓名
    idCode: '', //身份证号码
    referralCode: '', //邀请码
    modeId: null, //经营方式
    paramsData: {},
    isDisable: true,
    number: 0,
    modeName: '', //经营类类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    try {
      const mode = options.mode
      await this.getBusinessModeInfo()
      await this.requsetEnterprise()
      if (mode == 'add') {
        await this.requestEnterprise()
        await this.requsetSelectModeList()
      }
    } catch (err) {
      console.log(err)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync("qualifications__data");
    wx.removeStorageSync("enterprise__data");
    wx.removeStorageSync("certificates_list");
    wx.removeStorageSync("enterpriseName");
  },

  // 选择经营方式
  handleSelectOptions(e) {
    let index = e.currentTarget.dataset.index
    let modeId = e.currentTarget.dataset.modeid
    this.data.modeName = e.currentTarget.dataset.modename
    let state = e.currentTarget.dataset.state
    if (state == 1) return
    if (index === this.modeIndex) {
      return
    } else {
      this.setData({
        modeIndex: index
      })
      this.data.modeId = modeId
      if (this.data.number == 2 && this.data.modeId && this.data.registerAddress !== '请选择地区') {
        this.setData({
          isDisable: false
        })
      }
    }
  },
  //选择注册地址
  getData: function (e) {
    this.data.paramsData = Object.assign(
      this.data.paramsData,
      e.detail
    )
    const registerAddress = `${e.detail.provinceName}${e.detail.cityName}${e.detail.district}`
    this.setData({
      registerAddress
    })
    if (this.data.number == 3 && this.data.modeId && this.data.registerAddress !== '请选择地区') {
      this.setData({
        isDisable: false
      })
    }
  },
  //显示选择地址
  handleSelectAddress() {
    this.selectComponent("#area").openMask();
  },


  //下一步
  async handleNextStop() {
    if (!this.data.enterpriseName) {
      wx.showToast({
        title: '请输入企业全称',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.registerAddress == '-1') {
      wx.showToast({
        title: '请选择注册地址',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.location) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.modeId) {
      wx.showToast({
        title: '请选择经营方式',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const reg3 = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if(this.data.idCode){
      if (!reg3.test(this.data.idCode)) {
        wx.showToast({
          title: '身份证格式不正确',
          icon: 'none',
          duration: 2000
        })
        return
      }
    }

    this.data.paramsData = Object.assign(this.data.paramsData, {
      enterpriseName: this.data.enterpriseName,
      location: this.data.location,
      contacts: this.data.contacts,
      idCode: this.data.idCode?this.data.idCode:'',
      businessModeId: this.data.modeId,
      enterpriseId: '',
      type: 2,
      referralAccountId: '',
      referralCode: '',
      referralCode: this.data.referralCode
    })
    await wx.setStorageSync('enterprise__data', this.data.paramsData)
    const params = {
      enterpriseName: this.data.enterpriseName,
      businessModeId: this.data.modeId,
      IDCard: this.data.idCode?this.data.idCode:'',
      referralCode: this.data.referralCode
    }
    const res = await wx.$http.post('/ydh/mall/enterprise/exist', params, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == "ERR_0000") {
      //enterpriseId:'8888'去绑定企业    
      //enterpriseId:false审核中   
      //enterpriseId:true下一步
      if (res.data.data) {
        if (res.data.data>1) {
          const result = await wx.showModal({
            content: '该企业已入驻是否直接申请绑定？',
            confirmText: '确定',
            cancelText: '取消',
            confirmColor: '#3996E1',
          })
          if(result.confirm){
            //res.data.data获取企业id
            this.handleBindding(res.data.data,this.data.enterpriseName,this.data.contacts,this.data.modeName,this.data.idCode)
          }else{
            this.setData({
              modeIndex: null,
              show: false,
              enterpriseName: '', //企业全称
              registerAddress: -1, //注册地址
              location: '', //详细地址
              contacts: '', //姓名
              idCode: '', //身份证号码
              referralCode: '', //邀请码
              modeId: null, //经营方式
              paramsData: {},
              isDisable: true,
              number: 0,
              modeName: '', //经营类类型
            })
          }
          return;
        }
      }else{
        wx.showToast({
          title: '该企业入驻审核中', //您已经提交过该企业，请等待企业审核
          icon: 'none',
          duration: 2000
        })
        return;
      }
    } else if (res.data.returnCode == "ERR_0002") {
      wx.showToast({
        title: '身份证格式有误', //您已经提交过该企业，请等待企业审核
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (res.data.returnCode == "ERR_0005") {
      wx.showToast({
        title: '推荐码无效', //您已经提交过该企业，请等待企业审核
        icon: 'none',
        duration: 2000
      })
      return;
    } else {
      wx.showToast({
        title: res.data.returnMsg, //您已经提交过该企业，请等待企业审核
        icon: 'none',
        duration: 2000
      })
      return;
    }
    const result = await wx.$http.post('/ydh/mall/enterprise/credentials', {
      modeId: this.data.modeId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    let list = result.data.data.list
    list.forEach((item, index) => {
      item.isChecked = false
    })
    await wx.setStorageSync('certificates_list', list)
    await wx.setStorageSync('enterpriseName', this.data.enterpriseName);
    wx.navigateTo({
      url: '/packageB/pages/band/intelligence/index?modeName=' + this.data.modeName,
    })
  },

  //申请绑定
  async handleBindding(enterpriseId,enterpriseName,contacts,modeName,idCode) {
    try {
      const res = await wx.$http.post('/ydh/mall/enterpriseBindApply/contactsAndIdcode', {
        enterpriseId
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.statusCode == 200) {
        if (res.data.returnCode == "ERR_0000") {
          const mobileNumber = res.data.data ? res.data.data.mobileNumber : '';
          const params = {
            enterpriseName,
            modeName,
            enterpriseId,
            contacts,
            mobileNumber,
            idCode
          }
          wx.navigateTo({
            url: '/packageB/pages/band/bindding/index?params=' + JSON.stringify(params),
          })
        } else {
          wx.showToast({
            title: res.data.returnMsg,
            icon: 'none',
            duration: 1000
          })
        }
      }
    } catch (err) {
      console.log(err)
    }

  },

  //获取输入框信息
  handleInputValue(e) {
    const sign = e.target.dataset.sign
    const value = e.detail.value
    this.data[sign] = value
    this.data.number = 0
    if (this.data.enterpriseName) {
      this.data.number++
    } else {
      this.data.number--
    }

    if (this.data.location) {
      this.data.number++
    } else {
      this.data.number--
    }

    // if (this.data.contacts) {
    //   this.data.number++
    // } else {
    //   this.data.number--
    // }

    // if (this.data.idCode) {
    //   this.data.number++
    // } else {
    //   this.data.number--
    // }
        

    if (this.data.number == 2 && this.data.modeId && this.data.registerAddress !== '请选择地区') {
      this.setData({
        isDisable: false
      })
    } else {
      this.setData({
        isDisable: true
      })
    }
  },
  //请求当前的用户信息
  async requsetEnterprise() {
    try {
      const res = await wx.$http.post('/ydh/mall/enterpriseBindApply/contactsAndIdcode');
      if (res.data.data) {
        const {
          contacts,
          idCode
        } = res.data.data;
        this.setData({
          contacts,
          idCode
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  //返回9种经营方式
  async getBusinessModeInfo() {
    try {
      const res = await wx.$http.post('/ydh/mall/enterprise/businessModeInfo')
      const optionsList = res.data.data
      this.setData({
        optionsList
      })
    } catch (err) {
      console.log(err)
    }
  },
  //获取已选择的经营方式
  async requsetSelectModeList() {
    const list = [3, 6]
    const optionsList = this.data.optionsList
    list.forEach((item, index) => {
      optionsList[item - 1].state = 1
    })

    this.setData({
      optionsList
    })
  },
  //企业信息
  async requestEnterprise() {
    const res = await wx.$http.post('/ydh/mall/enterprise/getInfo')
  },
  //扫码获取邀请码
  async handleGetQrcode() {
    const res = await wx.scanCode()
    this.setData({
      referralCode: res.result.replace(/./g, '*')
    })
    this.data.referralCode = res.result
  }
})