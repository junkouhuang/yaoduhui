
Page({

  /**
   * 页面的初始数据
   */
  data: {
    withdraw:0,
    time:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.applyDisplay();
    
  },


  /**
   * isee
   */
  async isee(){
    wx.navigateBack()
  },


   async applyDisplay() {
     const that = this;
     let res = await wx.$http.post('/ydh/mall/agentCommissionSettlement/applyDisplay')
      that.setData({
        withdraw:res.data.data.settlementPrice,
        time:res.data.data.createTime
      })
  },
})