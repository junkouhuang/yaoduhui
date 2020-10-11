// pages/my/template/help_detail/index.js
var WxParse = require('../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    let that = this;
    const result = wx.getStorageSync('history_detail');

    if(result){
      WxParse.wxParse('article', 'html', result.questionContent, that, 5);
      that.setData({
        questionTitle: result.questionTitle,
        questionContent: result.questionContent,
      })
    }
  },
})