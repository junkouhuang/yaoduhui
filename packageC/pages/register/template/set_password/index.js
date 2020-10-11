// pages/verify_phone_number/index.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleForm:{
      username:"",
      password: "",
      confirm: "",
      code:"",
      openid:null,
      source: "+p/LQRPTDPW2/FIr1nZO8d2VkBDTSOg2s8mo/nMOG4rOLUbvFPjowQ==",//民乐荟   vaPETb8KC7K3k/69ZUoJIC9ErVdnXgp/8Oi0rimwz3TOLUbvFPjowQ== 药都荟   +p/LQRPTDPW2/FIr1nZO8d2VkBDTSOg2s8mo/nMOG4rOLUbvFPjowQ==
      enable:true
    },
    hide1: true,//控制小眼睛和密码明文
    hide2: true,//控制小眼睛和密码明文
    focus: -1, //文本框获得焦点边框高亮
    can: false,//登錄按鈕呈半透明
    avatarUrl: null,//头像
    city: null,//城市
    provice: null,//省份
    country: null,//国家
    gender: null,//性别1男0女
    nickname: null,//昵称
    userInfo:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this;
    that.data.ruleForm.username = getApp().globalData.userInfo["phone"]
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        that.getOpenid(res.code);
      }
    })
  },

  /**
  * 用户名获得焦点
  */
  usernameFocus: function () {
    let that = this;
    that.setData({
      focus: 0,
      close: that.data.ruleForm.username != "" ? true : false
    });
  },

  /**
   * 用户名失去焦点
   */
  usernameBlur: function () {
    let that = this;
    that.setData({
      close: false
    });
  },

  /**
   * 推荐碼获得焦点
   */
  codeFocus: function () {
    let that = this;
    that.setData({
      focus: 1
    });
  },

  /**
  * 密碼获得焦点
  */
  passwordFocus: function () {
    let that = this;
    that.setData({
      focus: 2
    });
  },

  /**
  * 确认密碼获得焦点
  */
  confirmpasswordFocus: function () {
    let that = this;
    that.setData({
      focus: 3
    });
  },

  /**
  * 用户名正在输入
  */
  usernameInput: function (e) {
    let that = this;
    that.setData({
      can: e.detail.value !== '' && that.data.ruleForm.password !== ''  && that.data.ruleForm.confirm !== '' ? true : false,
      close: e.detail.value !== "" ? true : false,
    })
    that.data.ruleForm.username = e.detail.value;
  },

  /**
  * 密码正在输入
  */
  passwordInput: function (e) {
    let that = this;
    that.setData({
      can: e.detail.value !== '' && that.data.ruleForm.username !== ''  && that.data.ruleForm.confirm !== '' ? true : false
    })
    that.data.ruleForm.password = e.detail.value;
  },

  /**
  * 确认密码正在输入
  */
  confirmpasswordInput: function (e) {
    let that = this;
    that.setData({
      can: e.detail.value !== '' && that.data.ruleForm.username !== ''  && that.data.ruleForm.password !== '' ? true : false
    })
    that.data.ruleForm.confirm = e.detail.value;
  },

  /**
   * 顯示或隱藏密碼
   */
  seen1: function () {
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
  seen2: function () {
    let that = this;
    let confirm = 'ruleForm.confirm'
    that.setData({
      hide2: !that.data.hide2,
      [confirm]: that.data.ruleForm.confirm
    });
  },

  /**
  * 立即注册
  */
  async register() {
    let that = this;
    if (that.data.ruleForm.username === '') {
      wx.showToast({
        title: '用户名/手机号不能为空',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (that.data.ruleForm.password === '') {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
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
   
    let res = await wx.$http.post('/authorizes/user/simple/register', Object.assign(that.data.ruleForm, getApp().globalData.reg1), { 'content-type': 'application/x-www-form-urlencoded' });

    if (res.data.returnCode == "ERR_0000") {
      getApp().globalData.reg2 = that.data.ruleForm;
      //跳转注册成功页
      wx.reLaunch({
        url: '/packageC/pages/register/template/register_success/index' //合并对象
      })
    }
    if (res.data.returnCode == "ERR_0009") {
      wx.showToast({
        title: '账号已存在',
        icon:none,
        duration:1500
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

  /**
  * 清除用户名
  */
  clear: function () {
    let that = this;
    let username = 'ruleForm.username'
    that.setData({
      [username]: "",
      close: false,
      can: false
    });
  },

  /**
   * 扫一扫，获取推荐码
   */
  scan:function(){
    let that = this;
    wx.scanCode({
      success: (res) => {
        let code = 'ruleForm.code';
        this.setData({
          [code]: res.result.replace(/./g, '*'),
          can:  that.data.ruleForm.password !== '' && that.data.ruleForm.username !== '' &&  that.data.ruleForm.confirm !== ''  ? true : false
        })
        that.data.ruleForm.code = res.result;
      },
      fail: (res) => {
        
      }
    })
  },


  /**
   * 获取openid
   */
  async getOpenid(code) {
    let that = this;
    let res = await wx.$http.get('/common/wxmp/ydh/login', { code: code }, { 'content-type': 'application/x-www-form-urlencoded' })
    that.data.ruleForm.openid = JSON.parse(res.data.data).openid;//注册②
  }
})