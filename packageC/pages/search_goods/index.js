const common = require("../../../utils/common");
var enterpriseId = ''; //当前企业id
var enterpriseName = ""; //当前企业名
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    classifyData: [],
    isClassifyList: false,
    currentIndex: 2, //当前选中
    showArea: false, //显示地区
    area_currentIndex: -1, //全国
    sort: -1, //-1：默认 0：向上排序 1：向下排序
    showFl: false, //显示分类
    typeName: '分类',
    areaName: '全部',
    fl_currentIndex: -1,
    show: 1, //用于控制页面数据是否显示
    sticky: false, //true:nav吸顶 
    ruleForm: {
      regionId: 0, //省id(000为全国id)
      priceSort: 'up', //排序：up-升序 down-降序
      retail: 0, //0-整件 1-零售
      drugTypeId: '', //商品二级类型drugTypeId
      categoryId: '', //一级分类id
      keyWord: '', //搜索关键字
      pageNum: 1,
      pageSize: 12,
    },
    showHistory: true, //是否显示历史搜索界面
    historyData: [], //历史记录数组
    hotData: [], //推荐商品
    type: 0, //0：文本 1：推荐商品，历史记录
    showBuild1: false,
    showBuild2: false,
    enterpriseId: '', //被申请建档方ID
    enterpriseName: '', //被申请建档方名称
    notProvince: false, //不可跨省预约
    isExpanding: false,
    allChecked: true,
    isHide: true,
    source2: '', //来源  company 商铺页面进入
    cid: '', //二级分类id
    scrolly: false,
    mtop: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let that = this;
    const result = await wx.getStorageSync('EnterpriseList');
    enterpriseId = result.enterpriseId;
    enterpriseName = result.enterpriseName;
    let showHistory = options.showHistory == "true" ? true : false;
    that.setData({
      showHistory,
      areaName: options.areaName,
      source2: options.source2,
      enterpriseId: options.enterpriseId,
      regionId: options.regionId,
    })
    if (showHistory) {
      that.getHistroy();
      that.findHotdrug();
    } else {
      that.data.cid = options.drugTypeId;
      that.selectComponent("#goods").data.isHide = false;
      that.selectComponent("#goods").onPageScroll();
      that.selectComponent('#goods').data.drugTypeId = options.drugTypeId;
      that.selectComponent('#goods').data.regionId = options.regionId ? options.regionId : 0;
      that.data.ruleForm.drugTypeId = options.drugTypeId;
      that.setData({
        typeName: options.level == 1 ? '分类' : options.level == 2 ? options.typeName : '',
        categoryId: options.categoryId
      });
    }
    wx.setNavigationBarTitle({
      title: options.categoryName ? options.categoryName : '搜索商品',
    })
    that.getArea();
    that.getClassify2();
  },

  onShow() {
    if (!this.data.showHistory) {
      if (this.selectComponent('#goods').data.isRefresh) {
        this.selectComponent('#goods').data.list = [];
        this.selectComponent('#goods').listByTag();
      }
    }
  },

  async getClassify2() {
    let that = this;
    let res = await wx.$http.get('/ydh/mall/drugType/list', {
      categoryId: that.data.categoryId,
      pageNum: 1,
      pageSize: "",
      remarks: "",
      sellWell: "",
      sort: "",
      status: "",
      typeName: ""
    });
    if (res.data.returnCode == "ERR_0000") {
      that.setData({
        classifyData: res.data.data.list
      })
      wx.setStorageSync('classifyData', res.data.data.list)
    }
    if (that.data.ruleForm.drugTypeId != "") {
      let index = res.data.data.list.findIndex(item => item.id == that.data.ruleForm.drugTypeId);
      that.setData({
        fl_currentIndex: index
      })
    }
  },

  //获取建档状态
  getBuildInfo(e) {
    const that = this;
    let announcement = e.detail;
    that.setData({
      announcement
    })
  },

  //选择公司
  chooseCompany(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const nickName = e.currentTarget.dataset.nickname
    this.selectComponent('#goods').data.regionId = e.currentTarget.dataset.provinceid;
    if (index == -1) {
      that.data.allChecked = true;
      for (let i in that.data.areaData) {
        that.data.areaData[i].check = that.data.allChecked;
      }
    } else {
      for (let i in that.data.areaData) {
        that.data.areaData[i].check = false;
      }
      that.data.areaData[index].check = true;
      if (that.data.areaData.length == 1) {
        that.data.allChecked = true;
      } else {
        that.data.allChecked = false;
      }
    }
    that.setData({
      isExpanding: false,
      areaName: nickName ? nickName : '全部',
      allChecked: that.data.allChecked,
      areaData: that.data.areaData,
      showBuild1: false,
      regionId: e.currentTarget.dataset.provinceid
    })
    that.init()
  },

  //浏览图片手指触摸动作点击
  previewImg: function (e) {
    const imgUrl = e.currentTarget.dataset.src;
    common.previewImg(imgUrl)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // wx.navigateBack({
    //   delta: 1
    // })
    wx.removeStorageSync('areaData');
    wx.removeStorageSync('carLength');
    wx.removeStorageSync('classifyData');
    wx.removeStorageSync('findHotdrug_data');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.selectComponent("#goods").onReachBottom();
  },
  myevent(e) {
    console.log(e.detail)
    this.setData({
      scrolly: e.detail
    })
    wx.pageScrollTo({
      scrollTop: this.data.mtop,
      duration: 0
    });
  },
  /**
   * 监听滚动条位置
   */

  onPageScroll: function (e) {
    let that = this;
    if (!this.data.scrolly) {
      this.setData({
        mtop: e.scrollTop
      });
    }
    if (e.scrollTop >= 41) {
      that.setData({
        sticky: true
      })
    } else {
      that.setData({
        sticky: false
      })
    }
  },

  //选择地区
  chooseArea(e) {
    let that = this;
    that.data.ruleForm['regionId'] = e.currentTarget.dataset.provinceid;
    that.setData({
      showArea: false,
      areaName: e.currentTarget.dataset.name,
      currentIndex: 0,
      area_currentIndex: e.currentTarget.dataset.index,
    })
    that.init()
  },

  //地区
  async getArea() {
    let that = this;
    let areaData = wx.getStorageSync('areaData');
    if (areaData) {
      that.setData({
        areaData
      })
    } else {
      let res = await wx.$http.post('/ydh/mall/enterprise/supplierProvinceList', {});
      //let resultData=[];
      if (res.data.returnCode == "ERR_0000") {
        for (let i in res.data.data) {
          res.data.data[i].check = true;
        }
        let resultData = res.data.data.filter(item => {
          return that.data.source2 == "company" && that.data.enterpriseId == item.enterpriseId;
        })
        //console.log(resultData)
        that.setData({
          areaData: resultData.length > 0 ? resultData : res.data.data
        })
        // if (res.data.data.length > 0) {
        //   wx.setStorageSync('areaData', res.data.data);
        // }
      }
    }
  },

  //购物
  home: function () {
    wx.switchTab({
      url: '../home/index'
    })
  },

  //关闭地区
  close_area() {
    let that = this;
    that.setData({
      showArea: false
    })
  },

  //关闭分类
  close_fl() {
    let that = this;
    that.setData({
      showFl: false,
    })
  },

  //选项
  async clickHandle(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    //0：全国  1价格  2整件 3 零售  4分类
    if (index == 0) {
      that.setData({
        isExpanding: !that.data.isExpanding,
        isClassifyList: false,
        showBuild1: !that.data.showBuild1,
        showBuild2: false,
      })
      return false;
    } else if (index == 1) {
      that.setData({
        ['ruleForm.priceSort']: that.data.ruleForm['priceSort'] == 'up' ? 'down' : 'up'
      })
      that.selectComponent('#goods').data.priceSort = that.data.ruleForm['priceSort']
    } else if (index == 2) {
      that.selectComponent('#goods').data.retail = 0; //0-整件
      that.setData({
        currentIndex: index
      })
    } else if (index == 3) {
      that.selectComponent('#goods').data.retail = 1; //1-零售
      that.setData({
        currentIndex: index
      })
    } else if (index == 4) {
      that.setData({
        isExpanding: false,
        isClassifyList: !that.data.isClassifyList,
        showBuild1: false,
        showBuild2: !that.data.showBuild2,
      })
      return false;
    }
    await this.init(index);
  },

  //初始化
  async init(currentIndex) {
    let that = this;
    that.setData({
      show: 1,
      isClassifyList: false,
      isExpanding: false,
      showBuild1: false,
      showBuild2: false,
    })
    await that.selectComponent('#goods').clickHandle();
  },

  //选择功能性分类
  chooseFl(e) {
    let that = this;
    that.setData({
      showFl: false,
      typeName: e.currentTarget.dataset.name,
      fl_currentIndex: e.currentTarget.dataset.index,
      isClassifyList: false,
      showBuild1: false,
    })
    this.data.cid = e.currentTarget.dataset.id
    if (e.currentTarget.dataset.index == -1) {
      that.selectComponent('#goods').data.categoryId = that.data.categoryId;
      that.selectComponent('#goods').data.drugTypeId = '';
    } else {
      that.selectComponent('#goods').data.categoryId = '';
      that.selectComponent('#goods').data.drugTypeId = e.currentTarget.dataset.id;
    }
    that.init(4);
  },

  //获取历史数据
  getHistroy() {
    let that = this;
    if (!that.data.showHistory) return false;
    if (wx.getStorageSync("searchHistrory_data") != "") {
      that.setData({
        historyData: wx.getStorageSync('searchHistrory_data')
      })
    }
  },

  //显示历史搜索界面
  histroy() {
    let that = this;
    that.setData({
      showHistory: true
    })
    //推荐商品
    that.findHotdrug();
    that.getHistroy();
  },

  //获取推荐推荐商品
  async findHotdrug() {
    let that = this;
    let hotData = wx.getStorageSync('findHotdrug_data');
    if (hotData != "") {
      that.setData({
        hotData
      })
    } else {
      let res = await wx.$http.post('/ydh/mall/drug/findHotdrug', {
        pageNum: 1,
        pageSize: 50
      });
      if (res.data.returnCode == "ERR_0000") {
        that.setData({
          hotData: res.data.data.list
        })
        wx.setStorageSync('findHotdrug_data', res.data.data.list);
      }
    }
  },

  myevent(e) {
    console.log(e.detail)
    this.setData({
      scrolly: e.detail
    })

  },

  //搜索
  search() {
    let that = this;
    let name = that.data.ruleForm["keyWord"];
    if (!name) {
      return
    }
    that.setData({
      show: 1
    })
    that.addHistory(name);
    console.log(that.data.regionId);
    that.selectComponent('#goods').data.regionId = that.data.regionId ? that.data.regionId : 0;
    // if (that.data.fl_currentIndex == -1) {
    //   that.selectComponent('#goods').data.categoryId = that.data.categoryId;
    //   that.selectComponent('#goods').data.drugTypeId = '';
    // } else {
    //   that.selectComponent('#goods').data.categoryId = '';
    //   that.selectComponent('#goods').data.drugTypeId = that.data.cid;
    // }
  },

  //搜索关键字
  inputHandle(e) {
    this.setData({
      ['ruleForm.keyWord']: e.detail.value,
    })
  },

  //获取焦点
  inputFocus() {
    this.setData({
      ['ruleForm.keyWord']: this.data.ruleForm.keyWord,
      showHistory: true
    })
    //推荐商品
    this.findHotdrug();
    //历史数据
    this.getHistroy();
  },

  // 删除关键字
  clearHandle() {
    this.setData({
      ['ruleForm.keyWord']: '',
      showHistory: true
    })
    this.inputFocus();
  },

  //选择商品
  clickYP(e) {
    let that = this;
    that.setData({
      ['ruleForm.keyWord']: e.currentTarget.dataset.name,
    });
    that.addHistory(e.currentTarget.dataset.name);
    that.selectComponent('#goods').data.regionId = that.data.regionId ? that.data.regionId : 0;
    // if (that.data.fl_currentIndex == -1) {
    //   that.selectComponent('#goods').data.categoryId = that.data.categoryId;
    //   that.selectComponent('#goods').data.drugTypeId = '';
    // } else {
    //   that.selectComponent('#goods').data.categoryId = '';
    //   that.selectComponent('#goods').data.drugTypeId = that.data.cid;
    // }
  },

  //插入到历史搜索数据
  addHistory(name) {
    let that = this;
    let arr = wx.getStorageSync('searchHistrory_data');
    if (arr != "") {
      let flag = arr.some((item, index, arr) => {
        return item.name == name;
      });
      //当前数组存在删除再插入
      if (flag) {
        arr.splice(arr.findIndex(item => item.name === name), 1)
      }
      //数组前面插入
      if (name != "") {
        arr.unshift({
          name
        });
        wx.setStorageSync("searchHistrory_data", arr);
      } else {
        that.setData({
          showHistory: false,
          ['ruleForm.keyWord']: ""
        })
        //that.list();
        return false;
      }
    } else {
      if (name != "") {
        wx.setStorageSync('searchHistrory_data', [{
          name: name
        }])
      }
    }
    if (arr != "") {
      that.setData({
        showHistory: false,
        list: [],
        historyData: wx.getStorageSync('searchHistrory_data')
      })
      that.selectComponent('#goods').data.keyWord = wx.getStorageSync('searchHistrory_data')[0].name;
      //that.selectComponent('#goods').clickHandle();
    } else {
      that.setData({
        showHistory: false,
        ['ruleForm.keyWord']: name == "" ? "" : name,
        list: [],
        historyData: wx.getStorageSync('searchHistrory_data')
      })
      that.selectComponent('#goods').data.keyWord = that.data.ruleForm.keyWord;
      //that.selectComponent("#goods").listByTag();
    }

    //设置购物车的显示
    this.selectComponent("#goods").data.isHide = false;
    this.selectComponent("#goods").onPageScroll();
  },

  //删除历史记录（单个）
  del(e) {
    let that = this;
    let name = e.currentTarget.dataset.name;
    that.delHistory(name);
  },

  //删除历史数据
  delHistory(name) {
    let that = this;
    let arr = wx.getStorageSync('searchHistrory_data');
    let flag = arr.some((item, index, arr) => {
      return item.name == name;
    });
    //当前数组存在删除再插入
    if (flag) {
      arr.splice(arr.findIndex(item => item.name === name), 1)
    }
    that.setData({
      historyData: arr
    })
    wx.setStorageSync('searchHistrory_data', arr)
  },

  //清除历史搜索记录
  clear() {
    let that = this;
    wx.removeStorageSync('searchHistrory_data');
    that.setData({
      historyData: []
    })
  },

  hideModal1() {
    let that = this;
    that.setData({
      showBuild1: false,
      isExpanding: false,
      isClassifyList: false,
    });
  },

  hideModal2() {
    let that = this;
    that.setData({
      showBuild2: false,
      isExpanding: false,
      isClassifyList: false,
    });
  },

  /**
   * 去往购物车
   */
  toCar() {
    wx.switchTab({
      url: '/pages/car/index',
    })
  }
})