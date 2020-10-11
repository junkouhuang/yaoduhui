const common = require('../../../../utils/common');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indexActive: null,
    nameId: null,
    name: '',
    nameInfo: '',
    qualificationsPaths: [],
    enterpriseName: '', //企业全称
    qualificationsNumber: '', //证书编号
    expiryDate: '', //有效期
    isDisable: true,
    check: false,
    must: 1, //1为非必填  非必填证书编号和证书有效期也可不填
    showSl: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.setData({
      must: options.must,
      nameId: options.nameid,
      name: options.name,
      nameInfo: options.nameInfo,
      enterpriseName: await wx.getStorageSync('enterpriseName'),
    })
    this.data.indexActive =  options.index;
    const qualificationsData = await wx.getStorageSync('qualifications__data')
    if (qualificationsData) {
      if (options.index < qualificationsData.length) {
        this.setData({
          qualificationsPaths: qualificationsData[options.index].qualificationsPaths[0],
          qualificationsNumber: qualificationsData[options.index].qualificationsNumber,
          expiryDate: qualificationsData[options.index].expiryDate,
          check: qualificationsData[options.index].expiryDate ? false : true,
          isDisable: false
        })
      } else {
        this.setData({
          qualificationsPaths: [],
          qualificationsNumber: '',
          expiryDate: '',
          check: false,
          isDisable: true
        })
      }
    } else {
      this.setData({
        qualificationsPaths: [],
        qualificationsNumber: '',
        expiryDate: '',
        check: false,
        isDisable: true
      })
    }
  },

  /**
   * 示例
   */
  openSl: function () {
    this.setData({
      showSl: true
    })
  },

  /**
   * 浏览图片手指触摸动作点击
   */
  previewImg: function (e) {
    const imgUrl = e.currentTarget.dataset.src;
    const index = e.currentTarget.dataset.index;
    common.previewImg(imgUrl, index)
  },

  //删除具体图片
  async handleCloseImage(e) {
    let that = this;
    const res = await wx.showModal({
      content: '是否删除该图片？',
    })
    if (res.confirm) {
      const index = e.currentTarget.dataset.index
      this.data.qualificationsPaths.splice(index, 1)
      this.setData({
        qualificationsPaths: this.data.qualificationsPaths,
      })
      that.isCan();
    }
  },
  //获取证书编号
  qualificationsNumberInput(e) {
    //  this.data.qualificationsNumber = e.detail.value;
    let that = this;
    this.setData({
      qualificationsNumber: e.detail.value,
    })
    that.isCan();
  },
  //选择有效期
  pickDate(e) {
    let that = this;
    this.setData({
      expiryDate: e.detail.value,
    });
    that.isCan();
  },
  //选择图片并保持到服务器
  async handleSelectImage() {
    let that = this;
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
        this.data.qualificationsPaths.push(imagePath)
        this.setData({
          qualificationsPaths: this.data.qualificationsPaths
        })
        wx.hideLoading()
      } else {
        wx.showToast({
          title: '文件上传失败',
          icon: 'none',
          duration: 2000
        })
      }
      this.isCan();
    } catch (err) {
      console.log(err)
      wx.hideLoading();
    }
  },
  isCan() {
    const that = this;
    if (that.data.check) {
      that.setData({
        isDisable: that.data.qualificationsPaths.length > 0 &&
          that.data.qualificationsNumber != "" ? false : true
      })
    } else {
      if (that.data.must == 1) {
        that.setData({
          isDisable: that.data.qualificationsPaths.length > 0 &&
            that.data.qualificationsNumber != "" &&
            that.data.expiryDate != "" ? false : true
        })
      } else {
        that.setData({
          isDisable: that.data.qualificationsPaths.length > 0 ? false : true
        })
      }
    }
  },
  //保存并返回
  async handleSaveImage() {
    const that = this;
    let index = this.data.indexActive;
    let enterpriseData = await wx.getStorageSync('enterprise__data')
    let certificateList = await wx.getStorageSync('certificates_list')
    let qualifications = await wx.getStorageSync('qualifications__data')
    qualifications = qualifications ? qualifications : []
    certificateList[index].isChecked = true
    qualifications[index] = {
      qualificationsNameId: this.data.nameId, //
      certificates: certificateList[index], //
      qualificationsPaths: [that.data.qualificationsPaths],
      expiryDate: this.data.expiryDate,
      qualificationsNumber: this.data.qualificationsNumber,
      check: ''
    }
    await wx.setStorageSync('qualifications__data', qualifications)
    await wx.setStorageSync('certificates_list', certificateList)
    enterpriseData = Object.assign(enterpriseData, {
      qualifications
    })
    await wx.setStorageSync('enterprise__data', enterpriseData)
    wx.navigateBack()
  },

  /**
   * 证件长期有效-check
   */
  checkHandle() {
    this.setData({
      expiryDate: this.data.check ?  this.data.expiryDate: "",
      check: !this.data.check
    })
    this.isCan();
  }
})