const common = require('../../../../utils/common');
let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleForm:{
      consigneeName: '',//收货人
      mobileNumber: '',//手机号码mobileNumber
      provinceId: '',
      province: '请选择',//省份
      cityId: '',
      city: '请选择',//城市
      regionId: '',
      region: '请选择',//县区
      location: '',//详细地址
      isDefault: 0, //是否默认地址: 0不是, 1是
      postCode: '',//邮编（选填）
      telphone:'',//电话
      enterpriseId:''
    },
    can: false,//登錄按鈕呈半透明
    dataList: [],//省份
    show:false,
    china:'',
    auth:0
  },

  async onLoad(){
    const that = this;
    let result =await wx.getStorageSync('EnterpriseList');
    //const auth = await common.getManageAuth(result.enterpriseId); //判断是否有修改权限
    that.setData({
      auth:await wx.getStorageSync('manageAuth')
    })
    let resData = await wx.$http.post('/ydh/mall/shop/findShopInfo');
    if(!resData.data.data) return;
    let {consigneeName,mobileNumber,telphone,province,provinceId,city,cityId,region,regionId,location,postCode} = resData.data.data;
    this.setData({
      ['ruleForm.consigneeName']:consigneeName,
      ['ruleForm.mobileNumber']:mobileNumber,
      ['ruleForm.telphone']:telphone,
      "china":`${province}${city}${region}`,
      ['ruleForm.province']:province,
      ['ruleForm.provinceId']:provinceId,
      ['ruleForm.city']:city,
      ['ruleForm.cityId']:cityId,
      ['ruleForm.region']:region,
      ['ruleForm.regionId']:regionId,
      ['ruleForm.location']:location,
      ['ruleForm.postCode']:postCode,
      enterpriseId:result.enterpriseId
    })
    this.isCan();
  },

  onUnload(){
    clearTimeout(timer);
  },
  /**
   * 保存
   */
  async save() {
    let that = this;
    console.log(that.data.ruleForm)
    if (that.data.ruleForm.consigneeName === '') {
      wx.showToast({
        title: '收货人不能为空', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (that.data.ruleForm.mobileNumber === '') {
      wx.showToast({
        title: '手机号码不能为空', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (that.data.ruleForm.mobileNumber.length !== 11) {
      wx.showToast({
        title: '手机号码长度必须为11位', //标题，不写默认正在加载
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      });
      return false;
    }
    if (!(/^1[3456789]\d{9}$/.test(that.data.ruleForm.mobileNumber))) {
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
    let res = await wx.$http.post("/ydh/mall/shop/update", that.data.ruleForm, { 'content-type': 'application/x-www-form-urlencoded' });
    if (res.data.returnCode == "ERR_0000") {
      //wx.setStorageSync('receipt_address', that.data.ruleForm)
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000, //延时关闭，默认2000
        success: function () {
          timer = setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000);
          
        }, //接口调用成功的回调函数
        fail: function () {

        },  //接口调用失败的回调函数
      })
    } else {
      wx.showToast({
        title: res.data.data,
        icon: 'none',
        duration: 2000, //延时关闭，默认2000
      })
    }
  },

  /**
   * 获取收货人
   */
  consigneeNameInput:function(e){
    let that = this;
    that.data.ruleForm.consigneeName = e.detail.value;
    this.isCan();
  },

  /**
   * 接收电话号码
   */
  telphoneInput(e) {
    let that = this;
    that.data.ruleForm.telphone = e.detail.value;
    this.isCan();
  },

  /**
  * 获取手机号码
  */
  mobileNumberInput: function (e) {
    let that = this;
    that.data.ruleForm.mobileNumber = e.detail.value;
    this.isCan();
  },

  /**
  * 获取详细地址
  */
  locationInput: function (e) {
    let that = this;
    that.data.ruleForm.location = e.detail.value;
    this.isCan();
  },

  /**
   * 邮政编号
   */
  postcodeInput(e){
    let that = this;
    that.data.ruleForm.postCode = e.detail.value;
  },
  
  /**
   * 选择地区
   */
  areaSel: function () {
    this.selectComponent("#area").openMask();
  },
  
  isCan(){
    const that = this;
    that.setData({
      can: that.data.ruleForm.consigneeName !== '' && that.data.ruleForm.mobileNumber !== '' && that.data.ruleForm.telphone !== '' && that.data.china !== '' && that.data.ruleForm.location !== '' ? true : false
    })
  },
  /**
   * 获取组件内传递出来的值(这里主要获取省市区名称和id)
   */
  getData(e) {
    let that = this;
    that.data.ruleForm["provinceId"] = e.detail.provinceId;
    that.data.ruleForm["province"] = e.detail.provinceName;
    that.data.ruleForm["cityId"] = e.detail.cityId;
    that.data.ruleForm["city"] = e.detail.cityName;
    that.data.ruleForm["regionId"] = e.detail.districtId;
    that.data.ruleForm["region"] = e.detail.district;
    that.setData({
      china: e.detail.provinceName + e.detail.cityName + e.detail.district,
      can: e.detail.provinceName !== '' && e.detail.cityName !== '' && e.detail.district !== '' && that.data.ruleForm.consigneeName !== '' && that.data.ruleForm.telphone !== '' && that.data.telphone !== '' && that.data.ruleForm.location !== '' ? true : false,
    })
  },

  /**
   * 是否默认
   */
  switch1Change(){
    let that = this;
    that.data.ruleForm["isDefault"] = that.data.ruleForm["isDefault"]==0?1:0;
  }
})