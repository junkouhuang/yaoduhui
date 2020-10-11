// pages/partner/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pantnerList: [],
    currentIndex: -1,
    isDisabled: true,
    baseInfo: '',
    topShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getLevel();
    this.level();
  },

  /**
   * 等级
   */
  async getLevel() {
    const res = await wx.$http.post('/ydh/mall/userAgent/getBasicInfo', {
      enterpriseId: ""
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == 'ERR_0000') {
      this.setData({
        baseInfo: res.data.data,
        topShow: res.data.data.contacts == null && res.data.data.salesmanType == null && res.data.data.enterpriseName == null && res.data.data.address == null ? false : true
      })
    }
  },


  /**
   * 合伙人等级
   */
  async level() {
    let that = this;
    let res = await wx.$http.get('/common/partner/level')
    if (res.data.returnCode == "ERR_0000") {
      res.data.data.forEach(item => {
        item['check'] = false;
      })
      this.setData({
        pantnerList: res.data.data,
      })
    }
  },

  /**
   * 下一步
   */
  async next() {
    let that = this;
    if (that.data.currentIndex == -1) {
      wx.showToast({
        title: '请选择合伙人等级',
        duration: 2000,
        icon: 'none',
      });
    } else {
      const params = {
        salesmanType: this.data.pantnerList[this.data.currentIndex]["id"]
      }
      let res = await wx.$http.post('/ydh/mall/userAgent/apply', params)
      if (res.data.returnCode == "ERR_0000") {
        if (res.data.data == 1) {
          wx.navigateTo({
            url: '/packageA/pages/partner/type/index?salesmanType=' + this.data.pantnerList[this.data.currentIndex]["id"],
          })
        }
      } else if (res.data.returnCode == "ERR_0001") {
        wx.showToast({
          title: res.data.returnMsg,
          duration: 2000,
          icon: 'none',
        });
      } else {
        wx.showToast({
          title: res.data.returnMsg,
          duration: 2000,
          icon: 'none',
        })
      }
    }
  },

  /**
   * 查看申请记录
   */
  applyRecord() {
    wx.navigateTo({
      url: '/packageA/pages/partner/record/index',
    })
  },

  /**
   * 选择合伙人级别
   */
  handleSelectItem(e) {
    const index = e.currentTarget.dataset.index;
    this.data.currentIndex = e.currentTarget.dataset.index;
    this.data.pantnerList.forEach(item => {
      item["check"] = false;
    })
    this.data.pantnerList[index]["check"] = true;
    this.setData({
      pantnerList: this.data.pantnerList,
      isDisabled: false
    })
  }
})