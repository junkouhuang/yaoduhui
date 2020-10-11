// pages/my/index.js
const common = require('../../utils/common');
let timerName1, timerName2;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountId: '',
    adminList: [{
        name: '销售订单',
        img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/b1.png',
        url: '/packageA/pages/sale_order/index'
      },
      {
        name: '采购订单',
        img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/b5.png',
        url: '/packageA/pages/purchase_order/index'
      },
      // {
      //   name: '建档管理',
      //   img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/b33.png',
      //   url: '/packageA/pages/put_record/index'
      // },
      {
        name: '企业管理',
        img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/qiye002.png',
        url: '/packageB/pages/enter-band/index'
      },
      // {
      //   name: '店铺管理',
      //   img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/b22.png',
      //   url: '/packageA/pages/shop-guanli/index'
      // },
      // {
      //   name: '个人信息',
      //   img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/userinfo.png',
      //   url: '/packageA/pages/user/index'
      // },
      // {
      //   name: '积分管理',
      //   img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/b4.png',
      //   // url: '/packageA/pages/integral/index'
      // },
      // {
      //   name: '设置',
      //   img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/setting01.png',
      //   url: '/packageA/pages/setting/index'
      // },
    ], //nav个数
    toolsList: [{
        name: '成为合伙人',
        img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/t01.png',
        url: '/packageA/pages/partner/index'
      },
      {
        name: '业绩统计',
        img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/t02.png',
        url: '/packageA/pages/statistics/index'
      },
      {
        name: '收益',
        img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/t03.png',
        url: '/packageA/pages/earnings/index'
      },
      {
        name: '邀请码',
        img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/QR01.png',
        url: '/packageA/pages/qrcode/index'
      },
    ], //nav个数
    serviceList: [
      //  {
      //    name: '商品追溯',
      //    img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/a5.png'
      //  },
      //  {
      //    name: 'ADR',
      //    img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/adr.png'
      //  },
      //  {
      //    name: 'CIO',
      //    img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/cio.png'
      //  },
      //  {
      //    name: '首营备案',
      //    img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/a3.png'
      //  },
      // {
      //   name: '帮助中心',
      //   img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/help01.png',
      //   url: '/packageA/pages/help/index'
      // },
      // {
      //   name: '我的收藏',
      //   img: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/langsc01.png',
      //   url: '/packageA/pages/like-goods/index'
      // },


    ], //nav个数
    opacity: 0,
    bottom: '-100%',
    showMask: false,
    bandingIndex: null,
    enterpriseList: [],
    enterpriseName: '',
    exit: true,
    enterpriseId: '',
    userInfo: {},
    realData: null,
    salesmanType: -1,
    flag: false, //true:立即进入 false:立即开通
    toux: true,
    level: true,
    has: true
  },

  onUnload() {
    clearTimeout(timerName1)
    clearTimeout(timerName2)
  },

  /**
   * 地址管理
   */
  addressAdmin() {
    wx.navigateTo({
      url: '/packageA/pages/address_list/index?id=1',
    })
  },

  /**
   * 修改用户信息
   */
  setUserInfo() {
    wx.navigateTo({
      url: '/packageA/pages/user/index',
    })
  },

  onLoad() {
     this.find();
     this.EnterpriseList();
     this.getLevel();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getUserInfoData();
    wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
    wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo')
  },

  //合伙人等级
  async getLevel() {
    const that = this;
    const res = await wx.$http.post('/ydh/mall/userAgent/getBasicInfo', {
      enterpriseId: that.data.enterpriseId ? that.data.enterpriseId : ''
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == 'ERR_0000') {
      this.data.accountId = res.data.data.accountId; //开户用
      this.setData({
        salesmanType: res.data.data.salesmanType,
        flag: res.data.data.flag
      })
    }
  },
  //热线
  hotLine() {
    wx.showActionSheet({
      itemList: ['400-833-7998', '呼叫'],
      success: function (res) {
        if (res.tapIndex == 1) {
          wx.makePhoneCall({
            phoneNumber: '400-833-7998',
          })
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  //邀请码
  qrcode() {
    let that = this;
    let userInfo = {
      avatar: that.data.userInfo.avatar,
      nickname: that.data.userInfo.nickname,
      telephone: that.data.userInfo.telephone
    }
    wx.navigateTo({
      url: '/packageA/pages/qrcode/index?userInfo=' + JSON.stringify(userInfo)
    })
  },
  //退出
  loginout: function () {
    wx.showModal({
      title: '',
      content: '确定退出登录？',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('searchHistrory_data');
          wx.removeStorageSync('car_alreadySelectNum');
          wx.removeStorageSync('EnterpriseList');
          wx.removeStorageSync('manageAuth');
          wx.removeStorageSync('nickname');
          wx.removeStorageSync('accountId');
          wx.removeStorageSync('avatar');
          wx.reLaunch({
            url: '/packageC/pages/login/index'
          })
        }
      }
    })
  },
  //请求当前绑定企业列表
  async EnterpriseList() {
    try {
      let result = await wx.getStorageSync('EnterpriseList');

      if (result) {
        this.setData({
          has: result.enterpriseList.length > 0 ? true : false,
          enterpriseList: result.enterpriseList,
          enterpriseName: result.enterpriseName,
          exit: result.enterpriseName ? true : false,
          supplierType: result.supplierType
        })
        this.data.bandingIndex = result.bandingIndex;
        this.data.enterpriseId = result.enterpriseId;
      } else {
        this.setData({
          exit:false
        })
      }
    } catch (err) {}
  },
  //选择企业Mask
  async selectEnterprise() {
    await common.getEnterpriseList();
    this.EnterpriseList();
    this.setData({
      showMask: true
    })
    timerName1 = setTimeout(() => {
      this.setData({
        opacity: 0.5,
        bottom: '0rpx'
      })
    }, 50)
    wx.$http.post('/ydh/mall/walletBasic/enterpriseInfo')
    wx.$http.post('/ydh/mall/individualwalletBasic/individualInfo')
  },
  //关闭Mask
  closeMask() {
    this.setData({
      opacity: 0,
      bottom: '-100%'
    })
    timerName2 = setTimeout(() => {
      this.setData({
        showMask: false
      })
    }, 300)
  },
  //切换企业
  async handleSelectItem(e) {
    try {
      let index = e.currentTarget.dataset.index
      const params = {
        enterpriseId: this.data.enterpriseList[index].enterpriseId
      }
      const res = await wx.$http.post('/ydh/mall/enterprise/changeEnterprise', params, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == 'ERR_0000') {
        this.closeMask();
        let bandingIndex = this.data.bandingIndex
        if (bandingIndex !== "") {
          for (let i in this.data.enterpriseList) {
            this.data.enterpriseList[i].loginStatus = 0
          }
        }
        const enterpriseName = this.data.enterpriseList[index].enterpriseName
        const enterpriseId = this.data.enterpriseList[index].enterpriseId
        const supplierType = this.data.enterpriseList[index].supplierType
        this.data.enterpriseList[index].loginStatus = 1
        this.setData({
          enterpriseList: this.data.enterpriseList,
          enterpriseName,
          supplierType,
        })
        let result = {
          enterpriseName: enterpriseName,
          enterpriseId: enterpriseId,
          bandingIndex: index,
          enterpriseList: this.data.enterpriseList,
          provinceId: this.data.enterpriseList[index].provinceId,
          supplierType: this.data.enterpriseList[index].supplierType,
        }
        wx.setStorageSync('EnterpriseList', result);
        this.data.bandingIndex = index;
        //getApp().globalData.refresh = true;
        await common.carlist(1);
        common.getManageAuth(enterpriseId);
        wx.setStorageSync('validitycheck', false);
        await this.getLevel();
      }
    } catch (err) {
      console.log(err)
    }
  },
  //新增企业
  async handleAddEenterprise() {
    wx.navigateTo({
      url: '/packageB/pages/band/search/index?hasBtn=false',
    })
    this.closeMask()
  },
  //获取用户信息
  async getUserInfoData() {
    try {
      const res = await wx.$http.post('/authorizes/user/detail', {
        source: 'vaPETb8KC7K3k/69ZUoJIC9ErVdnXgp/8Oi0rimwz3TOLUbvFPjowQ=='
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.data) {
        this.setData({
          userInfo: res.data.data,
          toux: true
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  //查询用户实名信息
  async find() {
    const res = await wx.$http.post('/ydh/user/authentication/find')
    if (!res.data.data) {
      this.setData({
        realData: {}
      })
      return
    } else {
      this.setData({
        realData: res.data.data
      })
      return
    }
  },
  //进入会员中心
  async handleMemberCenter() {
    wx.setStorageSync('avatar', this.data.userInfo.avatar);
    wx.setStorageSync('accountId', this.data.accountId);
    wx.setStorageSync('nickname', this.data.userInfo.nickname);
    wx.navigateTo({
      url: '/pages/member/index?accountId=' + this.data.accountId + "&avatar=" + this.data.userInfo.avatar + "&nickname=" + this.data.userInfo.nickname,
    })
  },
})