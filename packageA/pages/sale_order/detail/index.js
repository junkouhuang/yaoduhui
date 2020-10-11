
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.selectComponent("#orderDetail").data.orderId = options.orderId;
    this.selectComponent("#orderDetail").data.source = "sale_order";
    this.selectComponent("#orderDetail").detail();
  },
})