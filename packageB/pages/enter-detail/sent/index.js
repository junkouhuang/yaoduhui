Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    enterpriseId: '',
    enterpriseName: '',
    auth: '',
    arr: {},
    isCan: false,
    showBuilding: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(JSON.parse(options.arr))
    this.setData({
      item: JSON.parse(options.arr),
      enterpriseId: options.enterpriseId,
      enterpriseName: options.enterpriseName,
      auth: options.auth
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    const res = await wx.$http.post('/ydh/mall/enterprise/credentialsList', {
      enterpriseId: this.data.enterpriseId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    let arr = new Array();
    res.data.data.qualificationsDTOList.forEach(item => {
      if (item.nameId == 23) {
        arr.unshift(item)
      } else {
        arr.push(item)
      }
    })
    let some = arr.some(item => {
      return item.nameId == 23 && item.qualificationsPath
    })
    this.setData({
      arr: arr,
      isCan: some
    })
  },

  /**
   * 确定发送
   */
  async sentHandle() {
    let that = this;
    let message = "";
    //expiryStatus:0未过期 expiryStatus：1已过期 expiryStatus:null长期有效
    this.data.arr.forEach(item => {
      if (item.expiryStatus == 1 || (item.expiryStatus == 0 && !item.expiryDate && item.nameId != 17)) { //已过期
        message += item.qualificationsName + "、"
      }
    })
    message = message.substring(0, message.lastIndexOf('、'));
    let msg = "";
    for (let i in this.data.arr) {
      if (this.data.arr[i]["nameId"] != 23) {
        msg += this.data.arr[i]["qualificationsName"] + "、"
      }
    }
    //message += `${desc}，请重新上传`
    if (message) {
      wx.showModal({
        title: '温馨提示',
        content: "您的" + message + "已过期，请前往【证件管理】变更该证件",
        showCancel: false,
        confirmText: "我知道了",
        success: function (data) {
          //getApp().globalData.access_token = "";
          if (data.confirm) {

          }
        }
      })
    } else {
      if (this.data.isCan) {
        let list = new Array();
        this.data.item.forEach(item => {
          list.push({
            supplierId: item.enterpriseId,
            supplierName: item.enterpriseName,
            enterpriseId: this.data.enterpriseId
          })
        })
        let arr = [];
        this.data.item.forEach(item => {
          arr.push(item.provinceId)
        })
        let res = await wx.$http.post('/ydh/mall/archive/add', list)
        if (res.data.returnCode == "ERR_0000") {
          this.setData({
            showBuilding: true,
            content: msg,
          })
          await that.selectComponent("#buildInfo").getBuildInfo(arr, this.data.enterpriseId);
        }
        if (res.data.returnCode == "ERR_0001") {
          wx.showToast({
            title: res.data.data, //请不要重复添加建档信息
            icon: 'none'
          })
        }
      } else {
        wx.showToast({
          title: '当前有证书资料未完善',
          icon: 'none'
        })
      }
    }
  },


  //获取建档状态
  getBuildInfo(e) {
    const that = this;
    const announcement = e.detail;
    that.setData({
      announcement //状态,详情
    })
  },

  //建档弹窗关闭监听
  getDataBuild(e){
    console.log(e)
    if(!e.detail){
      wx.navigateBack()
    }
  },

  //更新授权委托书信息
  handleUpdateImage(e) {
    wx.navigateTo({
      url: "/packageB/pages/enter-detail/change/index?item=" + JSON.stringify(e.currentTarget.dataset.item) + "&enterpriseName=" + this.data.enterpriseName + "&auth=" + this.data.auth + "&enterpriseId=" + this.data.enterpriseId
    })
  }
})