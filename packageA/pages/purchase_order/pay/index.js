const tool = require("../../../../utils/filter.js")
let timerName1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: -1,
    userType: '',
    showMask: true,
    virtualAccountId: '', //付款方账号
    purchaseOrderId: '', //采购单号
    verifyNo: '', //短信验证码
    params: {
      transAmount: '', // 交易金额
      transCode: 'DDQR', //  交易码
      mobilePhone: '', // 手机号
      accountNo: '', //  绑定账户
      acctName: '', //  绑定账户名
      userType: '2', // '用户类型,1:个人 2:企业 3:同业 4:个体工商户'
    },
    opacity: 0,
    bottom: '-100%',
    chinesization: '', //大写
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
    let res = await wx.$http.post('/ydh/mall/purchaseorder/payPage', {
      purchaseOrderId: this.data.purchaseOrderId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.data) {
      this.setData({
        data: res.data.data,
        chinesization: tool.convertCurrency(res.data.data.transAmount)
      })
      this.data.params.transAmount = res.data.data.transAmount;
      wx.hideLoading();
    } else {
      wx.hideLoading();
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      })
    }
    //左上角返回按钮时间倒计时
    this.selectComponent("#return").data.purchaseOrderId= options.orderId;
    this.selectComponent("#return").shengTime();
  },

  onUnload(){
    console.log("====")
    clearInterval(timer);
  },
  //关闭Mask
  closeMask() {
    this.setData({
      opacity: 0,
      bottom: '-100%'
    })
    timerName1 = setTimeout(() => {
      this.setData({
        showMask: false
      })
    }, 300)
  },
  //获取短信验证码
  getMessCode(e) {
    this.data.verifyNo = e.detail.value;
    console.log(e)
  },
  //获取手机号码
  getMobilePhone(e) {
    this.data.params.mobilePhone = e.detail.value;
  },
  //选择付款方账户
  async selectPayAccount(e) {
    const virtualAccountId = e.currentTarget.dataset.item.virtualAccountId;
    this.data.userType = e.currentTarget.dataset.item.userType;
    this.setData({
      activeIndex: e.currentTarget.dataset.index,
      virtualAccountId
    })
    this.closeMask();
  },

  //切换付款方账户
  async handleSelectItem() {
    this.setData({
      showMask: true
    })
    timerName1 = setTimeout(() => {
      this.setData({
        opacity: 0.5,
        bottom: '0rpx'
      })
    }, 50)
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

  //立即支付
  payMent: tool.debounce(function () {
    this.payMentHandle();
  }),
  async payMentHandle() {
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
    let res = await wx.$http.post('/ydh/mall/purchaseorder/payOrder', {
      virtualAccountId: this.data.virtualAccountId, //付款方账号
      purchaseOrderId: this.data.purchaseOrderId, //采购单号
      verifyNo: this.data.verifyNo, //短信验证码
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    wx.hideLoading();
    this.selectComponent("#return").clearInterval();
    wx.navigateTo({
      url: "/packageA/pages/purchase_order/pay-success/index?type=1",
    })
  },

})