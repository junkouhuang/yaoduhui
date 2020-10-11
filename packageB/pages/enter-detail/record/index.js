
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lineLeft: '84rpx',
    lineLeftList: ['84rpx', '334rpx', '576rpx'],
    item: [],
    nav: ['待审核', '已通过', '未通过'],
    currentIndex: 0,
    ruleForm: {
      enterpriseId: "",
      status: 0,
      pageNum: 1,
      pageSize: 10
    },
    status: 1,
    has: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad (options) {
    this.data.ruleForm.enterpriseId = options.enterpriseId;
    this.getRequestData()
  },

  /**
   * handleNav
   */
  async handleNav(e) {
    const that = this;
    const index = e.currentTarget.dataset.index
    const list = this.data.lineLeftList
    if (index !== this.data.currentIndex) {
      await that.setData({
        currentIndex: index,
        lineLeft: list[index],
        has: true,
        ['ruleForm.status']: index,
        pageNum: 1,
        status:1,
        item:[]
      })
      await that.getRequestData();
    }
  },

  /**
   * 获取数据列表
   */
  async getRequestData() {
    const that = this;
    let res = await wx.$http.post('/ydh/mall/enterprisePhoto/list', that.data.ruleForm)
    if (res.data.data.list.length > 0) {
      that.setData({
        item: res.data.data.list,
        has: true
      })
      //已经加载全部
      if (!res.data.data.hasNextPage) {
        that.setData({
          
          status: 2
        })
      }
    } else {
      that.setData({
        has: false,
      })
    }
  }
})