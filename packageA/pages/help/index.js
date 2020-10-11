Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    status: 1, //1加载更多，2已经加载全部
    keyWord: '',
    pageNum:1,
    pages: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.list();
  },

  handleGetSearch(e) {
    const value = e.detail.value
    this.setData({
      keyWord: value
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync("history_detail");
  },

  //根据关键字搜索
  async handleSearchData() {
    this.data.list = [];
    await this.list()
  },

  //删除关键字
  handleClose() {
    this.setData({
      keyWord: '',
      list:[],
      status:1
    })
    this.data.pageNum = 1;
    this.list();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    that.data.pageNum = ++that.data.pageNum;
    if (that.data.pageNum <= that.data.pages) {
      that.list();
    }
  },


  //列表data
  async list() {
    const that = this;
    let paramData = {
      pageNum:that.data.pageNum,
      pageSize: 20,
      title: this.data.keyWord,
      status: 1,
      source: 1,
    }
    let res = await wx.$http.post('/common/faq/desktop/search', paramData, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == 'ERR_0000') {
      if (res.data.data) {
        this.setData({
          list: [...that.data.list, ...res.data.data.list],
          pages: res.data.data.pages
        })
        that.data.pages = res.data.data.pages;
        //已经加载全部
        if (!res.data.data.hasNextPage) {
          that.setData({
            status: 2
          })
        }
      }
    } else {
      this.setData({
        pages: 0
      })
    }
  },

  //详情
  toDetail(e) {
    wx.navigateTo({
      url: "/packageA/pages/help_detail/index",
    })
    wx.setStorageSync('history_detail', e.currentTarget.dataset.item)
  }
})