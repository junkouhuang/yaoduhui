const tool = require("../../utils/filter.js");
const common = require("../../utils/common")
let timer;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    len: {
      type: Number
    },
    source: {
      type: String
    },
  },
  /*组件生命周期*/

  lifetimes: {
    detached() {
      clearInterval(timer);
      console.log("========")
    },
  },
  /*页面生命周期*/
  pageLifetimes: {
    show: function () {
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
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    show: 1,
    list: [],
    status: 1, //0不显示加载  1显示加载  2显示完成
    tempFilePaths: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/scan.png', //货物账单默认图片
    can: false, //确定收货按钮是否可点击
    isHandle: false,
    purchaseOrderId: '', //采购单id
    type: 0, //0支付 1待确认支付
    close: false, //是否显示关闭按钮
    ruleForm: {
      status: '', //0-待付款 1-待确认付款 2-已付款 3-待退款 4-已完成 5-已取消/退款 6-待第三方确认订单
      pageNum: 1,
      pageSize: 2
    },
    keyword: '',
    orderId: '', //订单id
    pindex: '', //局部刷新的下标
    showAlert: false,
    windowWidth: null, //可使用窗口宽度
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 页面上拉触底事件的处理函数
     */
    lower: function () {
      const that = this;
      if (that.data.ruleForm.pageNum < that.data.pages) {
        that.data.ruleForm.pageNum = ++that.data.ruleForm.pageNum;
        clearInterval(timer);
        that.orderList();
      }
    },

    //切换
    change() {
      const that = this;
      that.data.ruleForm.pageNum = 1;
      clearInterval(timer);
      that.setData({
        show: 1,
        list: [],
        status: 1,
        ['ruleForm.status']: that.data.ruleForm.status //什么是待确认付款
      })
      that.orderList();
    },

    //什么是等待确认付款
    what() {
      this.setData({
        showAlert: true
      })
    },

    //进入企业
    async goCompany(e) {
      const supplierId = e.currentTarget.dataset.supplierid;
      const regionId = e.currentTarget.dataset.regionid;
      wx.navigateTo({
        url: `/packageC/pages/company/index?enterpriseId=${supplierId}&provinceId=${regionId}`,
      })
    },

    //列表
    async orderList() {
      let that = this;
      debugger
      try {
        let url = '';
        let header = {
          'content-type': 'application/x-www-form-urlencoded'
        }
        if (that.data.source == 'purchase_order') {
          url = '/ydh/mall/purchaseorder/list';
          that.data.ruleForm.keyword = that.data.keyword;
        }
        if (that.data.source == 'sale_order') {
          url = "/ydh/mall/order/findSalesOrderList";
          that.data.ruleForm.search = that.data.keyword;
          header = ""
        }
        let res = await wx.$http.post(url, that.data.ruleForm, header);
        if (res.data.returnCode == "ERR_0000") {
          if (res.data.data.list.length > 0) {
            let list = [...that.data.list, ...res.data.data.list];
            if (that.data.ruleForm.status == "" || that.data.ruleForm.status == 0) {
              that.setData({
                list,
                show: 1,
              })
              console.log(this.data.list)
              
              this.shengTime();
            } else {
              clearInterval(timer);
              that.setData({
                list,
                show: 1,
              })
            }
          } else {
            clearInterval(timer);
            that.setData({
              list: [],
              show: 2,
            })
          }
          that.data.pages = res.data.data.pages;
          //已经加载全部
          if (!res.data.data.hasNextPage) {
            that.setData({
              status: 2
            })
          } else {
            that.setData({
              status: 1
            })
          }
        }
        if (res.data.returnCode == "ERR_0005") {
          that.setData({
            show: 3
          })
        }
      } catch (err) {
        console.log(err)
        console.log("catch")
      }

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
      that.data.orderId = e.currentTarget.dataset.id;
      let res = await wx.$http.post('/ydh/mall/purchaseorder/cancelRefund', {
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
              that.partRefresh();
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

    shengTime() {
      timer = setInterval(() => {
        for (let i in this.data.list) {
          if (this.data.list[i].cancelTime > 0) {
            this.data.list[i].autoCancelTime = --this.data.list[i].cancelTime;
            if (this.data.list[i].status == 0) {
              this.data.list[i].shengTime = tool.timeDown(this.data.list[i].cancelTime); //list[i].autoCancelTime
            }
          } else {
            if (this.data.ruleForm.status == 0) {
              this.data.orderId = this.data.source == "purchase_order" ? this.data.list[i].purchaseOrderId : this.data.source == "sale_order" ? this.data.list[i].salesOrderId : '';
              //this.autoCancelOrder()
            }
          }
        }
        this.setData({
          list: this.data.list,
        })
      }, 1000)
    },

    //确认中/待付款订单取消
    cancelOrder(e) {
      let that = this;
      that.data.orderId = e.currentTarget.dataset.id;
      that.data.pindex = e.currentTarget.dataset.pindex;
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
              console.log(that.data.ruleForm.status)
              if (that.data.ruleForm.status != "") {
                that.partRefresh();
              } else {
                that.change();
              }
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

    //自动取消订单
    async autoCancelOrder() {
      const that = this;
      let url;
      let params;
      if (that.data.source == 'purchase_order') {
        url = '/ydh/mall/purchaseorder/cancelPurchaseOrder';
        params = {
          purchaseOrderId: this.data.orderId
        }
      }
      if (that.data.source == 'sale_order') {
        url = '/ydh/mall/order/cancelOrder';
        params = {
          salesOrderId: this.data.orderId
        }
      }
      let res = await wx.$http.post(url, params, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        console.log("--自动取消订单--")
        that.partRefresh();
      }
    },

    //取消订单局部刷新页面
    partRefresh() {
      let filerdata;
      if (this.data.source == "purchase_order") {
        
        filerdata = this.data.list.filter(item => {
          return item.purchaseOrderId != this.data.orderId; //this.data.orderId
        })
      }
      if (this.data.source == "sale_order") {

      }

      console.log(filerdata)
      if (filerdata.length > 0) {
        this.setData({
          list: filerdata
        })
      } else {
        this.data.list = [];
        this.orderList();
      }
    },

    //企业入驻
    band() {
      wx.navigateTo({
        url: '/packageB/pages/band/search/index'
      })
    },

    //左右切换
    swiperChange(event) {
      let that = this;
      let currentIndex = event.detail.current; //当前索引
      console.log(currentIndex)
      //每个tab选项宽度占1/5
      let singleNavWidth = that.data.windowWidth / 5;
      //tab选项居中
      let navScrollLeft = (currentIndex - 1) * singleNavWidth;
      console.log(navScrollLeft)
      console.log("navScrollLeft")
      that.setData({
        list: [],
        show: 0
      })
      that.data.ruleForm.pageNum = 1;
      //--0 - 待付款 1 - 待确认付款 2 - 已付款 3 - 待退款 4 - 已完成 5 - 已取消 6 - 待第三方确认订单
      that.data.ruleForm.status = currentIndex == 0 ? "" : currentIndex == 1 ? 6 : currentIndex == 2 ? 0 : currentIndex == 3 ? 1 : currentIndex == 4 ? 2 : currentIndex == 5 ? 3 : currentIndex == 6 ? 4 : currentIndex == 7 ? 5 : '';
      that.orderList();
      this.triggerEvent('setActiveStatus', {
        currentIndex,
        navScrollLeft
      })
    },

    //收货
    async sh(e) {
      let purchaseOrderId = e.currentTarget.dataset.id;
      let that = this;
      this.setData({
        purchaseOrderId
      })
      //收货拍照
      that.maskLayer()
    },

    //上传图片
    maskLayer: function (e) {
      // 用that取代this，防止不必要的情况发生
      let that = this;
      // 创建一个动画实例
      let animation = wx.createAnimation({
        // 动画持续时间
        duration: 500,
        // 定义动画效果，当前是匀速
        timingFunction: 'linear'
      })
      // 将该变量赋值给当前动画
      that.animation = animation
      // 先在y轴偏移，然后用step()完成一个动画
      animation.translateY(200).step()
      // 用setData改变当前动画
      that.setData({
        // 通过export()方法导出数据
        animationData: animation.export(),
        // 改变view里面的Wx：if
        chooseSize: true
      })
      // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
      setTimeout(function () {
        animation.translateY(0).step()
        that.setData({
          animationData: animation.export()
        })
      }, 200)
    },

    //上传图片
    async chooseImg() {
      let that = this;
      that.data.isHandle = false;
      try {
        const imageMsg = await wx.chooseImage({
          count: 1
        })
        const path = imageMsg.tempFilePaths[0]
        const res = await wx.$http.upload('https://www.xinquanjk.com/common/image/uploads', path)
        const data = JSON.parse(res.data)
        if (data.data) {
          const imagePath = data.data
          this.setData({
            tempFilePaths: imagePath,
            can: true
          })
        } else {
          wx.$toast({
            title: '文件上传失败',
            duration: 1000,
            tapClose: true
          })
        }
      } catch (err) {

      }
    },

    //确定收货
    async confirmReceipt(e) {
      let that = this;
      let res = await wx.$http.post('/ydh/mall/purchaseorder/confirmReceipt', {
        purchaseOrderId: that.data.purchaseOrderId,
        confirmReceipt: that.data.tempFilePaths
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        wx.showToast({
          title: "收货成功",
          icon: 'none',
          duration: 2000
        })
        that.hideModal()
        let list = that.data.list.filter(item => item.purchaseOrderId != that.data.purchaseOrderId)
        that.setData({
          list,
          show: list.length > 0 ? 1 : 2
        })
      } else {
        wx.showToast({
          title: "收货失败",
          icon: 'none',
          duration: 2000
        })
      }
    },

    //取消收货
    cancelsh() {
      let that = this;
      that.setData({
        chooseSize: false,
        tempFilePaths: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/scan.png',
        can: false
      })
    },

    //关闭收货弹窗
    hideModal() {
      let that = this;
      that.setData({
        chooseSize: false,
        tempFilePaths: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/scan.png',
        can: false
      })
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
            let list = that.data.list.filter(item => item.purchaseOrderId != purchaseOrderId)
            that.setData({
              list,
              show: list.length > 0 ? 1 : 2
            })
            let singleNavWidth = that.data.windowWidth / 5;
            //tab选项居中
            let navScrollLeft = (5 - 1) * singleNavWidth;
            that.data.ruleForm.pageNum = 1;
            //--0 - 待付款 1 - 待确认付款 2 - 已付款 3 - 待退款 4 - 已完成 5 - 已取消 6 - 待第三方确认订单
            that.data.ruleForm.status = 3;
            that.orderList();
            this.triggerEvent('setActiveStatus', {
              currentIndex:5,
              navScrollLeft
            })
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
        purchaseOrderId,
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
          await this.setData({
            currentTab: 3,
            list: [],
            status:1
          })
          //跳转并更新确认支付数据
          that.data.ruleForm.status = 1;
          await this.orderList();
          this.triggerEvent('setActiveStatus', {
            currentIndex:3
          })
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
            that.setData({
              currentTab: 4,
              status:1,
              list: []
            })
            that.data.ruleForm.status = 2;
            await that.orderList();
            this.triggerEvent('setActiveStatus', {
              currentIndex:4
            })
          }else{
            wx.showToast({
              title: res.data.data.data,
              icon:'none'
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

    //详情
    detail(e) {
      let that = this;
      that.data.orderId = e.currentTarget.dataset.orderid;
      that.data.pindex = e.currentTarget.dataset.pindex;
      that.data.isHandle = false;
      clearInterval(timer);
      if (that.data.source == "purchase_order") {
        wx.navigateTo({
          url: '/packageA/pages/purchase_order/detail/index?orderId=' + that.data.orderId,
        })
      }
      if (that.data.source == "sale_order") {
        wx.navigateTo({
          url: '/packageA/pages/sale_order/detail/index?orderId=' + that.data.orderId,
        })
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

    //更新退款状态
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