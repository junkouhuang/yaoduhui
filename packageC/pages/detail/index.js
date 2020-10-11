const common = require('../../../utils/common');
var enterpriseId = ''; //当前企业id
var enterpriseName = ""; //当前企业名
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerImg: [], //banner图张数
    currentIndex: 1, //banner图当前索引
    drugNo: '', //商品id
    list: [],
    touchStartTime: '', //开始触摸时间
    touchEndTime: '', //结束触摸时间
    selNum: '', //选中数量
    isFavorite: false,
    showBuild: false,
    tempFilePaths: 'https://edm.xinquanjk.com/upload/iconfont/202003/20/build.png', //上传默认图片
    isExpanding: false,
    showBuilding: false,
    ids: [],
    auth: 0,
    showSkeleton: true, //骨架屏显示隐藏
    announcement: [],
    buildStatus:'',
    scrolly:false,
    mtop:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let that = this;
    that.data.drugNo = options.drugNo
    const result = await wx.getStorageSync('EnterpriseList');
    enterpriseId = result.enterpriseId;
    enterpriseName = result.enterpriseName;
    that.qusetFavorite(options.drugNo)
    that.getDetail();
    const selNum =await common.carlist(0); //购物车选中数量
    that.setData({
      selNum
    })
  },

  onShow() {
    const that = this;
    if (getApp().globalData.refresh) {
      that.setData({
        list: []
      })
      that.getDetail();
    }
  },

  onShareAppMessage() {

  },

  onShareTimeline() {

  },
  onPageScroll(e){
    if(!this.data.scrolly){
      this.setData({mtop:e.scrollTop});
    }
  },

  //获取建档状态
  getBuildInfo(e) {
    const that = this;
    const announcement = e.detail;
    const buildStatus = e.detail[0].status;
    that.setData({
      buildStatus:buildStatus,
      announcement
    })
  },

  //展开收起
  handleExpandingChange: function () {
    this.setData({
      isExpanding: !this.data.isExpanding
    })
  },

  //申请建档
  async openBuild(e) {
    let that = this;
    let items = e.currentTarget.dataset.item;
    let result = await wx.getStorageSync('EnterpriseList');
    let res = await wx.$http.post('/ydh/mall/archive/findArchiveEnterprise', {
      provinceId: items.provinceId,
      enterpriseId: result.enterpriseId,
      enterpriseName: result.enterpriseName
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    res.data.data = res.data.data.filter(item => {
      return item.provinceId == items.provinceId
    })
    getApp().globalData.refresh = true;
    wx.navigateTo({
      url: '/packageB/pages/enter-detail/sent/index?arr=' + JSON.stringify(res.data.data) + "&enterpriseId=" + result.enterpriseId + "&enterpriseName=" + result.enterpriseName + "&auth=" + this.data.auth
    })
  },

  /**
   * 滑动时改变获取下标
   */
  bannerChange(e) {
    this.setData({
      currentIndex: e.detail.current + 1
    })
  },

  //打开建档中
  openBuilding() {
    this.shoying();
    this.setData({
      scrolly:true
    })
    wx.pageScrollTo({
      scrollTop: this.data.mtop,
      duration: 0
    });
  },

  //首营资料
  async shoying() {
    let that = this;
    let result = await wx.getStorageSync('EnterpriseList');
    const res = await wx.$http.post('/ydh/mall/enterprise/credentialsList', {
      enterpriseId: result.enterpriseId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })

    let message = "";
    for (let i in res.data.data.qualificationsDTOList) {
      if (res.data.data.qualificationsDTOList[i]["nameId"] != 23) {
        message += "【" + res.data.data.qualificationsDTOList[i]["qualificationsName"] + "】,"
      }
    }
    this.setData({
      showBuilding: true,
      content: message
    })
    await that.selectComponent("#buildInfo").getBuildInfo(that.data.ids, enterpriseId); //配送详情
  },

  //获取详情信息
  async getDetail(drugNo) {
    let that = this;
    let res = await wx.$http.post('/ydh/mall/drug/preview', {
      drugNo: that.data.drugNo
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    let list = res.data.data;
    if (list.packageAmount != null && list.retail == 0) {
      list.quantity = res.data.data.packageAmount;
    }
    if (list.midpackageAmount != null && list.retail == 1) {
      list.quantity = res.data.data.midpackageAmount;
    }
    that.setData({
      list,
      showSkeleton: false
    })
    that.data.ids = [];
    that.data.ids.push(res.data.data.provinceId);
    await that.selectComponent("#buildInfo").getBuildInfo(that.data.ids, enterpriseId);
    //const auth = await common.getManageAuth(enterpriseId); //判断是否有修改权限
    that.setData({
      auth:await wx.getStorageSync('manageAuth')
    })
  },

  /**
   * 加入购物车
   */
  async addcar() {
    let that = this;
    if (that.data.buildStatus == 1 || that.data.buildStatus == null) {
      wx.showToast({
        title: '请先向配送企业申请建档~',
        icon: 'none'
      })
    } else if (that.data.buildStatus == 0) {
      that.shoying();
    } else if (that.data.list.quantity > that.data.list.amount) {
      wx.showToast({
        title: '预约数量不能超过当前库存哦~',
        icon: 'none'
      })
    } else {
      let {
        enterpriseId,
        drugNo,
        quantity,
        retail
      } = that.data.list;
      let res = await wx.$http.post('/ydh/mall/shoppingcar/add', {
        enterpriseId,
        drugNo,
        quantity,
        retail
      });
      if (res.data.returnCode == "ERR_0000") {
        wx.showToast({
          title: '已加入预约单',
          icon: 'none',
        })
        const selNum =await common.carlist("0"); //购物车选中数量
        that.setData({
          selNum
        })
      }
      if (res.data.returnCode == "ERR_0001") {
        wx.showToast({
          title: '添加数量超过库存限制~',
          icon: 'none'
        })
      }
      if (res.data.returnCode == "ERR_0002") {
        wx.showToast({
          title: '请勿预约本企业商品~', //请勿购买本企业商品
          icon: 'none'
        })
      }
      if (res.data.returnCode == "ERR_0003") {
        wx.showToast({
          title: '该企业是数据服务公司，暂时无法采购药品~', 
          icon: 'none'
        })
      }
    }
  },

  /**
   * 绑定企业
   */
  band() {
    wx.navigateTo({
      url: '/packageB/pages/band/search/index'
    })
  },

  /**
   * 减
   */
  sub: function () {
    let that = this;
    let sl = 0;
    let qp = 0;
    if (that.data.list.packageAmount != null && that.data.list.retail == 0) {
      sl = parseInt(that.data.list.quantity) - parseInt(that.data.list.packageAmount);
      qp = that.data.list.packageAmount;
    }
    if (that.data.list.midpackageAmount != null && that.data.list.retail == 1) {
      sl = parseInt(that.data.list.quantity) - parseInt(that.data.list.midpackageAmount);
      qp = that.data.list.midpackageAmount;
    }
    if (sl >= qp) {
      that.data.list.quantity = sl
      that.setData({
        list: that.data.list
      })
    } else {
      wx.showToast({
        title: '预约数量不能小于起批量',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    }
  },

  /**
   * 获取手动输入数量
   */
  getQuantity(e) {
    const that = this;
    let val = e.detail.value;
    let amount = that.data.list.amount;
    let qp = 0;
    if (that.data.list.retail == 0) {
      qp = that.data.list.packageAmount;
    }
    if (that.data.list.retail == 1) {
      qp = that.data.list.midpackageAmount;
    }
    if (val > amount) {
      that.data.list.quantity = qp;
      that.setData({
        list: that.data.list
      })
      wx.showToast({
        title: '预约数量不能超过当前库存哦~',
        icon: 'none'
      })
    } else if (val < qp) {
      wx.showToast({
        title: '预约数量不能小于起订数量哦~',
        icon: 'none'
      })
      that.data.list.quantity = qp;
        that.setData({
          list: that.data.list
        })
    } else {
      wx.showToast({
        title: '预约数量必须是起订数量的倍数哦~',
        icon: 'none'
      })
      //手动输入的数量必须是起批数的倍数
      if(val%qp==0 && val>=qp){
        that.data.list.quantity = val;
      }
      that.setData({
        list: that.data.list
      })
    }

  },

  /**
   * 加
   */
  add: function () {
    let that = this;
    let sl = 0;
    let qp = 0;
    if (that.data.list.packageAmount != null && that.data.list.retail == 0) {
      sl = parseInt(that.data.list.quantity) + parseInt(that.data.list.packageAmount);
      qp = that.data.list.packageAmount;
    }
    if (that.data.list.midpackageAmount != null && that.data.list.retail == 1) {
      sl = parseInt(that.data.list.quantity) + parseInt(that.data.list.midpackageAmount);
      qp = that.data.list.midpackageAmount;
    }
    let amount = that.data.list.amount;
    if (sl <= amount) {
      that.data.list.quantity = sl
      that.setData({
        list: that.data.list
      })
    } else {
      that.data.list.quantity = qp;
      that.setData({
        list: that.data.list
      })
      wx.showToast({
        title: '预约数量不能超过库存',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    }
  },


  /**
   * 浏览图片手指触摸动作点击
   */
  previewImg: function (e) {
    const imgUrl = e.currentTarget.dataset.src;
    common.previewImg(imgUrl)
  },

  /**
   * 去往购物车
   */
  toCar() {
    wx.switchTab({
      url: '/pages/car/index',
    })
  },
  //查询商品是否收藏
  async qusetFavorite(drugNo) {
    const res = await wx.$http.get('/ydh/mall/favorite/check', {
      drugNo
    })
    if (res.data.returnCode == 'ERR_0000') {
      let isFavorite = res.data.data === 0 ? false : true
      this.setData({
        isFavorite
      })
    }
  },
  //取消收藏
  async handleCancelFavorite() {
    let list = [this.data.drugNo]
    const res = await wx.$http.post('/ydh/mall/favorite/delete', {
      list
    })
    if (res.data.returnCode == "ERR_0000") {
      this.setData({
        isFavorite: false
      })
      wx.showToast({
        title: '取消收藏成功',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //增加收藏
  async handleFavorite() {
    let params = Object.assign({
      drugNo: this.data.drugNo
    }, this.data.list)

    const res = await wx.$http.post('/ydh/mall/favorite/add', params)
    if (res.data.returnCode == "ERR_0000") {
      this.setData({
        isFavorite: true
      })
      wx.showToast({
        title: '收藏成功',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: res.data.data,
        icon: 'none',
        duration: 2000
      })
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