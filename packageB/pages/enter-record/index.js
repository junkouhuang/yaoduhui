let pageNum = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navbarList: ['待审核', '已通过', '未通过'],
    lineLeft: '140rpx',
    lineIndex: 0,
    lineLeftList: ['140rpx', '295rpx', '450rpx'],
    status: 1,
    pages:0,
    type: 0,
    checkPending: [], //待审核
    has: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.getRcordList()
  },

    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    pageNum = ++pageNum;
    if (pageNum <= that.data.pages) {
      that.getRcordList();
    }
  },

  //切换goggle
  async handleToggle(e) {
    const index = e.currentTarget.dataset.index
    const list = this.data.lineLeftList
    if (index !== this.data.lineIndex) {
      this.setData({
        lineIndex: index,
        lineLeft: list[index],
        has: true,
        checkPending: [],
        status: 1,
      })
      this.data.type = index;
      pageNum = 1;
      await this.getRcordList()
    }
  },
  //企业绑定记录
  async getRcordList() {
    const data = {
      status: this.data.type,
      pageNum,
      pageSize: 10,
    }
    try {
      const res = await wx.$http.post('/ydh/mall/enterpriseBindApply/find', data)
      if (res.data.returnCode == 'ERR_0000') {
        if (res.data.data) {
          this.setData({
            checkPending: [ ...this.data.checkPending,...res.data.data.list],
            has: true
          })
          this.data.pages = res.data.data.pages
          if (!res.data.data.hasNextPage) {
            this.setData({
              status: 2
            })
          }
        } else {
          this.setData({
            has: false,
          })
        }
      }
    } catch (err) {

    }
  },
})