const tool = require("../../../../utils/filter.js")
let timerName1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobilePhone: '',
    virtualAccountId: '',
    chinesization: '', //大写
    params: {
      transAmount: '', // 交易金额
      transCode: 'DDQR', //  交易码
      mobilePhone: '', // 手机号
      accountNo: '', //  绑定账户
      acctName: '', //  绑定账户名
      userType: '2', // '用户类型,1:个人 2:企业 3:同业 4:个体工商户'
    },
    verifyNo: '',
    btnText: '获取验证码'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.data.purchaseOrderId = options.orderId;
    wx.showLoading({
      title: '加载中',
    });
    let res = await wx.$http.post('/ydh/mall/purchaseorder/confirmPayPage', {
      purchaseOrderId:  this.data.purchaseOrderId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    console.log(res)


    console.log("====");
    if (res.data.data) {
      this.setData({
        data: res.data.data,
        chinesization: tool.convertCurrency(res.data.data.transAmount)
      })
      this.data.userType = res.data.data.userType;
      wx.hideLoading();
    }else{
      wx.hideLoading();
    }
  },

  //获取短信验证码
  getMessCode(e) {
    this.data.verifyNo = e.detail.value;
    console.log(e)
  },

  //获取手机号码
  getMobilePhone(e) {
    this.data.params.mobilePhone = e.detail.value;
    console.log(this.data.params.mobilePhone)
  },

  //获取验证码
  async getCodeBtn() {
    if (!this.data.userType) {
      wx.showToast({
        title: '请选择付款方账户',
        icon: 'none'
      })
      return;
    }
    if (!this.data.params.mobilePhone) {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
      return;
    }
    let time = 60
    this.setData({
      btnText: time + 's后重试'
    })
    const interval = setInterval(() => {
      time--
      if (time > 0) {
        this.setData({
          btnText: time + 's后重试'
        })
      } else {
        this.setData({
          btnText: '获取验证码'
        })
        clearInterval(interval)
      }
    }, 1000)
    let res = await wx.$http.post('/ydh/mall/bankAccount/getVerificationCode', this.data.params)
    console.log(res)
  },

  //确定支付
  payMent: tool.debounce(function () {
    console.log("00000")
    this.payMentHandle();
  }),
  async payMentHandle() {
    let that = this;
    if (!this.data.verifyNo) {
      wx.showToast({
        title: '短信验证码不能为空',
        icon: 'none'
      })
      return;
    }
    wx.showLoading({
      title: '支付中...',
    });
    
    let res = await wx.$http.post('/ydh/mall/purchaseorder/confirmPay', {
      purchaseOrderId: this.data.purchaseOrderId,
      verifyNo: this.data.verifyNo, //短信验证码
      virtualAccountId: this.data.data.payVirtualAccountId //付款方账号
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    console.log(res)
    wx.hideLoading();
    this.selectComponent("#return").clearInterval();
    wx.redirectTo({
      url: "/packageA/pages/purchase_order/pay-success/index?type=2",
    })
  },
})