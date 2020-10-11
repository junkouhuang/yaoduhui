// pages/verify_phone_number/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleForm: {
      phone: "",
      vericode: "",
      sign: null
    },
    focus: -1, //文本框获得焦点边框高亮
    can: false,//登錄按鈕呈半透明
    sent:false,//发送短信半透明
    mess:'获取验证码',
    clearInterval:null,
    secodes:90,
    userInfo:[]//微信用户信息
  },


  /**
  * 手機获得焦点
  */
  phoneFocus: function () {
    let that = this;
    that.setData({
      focus: 0
    });
  },

  /**
  * 手機正在输入
  */
  phoneInput: function (e) {
    let that = this;
    that.setData({
      can: e.detail.value != '' && that.data.ruleForm.vericode.length == 6 ? true : false
    })
    if (e.detail.value.length==11){
      if (!(/^1[3456789]\d{9}$/.test(e.detail.value))) {
        wx.showToast({
          title: '手机格式不正确', //标题，不写默认正在加载
          icon: 'none',
          duration: 1500
        })
      } else {
        that.setData({
          sent: true
        })
        that.data.ruleForm.phone = e.detail.value;
      }
    }else{
      that.setData({
        mess: '获取验证码',
        sent: false
      })
      that.data.secodes = 90;
      clearInterval(that.data.clearInterval)
    }
  },

  /**
  * 驗證碼获得焦点
  */
  vericodeFocus: function () {
    let that = this;
    that.setData({
      focus: 1
    });
  },

  /**
  * 驗證碼正在输入
  */
  vericodeInput: function (e) {
    let that = this;
    that.setData({
      can: e.detail.value.length ==6 && that.data.ruleForm.phone != '' ? true : false
    })
    that.data.ruleForm.vericode = e.detail.value;
  },

  /**
  * 获取短信验证码
  */
  async getvericode() {
    let that = this;
    let res = await wx.$http.post('/authorizes/security/code', { phone: that.data.ruleForm.phone, type: 1 }, { 'content-type': 'application/x-www-form-urlencoded' });
    if (res.data.returnCode == "ERR_0000"){
      that.data.clearInterval = setInterval(() => {
        if (that.data.secodes == 0) {
          that.setData({
            mess: '获取验证码',
            sent: true
          })
          that.data.secodes = 90;
          clearInterval(that.data.clearInterval)
        } else {
          let secode = that.data.secodes-- + 'S后重新获取';
          that.setData({
            mess: secode,
            sent: false
          })
        }
      }, 1000)
    }
    if (res.data.returnCode == "ERR_0019") {
      wx.showToast({
        title: '发送验证码太频繁，请稍后再试',
        icon: 'none',
        duration: 4000
      })
      that.setData({
        mess: '获取验证码',
        sent: true
      })
    }
    if (res.data.returnCode == "ERR_0020"){
      that.setData({
        mess: '获取验证码',
        sent: true
      })
      wx.showToast({
        title: "手机号已被注册",
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 下一步
   */
  async next() {
    let that = this;
    if (that.data.ruleForm.phone === '') {
      wx.showToast({
        title: '手机号不能为空', //标题，不写默认正在加载
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (that.data.ruleForm.vericode === '') {
      wx.showToast({
        title: '验证码不能为空', //标题，不写默认正在加载
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    let res = await wx.$http.post('/authorizes/security/validate',
      {
        phone: that.data.ruleForm.phone,
        code:that.data.ruleForm.vericode
      }, 
      {
        'content-type': 'application/x-www-form-urlencoded'
      });
      if (res.data.returnCode == "ERR_0000") {
        getApp().globalData["phone"] = that.data.ruleForm.phone;//注册②
        getApp().globalData["sign"] = res.data.data;//注册②
        wx.navigateTo({
          url: '/packageC/pages/forget/template/set_password/index'
        })
      }
  },
})