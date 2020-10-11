Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarList: ['客户返佣', '下级返佣'],
    lineLeft: '156rpx',
    lineIndex: 0,
    lineLeftList: ['156rpx', '442rpx'],
    data: [],
    list: [],
    type: 0,
    pageNum: 1,
    show: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.getRcordList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    const data = await wx.$http.post('/ydh/mall/agentCommissionSettlement/sumCommissionSettle');
    this.setData({
      data: data.data.data,
    })
  },

  //结算
  settle() {
    if (this.data.data.withdraw <= 0) {
      wx.showToast({
        title: '当前无可结算金额',
        duration: 2000,
        icon: 'none'
      })
    } else {
      wx.navigateTo({
        url: "/packageA/pages/earnings/settle/index?withdraw=" + this.data.data.withdraw
      })
    }
  },
  //切换
  async handleToggle(e) {
    const that = this;
    const index = e.currentTarget.dataset.index
    const list = this.data.lineLeftList
    if (index !== this.data.lineIndex) {
      this.setData({
        lineIndex: index,
        lineLeft: list[index],
        type: index,
        status:1,
        show:1
      })
      that.data.pageNum = 1;
      that.data.list = [];
      await this.getRcordList()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  async onReachBottom() {
    this.data.pageNum = ++this.data.pageNum;
    if (this.data.pageNum <= this.data.pages) {
      this.getRcordList();
    }
  },

  //结算记录
  settleRecord() {
    wx.navigateTo({
      url: '/packageA/pages/earnings/list/index',
    })
  },

  //列表
  async getRcordList() {
    const  that = this;
    let type = this.data.type
    const data = {
      level: type == 0 ? 4 : '',
      pageNum: this.data.pageNum,
      pageSize: 10,
    }
    try {
      const res = await wx.$http.post('/ydh/mall/agentCommissionSettlement/userCommissionList', data)
      if (res.data.returnCode == 'ERR_0000') {
        if (res.data.data.list.length>0) {
          this.setData({
            list: [...this.data.list, ...res.data.data.list]
          })
          if (!res.data.data.hasNextPage) {
            this.setData({
              status: 2
            })
          } else {
            this.setData({
              status: 1
            })
          }
        } else {
          this.setData({
            show:2
          })
        }
      }
    } catch (err) {

    }
  },
})