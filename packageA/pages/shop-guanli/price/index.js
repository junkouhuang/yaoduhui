
const common = require("../../../../utils/common")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minimumPurchasePrice:'',
    disabled:true,
    auth:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    const that = this;
    const minimumPurchasePrice = wx.getStorageSync("minimumPurchasePrice");
    console.log(typeof Number(minimumPurchasePrice))
    if (minimumPurchasePrice){
      that.setData({
        minimumPurchasePrice: Number(minimumPurchasePrice).toFixed(2),
        disabled: minimumPurchasePrice>0?false:true
      })
    }
    const result = await wx.getStorageSync('EnterpriseList');
    const auth = await common.getManageAuth(result.enterpriseId); //判断是否有修改权限
    that.setData({
      auth
    })
  },

  minimumPurchasePriceHandle(e){
    //this.data.minimumPurchasePrice = e.detail.value;
    this.setData({
      minimumPurchasePrice: e.detail.value,
      disabled: e.detail.value > 0 ? false : true
    })
  },

  async save(){
    if (this.data.minimumPurchasePrice == ""){
      wx.showToast({
        title: '起送价不能为空',
        duration:2000,
        icon: 'none',
      })
    }
    const res = await wx.$http.post('/ydh/mall/shop/update', { minimumPurchasePrice: this.data.minimumPurchasePrice }, { 'content-type': 'application/x-www-form-urlencoded' });
    if (res.data.returnCode == "ERR_0000") {
      wx.showToast({
        title: '设置成功',
        duration: 2000,
        icon: 'none',
      })
      wx.setStorageSync('minimumPurchasePrice', this.data.minimumPurchasePrice)
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } else {
      wx.showToast({
        title: res.data.data,
        icon: 'none',
        duration: 2000, //延时关闭，默认2000
      })
    }
  }
})