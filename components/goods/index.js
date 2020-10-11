const common = require("../../utils/common");
var enterpriseId = ''; //当前企业id
var enterpriseName = ""; //当前企业名
let timer;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    source: {
      type: String
    },
    parameterType: {
      type: Number
    },
    lineIndex: {
      type: Number
    },
  },
  /*组件所在页面的生命周期 */
  pageLifetimes: {
    show: function () {
      if (this.data.source == 'home') {
        common.carlist(this.data.source == 'home' ? 1 : 0);
      }
      // 页面被展示
    },
    hide: function () {
      // 页面被隐藏
      console.log("页面被隐藏")
    },
    resize: function (size) {
      // 页面尺寸变化
      console.log("页面尺寸变化")
    }
  },
  lifetimes: {
    async attached() {
      //await common.carlist(this.data.source == 'home'?1:0);
      await this.selectComponent('#cartComponent').carlist()
      await this.listByTag();
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    pageNum: 1,
    pages: 1, //总页数
    list: [],
    status: 1, //1加载更多，2已经加载全部
    showBuilding: false,
    priceSort: 'up',
    ids: [],
    retail: 0,
    regionId: 0,
    drugTypeId: '',
    categoryId: '',
    keyWord: '',
    isRefresh: false,
    notProvince: false, //不可跨省预约
    isHide: true

  },

  /**
   * 组件的方法列表
   */
  methods: {
    myevent(e) {
      console.log(e.detail)
      this.triggerEvent('myevent', false);
    },
    onPageScroll() {
      this.setData({
        isHide: this.data.isHide
      })
    },
    onReachBottom() {
      this.data.pageNum = ++this.data.pageNum;
      if (this.data.pageNum <= this.data.pages) {
        this.listByTag();
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

    //企业入驻
    band() {
      wx.navigateTo({
        url: '/packageB/pages/band/search/index'
      })
    },

    //减数量
    sub(e) {
      let that = this;
      let index = e.currentTarget.dataset.index;
      let sl = 0;
      let qp = 0;
      if (that.data.list[index].packageAmount != null && that.data.list[index].retail == 0) {
        sl = parseInt(that.data.list[index].quantity) - parseInt(that.data.list[index].packageAmount);
        qp = that.data.list[index].packageAmount;
      }
      if (that.data.list[index].midpackageAmount != null && that.data.list[index].retail == 1) {
        sl = parseInt(that.data.list[index].quantity) - parseInt(that.data.list[index].midpackageAmount);
        qp = that.data.list[index].midpackageAmount;
      }
      if (sl >= qp) {
        that.data.list[index].quantity = sl
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

    //tip
    tip() {
      wx.showToast({
        title: '绑定企业后可查看更多信息',
        duration: 2000, //延时关闭，默认2000
        icon: 'none',
      })
    },

    //获取手动输入数量
    getQuantity(e) {
      const that = this;
      const index = e.currentTarget.dataset.index;
      let val = e.detail.value;
      let amount = that.data.list[index].amount;
      let qp = 0;
      if (that.data.list[index].retail == 0) {
        qp = that.data.list[index].packageAmount;
      }
      if (that.data.list[index].retail == 1) {
        qp = that.data.list[index].midpackageAmount;
      }
      if (val > amount) {
        wx.showToast({
          title: '预约数量不能超过当前库存哦~',
          icon: 'none'
        })
        that.data.list[index].quantity = qp;
        that.setData({
          list: that.data.list
        })
      } else if (val < qp) {
        wx.showToast({
          title: '预约数量不能小于起订数量哦~',
          icon: 'none'
        })
        that.data.list[index].quantity = qp;
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
          that.data.list[index].quantity = val;
        }
        that.setData({
          list: that.data.list
        })
      }
    },

    //加数量
    add(e) {
      let that = this;
      let index = e.currentTarget.dataset.index;
      let sl = 0;
      let qp = 0;
      let amount = that.data.list[index].amount;
      if (that.data.list[index].packageAmount != null && that.data.list[index].retail == 0) {
        sl = parseInt(that.data.list[index].quantity) + parseInt(that.data.list[index].packageAmount);
        qp = that.data.list[index].packageAmount;
      }
      if (that.data.list[index].midpackageAmount != null && that.data.list[index].retail == 1) {
        sl = parseInt(that.data.list[index].quantity) + parseInt(that.data.list[index].midpackageAmount);
        qp = that.data.list[index].midpackageAmount;
      }
      if (sl <= amount) {
        that.data.list[index].quantity = sl
        that.setData({
          list: that.data.list
        })
      } else {
        wx.showToast({
          title: '预约数量不能超过当前库存哦~',
          duration: 2000, //延时关闭，默认2000
          icon: 'none',
        })
        that.data.list[index].quantity = qp;
        that.setData({
          list: that.data.list
        })
      }
    },

    //申请建档
    async openBuild(e) {
      let that = this;
      let items = e.currentTarget.dataset.item;
      let result = await wx.getStorageSync('EnterpriseList');
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
      that.data.isRefresh = true;
      wx.navigateTo({
        url: '/packageB/pages/enter-detail/sent/index?arr=' + JSON.stringify(res.data.data) + "&enterpriseId=" + result.enterpriseId + "&enterpriseName=" + result.enterpriseName + "&auth=" + this.data.auth
      })
    },

    //打开建档中
    openBuilding() {
      this.shoying();
      this.triggerEvent('myevent', true);
    },

    //打开公告
    openGg(e) {
      this.setData({
        showGg: true,
      })
      this.triggerEvent('myevent', true)
    },

    //首营资料
    async shoying() {
      const that = this;
      let result = await wx.getStorageSync('EnterpriseList');
      const res = await wx.$http.post('/ydh/mall/enterprise/credentialsList', {
        enterpriseId: result.enterpriseId
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      let message = "";
      for (let i in res.data.data.qualificationsDTOList) {
        if (res.data.data.qualificationsDTOList[i]["nameId"] != 23) {
          message += res.data.data.qualificationsDTOList[i]["qualificationsName"] + "、"
        }
      }
      this.setData({
        showBuilding: true,
        content: message
      })
      await that.selectComponent("#buildInfo").getBuildInfo(that.data.ids, enterpriseId); //配送详情
    },

    callCar(e) {
      timer = setTimeout(() => {
        this.car(e)
      }, 80)
    },

    //加入购物车
    async car(e) {
      let that = this;
      clearTimeout(timer);
      const status = e.currentTarget.dataset.status;
      if (status == 1 || status == null) {
        wx.showToast({
          title: '请先向配送企业申请建档~',
          icon: 'none'
        })
      } else if (status == 0) {
        that.shoying();
      } else {
        let index = e.currentTarget.dataset.index;
        let {
          enterpriseId,
          drugNo,
          quantity,
          retail,
          amount
        } = that.data.list[index];
        if (quantity <= amount) {
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
            await common.carlist(that.data.source == 'home' ? 1 : 0);
            console.log(await this.selectComponent('#cartComponent'))
            await this.selectComponent('#cartComponent').carlist()
          }
          if (res.data.returnCode == "ERR_0001") {
            wx.showToast({
              title: '添加数量超过库存限制~',
              icon: 'none'
            })
          }
          if (res.data.returnCode == "ERR_0002") {
            wx.showToast({
              title: '请勿预约本企业商品~', //请勿预约本企业商品
              icon: 'none'
            })
          }
          if (res.data.returnCode == "ERR_0005") {
            wx.showToast({
              title: '绑定企业后可查看更多信息~', //绑定企业后可查看更多信息
              icon: 'none'
            })
          }
        } else {
          wx.showToast({
            title: '预约数量不能超过当前库存哦~',
            icon: 'none',
          })
        }
      }
    },

    //搜索药品导航切换
    clickHandle() {
      const that = this;
      if (that.data.source != 'home') {
        that.setData({
          list: [],
          status: 1
        })
      } else {
        that.data.list = [];
      }
      that.data.pageNum = 1;
      that.listByTag();
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

    //列表
    async listByTag() {
      let that = this;
      const result = await wx.getStorageSync('EnterpriseList');
      if (!result) return;
      enterpriseId = result.enterpriseId;
      enterpriseName = result.enterpriseName;
      let url = "";
      let data = null;
      let header = {
        'content-type': 'application/x-www-form-urlencoded'
      };
      if (that.data.source.trim() == "fl_home") {
        url = "/ydh/mall/drug/findIconDrugList"
        data = {
          pageNum: that.data.pageNum,
          pageSize: 10,
          parameterType: that.data.parameterType
        }
      }
      if (that.data.source.trim() == "popularity") {
        url = "/ydh/mall/drug/findSalesTop";
        data = {
          pageNum: that.data.pageNum,
          pageSize: 10
        }
      }
      if (that.data.source.trim() == "home") {
        url = "/ydh/mall/drug/listByTag";
        data = {
          tagId: that.data.lineIndex == 0 ? 3 : that.data.lineIndex,
          pageNum: that.data.pageNum,
          pageSize: 10
        }
      }
      if (that.data.source.trim() == "search") {
        url = "/ydh/mall/drug/list";
        data = {
          regionId: that.data.regionId, //省id(000为全国id)
          priceSort: that.data.priceSort, //排序：up-升序 down-降序
          retail: that.data.retail, //0-整件 1-零售
          drugTypeId: that.data.drugTypeId, //商品二级类型drugTypeId
          categoryId: that.data.categoryId, //一级分类id
          keyWord: that.data.keyWord, //搜索关键字
          pageNum: that.data.pageNum,
          pageSize: 10,
        }
        header = {};
      }
      let res = await wx.$http.post(url, data, header);
      if (res.data.returnCode == "ERR_0000") {
        if (res.data.data.list.length > 0) {
          for (let i in res.data.data.list) {
            if (res.data.data.list[i].retail == 0) {
              res.data.data.list[i].quantity = res.data.data.list[i].packageAmount;
            }
            if (res.data.data.list[i].retail == 1) {
              res.data.data.list[i].quantity = res.data.data.list[i].midpackageAmount;
            }
            const has = that.data.ids.some((item) => {
              return item == res.data.data.list[i].provinceId;
            })
            if (!has) {
              that.data.ids.push(res.data.data.list[i].provinceId);
            }
          }
          that.setData({
            list: that.data.list.concat(res.data.data.list),
            pages: res.data.data.pages,
            notProvince: false
          })
          await that.selectComponent("#buildInfo").getBuildInfo(that.data.ids, enterpriseId);
          //const auth = await common.getManageAuth(enterpriseId); //判断是否有修改权限
          that.setData({
            auth: await wx.getStorageSync('manageAuth')
          })
          //已经加载全部
          if (!res.data.data.hasNextPage) {
            that.setData({
              status: 2
            })
          } else {
            that.setData({
              status: 1
            })
          }
        } else {
          that.setData({
            status: 0,
            pages: 0,
            notProvince: false
          })
        }
      } else if (res.data.returnCode == "ERR_0005") {
        wx.showToast({
          title: '不可跨省预约', //标题，不写默认正在加载
          duration: 2000, //延时关闭，默认2000
          icon: 'none',
        });
        that.setData({
          notProvince: true,
          status: '-1'
        })
      }
    },
  }
})