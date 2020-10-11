const common = require('../../../utils/common');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    lineLeft: '5%',
    lineLeftList: ['54rpx', '240rpx', '428rpx', '620rpx'],
    lineLeftList2: ['5%', '29.5%', '55%', '80%'],
    item: [],
    nav: ['证件管理', '首营管理', '员工管理', '企业信息'],
    currentIndex: 0,
    data: {},
    has: false,
    show: false,
    remark: '',
    auth: 0, //0没有权限 1有权限
    provinceId: '',
    enterpriseName: '',
    isCan: false,
    syRecord: false,
    showBuilding: false,
    showAlert: false,
    no_auth: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      item: JSON.parse(options.data)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    const that = this;
    if (getApp().globalData["avatar"]) {
      const imgUrl = getApp().globalData["avatar"];
      await that.changeImgFun(imgUrl);
    }
    await that.getRequestData();
  },

  onUnload() {
    getApp().globalData["avatar"] = ''
  },

  /**
   * 预览图片
   */
  previewImg(e) {
    const imgUrl = e.currentTarget.dataset.src;
    common.previewImg(imgUrl)
  },

  /**
   * 获取基础数据
   */
  async getRequestData() {
    const that = this;
    let {
      enterpriseId,
      enterpriseName,
      provinceId
    } = that.data.item;
    let url = "";
    let data = {}
    if (that.data.currentIndex == 0) {
      url = "/ydh/mall/enterprise/enterpriseInfo"
      data = {
        enterpriseId
      }
    }
    if (that.data.currentIndex == 1) {
      url = "/ydh/mall/archive/findArchiveEnterprise"
      data = {
        provinceId,
        enterpriseId,
        enterpriseName
      }
    }
    if (that.data.currentIndex == 2) {
      url = "/ydh/mall/shop/getEnterpriseStaff"
      data = {
        enterpriseId
      }
    }
    if (that.data.currentIndex == 3) {
      url = "/ydh/mall/enterprise/getInfoById"
      data = {
        enterpriseId
      }
    }
    const res = await wx.$http.post(url, data, {
      'content-type': 'application/x-www-form-urlencoded'
    })
      //首营管理自定义check
      if(that.data.currentIndex == 0 || that.data.currentIndex == 2 || that.data.currentIndex == 3 && res.data.data){
        that.setData({
          data:res.data.data,
          has: true,
          isCan: false,
          no_auth: 1
        })
      }else if(that.data.currentIndex == 1 && res.data.data){
        res.data.data.forEach(item => {
          item.check = false;
          //null-未申请 0-待审核 1-审核不通过 2-审核通过
          if (item.archiveStatus == 0 || item.archiveStatus == 1 || item.archiveStatus == 2) {
            this.setData({
              syRecord: true
            })
          }
        })
        that.setData({
          data:res.data.data,
          has: true,
          isCan: false,
          no_auth: 1
        })
      }else{
        that.setData({
          has: false,
          isCan: false,
          no_auth: 2
        })
      }
      
    if(that.data.currentIndex != 0) return;
    const auth = await common.getManageAuth(that.data.item.enterpriseId); //判断是否有修改权限
    that.setData({
      auth
    })
  },

  async zj_address(e) {
    const that = this;
    const enterpriseId = this.data.item.enterpriseId;
    const res = await wx.$http.post('/ydh/mall/enterprise/credentialsList', {
      enterpriseId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    let message = "";
    for (let i in res.data.data.qualificationsDTOList) {
      if (res.data.data.qualificationsDTOList[i]["nameId"] != 23) {
        message += res.data.data.qualificationsDTOList[i]["qualificationsName"] + "、"
      }
    }
    that.setData({
      showBuilding: true,
      content: message
    })
    await that.selectComponent("#buildInfo").getBuildInfo(Array.of(e.currentTarget.dataset.provinceid), this.data.item.enterpriseId);
  },

  //获取建档状态
  getBuildInfo(e) {
    const that = this;
    const announcement = e.detail;
    that.setData({
      announcement //状态,详情
    })
  },

  /**
   * 选框
   */
  handleSelectItem(e) {
    const index = e.currentTarget.dataset.index;
    this.data.data[index].check = !this.data.data[index].check;
    const flag = this.data.data.some(item => {
      return item.check == true
    })
    this.setData({
      data: this.data.data,
      isCan: flag
    })
  },

  /**
   * 申请首营建档
   */
  applyBuild() {
    let arr = this.data.data.filter(item => {
      return item.check == true;
    })
    console.log(arr)
    wx.navigateTo({
      url: '/packageB/pages/enter-detail/sent/index?arr=' + JSON.stringify(arr) + "&enterpriseId=" + this.data.item.enterpriseId + "&enterpriseName=" + this.data.item.enterpriseName + "&auth=" + this.data.auth
    })
  },

  /**
   * 修改封面图
   */
  changeImg() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        wx.navigateTo({
          url: '/packageA/pages/upload/index?src=' + src
        })
      }
    })
  },


  /**
   * handleNav
   */
  async handleNav(e) {
    const that = this;
    const index = e.currentTarget.dataset.index
    const list = this.data.lineLeftList2
    if (index !== this.data.currentIndex) {
      await that.setData({
        currentIndex: index,
        lineLeft: list[index],
        has: false
      })
      await that.getRequestData();
    }
  },


  /**
   * 员工详情
   */
  yghandle(e) {
    if (this.data.auth == 0) {
      return false;
    }
    wx.navigateTo({
      url: '/packageB/pages/enter-detail/detail/index?obj=' + JSON.stringify(e.currentTarget.dataset.item) + "&type=" + e.currentTarget.dataset.type,
    })
  },

  //拒绝原因弹出框
  reject: function (e) {
    this.data.bindApplyId = e.currentTarget.dataset.id;
    this.setData({
      show: true
    })
  },

  //确认
  getData: function (e) {
    this.data.remark = e.detail.inputContent;
    this.staffadui(2);
  },

  //通过
  pass(e) {
    const that = this;
    wx.showModal({
      title: '',
      content: '确认通过该员工申请？',
      confirmColor: '#3996E1',
      confirmText: '确认',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.data.bindApplyId = e.currentTarget.dataset.id;
          that.staffadui(1);
        }
      }
    })
  },

  //证件管理：去上传照片
  handleUpdateImage(e) {
    if (this.data.auth == 0 && e.currentTarget.dataset.item.nameId == 23) {
      this.setData({
        showAlert: true
      })
      return;
    }
    let arr = new Array();
    arr.push(e.currentTarget.dataset.item)
    if (e.currentTarget.dataset.item.qualificationsPath) {
      wx.navigateTo({
        url: "/packageB/pages/enter-detail/before/index?item=" + JSON.stringify(arr) + "&enterpriseName=" + e.currentTarget.dataset.enterprisename + "&auth=" + this.data.auth
      })
    } else {
      wx.navigateTo({
        url: "/packageB/pages/enter-detail/update/index?item=" + JSON.stringify(arr) + "&enterpriseName=" + e.currentTarget.dataset.enterprisename //+ "&auth=" + this.data.auth
      })
    }
  },

  async changeImgFun(imgUrl) {
    const that = this;
    const enterpriseId = that.data.item.enterpriseId;
    const res = await wx.$http.post('/ydh/mall/enterprise/changeImg', {
      enterpriseId,
      imgUrl
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    this.data.item.logo = imgUrl;
    that.setData({
      item: this.data.item,
      data: res.data.data
    })
  },

  /**
   * return
   */
  return () {
    wx.navigateBack();
  },

  /**
   * 首营建档
   */
  syBuild(e) {
    let arr = new Array();
    arr.push(e.currentTarget.dataset.item)
    wx.navigateTo({
      url: '/packageB/pages/enter-detail/sent/index?arr=' + JSON.stringify(arr) + "&enterpriseId=" + this.data.item.enterpriseId + "&enterpriseName=" + this.data.item.enterpriseName + "&auth=" + this.data.auth
    })
  },
  /**
   * 审核
   */
  async staffadui(status) {
    const data = {
      status: status,
      remark: status == 2 ? this.data.remark : '',
      bindApplyId: this.data.bindApplyId,
      enterpriseId: this.data.item.enterpriseId
    }
    const res = await wx.$http.post('/ydh/mall/shop/staffaduit', data, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.returnCode == 'ERR_0000') {
      wx.showToast({
        title: status == 1 ? "已通过" : status == 2 ? "已拒绝" : status == 3 ? "解绑成功" : "",
        duration: 2000,
        icon: 'none'
      })
      this.getRequestData();
    }
  }
})