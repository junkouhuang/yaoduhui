Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '', //关键字
    currentTab: 0, //当前选中标签
    navScrollLeft: 0,
    windowWidth: null, //可使用窗口宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowWidth:res.windowWidth
        })
        this.selectComponent("#order").data.windowWidth = res.windowWidth;
      },
    })
    this.setData({
      currentTab: options.status
    })
    // this.selectComponent("#order").data.ruleForm.status = this.data.currentTab == 0 ? "" : this.data.currentTab == 1 ? 6 : this.data.currentTab == 2 ? 0 : this.data.currentTab == 3 ? 1 : this.data.currentTab == 4 ? 2 : this.data.currentTab == 5 ? 3 : this.data.currentTab == 6 ? 4 : this.data.currentTab == 7 ? 5 : ''
    // that.selectComponent("#order").change();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let that = this;
    let orderStatus = wx.getStorageSync("orderStatus");
    console.log(orderStatus)
    if (orderStatus) {
      this.setData({
        currentTab: orderStatus == 1 ? 3 : orderStatus == 2 ? 4 : ''
      })
      wx.removeStorageSync("orderStatus");
    }
    this.selectComponent("#order").data.ruleForm.status = this.data.currentTab == 0 ? "" : this.data.currentTab == 1 ? 6 : this.data.currentTab == 2 ? 0 : this.data.currentTab == 3 ? 1 : this.data.currentTab == 4 ? 2 : this.data.currentTab == 5 ? 3 : this.data.currentTab == 6 ? 4 : this.data.currentTab == 7 ? 5 : ''
    that.selectComponent("#order").change();
  },
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

  //获取子组件传递给父组件的值
  getActiveStatus(e) {
    console.log(e.detail)
    console.log("getActiveStatus")
    this.setData({
      currentTab: e.detail.currentIndex,
      navScrollLeft: e.detail.navScrollLeft,
    })
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
      navScrollLeft: (currentIndex - 1) * singleNavWidth
    })
    that.selectComponent("#order").data.ruleForm.status = currentIndex == 0 ? "" : currentIndex == 1 ? 6 : currentIndex == 2 ? 0 : currentIndex == 3 ? 1 : currentIndex == 4 ? 2 : currentIndex == 5 ? 3 : currentIndex == 6 ? 4 : currentIndex == 7 ? 8 : '';
    that.selectComponent("#order").change();
  },
})