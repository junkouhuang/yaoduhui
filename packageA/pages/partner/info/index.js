// pages/member/real-name/index.js
let timer1,timer2;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleForm: {
      contacts: '', //真实姓名
      mobileNumber: '', //手机号码
      email: '', //联系邮箱
      provinceId: '', //省份Id
      province: '', //省
      cityId: "", //城市id
      city: "", //城市
      regionId: '', //区县ID
      region: '', //区县
      location: '', //详细地址
      composeAddress: '', //组合地址
      idCode: '', //身份证号
      partnerType: 1, //合伙人类型
      partnerEnterpriseId: '', //企业合伙人所属企业id,选择个人合伙人时,该值为空
      authIdCardNo: '', //身份证号码
      idCardFrontPath: "", //正面
      idCardBackPath: "", //反面
      policyPath: "", //社保卡
      salesmanType: '' //申请代理id
    },
    show: false,
    china: '',
    style: ["企业", "个人"],
    enterpriseName: '',
    isDisable: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.ruleForm.salesmanType = options.salesmanType;
  },

  onUnload(){
    clearTimeout(timer1);
    clearTimeout(timer2);
    wx.removeStorageSync('enterprise');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const result = wx.getStorageSync('enterprise');
    if (result) {
      this.setData({
        enterpriseName: result.enterpriseName
      })
      this.data.ruleForm['partnerType'] = 1;
      this.data.ruleForm['partnerEnterpriseId'] = result.enterpriseId;
    } else {
      this.setData({
        ['ruleForm.partnerType']: -1
      })
      this.data.ruleForm['partnerType'] = 0;
    }
  },

  /**
   * 选择地区
   */
  areaSel: function () {
    this.selectComponent("#area").openMask();
  },

  /**
   * 获取组件内传递出来的值(这里主要获取省市区名称和id)
   */
  getData(e) {
    let that = this;
    that.data.ruleForm["provinceId"] = e.detail.provinceId;
    that.data.ruleForm["province"] = e.detail.provinceName;
    that.data.ruleForm["cityId"] = e.detail.cityId;
    that.data.ruleForm["city"] = e.detail.cityName;
    that.data.ruleForm["regionId"] = e.detail.districtId;
    that.data.ruleForm["region"] = e.detail.district;

    that.setData({
      china: e.detail.provinceName + e.detail.cityName + e.detail.district
    })



    let can = this.data.ruleForm.contacts != '' &&
      this.data.ruleForm.mobileNumber != '' &&
      this.data.ruleForm.email != '' &&
      this.data.china != '' &&
      this.data.ruleForm.location != '' &&
      this.data.ruleForm.idCode != '' &&
      this.data.ruleForm.idCardFrontPath != '' &&
      this.data.ruleForm.idCardBackPath != '' &&
      this.data.ruleForm.policyPath != '' ? false : true

    this.setData({
      isDisable: can
    })


  },

  //获取输入的值
  handleGetInputData(e) {
    const sign = e.currentTarget.dataset.sign

    const value = e.detail.value

    this.data.ruleForm[sign] = value




    let can = this.data.ruleForm.contacts != '' &&
      this.data.ruleForm.mobileNumber != '' &&
      this.data.ruleForm.email != '' &&
      this.data.china != '' &&
      this.data.ruleForm.location != '' &&
      this.data.ruleForm.idCode != '' &&
      this.data.ruleForm.idCardFrontPath != '' &&
      this.data.ruleForm.idCardBackPath != '' &&
      this.data.ruleForm.policyPath != '' ? false : true


    this.setData({
      isDisable: can
    })

  },
  //上传身份证照片
  async uploadIdCardData(e) {
    const sign = e.currentTarget.dataset.sign
    try {
      const imageMsg = await wx.chooseImage({
        count: 1
      })
      const path = imageMsg.tempFilePaths[0]
      wx.showLoading({
        title: '上传中...',
      })
      const res = await wx.$http.upload('https://www.xinquanjk.com/common/image/uploads', path)
      const data = JSON.parse(res.data)
      if (data.data) {
        const imagePath = data.data
        switch (sign) {
          case 'front':
            this.setData({
              ['ruleForm.idCardFrontPath']: imagePath
            })
            break;
          case 'back':
            this.setData({
              ['ruleForm.idCardBackPath']: imagePath
            })
            break;
          case 'all':
            this.setData({
              ['ruleForm.policyPath']: imagePath
            })
            break
        }
        

        let can = this.data.ruleForm.contacts != '' &&
          this.data.ruleForm.mobileNumber != '' &&
          this.data.ruleForm.email != '' &&
          this.data.china != '' &&
          this.data.ruleForm.location != '' &&
          this.data.ruleForm.idCode != '' &&
          this.data.ruleForm.idCardFrontPath != '' &&
          this.data.ruleForm.idCardBackPath != '' &&
          this.data.ruleForm.policyPath != '' ? false : true


        this.setData({
          isDisable: can
        })
      } else {
        wx.showToast({
          title: '文件上传失败',
          icon: 'none',
          duration: 2000
        })
      }
      wx.hideLoading()
    } catch (err) {
      console.log(err)
      wx.hideLoading()
    }
  },

  //提交认证信息
  async submitData() {
    if (!this.data.ruleForm.contacts) {
      wx.showToast({
        title: '请输入真实姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.ruleForm.mobileNumber) {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (this.data.ruleForm.mobileNumber.length != 11) {
      wx.showToast({
        title: '手机号码长度必须为11位',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const reg1 = /^((13[0-9])|(14[5|7|9])|(15([0-3]|[5-9]))|(16([6]))|(17[1-6]|5|6|7|8])|(18([0-9]))|(19([8-9])))\d{8}$/;
    if (!reg1.test(this.data.ruleForm.mobileNumber)) {
      wx.showToast({
        title: '手机号码格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.ruleForm.email) {
      wx.showToast({
        title: '请输入联系邮箱',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const reg2 = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.(?:com|cn)$/;

    if (!reg2.test(this.data.ruleForm.email)) {
      wx.showToast({
        title: '联系邮箱格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.china) {
      wx.showToast({
        title: '请选择地区',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.ruleForm.location) {
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.ruleForm.idCode) {
      wx.showToast({
        title: '请填写身份证号',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const reg3 = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!reg3.test(this.data.ruleForm.idCode)) {
      wx.showToast({
        title: '身份证格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (this.data.ruleForm.partnerType == -1) {
      wx.showToast({
        title: '请选择类型',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (this.data.ruleForm.partnerType == -1) {
      wx.showToast({
        title: '请选择类型',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.ruleForm.idCardFrontPath) {
      wx.showToast({
        title: '请上传身份证正面',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.ruleForm.idCardBackPath) {
      wx.showToast({
        title: '请上传身份证反面',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.ruleForm.policyPath) {
      wx.showToast({
        title: '请上传保单/社保卡',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.data.ruleForm['composeAddress'] = this.data.china + this.data.ruleForm.location;
    try {
      wx.showLoading({
        title: '提交中...',
      })
      const res = await wx.$http.post("/ydh/mall/userAgent/apply", this.data.ruleForm)
      if (res.data.returnCode == 'ERR_0000') {
        wx.showToast({
          title: '提交审核成功',
          icon: 'none',
          duration: 2000
        })
        timer1 = setTimeout(() => {
          wx.navigateBack({
            delta: 2
          })
        }, 500)
      } else if (res.data.returnCode == 'ERR_0001') {
        wx.showToast({
          title: '代理已存在',
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.returnCode == 'ERR_0002') {
        wx.showToast({
          title: '身份证格式错误',
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.returnCode == 'ERR_0009') {
        wx.showToast({
          title: '已提交资料，请等待审核',
          icon: 'none',
          duration: 2000
        })
        timer2 = setTimeout(() => {
          wx.navigateBack({
            delta: 2
          })
        }, 500)
      } else {
        wx.showToast({
          title: res.data.returnMsg,
          icon: 'none',
          duration: 2000
        })
      }
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      console.log(err)
      wx.showToast({
        title: '提交资料失败',
        icon: 'none',
        duration: 2000
      })
    }

  },

  /**
   * 类型
   */
  pickStyle(e) {
    this.setData({
      ['ruleForm.partnerType']: e.detail.value,
      enterpriseName: ''
    })
    if (e.detail.value == 0) {
      wx.navigateTo({
        url: '/pages/partner/enterprise/index',
      })
    } else {

      this.data.ruleForm['enterpriseId'] = '';
    }
  },

  /**
   * 获取手机号码
   */
  phoneNumberInput: function (e) {
    let that = this;
    that.setData({
      can: e.detail.value !== '' && that.data.ruleForm.consignee !== '' && that.data.china !== '' && that.data.ruleForm.location !== '' ? true : false
    })
    that.data.ruleForm.phoneNumber = e.detail.value;
  },
})