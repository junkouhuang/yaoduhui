
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [], //已审核列表
    total:1,
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     this.getEnterBandList()
     this.data.list = [];
  },

  async getEnterBandList() {
    const that = this;
    try {
      const res = await wx.$http.post('/ydh/mall/enterprise/getEnterpriseList')
      if (res.data.returnCode == 'ERR_0000') {
        if (res.data.data.length>0) {
          let list = [...this.data.list, ...res.data.data]
          let newLlist = [];
          list.forEach(item=>{
            if(item.loginStatus == 1){
              newLlist.unshift(item)
            }else{
              newLlist.push(item)
            }
          })
          that.setData({
            list:newLlist,
            total: list.length,
          })
        }else{
          wx.redirectTo({
            url: '/packageB/pages/band/search/index?hasBtn=true',
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  },
  
  enterDetail(e){
    const that = this;
    const index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/packageB/pages/enter-detail/index?data='+JSON.stringify(this.data.list[index]),
    })
  }
})