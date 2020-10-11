const common = require("../../utils/common");
var pageNum = 1; //当前的页数
var pages = 0; //总页数
var enterpriseId = ''; //当前企业id
var enterpriseName = ""; //当前企业名
Page({
  /**
   * 页面的初始数据
   */
  data: {
    banner: [], //banner图
    popularity: [],
    active1: 0, //banner-圆点
    active2: 0,
    classifyData: [], //分类展示用
    flhandle: [],
    active2: 0, //分类-点
    classifyLen: 0, //分类-块
    index: 0, //分类初始下标
    list: [],
    navbarList: [{
        title: '促销药品',
        subhead: '超值的好药'
      },
      {
        title: '0元采购',
        subhead: '分享实现0元预约'
      }
    ],
    lineIndex: 0,
    showSkeleton: true, //骨架屏显示隐藏
    navbarInitTop: 0, //导航栏初始化距顶部的距离
    isFixedTop: false, //是否固定顶部
    isHide: true,
    enterpriseList: [], //商铺列表
    scrolly:false,
    mtop:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const that = this;
    //提示公告未补充资料弹窗：
    await that.getBanner(); //轮播图
    await that.findEnterprise(); //商铺
    await that.getClassify2(); //分类
    // wx.requestSubscribeMessage({ //消息推送
    //   tmplIds: ['k5YrP_7ca-9rS6wLZ8UTrKpEgC_AHdVhkT2p3iDGiS4'],
    //   success(res) {
    //     console.log(res)
    //   },
    //   fail(err) {
    //     console.log(err)
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let that = this;
    if (that.selectComponent('#goods').data.isRefresh) { //是否重新刷新，建档操作
      that.selectComponent('#goods').data.list = [];
      that.selectComponent('#goods').listByTag();
    }
    if (!wx.getStorageSync('validitycheck')) { //企业切换
      that.selectComponent('#goods').data.list = [];
      that.selectComponent('#goods').listByTag();
      await that.findEnterprise(); //商铺
      await common.validated();
      await common.getRequsetMemberDataBsyStatus();
      wx.setStorageSync('validitycheck', true)
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
  //分享好友
  onShareAppMessage() {

  },
  //分享朋友圈
  onShareTimeline() {

  },

  test() {
    wx.requestSubscribeMessage({
      tmplIds: ['k5YrP_7ca-9rS6wLZ8UTrKpEgC_AHdVhkT2p3iDGiS4'],
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
  },

  //页面滚动监听
  onPageScroll(e) {
    if(!this.data.scrolly){
      this.setData({mtop:e.scrollTop});
    }

    if (e.scrollTop > wx.getSystemInfoSync().windowHeight - 30) { // 显示隐藏购物车
      if (this.data.isHide) {
        this.data.isHide = false;
        this.selectComponent("#goods").data.isHide = false;
        this.selectComponent("#goods").onPageScroll();
      }
    } else {
      if (!this.data.isHide) {
        this.data.isHide = true;
        this.selectComponent("#goods").data.isHide = true;
        this.selectComponent("#goods").onPageScroll();
        console.log("******")
      }
    }
    if (e.scrollTop >= 0) {
      if (!this.data.isFixedTop) {
        this.setData({
          isFixedTop: true
        })
      }
    } else {
      if (this.data.isFixedTop) {
        this.setData({
          isFixedTop: false
        })
      }
    }
  },

  //切换
  async handleToggle(e) {
    this.setData({
      lineIndex: e.currentTarget.dataset.index,
    })
    this.selectComponent('#goods').clickHandle();
  },

  //页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    pageNum = 1;
    this.data.list = [];
    this.setData({
      status: 1
    });
    this.selectComponent('#goods').listByTag();
    wx.stopPullDownRefresh();
  },

  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    this.selectComponent("#goods").onReachBottom();
  },

  //fl_home
  styleHandle(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '/packageC/pages/fl_home/index?id=' + id + "&name=" + name,
    })
  },

  //滑动时改变获取下标
  bannerChange(e) {
    let that = this;
    that.setData({
      active1: e.detail.current
    })
  },
  bannerChange1(e) {
    let that = this;
    that.setData({
      active2: e.detail.current
    })
  },
  classifyChange(e) {
    let that = this;
    that.data.index = e.detail.current;
    that.setData({
      active2: e.detail.current,
      classifyList: that.data.classifyData.slice(that.data.index * 10, (that.data.index * 10) + 10)
    })
  },
  healthChange(e) {
    let that = this;
    that.data.index = e.detail.current;
    that.setData({
      active2: e.detail.current,
      navList2: that.data.navList.slice(that.data.index * 10, (that.data.index * 10) + 10)
    })
  },

  //人气排行榜
  popularity() {
    wx.navigateTo({
      url: '/packageC/pages/popularity/index',
    })
  },

  //分类
  async getClassify2() {
    let that = this;
    let res = await wx.$http.get('/ydh/mall/drugType/list', {
      categoryId: "",
      pageNum: 1,
      pageSize: 100,
      remarks: "",
      sellWell: "1001", //1001热销 1002非热销
      sort: "",
      status: "",
      typeName: ""
    });
    if (res.data.returnCode == "ERR_0000") {
      that.setData({
        classifyLen: res.data.data.list.length % 10 == 0 ? res.data.data.list.length / 10 : parseInt(res.data.data.list.length / 10) + 1,
        classifyList: res.data.data.list.slice(that.data.index * 10, (that.data.index * 10) + 10),
        showSkeleton: false
      })
      that.data.classifyData = res.data.data.list;
    }
  },


  //获取轮播图
  async getBanner() {
    let that = this;
    let res = await wx.$http.post('/ydh/mall/banner/find', {});
    if (res.data.returnCode == "ERR_0000") {
      const bannerList = res.data.data.list.filter((item) => {
        return item.position == 0;
      })
      const popularity = res.data.data.list.filter((item) => {
        return item.position == 1;
      })
      const flhandle = res.data.data.list.filter((item) => {
        return item.position == 3;
      })
      that.setData({
        banner: bannerList[0].details,
        flag: bannerList[0].flag,
        popularity: popularity[0].details,
        flhandle: flhandle[0].details,
      })
    }
  },

  //商品详情
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

  //跳转到搜索商品
  search(e) {
    wx.navigateTo({
      url: '/packageC/pages/search_goods/index?showHistory=true' //文本输入框跳转
    })
  },

  //跳转到搜索商品
  toSearchGood(e) {
    let drugTypeId = e.currentTarget.dataset.id;
    let typeName = e.currentTarget.dataset.typename;
    let categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: '/packageC/pages/search_goods/index?drugTypeId=' + drugTypeId + "&typeName=" + typeName + "&categoryId=" + categoryId + "&showHistory=false&level=2&categoryName=",
    })
  },

  /**
   * 进入企业
   */
  goCompany(e) {
    let enterpriseId = e.currentTarget.dataset.enterpriseid;
    let provinceId = e.currentTarget.dataset.provinceid;
    this.selectComponent('#goods').data.isRefresh = true;
    wx.navigateTo({
      url: `/packageC/pages/company/index?enterpriseId=${enterpriseId}&provinceId=${provinceId}`,
    })
  },

  /**
   * 获取商铺列表
   */
  async findEnterprise() {
    let that = this;
    let res = await wx.$http.post('/ydh/mall/stores/findEnterprise', {});
    if (res.data.returnCode == "ERR_0000") {
      that.setData({
        enterpriseList: res.data.data
      })
    }
  }
})