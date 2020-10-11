// pages/integral/purchase/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIndex:12,
    activeIndex:null,
    lookAgreement:false,
    integralNumber:0,
    totalMoney:0,
    integralPrise:1000
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //查看更多
  async handleLookMore(){
    if(this.data.showIndex==12){
      this.setData({
        showIndex:10000
      })
    }else{
      this.setData({
        showIndex:12
      })
    }
  },
  //选择用户
  async handleSelectItem(e){
    const index = e.currentTarget.dataset.index
    if(index!=this.data.activeIndex){
      this.setData({
        activeIndex:index
      })
    }
  },
  //勾选协议
  handleSelectAgreement(){
    this.setData({
      lookAgreement:!this.data.lookAgreement
    })
  },
  //减积分卡数量
  reduce(){
    if(this.data.integralNumber==0) return 
    let integralNumber= --this.data.integralNumber
    let totalMoney = integralNumber * this.data.integralPrise
    this.setData({
      integralNumber,
      totalMoney
    })

  },
  //加积分卡数量
  add(){
    try{
      let integralNumber = ++this.data.integralNumber
      let totalMoney = integralNumber * this.data.integralPrise
      this.setData({
        integralNumber,
        totalMoney
      })
    }catch(err){
      console.log(err)
    }
  },
  //提交订单
  async handleSubmit(){
    if(this.data.activeIndex==null){
      wx.showToast({
        title: '请选择预约的用户',
        icon: 'none',
        duration: 2000
      })
      return 
    }

    if (this.data.integralNumber == 0) {
      wx.showToast({
        title: '预约数量不能为0',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.lookAgreement) {
      wx.showToast({
        title: '请勾选我已了解按钮',
        icon: 'none',
        duration: 2000
      })
      return
    }

    
  }
})