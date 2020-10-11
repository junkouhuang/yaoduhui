var util = require('../../../utils/filter.js');
let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gender: ["男", "女"],
    ruleForm:{
      avatar:'',
      uno: '',
      telephone: '',
      nickname: '',
      sex: '',
      birthday: ''
    },
    can:true,
    index2:'',//生日
  },

  onUnload(){
    clearTimeout(timer);
  },

  /**
   * 用户信息
   */
  nicknameInput(e){
   this.data.ruleForm.nickname = e.detail.value;
   this.setData({
     can: e.detail.value?true:false
   })
  },

  /**
   * 点头像
   */
  upload() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        wx.navigateTo({
          url: '/packageA/pages/upload/index?src=' + src
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (getApp().globalData["avatar"]){
      this.setData({
        ["ruleForm.avatar"]: getApp().globalData["avatar"]
      })
    }
  },

  /**
   * 选择性别
   */
  sexHandle(){
    this.setData({
      sexHandle:true
    })
  },

  /**
   * 性别
   */
  pickSex: function (e) {
    this.setData({
      ["ruleForm.sex"]: parseInt(e.detail.value) + 1,//0：男 1：女（系统：1：男，2：女）
    });
  },

  /**
   * 生日
   */
  pickDate(e){
    this.setData({
      ["ruleForm.birthday"]: e.detail.value,
    });
  },
  /**
   * 获取用户信息
   */
  async getUserInfo(){
    let that = this;
    try {
      const res = await wx.$http.post('/authorizes/user/detail', { source: "+p/LQRPTDPW2/FIr1nZO8d2VkBDTSOg2s8mo/nMOG4rOLUbvFPjowQ==" }, { 'content-type': 'application/x-www-form-urlencoded' })
      if (res.data.returnCode == 'ERR_0000') {
       that.setData({
         ["ruleForm.avatar"]: res.data.data.avatar,
         ["ruleForm.uno"]: res.data.data.uno,
         ["ruleForm.telephone"]: res.data.data.telephone,
         ["ruleForm.nickname"]: res.data.data.nickname,
         ["ruleForm.sex"]: res.data.data.sex,
         ["ruleForm.birthday"]: util.formatTime(res.data.data.birthday),
       })
      }
    } catch (err) {
      console.log(err)
    }
  },

  /**
   * 保存
   */
  async update(){
    let that = this;
    try {
      const res = await wx.$http.post('/authorizes/user/update', that.data.ruleForm, { 'content-type': 'application/x-www-form-urlencoded' })
      if (res.data.returnCode == 'ERR_0000') {
        wx.showToast({
          title: '修改成功',
          icon:'none'
        })
        timer = setTimeout(()=>{
          wx.navigateBack();
        },500)
      }
    } catch (err) {
      console.log(err)
    }
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})