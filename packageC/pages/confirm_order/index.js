const common = require('../../../utils/common');
const tool = require('../../../utils/filter');
let pageNum = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    defaultAddress: [],
    totalAmount: 0,
    orderAmountResult: [],
    shopEnterpriseNameData: [],
    drugNosList: [],
    isHandle: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let that = this;
    that.data.drugNosList = options.drugNosList.split(",");
    //that.data.enterpriseId= wx.getStorageSync('enterpriseId')
    this.settlement();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    that.adddress();
  },

  /**
   * 默认地址
   */
  async adddress() {
    let that = this;
    let result = await wx.getStorageSync('EnterpriseList');
    let res = await wx.$http.post('/ydh/user/address/display', {
      pageNum,
      pageSize: 100,
      enterpriseId: result.enterpriseId
    })
    if (res.data.returnCode == "ERR_0000") {
      if (res.data.data.list.length == 0) {
        that.setData({
          defaultAddress: []
        })
      } else {
        for (let i in res.data.data.list) {
          for (let j in res.data.data.list[i].shippingAddress) {
            if (res.data.data.list[i].enterpriseId == result.enterpriseId) {
              getApp().globalData.defaultAddress = res.data.data.list[i].shippingAddress[j];
              let arr = [];
              arr.push(getApp().globalData.defaultAddress)
              that.setData({
                defaultAddress: arr
              })
              return false;
            } else {
              getApp().globalData.defaultAddress = []
              that.setData({
                defaultAddress: []
              })
              return false;
            }
          }
        }
      }
    }
  },

  /**
   * 提交订单
   */
  submit: tool.debounce(function () {
    this.submitHandle();
  }),

  async submitHandle() {
    let that = this;
    //商品编号
    let drugNosList = [];
    for (let i in that.data.list) { //key
      drugNosList.push(that.data.list[i].drugNo);
    }
    //默认地址id
    if (that.data.defaultAddress[0].consignee == null || that.data.defaultAddress[0].phoneNumber == null) {
      wx.showToast({
        title: '请完善收货地址',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
      return false;
    }
    let orderAmount = 0;
    that.data.list.forEach((item, index) => {
      orderAmount = orderAmount + item.price * item.quantity;
    })
    let shippingAddressId = that.data.defaultAddress[0].addressId;
    let res = await wx.$http.post('/ydh/mall/order/submitOrder', {
      drugNos: this.data.drugNosList,
      shippingAddressId: shippingAddressId,
      orderAmountResult: this.data.orderAmountResult
    });
    if (res.data.returnCode == "ERR_0000") {
      //山东天瑞：待付款  华源：支付结果->待确认
      if (res.data.data.shopEnterpriseId == "1") {
        let b = [...new Set(this.data.shopEnterpriseNameData)]
        wx.redirectTo({
          url: '/packageC/pages/confirm_order/template/pay_result/index?shopEnterpriseName=' + b
        })
      } else {
        wx.redirectTo({
          url: '/packageA/pages/purchase_order/index?status=2',
        })
      }
    } else if (res.data.returnCode == "ERR_0001") {
      wx.showToast({
        title: res.data.data.info, //'建档信息审核中',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    } else if (res.data.returnCode == "ERR_0005") {
      wx.showToast({
        title: '您未向配送企业申请建档,请您先申请建档,再下单',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    } else if (res.data.returnCode == "P_ERR_0005") {
      wx.showToast({
        title: '账户状态异常，请联系客服',//账户状态异常
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    } else if (res.data.returnCode == "P_ERR_0006") {
      wx.showToast({
        title: '该账号暂未开通账户',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    } else {
      wx.showToast({
        title: res.data.returnMsg,
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    }
    //ERR_0001：建档信息审核中
    //50000：没有查询到华源备案号,请联系客服
    //70000：没有查询到华源备案号,请联系客服
    //70001：已选商品的金额不足店铺起送金额
  },

  /**
   * 商品清单(待用)
   */
  async settlement() {
    let res = await wx.$http.post('/ydh/mall/order/settlement', {
      drugNos: this.data.drugNosList,
      // enterpriseId: wx.getStorageSync('enterpriseId') || ''
    });
    if (res.data.returnCode == "ERR_0000") {
      let totalAmount = 0;
      for (let i in res.data.data) { //key
        let orderPrice = 0;
        let enterpriseId = res.data.data[i]["enterpriseId"];
        if (res.data.data[i].enterpriseId != 4095) {
          this.data.shopEnterpriseNameData.push(res.data.data[i]["enterpriseName"]);
        }
        for (let j in res.data.data[i]["shoppingCarDTOList"]) {
          totalAmount = totalAmount + res.data.data[i]["shoppingCarDTOList"][j].price * res.data.data[i]["shoppingCarDTOList"][j].quantity;
          orderPrice = orderPrice + res.data.data[i]["shoppingCarDTOList"][j].price * res.data.data[i]["shoppingCarDTOList"][j].quantity;
        }
        this.data.orderAmountResult.push({
          orderPrice,
          enterpriseId
        });
      }
      this.setData({
        list: res.data.data,
        totalAmount
      })
    }
  }
})