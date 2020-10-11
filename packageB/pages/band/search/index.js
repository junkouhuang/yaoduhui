const tool = require('../../../../utils/filter')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1,
    enterpriseList: [],
    keyword: '',
    pages: -1,
    status: 1,
    hasBtn:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.setData({
      hasBtn:options.hasBtn
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    if(this.data.keyword){
      this.getEnterpriseData()
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onReachBottom: function () {
    const that = this;
    that.data.pageNum = ++this.data.pageNum;
    if (this.data.pageNum <= that.data.pages) {
      that.getEnterpriseData();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  handleScrollBottom() {
    const that = this;
    that.data.pageNum = ++that.data.pageNum;
    if (this.data.pageNum <= that.data.pages) {
      that.getEnterpriseData();
    }
  },

  //监听enter建查询数据
  handleSearchKeyword(e) {
    const keyword = e.detail.value
    this.setData({
      keyword
    })
    this.data.pageNum = 1;
    if (keyword != '') {
      this.getEnterpriseData()
    }
  },
  //点击入驻企业
  async check(e) {
    this.handleBindding(e);
    return;
    const res = await wx.$http.post('/ydh/user/authentication/find')
    if (res.data.returnCode == 'ERR_0005') {
      const result = await wx.showModal({
        content: '检测到您暂未实名认证',
        confirmText: '去认证',
        cancelText: '忽略'
      })
      if (result.confirm) {
        wx.navigateTo({
          url: '/pages/member/real-name/index',
        })
      } else {
        this.handleBindding(e);
      }
      return
    }
    if (res.data.returnCode == 'ERR_0000') {
      if (res.data.data.status == 0) {
        wx.showToast({
          title: '实名认证审核中',
          icon: 'none',
          duration: 1000
        })
        //this.handleBindding(e);
      } else if (res.data.data.status == 1) {
        this.handleBindding(e);
      } else if (res.data.data.status == 2) {
        // wx.showToast({
        //   title: '实名认证审核失败',
        //   icon: 'none',
        //   duration: 1000
        // })
        const result = await wx.showModal({
          content: '实名认证审核失败',
          confirmText: '去认证',
          cancelText: '忽略'
        })
        if (result.confirm) {
          wx.navigateTo({
            url: '/pages/member/real-name/index',
          })
        } else {
          this.handleBindding(e);
        }
      }
    }
  },
  //申请绑定
  async handleBindding(e) {
    const name = e.currentTarget.dataset.name
    const modeName = e.currentTarget.dataset.modename
    const enterpriseId = e.currentTarget.dataset.id
    try {
      const res = await wx.$http.post('/ydh/mall/enterpriseBindApply/contactsAndIdcode',{enterpriseId},{
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.statusCode == 200) {
        if (res.data.returnCode == "ERR_0000") {
          const contacts = res.data.data ? res.data.data.contacts : '';
          const mobileNumber = res.data.data ? res.data.data.mobileNumber : '';
          const idCode = res.data.data ? res.data.data.idCode : '';
          const params = {
            enterpriseName: name,
            modeName,
            enterpriseId,
            contacts,
            mobileNumber,
            idCode
          }
          wx.navigateTo({
            url: '/packageB/pages/band/bindding/index?params='+JSON.stringify(params),
          })
        }else{
          wx.showToast({
            title: res.data.returnMsg,
            icon:'none',
            duration:1000
          })
        }
      }
    } catch (err) {
      console.log(err)
    }

  },
  //删除关键字
  handleClose() {
    const that = this;
    this.setData({
      enterpriseList: [],
      keyword: '',
    })
    this.data.pageNum = 1;
    that.getEnterpriseData();
  },
  //请求企业数据
  async getEnterpriseData() {
    const data = {
      enterpriseName: this.data.keyword,
      pageSize: 10
    }
    this.data.pageNum  = 1;
    try {
      const res = await wx.$http.post('/ydh/mall/enterprise/enterprises', data)
      if (res.data.data) {
        let list = res.data.data.list
        if (pageNum !== 1) {
          list = [...this.data.enterpriseList, ...list]
        }
      
        for (let i in list) {
          let flag = false;
          list[i].enterpriseNameRich = list[i].enterpriseName;
          if(this.data.keyword){
            var newTxt = '<span style="color:#3996E1;font-weight:bold;">'+this.data.keyword+'</span>'
            list[i].enterpriseNameRich = list[i].enterpriseNameRich.replace(this.data.keyword, newTxt)
          }
          for (let j in list[i].operate) {
            if (list[i].operate[j] == 4) {
              flag = true;
            }
          }
          list[i].status = flag;
        }
        if (!res.data.data.hasNextPage) {
          this.setData({
            status: 2
          })
        } else {
          this.setData({
            status: 1
          })
        }
        this.setData({
          enterpriseList: list,
          pages: res.data.data.pages
        })
      } else {
        this.setData({
          enterpriseList: [],
          pages: 0
        })
        this.data.pageNum = 1;
      }
    } catch (err) {
      console.log(err)
    }
  },

  goToSettledIn: tool.debounce(function() {
    wx.navigateTo({
      url: '/packageB/pages/band/index?mode=Settled',
    })
    //this.goToSettledInHandle();
 }),
  //点击入驻企业
  async goToSettledInHandle() {
    
    const res = await wx.$http.post('/ydh/user/authentication/find')
    if (res.data.returnCode == 'ERR_0005') {
      const result = await wx.showModal({
        content: '检测到您暂未实名认证',
        confirmText: '去认证',
        cancelText: '忽略'
      })
      if (result.confirm) {
        wx.navigateTo({
          url: '/pages/member/real-name/index',
        })
      } else {
        wx.navigateTo({
          url: '/packageB/pages/band/index?mode=Settled',
        })
      }
      return
    }
    if (res.data.returnCode == 'ERR_0000') {
      if (res.data.data.status == 0) {
        wx.showToast({
          title: '实名认证审核中',
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.data.status == 1) {
        wx.navigateTo({
          url: '/packageB/pages/band/index?mode=Settled',
        })
      } else if (res.data.data.status == 2) {
        const result = await wx.showModal({
          content: '实名认证审核失败',
          confirmText: '重新认证',
          cancelText: '忽略'
        })
        if (result.confirm) {
          wx.navigateTo({
            url: '/pages/member/real-name/index',
          })
        } else {
          wx.navigateTo({
            url: '/packageB/pages/band/index?mode=Settled',
          })
        }
      }
    }
  },

  handleAddMode() {
    wx.navigateTo({
      url: '/packageB/pages/band/index?mode=add',
    })
  }
})