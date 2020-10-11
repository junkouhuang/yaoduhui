// pages/member/data-replenish/index.js
var filter = require('../../../utils/filter.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountType: '', //账户类型 公1002   个人1001
    idImgFront: "", //正面
    idImgBack: "", //反面
    visaDate: "", // 营业执照登记日期
    lostDate: "", //营业执照过期时间
    phone: "", //手机号码
    code: "", //短信验证码
    bizAddress: '',
    qualificationsPaths: [],
    businessLicenseCode: '',
    check: false,
    userType: '',
    codeProp: {
      btnText: '获取验证码',
      url: '/ydh/mall/walletBasic/getSmsVerificationCode',
      params: {
        accountNo: "", //卡号
        acctName: "", //开户名
        mobilePhone: "", //手机号码
        bkNo: "", //行号
        bkNam: "", //支行名称
        userType: '',
        transCode: "", // DGKHBL 对公信息补录  个体工商户 XNKHBL
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log(options.parameter);
    let optionsArray = JSON.parse(options.parameter);

    that.setData({
      accountType: optionsArray.accountType,
      userType: optionsArray.userType,
      phone: optionsArray.phone,
      bizAddress: optionsArray.bizAddress,
      'codeProp.params.mobilePhone': optionsArray.phone,
      'codeProp.params.userType': optionsArray.userType,
      'codeProp.params.transCode': optionsArray.accountType == 1002 ? 'DGKHBL' : 'XNKHBL', // DGKHBL 对公信息补录  个体工商户 XNKHBL
    });
    console.log(optionsArray.accountType);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(timer1)
    clearTimeout(timer2)
    clearTimeout(timer3)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  //获取输入的值
  getInputValue(e) {
    const sign = e.currentTarget.dataset.sign
    const value = e.detail.value
    this.data[sign] = value
  },
  setParams() {
    this.setData({
      'codeProp.params.mobilePhone': this.data.phone, //手机号码
    })
  },

  /**
   * 确认提交资料
   */
  async handleNextStop() {
    let data = {};
    let url = '';
    let that = this;
    //个人户提交资料
    if (this.data.accountType == 1001) {
      //个人
      url = '/ydh/mall/walletBasic/privateSupplement';
      data = {
        //bizAddress: this.data.bizAddress,
        verifyNo: this.data.code,
        userType: this.data.userType,
        //businessLicenseImg: this.data.businessLicenseImg,
        workType: '职员', //职业类型
        idImgFront: this.data.idImgFront, //正面
        idImgBack: this.data.idImgBack, //反面
      }
    } else {
      if (this.data.qualificationsPaths.length <= 0) {
        return wx.showToast({
          title: '请上传营业执照照片', //标题，不写默认正在加载
          icon: 'none',
          duration: 2000
        })
      }

      if (!this.data.businessLicenseCode) {
        wx.showToast({
          title: '请填写统一社会信用代码',
          icon: 'none',
          duration: 2000
        })
        return
      }


      if (!this.data.visaDate) {
        wx.showToast({
          title: '请选择证件发出日期',
          icon: 'none',
          duration: 2000
        })
        return
      }

      if (!this.data.check) {
        if (!this.data.lostDate) {
          wx.showToast({
            title: '请选择证件过期日期',
            icon: 'none',
            duration: 2000
          })
          return
        }
      }

      //公
      url = '/ydh/mall/walletBasic/publicSupplement';
      data = {
        bizAddress: this.data.bizAddress ? this.data.bizAddress : '',
        verifyNo: this.data.code,
        businessLicenseCode: this.data.businessLicenseCode,
        businessLicenseImg: this.data.qualificationsPaths[0],
        visaDate: this.data.visaDate, // 营业执照登记日期
        lostDate: this.data.check ? '长期有效' : this.data.lostDate, //  营业执照过期时间
        idImgFront: this.data.idImgFront, //正面
        idImgBack: this.data.idImgBack, //反面
      }
    }
    if (!this.data.idImgFront) {
      wx.showToast({
        title: '请上传身份证正面',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.idImgBack) {
      wx.showToast({
        title: '请上传身份证反面',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!(/^1[3456789]\d{9}$/.test(this.data.phone))) {
      return wx.showToast({
        title: '手机格式不正确', //标题，不写默认正在加载
        icon: 'none',
        duration: 2000
      })
    }

    if (!this.data.code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    try {
      wx.showLoading({
        title: '提交中...',
      })
      const res = await wx.$http.post(url, data)
      wx.hideLoading()
      if (res.data.returnCode == 'ERR_0002') {
        wx.showToast({
          title: '身份证格式错误',
          icon: 'none',
          duration: 2000
        })
      }

      if (res.data.returnCode == 'ERR_0009') {
        wx.showToast({
          title: '已提交资料，请等待审核',
          icon: 'none',
          duration: 2000
        })
        timer1 = setTimeout(() => {
          wx.navigateBack()
        }, 500)
        wx.hideLoading()
      }
      if (res.data.returnCode == 'ERR_0000') {
        wx.navigateTo({
          url: '/pages/member/open-complete/index?status=replenishSuccessfu',
        })
      } else if (res.data.returnCode == 'ERR_0001') {
        //开户失败
        wx.navigateTo({
          url: '/pages/member/open-complete/index?status=replenishSuccessfuFail',
        })
      } else {
        // wx.showToast({
        //   title: res.data.returnMsg,
        //   icon: 'none',
        //   duration: 2000
        // })
        timer2 = setTimeout(() => {
          wx.showToast({
            title: res.data.returnMsg,
            icon: "none",
          });
          timer3 = setTimeout(() => {
            wx.hideToast();
          }, 2000)
        }, 0);
      }

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
      console.log(data);
      if (data.data) {
        const imagePath = data.data
        switch (sign) {
          case 'front':
            this.setData({
              idImgFront: imagePath
            })
            break;
          case 'back':
            this.setData({
              idImgBack: imagePath
            })
            break;
          case 'businessLicenseImg':
            this.data.qualificationsPaths = [];
            this.data.qualificationsPaths.push(imagePath)
            this.setData({
              qualificationsPaths: this.data.qualificationsPaths
            })
            break
        }
        wx.hideLoading()
      } else {
        wx.showToast({
          title: '文件上传失败',
          icon: 'none',
          duration: 2000
        })
      }

    } catch (err) {
      wx.showToast({
        title: '文件上传失败',
        icon: 'none',
        duration: 2000
      })
    }
  },
  pickDate(e) {
    let that = this;
    if (e.currentTarget.dataset.time == 'visaDate') {
      this.setData({
        visaDate: e.detail.value,
      });
    } else {
      this.setData({
        lostDate: e.detail.value,
      });
    }
  },
  checkHandle() {
    this.setData({
      check: !this.data.check
    })
    if (this.data.check) {
      this.setData({
        //visaDate:filter.formatTime(new Date),
        lostDate: '2999-12-31',
      })
    } else {
      this.setData({
        //visaDate:'',
        lostDate: '',
      })
    }
  },

  //删除具体图片
  async handleCloseImage(e) {
    const res = await wx.showModal({
      content: '是否删除该图片？',
    })
    if (res.confirm) {
      const index = e.currentTarget.dataset.index
      this.data.qualificationsPaths.splice(index, 1)
      this.setData({
        qualificationsPaths: this.data.qualificationsPaths,
      })
    }
  },
})