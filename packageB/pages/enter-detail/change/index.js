const common = require('../../../../utils/common');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    enterpriseName: '',
    auth: '', //0无修改权限 1有修改权限
    showSl: false,
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
      enterpriseId:options.enterpriseId,
      auth: options.auth
    })
    this.isCan();
  },

  //删除具体图片
  async handleCloseImage(e) {
    let that = this;
    const res = await wx.showModal({
      content: '是否删除该图片？',
    })
    if (res.confirm) {
      const index = e.currentTarget.dataset.index
      this.data.item.qualificationsPath.splice(index, 1)
      this.setData({
        item: this.data.item,
      })
      that.isCan();
    }
  },

   /**
   * 示例
   */
  openSl: function () {
    this.setData({
      showSl: true
    })
  },
  //获取证书编号
  qualificationsNumberInput(e) {
    //  this.data.qualificationsNumber = e.detail.value;
    let that = this;
    that.data.item.qualificationsNumber = e.detail.value
    that.setData({
      item: that.data.item,
    })
    that.isCan();
  },
  //选择有效期
  pickDate(e) {
    let that = this;
    this.data.item.expiryDate = e.detail.value
    this.setData({
      item: this.data.item,
    });
    that.isCan();
  },
  //选择图片并保持到服务器
  async handleSelectImage() {
    let that = this;
    try {
      const imageMsg = await wx.chooseImage({
        count: 1
      })
      const path = imageMsg.tempFilePaths[0]
      wx.showLoading({
        title: '上传中...',
      })
      const res = await wx.$http.upload('https://www.xinquanjk.com/common/image/uploads', path)
      const data = JSON.parse(res.data)
      if (data.data) {
        const imagePath = data.data
        let newArr = this.data.item.qualificationsPath || [];
        newArr.push(imagePath)
        this.data.item.qualificationsPath = newArr
        this.setData({
          item: this.data.item
        })
        wx.hideLoading()
      } else {
        wx.showToast({
          title: '文件上传失败',
          icon: 'none',
          duration: 2000
        })
      }
      this.isCan();
    } catch (err) {
      console.log(err)
      wx.hideLoading();
    }
  },
  isCan() {
    const that = this;
    that.setData({
      isDisable: that.data.item.qualificationsPath.length > 0 &&
      that.data.item.expiryDate != "" && that.data.item.expiryDate != undefined ? false : true
    })
  },

  /**
   * 浏览图片手指触摸动作点击
   */
  previewImg: function(e) {
    const imgUrl = e.currentTarget.dataset.src;
    const index = e.currentTarget.dataset.index;
    common.previewImg(imgUrl,index)
  },

  //保存并返回
  async handleSaveImage() {
    let arr = new Array();
    let data = {
      qualificationsNameId: this.data.item.nameId,
      qualificationsValueId: this.data.item.valueId,
      imgUrl: this.data.item.qualificationsPath.toString(),
      qualificationsNumber: this.data.item.qualificationsNumber,
      expiryDate: this.data.item.expiryDate,
      enterpriseId: this.data.enterpriseId
    }
    arr.push(data);
    const res = await wx.$http.post('/ydh/mall/enterprisePhoto/update', arr)
    if (res.data.returnCode == 'ERR_0000') {
      wx.redirectTo({
        url: '/packageB/pages/enter-detail/update/success/index?nameId='+this.data.item.nameId,
      })
    }else{
      wx.showToast({
        title: res.data.data,
        icon:'none',
        duration:1500
      })
    }
  },

  /**
   * 证件长期有效-check
   */
  checkHandle() {
    let isCheck = !this.data.item.isCheck
    this.data.item.isCheck = isCheck;
    this.data.item.expiryDate = isCheck ? "" : this.data.expiryDate;
    this.setData({
      item: this.data.item
    })
    this.isCan();
  }
})