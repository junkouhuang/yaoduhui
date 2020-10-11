Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '', //关键字
    list: [],
    currentTab: 0, //当前选中标签
    navScrollLeft: 0,
    windowWidth: null, //可使用窗口宽度
    loadding: 0, //0不显示加载  1显示加载  2显示完成
    salesOrderId: null,
    show: 0,
    isHandle: false,
    flag: '',
    close: false, //是否显示关闭按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let that = this;
    //获得系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowWidth:res.windowWidth
        })
        this.selectComponent("#order").data.windowWidth = res.windowWidth;
      },
    })
    this.selectComponent("#order").data.ruleForm.status = "";
  },

  //获取子组件传递给父组件的值
  getActiveStatus(e) {
    this.setData({
      currentTab: e.detail.currentIndex,
      navScrollLeft: e.detail.navScrollLeft,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let that = this;
    this.selectComponent("#order").orderList();
    if (this.data.isHandle) {
      const res = await wx.showModal({
        content: '是否退款成功',
        confirmText: '是',
        cancelText: '否'
      })
      if (res.confirm) {
        let list = that.data.list.filter(item => item.salesOrderId != that.data.salesOrderId)
        that.setData({
          list,
          show: list.length > 0 ? 1 : 2
        })
        that.updateOrderStatus(that.data.salesOrderId);
      } else {
        console.log('取消')
        that.data.isHandle = false;
      }
    }
  },


  /**
   * 搜索关键字
   */
  inputFocus(e) {
    let that = this;
    that.setData({
      close: e.detail.value != "" ? true : false,
    });
  },
  inputHandle(e) {
    this.data.keyword = e.detail.value;
    this.setData({
      close: e.detail.value != "" ? true : false,
    });
  },
  inputBlur: function () {
    let that = this;
    that.setData({
      close: false
    });
  },
  //清除关键字
  clearHandle: function () {
    this.setData({
      close: false,
      keyword: ''
    });
    this.selectComponent("#order").data.keyword = "";
    this.selectComponent("#order").change();
  },



  //根据商品名搜索
  search() {
    this.selectComponent("#order").data.keyword = this.data.keyword;
    this.selectComponent("#order").change();
  },

  //点击切换
  change: function (e) {
    let that = this;
    let currentIndex = e.currentTarget.dataset.index;
    if (currentIndex == that.data.currentTab) return;
    let singleNavWidth = that.data.windowWidth / 5;
    //tab选项居中                            
    that.setData({
      currentTab: currentIndex,
      navScrollLeft: (currentIndex - 1) * singleNavWidth,
    })
    //--0 - 待付款 1 - 待确认付款 2 - 已付款 3 - 待退款 4 - 已完成 5 - 已取消 6 - 待第三方确认订单
    that.selectComponent("#order").data.ruleForm.status = currentIndex == 0 ? "" : currentIndex == 1 ? 6 : currentIndex == 2 ? 0 : currentIndex == 3 ? 1 : currentIndex == 4 ? 2 : currentIndex == 5 ? 3 : currentIndex == 6 ? 4 : currentIndex == 7 ? 8 : '';
    that.selectComponent("#order").change();
  },


  /**
   * 左右切换
   */
  swiperChange(event) {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let currentIndex = event.detail.current; //当前索引
    //每个tab选项宽度占1/5
    let singleNavWidth = that.data.windowWidth / 5;
    //tab选项居中                            
    if (that.data.currentTab == currentIndex) {
      return false;
    } else {
      that.setData({
        currentTab: currentIndex,
        navScrollLeft: (currentIndex - 1) * singleNavWidth, //tab居中
        list: [],
        loadding: 0,
        show: 0
      })
    }
    that.data.ruleForm.pageNum = 1;
    //--0 - 待付款 1 - 待确认付款 2 - 已付款 3 - 待退款 4 - 已完成 5 - 已取消 6 - 待第三方确认订单
    that.data.ruleForm.status = currentIndex == 0 ? "" : currentIndex == 1 ? 6 : currentIndex == 2 ? 0 : currentIndex == 3 ? 1 : currentIndex == 4 ? 2 : currentIndex == 5 ? 3 : currentIndex == 6 ? 4 : currentIndex == 7 ? 5 : '';
    that.xsd_list();
  },

  /**
   * 滚动到底部事件
   */
  lower() {
    let that = this;
    that.data.ruleForm.pageNum = ++that.data.pageNum;
    if (that.data.ruleForm.pageNum <= that.data.pages) {
      that.setData({
        loadding: 1
      })
      that.xsd_list();
    } else {
      that.setData({
        loadding: 2
      })
    }
  },

  /**
   * 代付款订单取消
   */
  cancelOrder(e) {
    let that = this;
    let salesOrderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定取消订单？',
      success: function (res) {
        if (res.confirm) {
          that.cancelSaleOrder(salesOrderId);
        }
      }
    })
  },

  async cancelSaleOrder(salesOrderId) {
    const that = this
    let res = await wx.$http.post('/ydh/mall/order/cancelOrder', {
      salesOrderId: salesOrderId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == "ERR_0000") {
      if (res.data) {
        wx.showToast({
          title: "操作成功",
          icon: 'none',
          duration: 2000,
          success: function () {
            let list = that.data.list.filter(item => item.salesOrderId != salesOrderId)
            that.setData({
              list,
              show: list.length > 0 ? 1 : 2
            })
          }
        })
      } else {
        wx.showToast({
          title: "取消订单失败",
          icon: 'none',
          duration: 2000
        })
      }
    }
  },

  //取消订单订单并退款
  async handleCancelRefund(e) {
    let that = this;
    let salesOrderId = e.currentTarget.dataset.id;
    that.data.salesOrderId = e.currentTarget.dataset.id;
    that.handleCancelRefundHandle(salesOrderId);
    that.data.isHandle = true;
  },
  async handleCancelRefundHandle() {
    let that = this;
    try {
      const result = await wx.showModal({
        title: '提示',
        content: '取消订单并退款？',
      })
      if (!result.confirm) return;
      const res = await wx.$http.post('/ydh/mall/order/cancelOrderRefund', {
        salesOrderId: this.data.salesOrderId
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode = "ERR_0000") {
        if (res.data.data.result == 4) {
          wx.showToast({
            title: res.data.data.data,
            icon: 'none',
            duration: 1500
          })
          //取消订单并退款成功后并更新数据
          let list = that.data.list.filter(item => item.salesOrderId != this.data.salesOrderId)
          that.setData({
            list,
            show: list.length > 0 ? 1 : 2
          })
        }
      }
    } catch (err) {
      wx.hideLoading()
    }
  },

  /**
   * 更新退款状态
   */
  async updateOrderStatus(salesOrderId) {
    const that = this
    let res = await wx.$http.post('/ydh/mall/order/updateOrderStatus', {
      salesOrderId: salesOrderId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == "ERR_0000") {
      if (res.data) {
        wx.showToast({
          title: "操作成功",
          icon: 'none',
          duration: 2000,
          success: function () {
            // that.data.list =[]
            that.xsd_list();
          }
        })
      } else {
        wx.showToast({
          title: "取消订单失败",
          icon: 'none',
          duration: 2000
        })
      }
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


  //退款
  async handleRefund(e) {
    let that = this;
    let salesOrderId = e.currentTarget.dataset.id;
    that.data.salesOrderId = e.currentTarget.dataset.id;
    that.data.flag = e.currentTarget.dataset.flag
    that.data.isHandle = true;
    that.handleRefundHandle(salesOrderId);
  },
  async handleRefundHandle() {
    let that = this;
    let flag = that.data.flag;
    if (that.data.flag) {
      const result = await wx.showModal({
        title: '提示',
        content: '确定退款？',
      })
      if (!result.confirm) return;
    } else {
      const result = await wx.showModal({
        title: '提示',
        content: '拒绝退款？',
      })
      if (!result.confirm) return;
    }
    try {
      const res = await wx.$http.post('/ydh/mall/order/auditRefundApply', {
        salesOrderId: this.data.salesOrderId,
        flag
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        if (flag) { //确认退款
          if (res.data.data.result == 4) {
            wx.showToast({
              title: '退款成功',
              icon: 'none',
              duration: 1500
            })
            let list = that.data.list.filter(item => item.salesOrderId != this.data.salesOrderId)
            that.setData({
              list,
              show: list.length > 0 ? 1 : 2
            })
          }
        } else { //拒绝退款
          await wx.showToast({
            title: "操作成功",
            icon: 'none',
            duration: 2000
          })
          let list = that.data.list.filter(item => item.salesOrderId != this.data.salesOrderId)
          that.setData({
            list,
            show: list.length > 0 ? 1 : 2
          })
        }
      } else {
        await wx.showToast({
          title: res.data.returnMsg,
          icon: 'none',
          duration: 2000
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
})