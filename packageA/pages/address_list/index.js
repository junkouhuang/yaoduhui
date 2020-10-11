const common = require('../../../utils/common');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userAddInfo: {
      addressId: null,
      consignee: '', //收货人
      phoneNumber: '', //手机号码
      provinceId: '',
      provinceName: '请选择', //省份
      cityId: '',
      cityName: '请选择', //城市
      districtId: '',
      district: '请选择', //县区
      location: '', //详细地址
      isDefault: 0, //是否默认地址: 0不是, 1是
      postcode: '', //邮编（选填）
    },
    pages: 1,
    pageNum:1,
    addressList: [],
    ids: [], //地址列表id
    id: '',
    status: 1,
    enterpriseId: '',
    showAddress: true,
    partRefresh: false,
    addressId: null, //这里是存放操作某条数据的addressId
    pindex:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if(options.id == 0){
      const result = await wx.getStorageSync('EnterpriseList');
      this.data.enterpriseId = result.enterpriseId;
    }
    this.setData({
      id: options.id,
    })
    this.adddress();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let that = this;
    if (that.data.partRefresh) {
      await that.adddress();
    }
  },
  onReachBottom() {
    let that = this;
    that.data.pageNum = ++that.data.pageNum;
    if (that.data.pageNum <= that.data.pages) {
      that.adddress();
    }
  },

  /**
   * 修改
   */
  editor(e) {
    let that = this;
    that.data.pindex = e.currentTarget.dataset.pindex;
    const cindex = e.currentTarget.dataset.cindex;
    that.data.addressId = e.currentTarget.dataset.addressid;
    that.data.addressList[ that.data.pindex].shippingAddress[cindex].enterpriseId = that.data.addressList[ that.data.pindex].enterpriseId
    let {
      consignee,
      ...rest
    } = that.data.addressList[ that.data.pindex].shippingAddress[cindex];
    that.data.partRefresh = true;
    wx.navigateTo({
      url: '/packageA/pages/address_list/editor/index?data=' + JSON.stringify(rest) + "&enterpriseId=" + this.data.enterpriseId + "&consignee=" + encodeURIComponent(consignee || '')
    })
  },

  /**
   * 默认地址
   */
  async adddress() {
    let that = this;
    let res = await wx.$http.post('/ydh/user/address/display', {
      pageNum:that.data.pageNum,
      pageSize: 10,
      enterpriseId: that.data.id == 0 ? that.data.enterpriseId : that.data.id == 1 ? '' : ''
    })
    if (res.data.returnCode == "ERR_0000") {
      if (that.data.partRefresh) { //局部刷新
        for(let i in res.data.data.list){
          for(let j in  res.data.data.list[i].shippingAddress){
            if (res.data.data.list[i].shippingAddress[j].addressId == that.data.addressId) {
              this.setData({
                [`addressList[${that.data.pindex}]`]: res.data.data.list[i]
              })
            }
          }
        }
        that.data.partRefresh = false;
      } else { //正常逻辑操作
        if (res.data.data) {
          that.setData({
            addressList: [...this.data.addressList, ...res.data.data.list],
            showAddress: true,
          })
          this.data.pages = res.data.data.pages;
          if (!res.data.data.hasNextPage) {
            that.setData({
              status: 2
            })
          }
        } else {
          that.setData({
            showAddress: true,
            pages: 0
          })
        }
      }
      const result = await wx.getStorageSync('EnterpriseList');
      that.setData({
        enterpriseId:result.enterpriseId
      })
    }
    if (res.data.returnCode == "ERR_0005") {
      that.setData({
        showAddress: false
      })
    }
  },
  /**
   * 企业入驻
   */
  band() {
    wx.navigateTo({
      url: '/packageB/pages/band/search/index'
    })
  },

  /**
   * 
   */
  chickHandle(e) {
    const that = this;
    const pindex = e.currentTarget.dataset.pindex;
    const cindex = e.currentTarget.dataset.cindex;
    const consignee = that.data.addressList[pindex].shippingAddress[cindex].consignee;
    const phoneNumber = that.data.addressList[pindex].shippingAddress[cindex].phoneNumber;
    if (consignee == null || phoneNumber == null) {
      that.editor(e);
    } else {
      getApp().globalData.defaultAddress = e.currentTarget.dataset.item;
      wx.navigateBack({
        delta: 1
      })
    }
  },
})