
Page({

  /**
   * 页面的初始数据
   */
  data: {
    certificateList: [],
    isDisabled: true
  },
  onUnload() {
    wx.removeStorageSync("enterpriseName");
    wx.removeStorageSync("qualifications__data");
    wx.removeStorageSync("enterprise__data");
    wx.removeStorageSync("certificates_list");
  },

  onLoad(optios){
    this.setData({
      modeName:optios.modeName
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    const certificateList = await wx.getStorageSync('certificates_list')
    this.setData({
      certificateList
    })
    let flag = true
    certificateList.forEach((item, index) => {
      if (item.check == 1 && !item.isChecked) {
        flag = false
      }
    })
    if (flag) {
      this.setData({
        isDisabled: false
      })
    } else {
      this.setData({
        isDisabled: true
      })
    }
  },

  //去上传照片
  handleUpdateImage(e) {
    const {
      index,
      must,
      name,
      nameid,
      nameinfo,
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/packageB/pages/band/update/index?nameid=${nameid}&index=${index}&name=${name}&nameInfo=${nameinfo}&must=${must}`
    })
  },
  //提交企业信息
  async handleSubmit() {
    let certificateList = await wx.getStorageSync('certificates_list')
    let enterpriseData = await wx.getStorageSync('enterprise__data')
    let flag = true
    certificateList.forEach((item, index) => {
      if (item.check == 1 && !item.isChecked) {
        flag = false
      }
    })
    if (!flag) {
      wx.showToast({
        title: '带*号为必填证书',
        icon: 'none',
        duration: 2000
      })
      return
    }
    enterpriseData.qualifications = enterpriseData.qualifications.filter((item) => {
      return item != null
    })
    const res = await wx.$http.post('/ydh/mall/enterprise/apply', enterpriseData)
    if (res.data.returnCode == "ERR_0000") {
      if (res.data.data == 1) {
        wx.reLaunch({
          url: '/packageB/pages/band/success/index',
        })
        wx.removeStorageSync("enterpriseName");
        wx.removeStorageSync("qualifications__data");
        wx.removeStorageSync("enterprise__data");
        wx.removeStorageSync("certificates_list");
      }
    } else if (res.data.returnCode == "ERR_0005") {
      wx.showToast({
        title: '推荐码无效',
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
  }
})