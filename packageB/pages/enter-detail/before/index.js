const common = require('../../../../utils/common');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    enterpriseName: '',
    auth: '', //0无修改权限 1有修改权限
    showSl: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    //数据处理，将图片为null转化为[]
    let result = JSON.parse(options.item)
    result.qualificationsPath = result.qualificationsPath ? result.qualificationsPath : []
    result.isCheck = result.nameId == 17 && !result.expiryDate ? true : false
    this.setData({
      item: result,
      enterpriseName: options.enterpriseName,
      auth: options.auth
    })
    if(this.data.item[0].changeStatus == 2){
      this.changeReadStatus();
    }
  },

  /**
   * 用户查看审核失败详情后，更改此条记录已读状态
   */
  async changeReadStatus(){
    let data = {
      enterpriseId:this.data.item[0].enterpriseId,
      qualificationsNameId:this.data.item[0].nameId,
      readStatus:1 //0未读  1已读
    }
    const res = await wx.$http.post('/ydh/mall/enterprisePhoto/changeReadStatus', data, {
      'content-type': 'application/x-www-form-urlencoded'
    });
  },

  /**
   * 去变更
   */
  update() {
    wx.redirectTo({
      url: "/packageB/pages/enter-detail/update/index?item=" + JSON.stringify(this.data.item) + "&enterpriseName=" + this.data.enterpriseName //+ "&auth=" + this.data.auth
    })
  },

  /**
   * 示例
   */
  openSl: function () {
    this.setData({
      showSl: true
    })
  },


  /**
   * 浏览图片手指触摸动作点击
   */
  previewImg: function (e) {
    const imgUrl = e.currentTarget.dataset.src;
    const index = e.currentTarget.dataset.index;
    common.previewImg(imgUrl,index)
  },
})