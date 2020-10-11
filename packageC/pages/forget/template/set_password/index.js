// pages/verify_phone_number/index.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleForm: {
      phone: '',
      password: "",
      confirm: "",
      sign: ''
    },
    hide1: true, //控制小眼睛和密码明文
    hide2: true, //控制小眼睛和密码明文
    focus: -1, //文本框获得焦点边框高亮
    can: false, //登錄按鈕呈半透明
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    let that = this;
    that.data.ruleForm.phone = getApp().globalData["phone"];
    that.data.ruleForm.sign = getApp().globalData["sign"];
  },

  /**
   * 密碼获得焦点
   */
  passwordFocus: function() {
    let that = this;
    that.setData({
      focus: 2
    });
  },

  /**
   * 确认密碼获得焦点
   */
  confirmpasswordFocus: function() {
    let that = this;
    that.setData({
      focus: 3
    });
  },

  /**
   * 密码正在输入
   */
  passwordInput: function(e) {
    let that = this;
    that.setData({
      can: e.detail.value !== '' && that.data.ruleForm.code !== '' && that.data.ruleForm.confirm !== '' ? true : false
    })
    that.data.ruleForm.password = e.detail.value;
  },

  /**
   * 确认密码正在输入
   */
  confirmpasswordInput: function(e) {
    let that = this;
    that.setData({
      can: e.detail.value !== '' && that.data.ruleForm.code !== '' && that.data.ruleForm.password !== '' ? true : false
    })
    that.data.ruleForm.confirm = e.detail.value;
  },

  /**
   * 顯示或隱藏密碼
   */
  seen1: function() {
    let that = this;
    let password = 'ruleForm.password'
    that.setData({
      hide1: !that.data.hide1,
      [password]: that.data.ruleForm.password
    });
  },

  /**
   * 顯示或隱藏密碼
   */
  seen2: function() {
    let that = this;
    let confirm = 'ruleForm.confirm'
    that.setData({
      hide2: !that.data.hide2,
      [confirm]: that.data.ruleForm.confirm
    });
  },

  /**
   * 找回密码
   */
  async finsh() {
    let that = this;
    //let reg = new RegExp('^(?=.*\\d)(?=.*[a-zA-Z]).{6,18}$');
    let reg = /^[a-zA-Z][0-9A-Za-z]{6,20}$/;
    if (!reg.test(that.data.ruleForm.password)) {
      wx.showToast({
        title: '密码必须至少6个字符，以字母开头，同时包含字母和数字', //标题，不写默认正在加载
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (that.data.ruleForm.confirm === '') {
      wx.showToast({
        title: '确认密码不能为空', //标题，不写默认正在加载
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (!reg.test(that.data.ruleForm.confirm)) {
      wx.showToast({
        title: '确认密码必须至少6个字符，以字母开头，同时包含字母和数字', //标题，不写默认正在加载
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (that.data.ruleForm.password !== that.data.ruleForm.confirm) {
      wx.showToast({
        title: '两次密码不一致', //标题，不写默认正在加载
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    let res = await wx.$http.post('/authorizes/user/passport/forget', Object.assign(that.data.ruleForm, getApp().globalData.reg1), {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.returnCode == "ERR_0000") {
      //  wx.showToast({
      //    title: '修改成功',
      //    icon:'none',
      //    duration:2000
      //  })
   
      wx.redirectTo({
        url: '/packageC/pages/forget/template/setting_success/index',
      })
    }
    if (res.data.returnCode == "ERR_0009") {
      wx.showToast({
        title: '账号已存在',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (res.data.returnCode == "ERR_0017") {
      wx.showToast({
        title: '验证码已过期，请重新获取',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (res.data.returnCode == "ERR_0018") {
      wx.showToast({
        title: '无效验证码',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
  },
})