// components/orderNav/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    keyword:'',//关键字
    currentTab: 0, //当前选中标签
    navScrollLeft: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
      this.selectComponent("#order").orderList();
    },

    //根据商品名搜索
    search() {
      this.selectComponent("#order").data.keyword = this.data.keyword;
      this.selectComponent("#order").orderList();
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
      that.selectComponent("#order").data.ruleForm.status = currentIndex == 0 ? "" : currentIndex == 1 ? 6 : currentIndex == 2 ? 0 : currentIndex == 3 ? 1 : currentIndex == 4 ? 2 : currentIndex == 5 ? 3 : currentIndex == 6 ? 4 : currentIndex == 7 ? 5 : '';
      that.selectComponent("#order").change();
    },
  }
})