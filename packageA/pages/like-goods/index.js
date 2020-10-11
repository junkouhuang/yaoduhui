Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: 1,
    likeList: [],
    showLikeGoods: true,
    show:1
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onLoad() {

    await this.requsetLikeData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  async onReachBottom() {
   //后端说不需要分页
  },

  async requsetLikeData() {
    const that = this;
    try {
      const res = await wx.$http.post('/ydh/mall/favorite/find', {
        pageNum:1,
        pageSize: 100
      });
      if (res.data.returnCode == "ERR_0000") {
        if(res.data.data.list.length>0){
          this.setData({
            likeList: [...this.data.likeList, ...res.data.data.list],
            showLikeGoods: true,
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
        }else{
          that.setData({
            show:2,
            showLikeGoods: true,
          })
        }
      }
      if (res.data.returnCode == "ERR_0005") {
        this.setData({
          showLikeGoods: false,
        })
      }
    } catch (err) {
    }
  },

  //查看详情
  detail(e) {
    let drugNo = e.currentTarget.dataset.drugno;
    let amount = e.currentTarget.dataset.amount;
    if (amount == null) {
      wx.showToast({
        title: '绑定企业后可查看更多信息',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    } else {
      wx.navigateTo({
        url: '/packageC/pages/detail/index?drugNo=' + drugNo,
      })
    }
  },
})