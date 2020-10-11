// pages/verify_phone_number/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleForm: {
      password:'',
      confirm:'',
      phone: "",
      vericode: "",
      openid:'',
      sign: null,
      avatarUrl: null,//头像
      city: null,//城市
      provice: null,//省份
      country: null,//国家
      gender: null,//性别1男0女
      nickname: null,//昵称
    },
    //check:true,
    focus: -1, //文本框获得焦点边框高亮
    can: false,//登錄按鈕呈半透明
    sent:false,//发送短信半透明
    mess:'获取验证码',
    clearInterval:null,
    secodes:90,
    userInfo:[]//微信用户信息
  },

  onLoad(){
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.getOpenid(res.code);
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
  },

  /**
   * 同意协议
   */
  // check: function () {
  //   let that = this;
  //   that.setData({
  //     check: !that.data.check,
  //     can: that.data.ruleForm.phone.length ==11  && that.data.ruleForm.vericode.length == 6 && !that.data.check ? true : false
  //   })
  // },

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
  * 手機获得焦点
  */
  phoneFocus: function () {
    let that = this;
    that.setData({
      focus: 0
    });
  },

getValue: function (e) {
  let that = this;
  const sign = e.currentTarget.dataset.sign;
  that.data.ruleForm[sign] = e.detail.value;
  that.isCan();
},

isCan(){
  const that = this;
  that.setData({
    can: that.data.ruleForm.password && 
    that.data.ruleForm.confirm   && 
    that.data.ruleForm.phone   && 
    that.data.ruleForm.vericode ? true : false
  })
},


  /**
   * 协议
   */
  protocol: function () {
    wx.navigateTo({
      url: '/packageC/pages/register/template/verify_phone_number/template/protocol/index'
    })
  },

  /**
  * 手機正在输入
  */
  phoneInput: function (e) {
    let that = this;
    if (e.detail.value.length==11){
      if (!(/^1[3456789]\d{9}$/.test(e.detail.value))) {
        wx.showToast({
          title: '手机格式不正确', //标题，不写默认正在加载
          icon: 'none',
          duration: 2000
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
    this.isCan();
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
      can: e.detail.value.length == 6 && that.data.ruleForm.phone.length == 11? true : false
    })
    that.data.ruleForm.vericode = e.detail.value;
  },

  /**
  * 获取短信验证码
  */
  async getvericode() {
    let that = this;
    let res = await wx.$http.post('/authorizes/security/code', { phone: that.data.ruleForm.phone, type: 0 }, { 'content-type': 'application/x-www-form-urlencoded' });
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
        icon:'none',
        duration:2000
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
    if(res.data.returnCode == "ERR_0002"){
      wx.showToast({
        title: '暂不支持该虚拟手机号段',
        icon:'none'
      })
    }
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
   * 下一步
   */
  async next() {
    let that = this;
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
    if (that.data.ruleForm.phone === '') {
      wx.showToast({
        title: '手机号不能为空', //标题，不写默认正在加载
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (that.data.ruleForm.vericode === '') {
      wx.showToast({
        title: '验证码不能为空', //标题，不写默认正在加载
        icon: 'none',
        duration: 2000
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
        this.data.ruleForm.sign = res.data.data;
        //getApp().globalData.userInfo["phone"] = that.data.ruleForm.phone;//注册②
        //getApp().globalData.userInfo["sign"] = res.data.data;//注册②
        //getApp().globalData.reg1 = getApp().globalData.userInfo;//合并对象
        //wx.navigateTo({
        //  url: '/packageC/pages/register/template/set_password/index'
        //})
        this.register();
      }
  },

  /**
  * 立即注册
  */
 async register() {
  let that = this;
  let data = {
    username:that.data.ruleForm.phone,
    password:that.data.ruleForm.password,
    confirm:that.data.ruleForm.confirm,
    code:'',
    openid:that.data.ruleForm.openid,
    source: "+p/LQRPTDPW2/FIr1nZO8d2VkBDTSOg2s8mo/nMOG4rOLUbvFPjowQ==",//民乐荟   vaPETb8KC7K3k/69ZUoJIC9ErVdnXgp/8Oi0rimwz3TOLUbvFPjowQ== 药都荟   +p/LQRPTDPW2/FIr1nZO8d2VkBDTSOg2s8mo/nMOG4rOLUbvFPjowQ==
    enable:true,
    nickname: getApp().globalData.userInfo.nickname,//昵称
    sex: getApp().globalData.userInfo.sex,//性别1男0女
    avatar: getApp().globalData.userInfo.avatar,//头像
    birthday:'',
    phone:that.data.ruleForm.phone,
    sign:that.data.ruleForm.sign
  }
  let res = await wx.$http.post('/authorizes/user/simple/register', data, { 'content-type': 'application/x-www-form-urlencoded' });

  if (res.data.returnCode == "ERR_0000") {
    let data = {
      phone:that.data.ruleForm.phone,
      sign:that.data.ruleForm.sign
    }
    getApp().globalData.reg2 = data;
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
})