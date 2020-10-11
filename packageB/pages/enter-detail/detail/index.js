const tool = require("../../../../utils/filter");
let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      item: JSON.parse(options.obj)
    })
    let nacTxt = options.type == "my" ? "法人/负责人" : options.type == "worker" ? "员工详情" : ""

    wx.setNavigationBarTitle({
      title: `${nacTxt}`,
    })
  },

  onUnload(){
    clearTimeout(timer)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 解除员工信息
   */
  async unband() {
    const that = this;
    wx.showModal({
      title: '',
      content: '确认要将该员工与企业解绑吗',
      confirmColor: '#3996E1',
      confirmText: '确认',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.staffaduit();
        } else {

        }
      }
    })
  },

  /**
   * 管理权转让
   */
  transfer() {
    wx.navigateTo({
      url: '/packageB/pages/enter-detail/transfer/index?enterpriseId=' + this.data.item.enterpriseId,
    })
  },

  /**
   * 解绑
   */

  unband: tool.debounce(function() {
    this.unbandHandle();
  }),

  async unbandHandle() {
    const that = this;
    wx.showModal({
      title: '',
      content: '确认要将该员工与企业解绑吗',
      confirmColor: '#3996E1',
      confirmText: '确认',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.staffaduit();
        }
      }
    })
  },
  //mall/shop/changeAuth

  async staffaduit() {
    const that = this;
    const data = {
      status: 3,
      remark: '',
      bindApplyId: this.data.item.bindApplyId,
      enterpriseId: this.data.item.enterpriseId
    }
    const res = await wx.$http.post('/ydh/mall/shop/staffaduit', data, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.returnCode == 'ERR_0000') {
      wx.showToast({
        title: '已解绑',
        icon: 'none',
        duration: 1500
      })
      timer = setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    }
  }
})