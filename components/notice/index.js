// components/confirm.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
    },
    content: {
      type: String
    },
    announcement:{
      type:[]
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
   
  },


  /**
   * 组件的方法列表
   */
  methods: {
    //明白了
    isee() {
      this.setData({
        show: false
      })
      this.triggerEvent('getData', false)
      this.triggerEvent('myevent', false);
    },
    //复制
    copyText: function (e) {
      const index = e.currentTarget.dataset.index
      let copy = this.data.announcement[index].shop.province+this.data.announcement[index].shop.city+this.data.announcement[index].shop.region+this.data.announcement[index].shop.location;
      wx.setClipboardData({
        data: copy,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              wx.showToast({
                title: '复制成功'
              })
            }
          })
        }
      })
    },
    //获取建档信息
    async getBuildInfo(regionIdList,enterpriseId){
      const that = this;
      let resData = await wx.$http.post('/ydh/mall/archive/findAnnouncement', {
        regionIdList,enterpriseId
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      });
      // let announcement;
      // if (resData.data.returnCode == 'ERR_0000') {
      //   announcement = resData.data.data
      // } else {
      //   announcement = []
      // }
      // that.setData({
      //   announcement
      // })
      this.triggerEvent('getBuildInfo',resData.data.data)
    }
  }
})