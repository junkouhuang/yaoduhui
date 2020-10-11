let  pageNum = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: 1, //状态 0：待审核 1：审核通过 2：审核不通过
    checkPending: [],
    accountId: '',
    enterpriseId:'',
    has: true,
    isDisable:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.enterpriseId = options.enterpriseId
    this.requestData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    pageNum = ++pageNum;
    if (pageNum <= that.data.pages) {
      that.requestData();
    }
  },

  /**
   * 选中
   */
  checkHandle(e){
    const that = this;
    const index = e.currentTarget.dataset.index;
    that.data.accountId = e.currentTarget.dataset.accountid;
    that.data.enterpriseId = e.currentTarget.dataset.enterpriseid;
    that.data.checkPending.forEach(item=>{
      item.check = false;
    })
    that.data.checkPending[index].check = !that.data.checkPending.check;
    that.setData({
      checkPending:that.data.checkPending,
      isDisable:false
    })
  },

  /**
   * 完成
   */
  async finsh(e){
    const that = this;
    const some = that.data.checkPending.some(item=>{
      return item.check
    })
    if(!some){
      wx.showToast({
        title: '请选择管理员',
        icon:'none',
        duration:1500
      })
      return false;
    }
    const data = {
      enterpriseId:that.data.enterpriseId,
      changeId:that.data.accountId
    }
    const res = await wx.$http.post('/ydh/mall/shop/changeAuth', data, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if(res.data.returnCode == "ERR_0000"){
      wx.showToast({
        title: '管理权转让成功',
      })
      wx.navigateBack({
        delta: 2,
      })
    }
  },

  /**
   * 获取基础数据
   */
  async requestData () {
    const that = this;
    const data = {
      pageNum,
      pageSize: 10,
      status: 1,
      enterpriseId:this.data.enterpriseId
    }
    const res = await wx.$http.post('/ydh/mall/shop/staffList', data, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == 'ERR_0000') {
      if (res.data.data.list.length>0) {
        res.data.data.list.forEach(item=>{
          item.check=false
        })
        this.setData({
          checkPending: [...this.data.checkPending, ...res.data.data.list],
          has: true
        })
        this.data.pages = res.data.data.pages;
        if(!res.data.data.hasNextPage){
          this.setData({
            status:2
          })
        }
      } else {
        this.setData({
          has: false
        })
      }
    }
  }
})