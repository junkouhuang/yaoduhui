const common = require("../../utils/common")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    hidden: false,
    showBuild: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    that.data.url = options.url
    that.setData({
      hidden: true,
      showBuild: true
    })
  },

  /**
   * 浏览图片手指触摸动作点击
   */
  previewImg: function (e) {
    const imgUrl = e.currentTarget.dataset.src;
    common.previewImg(imgUrl)
  },

  /**
   * 关闭申请建档model弹出框
   */
  hideModal() {
    let that = this;
    that.setData({
      hidden: false,
      showBuild: false
    });

    wx.navigateTo({
      url: '/pages/bohai/index?url=' + encodeURIComponent(decodeURIComponent(this.data.url)),
    })
  },



})