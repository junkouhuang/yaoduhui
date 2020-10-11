const tools = require('../../utils/filter')
let timer;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String
    },
    type: {
      type: String
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
    lastModifyTime: '',
    purchaseOrderId: '',
    showDialog:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async return () {
      if (this.data.type == 'pay') {
        this.setData({
          showDialog:true
        })
      } else if (this.data.type == 'confirmpay') {
        clearTimeout(timerName1);
        let model = await wx.showModal({
          title: '',
          content: "是否放弃该订单确认支付，6天5时30分20秒后系统会自动确认支付。 按钮：放弃/继续支付",
          cancelText: "放弃",
          confirmText: "继续支付"
        })
        if (model.confirm) {
          wx.navigateTo({
            url: "/packageB/pages/enter-detail/update/index?item=" + JSON.stringify(arr) + "&enterpriseName=" + enterpriseList.enterpriseName //+ "&auth=" + manageAuth
          })
        }
      } else {
        wx.navigateBack();
      }
    },

    //放弃支付
    cancel(){
      clearInterval(timer);
      wx.navigateBack();
    },

    clearInterval(){
      console.log("clearInterval")
      clearInterval(timer);
    },

    //继续支付
    contiune(){
      this.setData({
        showDialog:false
      })
    },

    async shengTime() {
      let res = await wx.$http.post('/ydh/mall/purchaseorder/payPage', {
        purchaseOrderId: this.data.purchaseOrderId
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      });
      console.log(res)
      if (res.data.data) {
        let time = res.data.data.cancelTime;
        timer = setInterval(() => {
          if (time > 0) {
            time = --time;
            this.setData({
              lastModifyTime: tools.timeDown(time)
            })
            //this.data.lastModifyTime = time;
           console.log(tools.timeDown(time))
          } else {
            wx.navigateBack();
            wx.showToast({
              title: '该订单过期了',
              icon: 'none'
            })
            clearInterval(timer);
          }
        }, 1000)
        wx.hideLoading();
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        })
      }
    },
  }
})
