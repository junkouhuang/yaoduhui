const common = require("../../../utils/common")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenLightValue: 0, //屏幕亮度初始值
    imgUrl: '',
    sbl: 0, //屏幕亮度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let userInfo = JSON.parse(options.userInfo);
    let {
      avatar,
      nickname,
      telephone
    } = userInfo;
    that.setData({
      avatar,
      nickname,
      telephone
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let res = await wx.$http.post('/authorizes/user/code', {
      source: "+p/LQRPTDPW2/FIr1nZO8d2VkBDTSOg2s8mo/nMOG4rOLUbvFPjowQ=="
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == 'ERR_0000') {
      this.setData({
        imgUrl: res.data.data
      })
    }
  },

  /**
   * 浏览图片手指触摸动作点击
   */
  previewImg: function (e) {
    const imgUrl = e.currentTarget.dataset.src;
    common.previewImg(imgUrl)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //this.setScreenLight(this.data.sbl);
  },


  /**
   * 返回上一页
   */
  return () {
    wx.navigateBack();
  }
})