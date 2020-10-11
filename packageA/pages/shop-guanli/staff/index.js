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
    status: 1, //1加载更多，2已经加载全部
    type: 0,
    checkPending: [],
    show: false,
    remark: '',
    bindApplyId: '',
    enterpriseId:'',
    lineIndex:0,
    has: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.data.enterpriseId = options.enterpriseId;
    await this.getRcordList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom(){
    let that = this;
    pageNum = ++pageNum;
    if (pageNum <= that.data.pages) {
      that.getRcordList();
    }
  },

  //拒绝原因弹出框
  reject: function (e) {
    this.data.bindApplyId = e.currentTarget.dataset.id;
    this.setData({
      show: true
    })
  },

  //确认
  getData: function (e) {
    this.data.remark = e.detail.inputContent;
    this.staffadui(2);
  },

  //通过
  pass(e) {
    const that = this;
    wx.showModal({
      title: '',
      content: '确认通过该员工申请？',
      confirmColor: '#3996E1',
      confirmText: '确认',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.data.bindApplyId = e.currentTarget.dataset.id;
          that.staffadui(1);
        }
      }
    })
  },

  //解绑
  jieband(e) {
    this.data.bindApplyId = e.currentTarget.dataset.id;
    this.staffadui(3);
  },

  //切换goggle
  handleToggle(e) {
    const index = e.currentTarget.dataset.index
    const list = this.data.lineLeftList
    if (index !== this.data.lineIndex) {
      this.setData({
        lineIndex: index,
        lineLeft: list[index],
        checkPending:[],
        status:1,
        has: true
      })
      this.data.type = index;
      pageNum = 1;
      this.getRcordList();
    }
  },

  async getRcordList() {
    const data = {
      pageNum,
      pageSize: 10,
      status: this.data.type,
      enterpriseId:this.data.enterpriseId
    }
    try {
      const res = await wx.$http.post('/ydh/mall/shop/staffList', data, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == 'ERR_0000') {
        if (res.data.data.list.length > 0) {
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
    } catch (err) {
    }
  },
  /**
   * 审核
   */
  async staffadui(status) {
    const data = {
      status: status,
      remark: this.data.remark,
      bindApplyId: this.data.bindApplyId,
      enterpriseId:this.data.enterpriseId
    }
    const res = await wx.$http.post('/ydh/mall/shop/staffaduit', data, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.returnCode == 'ERR_0000') {
      wx.showToast({
        title: status == 1 ? "已通过" : status == 2 ? "已拒绝" : status == 3 ? "解绑成功" : "",
        duration: 2000,
        icon: 'none'
      })
      this.setData({
        show: false,
        checkPending:[]
      })
      this.getRcordList();
    }
  }
})