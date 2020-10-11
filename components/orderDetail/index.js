const tools = require('../../utils/filter')
let timer;
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
      
      // 页面被展示
      let that = this;
      console.log("--====")
      if (this.data.isHandle) {
        wx.showModal({
          title: '',
          content: '是否支付成功',
          confirmText: '是',
          cancelText: '否',
          success(res) {
            if (res.confirm) {
              if (that.data.type == 1) {
                that.payMent(that.data.purchaseOrderId);
              }
              if (that.data.type == 2) {
                that.confirmPayMent(that.data.purchaseOrderId);
              }
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
      console.log("页面被展示")
    },
    hide: function () {
      // 页面被隐藏
      console.log("页面被隐藏")
    },
    resize: function (size) {
      // 页面尺寸变化
      console.log("页面尺寸变化")
    }
  },
  /*组件生命周期*/
  lifetimes: {
    detached() {
      clearInterval(timer);
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    data: [],
    totalAmount: 0,
    orderId: '',
    show: false,
    source: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goodDetail(e) {
      let drugNo = e.currentTarget.dataset.drugno;
      wx.navigateTo({
        url: '/packageC/pages/detail/index?drugNo=' + drugNo,
      })
    },
    /**
     * 详情
     */
    async detail() {
      const that = this;
      let url;
      let params;
      this.setData({
        source: that.data.source
      })
      if (that.data.source == "purchase_order") {
        url = '/ydh/mall/purchaseorder/preview'
        params = {
          purchaseOrderId: that.data.orderId
        }
      }
      if (that.data.source == "sale_order") {
        url = '/ydh/mall/order/findSalesOrderDetail'
        params = {
          salesOrderId: that.data.orderId
        }
      }
      const res = await wx.$http.post(url, params, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        let list = res.data.data;
        let totalAmount = 0;
        for (let i in list.purchaseOrderDetail) { //key
          totalAmount = totalAmount + list.purchaseOrderDetail[i].amountWithTax;
        }
        that.data.orderId = list.purchaseOrderId;
        that.setData({
          data: list,
          totalAmount,
          show: true
        })
        console.log(list.status)
        if (list.status == 0) {
          let time = list.cancelTime;
          timer = setInterval(() => {
            if (time > 0) {
              time = --time;
              that.setData({
                lastModifyTime: tools.timeDown(time),
              })
            } else {
              that.cancelPurchaseOrder();
              clearInterval(timer);
            }
          }, 1000)
        }
      }
    },

    //支付
    async pay(e) {
      // wx.navigateTo({
      //   url: '/packageA/pages/purchase_order/pay/index?orderId=' + e.currentTarget.dataset.id,
      // })
      const that = this;
      let purchaseOrderId = e.currentTarget.dataset.id;
      that.data.purchaseOrderId = e.currentTarget.dataset.id;
      that.data.type = 1;
      await this.payMent(purchaseOrderId);
    },
    async payMent(purchaseOrderId) {
      let that = this;
      let res = await wx.$http.post('/ydh/mall/purchaseorder/payOrder', {
        purchaseOrderId: purchaseOrderId,
        deviceType: 'MOBILE'
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        that.data.isHandle = res.data.data.result == 1 ? true : res.data.data.result == 2 ? false : ''; //是否开启“支付成功”弹出框
        //渤海银行支付
        if (res.data.data.result == 1) {
          const webUrl = encodeURIComponent(`${res.data.data.data.nextPageUrl}&AccessToken=${res.data.data.data.accessToken}`)
          wx.navigateTo({
            url: `/pages/web-view/index?url=${webUrl}`,
          })
        }
        //支付完成回调
        if (res.data.data.result == 2) {
          // await this.setData({
          //   currentTab: 3,
          //   list: []
          // })
          // //跳转并更新确认支付数据
          // that.data.ruleForm.status = 1;
          // await this.cgd_list();
          wx.navigateBack()
        }
        if (res.data.data.result == 4) {
          wx.showToast({
            title: '未开通会员中心账户，请前往开通', //新增钱包账单异常
            icon: 'none',
            duration: 1000
          })
        }
      } else {
        wx.showToast({
          title: res.data.returnMsg, //新增钱包账单异常
          icon: 'none',
          duration: 2000
        })
      }
      //ERR_0003:新增钱包账单异常
      //ERR_0023:订单数据不正确
      //ERR_0030:支付异常
    },
    //确认支付
    async confirmPay(e) {
      // wx.navigateTo({
      //   url: '/packageA/pages/purchase_order/confirm-pay/index?orderId=' + e.currentTarget.dataset.id,
      // })
      const that = this;
      const purchaseOrderId = e.currentTarget.dataset.id
      that.data.purchaseOrderId = e.currentTarget.dataset.id
      that.data.type = 2;
      await this.confirmPayMent(purchaseOrderId);
    },
    async confirmPayMent(purchaseOrderId) {
      const that = this;
      try {
        const res = await wx.$http.post('/ydh/mall/purchaseorder/confirmPay', {
          purchaseOrderId,
          deviceType: 'MOBILE'
        }, {
          'content-type': 'application/x-www-form-urlencoded'
        })
        that.data.isHandle = res.data.data.result == 1 ? true : res.data.data.result == 2 ? false : ''; //是否开启“支付成功”弹出框
        //渤海银行支付
        if (res.data.returnCode == "ERR_0000") {
          if (res.data.data.result == 1) {
            const webUrl = encodeURIComponent(`${res.data.data.data.nextPageUrl}&AccessToken=${res.data.data.data.accessToken}`)
            wx.navigateTo({
              url: `/pages/web-view/index?url=${webUrl}`,
            })
          }
          if (res.data.data.result == 2) {
            //确认支付成功并更新已付款数据
            wx.navigateBack();
            // that.setData({
            //   currentTab: 4,
            //   list: []
            // })
            // that.data.ruleForm.status = 2;
            // await that.cgd_list();
          } else {
            wx.showToast({
              title: res.data.data.data,
              icon: 'none'
            })
          }
        } else {
          wx.showToast({
            title: res.data.returnMsg, //确认支付异常
            icon: 'none',
            duration: 2000
          })
        }
        //ERR_0031:确认支付异常
      } catch (err) {
        wx.hideLoading()
      }
    },

    //申请退款
    async applyRefund(e) {
      let that = this;
      const result = await wx.showModal({
        content: '是否确认要申请退款？',
        cancelText: '否',
        confirmText: '是'
      })
      if (result.confirm) {
        try {
          const purchaseOrderId = e.currentTarget.dataset.id
          const res = await wx.$http.post('/ydh/mall/purchaseorder/applyRefund', {
            purchaseOrderId
          }, {
            'content-type': 'application/x-www-form-urlencoded'
          })
          if (res.data.returnCode == "ERR_0000") {
            wx.showToast({
              title: '申请退款成功~',
              icon: 'none'
            })
            wx.navigateBack()
          } else {
            wx.showToast({
              title: '申请退款失败~',
              icon: 'none'
            })
          }
        } catch (err) {

        }
      }
    },
    //待付款订单取消
    cancelOrder() {
      let that = this;
      wx.showModal({
        title: '',
        content: '是否确认要取消订单？',
        cancelText: '否',
        confirmText: '是',
        success: function (res) {
          if (res.confirm) {
            that.cancelPurchaseOrder();
          }
        }
      })
    },

    async cancelPurchaseOrder() {
      const that = this;
      let res = await wx.$http.post('/ydh/mall/purchaseorder/cancelPurchaseOrder', {
        purchaseOrderId: that.data.orderId
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
              wx.navigateBack();
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

    //返回上一页
    return () {
      wx.navigateBack();
    },

    //取消申请退款
    async cancelRefund(e) {
      const that = this;
      const result = await wx.showModal({
        title: '',
        content: '是否确认要取消申请退款？',
        cancelText: '否',
        confirmText: '是',
      })
      if (!result.confirm) return;
      const orderId = e.currentTarget.dataset.id;
      let res = await wx.$http.post('/ydh/mall/purchaseorder/cancelRefund', {
        purchaseOrderId: orderId
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
              wx.navigateBack()
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

    //退款（拒绝退款和同意退款）
    async handleRefund(e) {
      let that = this;
      //let salesOrderId = e.currentTarget.dataset.id;
      that.data.salesOrderId = e.currentTarget.dataset.id;
      that.data.flag = e.currentTarget.dataset.flag
      //that.data.isHandle = true;
      that.handleRefundHandle();
    },
    async handleRefundHandle() {
      let that = this;
      let flag = that.data.flag;
      if (flag) {
        const result = await wx.showModal({
          title: '',
          content: '确定退款？',
          cancelText: '否',
          confirmText: '是'
        })
        if (!result.confirm) return;
      } else {
        const result = await wx.showModal({
          title: '',
          content: '拒绝退款？',
          cancelText: '否',
          confirmText: '是'
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
  }
})