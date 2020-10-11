let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleForm: {
      consignee: '', //收货人
      phoneNumber: '', //手机号码
      provinceId: '',
      provinceName: '', //省份
      cityId: '',
      cityName: '', //城市
      districtId: '',
      district: '', //县区
      location: '', //详细地址
      isDefault: '', //是否默认地址: 0不是, 1是
      postCode: '', //邮编（选填）
      enterpriseId: ''
    },
    can: false, //登錄按鈕呈半透明
    dataList: [], //省份
    show: false,
    indexs: 0, //控制显示省市区
    china: '',
    enterpriseId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    const data = JSON.parse(options.data);
    this.data.enterpriseId = options.enterpriseId
    data.consignee = decodeURIComponent(options.consignee)

    that.setData({
      ruleForm: data,
      can: data.consignee && data.phoneNumber && data.provinceName && data.cityName && data.district && data.location ? true : false
    })
  },

  onUnload(){
    clearTimeout(timer);
  },

  /**
   * 保存
   */
  async save() {
    let that = this;
    if (that.data.ruleForm.consignee === '') {
      wx.showToast({
        title: '收货人不能为空', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (that.data.ruleForm.phoneNumber === '') {
      wx.showToast({
        title: '手机号码不能为空', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (that.data.ruleForm.phoneNumber.length !== 11) {
      wx.showToast({
        title: '手机号码长度必须为11位', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (!(/^1[3456789]\d{9}$/.test(that.data.ruleForm.phoneNumber))) {
      wx.showToast({
        title: '手机格式不正确', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (that.data.provinceName === '' || that.data.cityName === '' || that.data.district === '') {
      wx.showToast({
        title: '请选择地区', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (that.data.ruleForm.location === '') {
      wx.showToast({
        title: '详细地址不能为空', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (that.data.ruleForm.isDefault == 1) {
      that.data.ruleForm.enterpriseId = that.data.enterpriseId;
    }
    that.data.ruleForm.isDefault = 0;
    let res = await wx.$http.post('/ydh/user/address/create', that.data.ruleForm);
    if (res.data.returnCode == "ERR_0000") {
      wx.showToast({
        title: '修改成功',
        icon: 'none',
        duration: 2000, //延时关闭，默认2000
        success: function () {
          timer = setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }, //接口调用成功的回调函数
        fail: function () {

        }, //接口调用失败的回调函数
      })
    }
  },

  /**
   * 获取收货人
   */
  consigneeInput: function (e) {
    this.setData({
      ['ruleForm.consignee']: e.detail.value
    })
    this.isCan();
  },

  /**
   * 获取手机号码
   */
  phoneNumberInput: function (e) {
    this.setData({
      ['ruleForm.phoneNumber']: e.detail.value
    })
    this.isCan();
  },

  /**
   * 获取详细地址
   */
  locationInput: function (e) {
    this.setData({
      ['ruleForm.location']: e.detail.value
    })
    this.isCan();
  },

  isCan() {
    this.setData({
      can: this.data.ruleForm.consignee != null && this.data.ruleForm.phoneNumber != null && this.data.ruleForm.provinceName != null && this.data.ruleForm.cityName != null && this.data.ruleForm.district != null && this.data.ruleForm.location != null ? true : false
    })
  },

  /**
   * 邮政编号
   */
  postcodeInput(e) {
    let that = this;
    that.data.ruleForm.postCode = e.detail.value;
  },

  /**
   * 选择地区
   */
  areaSel: function () {
    let that = this;
    that.setData({
      show: true
    })
  },

  /**
   * 是否默认
   */
  switch1Change() {
    let that = this;
    that.data.ruleForm["isDefault"] = that.data.ruleForm["isDefault"] == 0 ? 1 : 0;
  }
})