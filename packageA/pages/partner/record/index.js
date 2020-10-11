let pageNum= 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navbarList: ['待审核', '已通过', '未通过'],
    lineLeft: '140rpx',
    lineIndex: 0,
    lineLeftList: ['140rpx', '296rpx', '451rpx'],
    type: 0,//状态 0：待审核 1：审核通过 2：审核不通过
    pageNum:1,
    list: [], //已审核
    show:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad() {
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
        show:1,
        status:1,
        list:[]
      })
      that.data.pageNum = 1;
      await this.getRcordList()
    }
  },
  //请求建档列表
  async getRcordList() {
    const that = this;
    const data = {
      pageNum:that.data.pageNum,
      pageSize: 10,
      status: that.data.type,
    }
    try {
      const res = await wx.$http.post('/ydh/mall/userAgent/applyRecord', data)
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
  //触发滚到底部
  async handleScrollBottom() {
    let that = this;
    that.data.pageNum = ++that.data.pageNum;
    if (that.data.pageNum <= that.data.pages) {
      await this.getRcordList()
    }
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