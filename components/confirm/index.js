// components/confirm.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
    },
    placeholderText: {
      type: String,
    },
    show: {
      type: Boolean,
    },
  },


  /**
   * 组件的初始数据
   */
  data: {
    num: 0,
    flag: true,
    inputContent: ''
  },
  attached: function () {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    inputNum(e) {
      let num = e.detail.value.length;
      this.data.inputContent = e.detail.value;
      this.setData({
        num
      })
    },
    //取消
    cancel() {
      this.setData({
        show: false
      })
    },
    //确定
    yes() {
      if(!this.data.inputContent){
        wx.showToast({
          title: '请输入拒绝原因',
          icon:'none',
          duration:1500
        })
        return false;
      }
      this.setData({
        show: false
      })
      this.triggerEvent('getData', {inputContent:this.data.inputContent})
    }
  }
})