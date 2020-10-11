const common = require('../../utils/common');
let pageNum = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    delBtnWidth: 160,
    isScroll: true,
    windowHeight: 0,
    list: [], //nav个数
    checkAll: false,
    can: false,
    editor: true,
    amount: 0, //总金额
    showCar: true,
    show: 0,
    drugNosList: [],
    myEnterpriseId: '',
    startX:''
  },

  /**
   * 商品详情
   */
  detail(e) {
    let drugNo = e.currentTarget.dataset.drugno;
    wx.navigateTo({
      url: '/packageC/pages/detail/index?drugNo=' + drugNo,
    })
  },

  onLoad() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        });
      }
    });
  },

  drawStart: function (e) {
    var touch = e.touches[0]
    const pindex = e.currentTarget.dataset.pindex;
    for (var index in this.data.list[pindex].shoppingCarDTOList) {
      var item = this.data.list[pindex].shoppingCarDTOList[index]
      item.right = 0
    }
    this.setData({
      list: this.data.list
    })
    this.data.startX = touch.clientX
  },
  drawMove: function (e) {
    const pindex = e.currentTarget.dataset.pindex;
    const cindex = e.currentTarget.dataset.cindex;
    var touch = e.touches[0]
    var item = this.data.list[pindex].shoppingCarDTOList[cindex]
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        list: this.data.list
      })
      this.data.isScroll = false;
    } else {
      item.right = 0
      this.setData({
        list: this.data.list
      })
      this.data.isScroll = true;
    }
  },
  drawEnd: function (e) {
    const pindex = e.currentTarget.dataset.pindex;
    const cindex = e.currentTarget.dataset.cindex;
    var item = this.data.list[pindex].shoppingCarDTOList[cindex]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        list: this.data.list,
      })
      this.data.isScroll = true;
    } else {
      item.right = 0
      this.setData({
        list: this.data.list,
      })
      this.data.isScroll = true;
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let that = this;
    let result = await wx.getStorageSync('EnterpriseList');
    let enterpriseId = result.enterpriseId;
    if (enterpriseId) {
      that.setData({
        showCar: true
      })
      await that.carlist();
      await that.init();
    } else {
      that.setData({
        showCar: false
      })
    }
  },

  /**
   * 购物车列表
   */
  async carlist() {
    let that = this;
    let res = await wx.$http.post('/ydh/mall/shoppingcar/list', {
      pageNum,
      pageSize: 200
    })
    if (res.data.returnCode == "ERR_0000") {
      let amountSp = 0;
      if (res.data.data.length > 0) {
        for (let i in res.data.data) {
          res.data.data[i]["checked"] = false;
          for (let j in res.data.data[i]["shoppingCarDTOList"]) {
            res.data.data[i]["shoppingCarDTOList"][j]["checked"] = false;
            res.data.data[i]["shoppingCarDTOList"][j]["right"] = 0;
            amountSp += 1;
          }
        }
        wx.setStorageSync('car_alreadySelectNum', amountSp);
      } else {
        wx.removeStorageSync('car_alreadySelectNum');
      }
      that.setData({
        show: res.data.data.length > 0 ? 1 : 2,
        showCar: true,
        list: res.data.data,
        amountSp
      })
      if (wx.getStorageSync('car_alreadySelectNum')) {
        wx.setTabBarBadge({ //tabbar右上角添加文本
          index: 2, ////tabbar下标
          text: wx.getStorageSync('car_alreadySelectNum').toString() //显示的内容
        })
      } else {
        wx.removeTabBarBadge({
          index: 2,
        });
      }
    }
    if (res.data.returnCode == "ERR_0005") {
      wx.hideLoading();
      that.setData({
        showCar: false
      })
    }
  },

  //去购物
  home: function () {
    wx.switchTab({
      url: '../home/index'
    })
  },

  //选择配送企业
  checkedEnterpriseName(e) {
    let index = e.currentTarget.dataset.index;
    this.data.list[index]["checked"] = !this.data.list[index]["checked"];
    for (let i in this.data.list[index]["shoppingCarDTOList"]) {
      this.data.list[index]["shoppingCarDTOList"][i]["checked"] = this.data.list[index]["checked"];
    }
    this.checkRadio();
  },

  checkRadio() {
    let that = this;
    let some = this.data.list.some(function (obj) { // some  一真即真
      return obj.checked == false
    })
    let can = false;
    this.data.drugNosList = [];
    for (let i in that.data.list) {
      for (let j in that.data.list[i]["shoppingCarDTOList"]) {
        if (that.data.list[i]["shoppingCarDTOList"][j]["checked"]) {
          can = true;
          this.data.drugNosList.push(that.data.list[i]["shoppingCarDTOList"][j]["drugNo"]);
        }
      }
    }
    this.setData({
      list: this.data.list,
      checkAll: !some,
      can: can
    })
    this.amount();
  },

  //复选框
  checked: function (e) {
    let that = this;
    let pindex = e.currentTarget.dataset.pindex;
    let cindex = e.currentTarget.dataset.cindex;
    that.data.list[pindex]["shoppingCarDTOList"][cindex]["checked"] = !that.data.list[pindex]["shoppingCarDTOList"][cindex]["checked"];
    let some = that.data.list[pindex]["shoppingCarDTOList"].some(function (obj) { // some  一真即真
      return obj.checked == false
    })
    that.data.list[pindex]["checked"] = !some;
    let flag = true;
    for (let i in that.data.list) {
      if (!that.data.list[i]["checked"]) {
        flag = false;
      }
    }
    this.checkRadio();
  },

  //全选
  checkAll() {
    let that = this;
    that.data.drugNosList = []
    for (let i in that.data.list) {
      that.data.list[i]["checked"] = !that.data.checkAll;
      for (let j in that.data.list[i]["shoppingCarDTOList"]) {
        that.data.list[i]["shoppingCarDTOList"][j]["checked"] = !that.data.checkAll;
        that.data.drugNosList.push(that.data.list[i]["shoppingCarDTOList"][j]["drugNo"]);
      }
    }
    that.setData({
      list: that.data.list,
      checkAll: !that.data.checkAll,
      can: !that.data.checkAll
    })
    that.amount();
  },

  //减
  sub: function (e) {
    let that = this;
    let pindex = e.currentTarget.dataset.pindex;
    let cindex = e.currentTarget.dataset.cindex;
    let sl = 0;
    let qp = 0;
    if (that.data.list[pindex]["shoppingCarDTOList"][cindex].packageAmount != null && that.data.list[pindex]["shoppingCarDTOList"][cindex].retail == 0) {
      sl = parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].quantity) - parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].packageAmount);
      qp = that.data.list[pindex]["shoppingCarDTOList"][cindex].packageAmount;
    }
    if (that.data.list[pindex]["shoppingCarDTOList"][cindex].midpackageAmount != null && that.data.list[pindex]["shoppingCarDTOList"][cindex].retail == 1) {
      sl = parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].quantity) - parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].midpackageAmount);
      qp = that.data.list[pindex]["shoppingCarDTOList"][cindex].midpackageAmount;
    }
    if (sl >= qp) {
      that.data.list[pindex]["shoppingCarDTOList"][cindex]["quantity"] = sl;
      that.setData({
        list: that.data.list
      })
      that.amount();
      that.updateQuantity(that.data.list[pindex]["shoppingCarDTOList"][cindex]["id"], that.data.list[pindex]["shoppingCarDTOList"][cindex]["quantity"]);

    } else {
      wx.showToast({
        title: '预约数量不能小于起批量',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    }

  },

  //获取手动输入数量
  getQuantity(e) {
    const that = this;
    let pindex = e.currentTarget.dataset.pindex;
    let cindex = e.currentTarget.dataset.cindex;
    let val = e.detail.value;
    let amount = that.data.list[pindex]["shoppingCarDTOList"][cindex].amount;
    let packageAmount = that.data.list[pindex]["shoppingCarDTOList"][cindex].packageAmount;
    if(that.data.list[pindex]["shoppingCarDTOList"][cindex].retail==1){
      packageAmount= that.data.list[pindex]["shoppingCarDTOList"][cindex].midpackageAmount;
    }
    if (val > amount) {
      that.data.list[pindex]["shoppingCarDTOList"][cindex].quantity = amount;
      that.setData({
        list: that.data.list
      })
      wx.showToast({
        title: '预约数量不能超过当前库存哦~',
        icon: 'none'
      })
    } else if (val < packageAmount) {
      wx.showToast({
        title: '预约数量不能小于起订数量哦~',
        icon: 'none'
      })
    } else {
      if(val%packageAmount==0){
        that.data.list[pindex]["shoppingCarDTOList"][cindex].quantity = val;
      }
      that.setData({
        list: that.data.list
      })
    }
    that.updateQuantity(that.data.list[pindex]["shoppingCarDTOList"][cindex]["id"], that.data.list[pindex]["shoppingCarDTOList"][cindex]["quantity"]);
    that.amount();
  },

  //加
  add: function (e) {
    let that = this;
    let pindex = e.currentTarget.dataset.pindex;
    let cindex = e.currentTarget.dataset.cindex;
    let sl = 0;
    if (that.data.list[pindex]["shoppingCarDTOList"][cindex].packageAmount != null && that.data.list[pindex]["shoppingCarDTOList"][cindex].retail == 0) {
      sl = parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].quantity) + parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].packageAmount);
    }
    if (that.data.list[pindex]["shoppingCarDTOList"][cindex].midpackageAmount != null && that.data.list[pindex]["shoppingCarDTOList"][cindex].retail == 1) {
      sl = parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].quantity) + parseInt(that.data.list[pindex]["shoppingCarDTOList"][cindex].midpackageAmount);
    }
    let amount = that.data.list[pindex]["shoppingCarDTOList"][cindex].amount;
    if (sl > amount) {
      wx.showToast({
        title: '预约数量不能超过当前库存哦~',
        icon: 'none'
      })
    } else {
      that.data.list[pindex]["shoppingCarDTOList"][cindex]["quantity"] = sl;
      that.setData({
        list: that.data.list
      })
      that.amount();
    }
    that.updateQuantity(that.data.list[pindex]["shoppingCarDTOList"][cindex]["id"], that.data.list[pindex]["shoppingCarDTOList"][cindex]["quantity"]);
  },

  //下一步（确认订单)
  next: function () {
    let that = this;
    let arr = new Array();
    for (let i in that.data.list) {
      let some = this.data.list[i]["shoppingCarDTOList"].some(function (obj) { // some  一真即真
        return obj.checked == false
      })
    }
    wx.navigateTo({
      url: '/packageC/pages/confirm_order/index?drugNosList=' + this.data.drugNosList
    })
  },

  //更改购物车数量
  async updateQuantity(id, quantity) {
    let that = this;
    let res = await wx.$http.post('/ydh/mall/shoppingcar/updateQuantity', {
      id,
      quantity
    });

  },

  //编辑
  operation: function () {
    let that = this;
    that.setData({
      editor: !that.data.editor
    })
  },

  //滑动删除
  async slideDel(e) {
    let that = this;
    const id = e.currentTarget.dataset.id;
    let amountSp = 0; //共有商品
    let res = await wx.$http.post('/ydh/mall/shoppingcar/deleteList', {
      idList: Array.of(id)
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.returnCode == "ERR_0000") {
      that.data.list.forEach((item, index) => {
        item.shoppingCarDTOList = item.shoppingCarDTOList.filter((items) => {
          return items.id != id
        })
      })
      let arr = that.data.list.filter((items) => {
        console.log(items)
        console.log(items.shoppingCarDTOList.length)
        console.log(items.shoppingCarDTOList.length == 0)
        return items.shoppingCarDTOList.length != 0
      })
      console.log(arr)
      console.log("=====")
      for (let i in arr) { //key
        for (let j in arr[i]["shoppingCarDTOList"]) {
          amountSp += 1;
        }
      }
      that.setData({
        list: arr.length > 0 ? arr : [],
        show: arr.length > 0 ? 1 : 2,
        amountSp,
        can: false,
        editor: arr.length > 0 ? that.data.editor : false
      })
      wx.showToast({
        title: '删除成功',
        icon: 'none',
        duration: 2000
      })
      await common.carlist(1);
      await that.amount();
    }
  },

  //删除
  async delete() {
    let that = this;
    let idList = [];
    let amountSp = 0; //共有商品
    for (let i in that.data.list) { //key
      for (let j in that.data.list[i]["shoppingCarDTOList"]) {
        if (that.data.list[i]["shoppingCarDTOList"][j].checked) {
          idList.push(that.data.list[i]["shoppingCarDTOList"][j].id);
        } else {
          amountSp += 1;
        }
      }
    }
    let res = await wx.$http.post('/ydh/mall/shoppingcar/deleteList', {
      idList
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.returnCode == "ERR_0000") {
      let arr = [];
      arr = this.data.list.filter((item) => {
        return item.checked != true
      })
      arr.forEach((item, index) => {
        item.shoppingCarDTOList = item.shoppingCarDTOList.filter((items) => {
          return items.checked != true
        })
      })
      that.setData({
        list: arr.length > 0 ? arr : [],
        show: arr.length > 0 ? 1 : 2,
        amountSp,
        can: false,
        editor: arr.length > 0 ? that.data.editor : false
      })
      wx.showToast({
        title: '删除成功',
        icon: 'none',
        duration: 2000
      })
      await common.carlist(1);
      await that.amount();
    }
  },

  /**
   * 总金额
   */
  async amount() {
    let that = this;
    let amount = 0;
    for (let i in that.data.list) {
      for (let j in that.data.list[i]["shoppingCarDTOList"]) {
        if (that.data.list[i]["shoppingCarDTOList"][j]["checked"]) {
          amount = amount + that.data.list[i]["shoppingCarDTOList"][j].price * that.data.list[i]["shoppingCarDTOList"][j].quantity;
        }
      }
    }
    that.setData({
      amount
    })
  },

  /**
   * 初始化
   */
  init() {
    let that = this;
    that.setData({
      checkAll: false,
      can: false,
      amount: 0,
      editor: true
    })
  }
})