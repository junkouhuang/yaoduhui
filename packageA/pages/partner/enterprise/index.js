Page({
  /**
   * 页面的初始数据
   */
  data: {
    // modeList: ['生产企业', '经营企业', '连锁总部', '连锁门店', '零售企业', '医疗机构（盈利）', '医疗机构(非盈利)', '基础企业','数据服务公司'],
    enterpriseList: [],
    keyword: '',
    status: 1,
    pageNum:1,
    isrequset: false
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    this.data.pageNum = 1;
    if (this.data.isrequset) {
      await this.getEnterpriseData()
    }
  },

  //监听enter建查询数据
  handleSearchKeyword(e) {
    const keyword = e.detail.value
    this.setData({
      keyword: keyword,
      enterpriseList:[],
    })
    this.data.pageNum =1;
    this.getEnterpriseData()
  },
  //删除关键字
  handleClose() {
    this.setData({
      enterpriseList: [],
      keyword: '',
    })
    this.data.pageNum =1;
  },
  //监听input的value
  handleInputKey(e) {
    const keyword = e.detail.value
    if (!keyword) {
      this.setData({
        enterpriseList: [],
        keyword: keyword,
      })
      this.data.pageNum =1;
    } else {
      this.setData({
        keyword: keyword
      })
    }
  },
  //请求企业数据
  async getEnterpriseData() {
    const data = {
      enterpriseName: this.data.keyword,
      pageSize: 20
    }
    this.data.pageNum =this.data.pageNum;
    try {
      const res = await wx.$http.post('/ydh/mall/enterprise/enterprises', data)
      if (res.data.data) {
        let list = res.data.data.list
        list = [...this.data.enterpriseList, ...list]
        list.forEach(item => {
          item['check'] = false;
        })
        this.setData({
          enterpriseList: list,
        })
        //已经加载全部
        if (!res.data.data.hasNextPage) {
          this.setData({
            status: 2
          })
        } else {
          this.setData({
            status: 1
          })
        }
      } else {
        this.setData({
          enterpriseList: [],
        })
        wx.showToast({
          title: '没有相关的企业信息',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (err) {
      console.log(err)
    }
  },

  /**
   * 选择企业
   */
  handleSelectItem(e) {
    const index = e.currentTarget.dataset.index;
    this.data.enterpriseList.forEach(item => {
      item["check"] = false;
    })
    this.data.enterpriseList[index]["check"] = true;
    this.setData({
      enterpriseList: this.data.enterpriseList
    })
    const enterprise = {
      enterpriseId: this.data.enterpriseList[index]["enterpriseId"],
      enterpriseName: this.data.enterpriseList[index]["enterpriseName"]
    }
    wx.setStorageSync('enterprise', enterprise)
    wx.navigateBack({
      delta: 1
    })
  },

  //点击入驻企业
  async goToSettledIn() {
    const res = await wx.$http.post('/ydh/user/authentication/check')
    if (res.data.returnCode !== 'ERR_0009') {
      const result = await wx.showModal({
        content: '检测到您暂未实名认证',
        confirmText: '去认证'
      })
      if (result.confirm) {
        wx.navigateTo({
          url: '/pages/member/real-name/index',
        })
      }
      return
    }
    wx.navigateTo({
      url: '/packageB/pages/band/index?mode=Settled',
    })
  },

  handleAddMode() {
    wx.navigateTo({
      url: '/packageB/pages/band/index?mode=add',
    })
  }
})