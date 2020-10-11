let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // modeList: ['生产企业', '经营企业', '连锁总部', '连锁门店', '零售企业', '医疗机构（盈利', '医疗机构(非盈利)', '数据服务公司'],
    // modeList: ['原辅料商', '生产企业', '批发经营企业(药品)', '零售连锁总部', '零售连锁总部', '零售连锁门店', '零售经营企业', '医疗机构(盈利)', '医疗机构(非盈利)', '数据服务公司', '批发经营企业(非药品)'],
    enterpriseMsg: {},
    isDisable:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const params = JSON.parse(options.params);
    this.setData({
      enterpriseMsg: params,
      isDisable: params.contacts && params.mobileNumber && params.idCode?false:true
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    getApp().globalData.isrequset = true;
    clearTimeout(timer);
  },
  //获取输入的值
  handleGetInputData(e) {
    const sign = e.currentTarget.dataset.sign
    const value = e.detail.value
    this.data.enterpriseMsg[sign] = value
    this.setData({
      isDisable: this.data.enterpriseMsg.contacts && this.data.enterpriseMsg.mobileNumber && this.data.enterpriseMsg.idCode ? false : true
    })
    
  },
  //申请绑定
  async binddingEnterprise() {
    try {
      if (this.data.enterpriseMsg.contacts== "") {
        wx.showToast({
          title: '姓名不能为空',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (this.data.enterpriseMsg.mobileNumber== "") {
        wx.showToast({
          title: '手机号码不能为空',
          icon: 'none',
          duration: 2000
        })
        return
      }
      const reg3 = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      if (!reg3.test(this.data.enterpriseMsg.idCode)) {
        wx.showToast({
          title: '身份证格式不正确',
          icon: 'none',
          duration: 2000
        })
        return
      }
      const res = await wx.$http.post('/ydh/mall/enterpriseBindApply/bindEnterpriseApply', this.data.enterpriseMsg);
      if (res.data.returnCode == "ERR_0000"){
        if (res.data.data == 1) {
          // wx.showToast({
          //   title: '成功提交申请',
          //   icon: 'none',
          //   duration: 1000
          // })
          timer = setTimeout(() => {
            //wx.navigateBack()
            wx.navigateTo({
              url: '/packageB/pages/band/bindding/success/index',
            })
          }, 1000)
        }
        if(res.data.data==2){
          wx.showToast({
            title: '审核失败',
            icon: 'none',
            duration: 1000
          })
        }
      }else if(res.data.returnCode == "ERR_0002"){
        wx.showToast({
          title: '身份证号码无效',
          icon: 'none',
          duration: 1000
        })
      }else if(res.data.returnCode == "ERR_0009"){
        wx.showToast({
          title: '您已提交企业绑定申请，请勿重复提交',
          icon: 'none',
          duration: 1000
        })
      }else if (res.data.returnCode == "ERR_0010"){
        wx.showToast({
          title: '账号未进行实名认证',
          icon: 'none',
          duration: 1000
        })
      }else{
        wx.showToast({
          title: res.data.returnMsg,
          icon: 'none',
          duration: 1000
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
})