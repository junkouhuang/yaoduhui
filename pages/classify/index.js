let pageNum =  1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    default: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/classify1.png',
    active: 0, //banner
    categoryId: '', //一级分类Id
    categoryName:'',
    classifyList: [], //一级分类
    currentIndex: 0,
    num: 1, //总条数
    promotion: [], //二级分类
    pageSize: 12,
    pages:1,
    windowHeight: null, //可使用窗口宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.getClassify1(); //一级分类
    //获得系统信息
    wx.getSystemInfo({
      success: (res) => {
        that.data.windowHeight = res.windowHeight;
      },
    })
  },

  /**
   * 滑动时改变获取下标
   */
  bannerChange(e) {
    let that = this;
    that.setData({
      active: e.detail.current
    })
  },

  /**
   * 一级菜单事件
   */
  flHandle(e) {
    let that = this;
    that.data.categoryId = e.currentTarget.dataset.id; //获取一级分类id
    that.data.categoryName = e.currentTarget.dataset.typename; //一级分类
    that.data.typeName = e.currentTarget.dataset.typename;
    let currentIndex = e.currentTarget.dataset.index;
    let singleNavHeight = that.data.windowHeight / 11; //每个单元格高度
    let nowNavHeight = currentIndex * singleNavHeight; //当前选中tab在导航的位置
    let firstCenterNavHeight = 5 * singleNavHeight; //第一个临界值
    let lastCenterNavHeight = (that.data.num - 5) * singleNavHeight; //最后一个临界值
    if (nowNavHeight > firstCenterNavHeight && nowNavHeight < lastCenterNavHeight) {
      this.setData({
        currentIndex: currentIndex,
        navScrollTop: (currentIndex - 5) * singleNavHeight
      })
    } else {
      this.setData({
        currentIndex: currentIndex,
      })
    }
    that.getClassify2();
  },

  /**
   * 分类一
   */
  async getClassify1() {
    let that = this;
    let res = await wx.$http.get('/ydh/mall/drugType/categoryList', {
      status: ''
    });
    if (res.data.returnCode == "ERR_0000") {
      that.setData({
        classifyList: res.data.data
      })
      that.data.num = res.data.data.length;
      that.data.categoryId = res.data.data[0].id; //一级分类id
      that.data.categoryName = res.data.data[0].typeName; //一级分类id
      that.getClassify2();
    }
  },

  /**
   * 分类二
   */
  async getClassify2() {
    let that = this;
    let res = await wx.$http.get('/ydh/mall/drugType/list', {
      categoryId: that.data.categoryId,
      pageNum,
      pageSize: 100,
      remarks: "",
      sellWell: "",
      sort: "",
      status: "",
      typeName: ""
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    if (res.data.returnCode == "ERR_0000") {
      if(res.data.data.list.length>0){
      that.setData({
        promotion: res.data.data.list,
        pages:res.data.data.pages
      })
    }else{
      that.setData({
        pages: res.data.data.list
      })
    }
    }
  },

  /**
   * 搜索商品界面
   * 2020-04-25
   */
  search_good(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let categoryId = e.currentTarget.dataset.categoryid;
    let typeName = e.currentTarget.dataset.typename;
    wx.navigateTo({
      url: '/packageC/pages/search_goods/index?drugTypeId=' + id + "&typeName=" + typeName + "&categoryId=" + categoryId + "&showHistory=false&source=2&level=2&categoryName="+that.data.categoryName,
    })
  }
})