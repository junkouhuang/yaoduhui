// components/verificationCode/index.js
Component({
  // 引用在父组件的样式
  externalClasses: ['my-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    prop: {
      type: Object, //类型
      value: () => {} //默认值
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    getCodeBtnText: ''
  },

  attached: function () {
    // 在组件实例进入页面节点树时执行
    this.setData({
      getCodeBtnText: this.data.prop.btnText
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取验证码
    async getCode() {
      const route = getCurrentPages()[getCurrentPages().length - 1].route
      console.log(route)
      console.log(this.data.prop)
      if (route.includes('pages/member/binding-card/index')) { // 开户 获取验证码
        if (this.data.prop.params.accountNo == '') {
          return wx.showToast({
            title: '请输入银行卡号', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
        if (!(/^(\d{10,25})$/.test(this.data.prop.params.accountNo))) {
          return wx.showToast({
            title: '请输入正确银行卡帐号',
            icon: 'none',
            duration: 2000
          })
        }
        if (this.data.prop.params.bkNam == '') {
          return wx.showToast({
            title: '请选择支行', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
        if (this.data.prop.params.mobilePhone == '') {
          return wx.showToast({
            title: '请输入手机号码', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
        if (!(/^1[3456789]\d{9}$/.test(this.data.prop.params.mobilePhone))) {
          return wx.showToast({
            title: '手机格式不正确', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
      } else if (route.includes('pages/member/recharge/index')) { // 充值 获取验证码
        if (this.data.prop.params.transAmount == '') {
          return wx.showToast({
            title: '请输入充值金额', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
        if (this.data.prop.params.mobilePhone == '') {
          return wx.showToast({
            title: '请输入手机号码', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
        if (!(/^1[3456789]\d{9}$/.test(this.data.prop.params.mobilePhone))) {
          return wx.showToast({
            title: '手机格式不正确', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
      } else if (route.includes('pages/member/cash-withdrawal/index')) { // 提现 获取验证码
        if (this.data.prop.params.transAmount == '') {
          return wx.showToast({
            title: '请输入提现金额', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
        if (this.data.prop.params.mobilePhone == '') {
          return wx.showToast({
            title: '请输入手机号码', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
        if (!(/^1[3456789]\d{9}$/.test(this.data.prop.params.mobilePhone))) {
          return wx.showToast({
            title: '手机格式不正确', //标题，不写默认正在加载
            icon: 'none',
            duration: 2000
          })
        }
      }
      console.log('号码正确，发起请求')
      let flg = await this.getVerificationCode(this.data.prop.url, this.data.prop.params)
      console.log(flg)
      if(!flg){
        return
      }
      let time = 60
      this.setData({
        getCodeBtnText: time + 's后重试'
      })
      const interval = setInterval(() => {
        time--
        if (time > 0) {
          this.setData({
            getCodeBtnText: time + 's后重试'
          })
        } else {
          this.setData({
            getCodeBtnText: this.data.prop.btnText
          })
          clearInterval(interval)
        }
      }, 1000)
    },

    async getVerificationCode (url, data) {
      let flg=true;
      let res=await wx.$http.post(url, data);
      if(res.data.returnCode != 'ERR_0000'){
        flg=false
        wx.showToast({
          title: res.data.returnMsg, //标题，不写默认正在加载
          icon: 'none',
          duration: 2000
        })
      }
      return flg;
    }
  }
})
