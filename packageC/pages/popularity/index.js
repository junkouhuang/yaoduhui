Page({
  /**
   * 页面的初始数据
   */
  data: {
    isHide:true,
    scrolly:false,
    mtop:0
  },

  onShow: function () {
    if (this.selectComponent('#goods').data.isRefresh) {
      this.selectComponent('#goods').data.list = [];
      this.selectComponent('#goods').listByTag();
    }
  },

  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    this.selectComponent("#goods").onReachBottom();
  },

  //页面滚动监听
  onPageScroll(e) {
    if(!this.data.scrolly){
      this.setData({mtop:e.scrollTop});
    }
    if (e.scrollTop > wx.getSystemInfoSync().windowHeight - 30) { // 显示隐藏购物车
      console.log("====")
      if (this.data.isHide) {
        this.data.isHide = false;
        this.selectComponent("#goods").data.isHide = false;
        this.selectComponent("#goods").onPageScroll();
        console.log("===")
      }
    } else {
      console.log("******")
      if (!this.data.isHide) {
        this.data.isHide = true;
        this.selectComponent("#goods").data.isHide = true;
        this.selectComponent("#goods").onPageScroll();
        console.log("===")
      }
    }
  },

  myevent(e){
    console.log(e.detail)
    this.setData({
      scrolly:e.detail
    })
    wx.pageScrollTo({
      scrollTop: this.data.mtop,
      duration: 0
    });
  },

})