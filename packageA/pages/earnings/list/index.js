var filter = require('../../../../utils/filter.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navbarList: ['全部', '待审核', '审核通过', '审核不通过'],
    lineLeft: '20rpx',
    lineIndex: 0,
    pageNum:1,
    lineLeftList: ['18rpx', '160rpx', '328rpx', '528rpx'],
    status: 0, //状态 0：待审核 1：审核通过 2：审核不通过
    type: 0,
    list: [], 
    expiryDate: filter.formatMonth(new Date())
  },

  /**
   * 时间
   */
  async pickDate(e) {
    console.log(e.detail.value)
    this.setData({
      expiryDate: e.detail.value,
      status:1
    });
    this.data.pageNum == 1;
    this.data.list = [];
    await this.getRcordList();
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options) {
     this.getRcordList();
  },

  //切换goggle
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
        show:1,
        list: [],
      })
      that.data.pageNum =1;
      await this.getRcordList()
    }
  },
  //请求结算记录列表
  async getRcordList() {
    const that = this;
    const data = {
      pageNum:that.data.pageNum,
      pageSize: 10,
      startTime: filter.formatMonth(this.data.expiryDate).replace(/-/g, ''),
      status: this.data.type == 0 ? '' : this.data.type == 1 ? 0 : this.data.type == 2 ? 1 : this.data.type == 3 ? 2 : '',
    }
    try {
      const res = await wx.$http.post('/ydh/mall/agentCommissionSettlement/settleList', data, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == 'ERR_0000') {
        if(res.data.data){
          that.setData({
            list:[...that.data.list, ...res.data.data.list],
            show:1
          })
          if (!res.data.data.hasNextPage) {
            that.setData({
              status: 2
            })
          }else{
            that.setData({
              status: 1
            })
          }
        }else{
          this.setData({
            status: 1,
            show:2
          })
        }
      }
    } catch (err) {
     
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  async onReachBottom() {
    const type = this.data.type
    const status = type == 0 ? this.data.statusCheck : this.data.status
    if (status == 2) return
    await this.getRcordList()
  },
  //触发滚到底部
  handleScrollBottom() {
  },
  //获取关键字
  handleGetSearch(e) {
    const value = e.detail.value
    this.setData({
      supplierName: value
    })
  },
  //删除关键字
  async handleClose() {
    const type = this.data.type
    switch (type) {
      case 0:
        this.setData({
          supplierName: '',
          pageNumCheck: 1
        })
        break;
      case 1:
        this.setData({
          supplierName: '',
          pageNum: 1
        })
    }

    await this.getRcordList()

  },
  //根据关键字搜索
  async handleSearchData() {
    const type = this.data.type
    switch (type) {
      case 0:
        this.setData({
          pageNumCheck: 1
        })
        break;
      case 1:
        this.setData({
          pageNum: 1
        })
    }
    await this.getRcordList()
  },
  async handleLookDetail(e) {
    let {
      enterpriseId,
      enterpriseName,
      location,
      mobileNumber,
      supplierName,
      userName,
      modeName,
      status,
      auditOpinion,
      id
    } = e.currentTarget.dataset.detail
    const data = {
      enterpriseId,
      enterpriseName,
      location,
      mobileNumber,
      supplierName,
      userName,
      modeName,
      status,
      auditOpinion,
      id
    }
    await wx.setStorageSync('put_record_data', data)

    wx.navigateTo({
      url: '/pages/put_record/customer/index',
    })
  }
})