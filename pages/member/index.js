// pages/member/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberData: {},
    basicInfoData: {},
    isHandle: false,
    seen: true,
    see: true,
    hidden1: true,
    hidden2: true,
    avatar: '',
    nickname: '',
    has:false,
    again: '', //成功页返回标识
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const that = this;
    //await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
    //await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo')
    //await this.requsetMemberData()
    let avatar = wx.getStorageSync('avatar');
    let accountId = wx.getStorageSync('accountId');
    let nickname = wx.getStorageSync('nickname');
    that.setData({
      //memberData: JSON.parse(options.list),
      accountId: options.accountId?options.accountId:accountId,
      avatar: options.avatar?options.avatar:avatar,
      nickname: options.nickname?options.nickname:nickname,
      again: options.again ? options.again : '',
    })

  },

  /**
   * 回退
   */
  return () {
    wx.navigateBack();
  },

  seen() {
    this.setData({
      seen: !this.data.seen
    })
  },

  see() {
    this.setData({
      see: !this.data.see
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    if (!this.data.isHandle) {
      this.data.isHandle = true;
    }
    await this.requsetMemberData()
    //await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
    //await wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo')

  },

  //激活
  activation() {
    this.setData({
      hidden1: false
    })
  },

  //closemGG
  closemGG() {
    this.setData({
      hidden1: true
    })
  },

  //充值方式
  czType() {
    this.setData({
      hidden2: false
    })
  },

  //账单管理
  billAdmin() {
    if (this.data.memberData.enterpriseAccountResult.bsyStatus == 7) {
      wx.showToast({
        title: '当前卡号未激活',
        icon: 'none',
        duration: 1000
      })
    } else {
      wx.navigateTo({
        url: `/pages/member/bill_details/index?account=${this.data.memberData.enterpriseAccountResult.account}&accountId=${this.data.memberData.enterpriseAccountResult.accountId}`,
      })
    }
  },

  //closemCZ
  closemCZ() {
    this.setData({
      hidden2: true
    })
  },

  //开户
  async handleOpenAccount(e) {
    const accountType = e.currentTarget.dataset.accounttype
    if (!this.data.memberData.enterpriseAccountResult.enterpriseName && accountType == '1002') {
      const result = await wx.showModal({
        content: '企业开户需要先绑定企业后才能开通',
        confirmText: '去绑定',
        cancelText: '知道了'
      })

      if (result.confirm) {
        this.handleAddEenterprise();
      }
    } else {
      this.accountHandle(accountType);
    }
  },


  accountHandle(accountType) {
    let enterpriseName = this.data.memberData.enterpriseAccountResult.enterpriseName;
    let enterpriseId = this.data.memberData.enterpriseAccountResult.enterpriseId;
    let businessModeId = this.data.memberData.enterpriseAccountResult.businessModeId;
    let url = null
    if (accountType == 1002) { //企业开户
      url = `/pages/member/account-two/index?enterpriseName=${enterpriseName}&enterpriseId=${enterpriseId}&businessModeId=${businessModeId}`
    } else if (accountType == 1001) { //个人开户
      url = `/pages/member/open-account/index?list=null`
    }
    wx.navigateTo({
      url,
    })
  },
  //请求会员中心数据
  async requsetMemberData() {
    try {
      if (!this.data.isHandle) {
        wx.showLoading({
          title: '加载中',
        })
      }
      const res = await wx.$http.post('/ydh/mall/walletBasic/getBasicInfo')
      if (res.data.returnCode == 'ERR_0000') {
        const memberData = res.data.data
        //企业-公户2 
        if (res.data.data.enterpriseAccountResult.userType == 2 && res.data.data.enterpriseAccountResult.bsyStatus == 7) {
          await wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
        }
        await this.setData({
          memberData,
          has:true
        })
      }
      wx.hideLoading()
    } catch (err) {
      console.log(err)
      wx.hideLoading();
    }
  },

  //绑定卡
  handlebindingCard(e) {
    if (e.currentTarget.dataset.type == 0) { //企业
      wx.navigateTo({
        url: '/pages/member/binding-card/index?accountType=' + this.data.memberData.enterpriseAccountResult.accountType + "&userType=" + this.data.memberData.enterpriseAccountResult.userType,
      })
    }
    if (e.currentTarget.dataset.type == 1) {
      wx.navigateTo({
        url: "/pages/member/binding-card/index?accountType=" + this.data.memberData.individualAccountResult.accountType + "&userTyp='' ",
      })
    }
  },
  //变更
  async handleChangeMsg(e) {
    try {
      let params = {}
      let url = '';
      if (e.currentTarget.dataset.type == "0") { //企业
        params = {
          virtualAccountId: this.data.memberData.enterpriseAccountResult.virtualAccountId,
        }
        url = '/ydh/mall/walletBasic/getBsyInfo';
      }
      if (e.currentTarget.dataset.type == "1") {
        params = {
          accountId: this.data.memberData.individualAccountResult.accountId,
        }
        url = '/ydh/mall/individualwalletBasic/individualUserInfo';
      }
      const res = await wx.$http.post(url, params, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        const data = res.data.data
        if (e.currentTarget.dataset.type == 0) { //企业
          let stringData = `enterpriseName=${data.virtualAccountName}&phoneNumber=${data.mobilePhone}&userType=${data.userType}&certificateNumber=${data.qualificationsNumber}&idCard=${data.certNo}&userName=${data.bossName}`
          wx.navigateTo({
            url: `/pages/member/account-two/index?${stringData}`,
          })
        }
        if (e.currentTarget.dataset.type == 1) {
          wx.navigateTo({
            url: "/pages/member/open-account/index?list=" + JSON.stringify(data),
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  },
   //账户管理
   async handleManageAccount(e) {
    if (e.currentTarget.dataset.type == "0") { //企业
      if (!this.data.memberData.enterpriseAccountResult.bsyStatus && this.data.memberData.enterpriseAccountResult.bsyStatus != 0) return
      let parameter = {
        accountType: this.data.memberData.enterpriseAccountResult.accountType,
        userType: this.data.memberData.enterpriseAccountResult.userType,
        virtualAccountId: this.data.memberData.enterpriseAccountResult.virtualAccountId,
        accountId: this.data.memberData.enterpriseAccountResult.accountId,
        bizAddress: this.data.memberData.enterpriseAccountResult.bizAddress,
        businessLicenseCode: this.data.memberData.enterpriseAccountResult.businessLicenseCode,
      }
      parameter = JSON.stringify(parameter);
      //账户类型和银行卡号
      wx.navigateTo({
        url: `/pages/member/manage-account-update/index?parameter=${parameter}`,
      })
    }
    if (e.currentTarget.dataset.type == "1") {
      if (!this.data.memberData.individualAccountResult.bsyStatus && this.data.memberData.individualAccountResult.bsyStatus != 0) return
      let parameter = {
        accountType: this.data.memberData.individualAccountResult.accountType,
        userType: this.data.memberData.individualAccountResult.userType,
        virtualAccountId: this.data.memberData.individualAccountResult.virtualAccountId,
        accountId: this.data.memberData.individualAccountResult.accountId,
        bizAddress: this.data.memberData.individualAccountResult.bizAddress,
        businessLicenseCode: this.data.memberData.individualAccountResult.businessLicenseCode,
      }
      parameter = JSON.stringify(parameter);
      //账户类型和银行卡号
      wx.navigateTo({
        url: `/pages/member/manage-account-update/index?parameter=${parameter}`,
      })
    }

  },
  //充值
  async handleRecharge(e) {
    const result = await this.handleTipsMessage(Number(e.currentTarget.dataset.type))
    if (!result) return
    if (e.currentTarget.dataset.type == "0") {
      wx.navigateTo({
        url: `/pages/member/recharge/index?accountType=${this.data.memberData.enterpriseAccountResult.accountType}`,
      })
    }
    if (e.currentTarget.dataset.type == "1") {
      wx.navigateTo({
        url: `/pages/member/recharge/index?accountType=${this.data.memberData.individualAccountResult.accountType}`,
      })
    }
  },
  async handleTipsMessage(type) {
    if ((type == 0 ? this.data.memberData.enterpriseAccountResult.bsyStatus : this.data.memberData.individualAccountResult.bsyStatus) == 9) {
      wx.showToast({
        title: '请先绑定银行卡',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    if ((type == 0 ? this.data.memberData.enterpriseAccountResult.bsyStatus : this.data.memberData.individualAccountResult.bsyStatus) == 6) {
      wx.showToast({
        title: '请先完成银行开户',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    const flg= this.checkBsyStatus(type == 0 ? this.data.memberData.enterpriseAccountResult.bsyStatus : this.data.memberData.individualAccountResult.bsyStatus, type);
    return flg
  },
  //转账
  async handleTransferAccounts(e) {
    const result = await this.handleTipsMessage(Number(e.currentTarget.dataset.type))
    if (!result) return
    if (e.currentTarget.dataset.type == "0") {
      wx.navigateTo({
        url: '/pages/member/transfer/index?accountType=' + this.data.memberData.enterpriseAccountResult.accountType,
      })
    }
    if (e.currentTarget.dataset.type == "1") {
      wx.navigateTo({
        url: '/pages/member/transfer/index?accountType=' + this.data.memberData.individualAccountResult.accountType,
      })
    }
  },
  //复制
  copy(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success: function(res) {
      }
    })
  },
  //提现
  async handleCashWithdrawal(e) {
    const result = await this.handleTipsMessage(Number(e.currentTarget.dataset.type))
    if (!result) return
    if (e.currentTarget.dataset.type == "0") {
      wx.navigateTo({
        url: `/pages/member/cash-withdrawal/index?accountType=${this.data.memberData.enterpriseAccountResult.accountType}&virtualAccountId=${this.data.memberData.enterpriseAccountResult.virtualAccountId}`,
      })
    }
    if (e.currentTarget.dataset.type == "1") {
      wx.navigateTo({
        url: `/pages/member/cash-withdrawal/index?accountType=${this.data.memberData.individualAccountResult.accountType}&virtualAccountId=${this.data.memberData.individualAccountResult.virtualAccountId}`,
      })
    }
  },
  //
  async handleAddEenterprise() {
    wx.navigateTo({
      url: '/packageB/pages/band/search/index',
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.data.again != '') {
      //清除缓存
      wx.removeStorageSync('avatar', this.data.userInfo.avatar);
      wx.removeStorageSync('accountId', this.data.accountId);
      wx.removeStorageSync('nickname', this.data.userInfo.nickname);
      wx.reLaunch({
        url: '/pages/my/index',
      })
    }
  },

  /**
   * 补充资料提示
   * param {bsyStatus  type 0企业账户 1个人账户}
   */
  async checkBsyStatus(bsyStatus,type) {
    let flg=true;
    let that =this;
    if (bsyStatus == 10) {
      flg=false;
      wx.showModal({
        title:'系统公告',
        content: '为更加满足监管对于客户身份识别的要求，近期渤海银行将对系统开户进行优化调整，完善客户信息采集，您需要补充该账户开户资料后才能正常使用，对此给您带来的不变敬请谅解。',
        confirmText: '补充资料',
        showCancel: true,//是否显示取消按钮
        cancelText: '取消',
        cancelColor:'#333333',
        confirmColor: '#4498E0',
        success: function (res) {
          //接口调用成功
          if (res.confirm) {
            let parameter = {
              accountType: type == 0 ? that.data.memberData.enterpriseAccountResult.accountType : that.data.memberData.individualAccountResult.accountType,
              userType: type == 0 ? that.data.memberData.enterpriseAccountResult.userType : that.data.memberData.individualAccountResult.userType,
              virtualAccountId: type == 0 ? that.data.memberData.enterpriseAccountResult.virtualAccountId : that.data.memberData.individualAccountResult.virtualAccountId,
              accountId: type == 0 ? that.data.memberData.enterpriseAccountResult.accountId : that.data.memberData.individualAccountResult.accountId,
              bizAddress: type == 0 ? that.data.memberData.enterpriseAccountResult.bizAddress : that.data.memberData.individualAccountResult.bizAddress,
              businessLicenseCode: type == 0 ? that.data.memberData.enterpriseAccountResult.businessLicenseCode : that.data.memberData.individualAccountResult.businessLicenseCode,
            }
            parameter = JSON.stringify(parameter);
            //账户类型和银行卡号
            wx.navigateTo({
              url: `/pages/member/manage-account-update/index?parameter=${parameter}`,
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        },
        fail: function (res) {
          //接口调用失败的回调函数 
          console.log(res)
        },
        complete: function (res) {
          //接口调用结束的回调函数  
        }
      })
    }
    return flg;
  }
})