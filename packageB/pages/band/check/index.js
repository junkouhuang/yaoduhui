const common = require('../../../../utils/common');
let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    qualificationsPaths: [],
    nameId: null,
    indexActive: null,
    name: '',
    nameInfo: '',
    enterpriseName: '', //企业全称
    qualificationsNumber: '', //证书编号
    expiryDate: '2030-01-01', //有效期
    isDisable: false,
    check: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    try {
      const list = JSON.parse(options.list);
      for (let i in list){
        if (list[i].expiryDate){
          list[i].check = false
        }else{
          list[i].check = true
        }
      }
      this.setData({
        list
      })
    } catch (err) {
      console.log(err)
    }
  },

  onUnload(){
    clearTimeout(timer);
  },

  /**
   * 浏览图片手指触摸动作点击
   */
  previewImg: function (e) {
    const imgUrl = e.currentTarget.dataset.src;
    const index = e.currentTarget.dataset.pindex;
    common.previewImg(imgUrl, index)
  },
  //删除具体图片
  async handleCloseImage(e) {
    const res = await wx.showModal({
      content: '是否删除该图片？',
    })
    if (res.confirm) {
      const pindex = e.currentTarget.dataset.pindex
      const cindex = e.currentTarget.dataset.cindex
      this.data.list[pindex].qualificationsPaths.splice(cindex, 1)
      this.setData({
        list: this.data.list,
      })
      this.iscan();
    }
  },
  //获取证书编号
  qualificationsNumberInput(e) {
    //  this.data.qualificationsNumber = e.detail.value;
    const pindex = e.currentTarget.dataset.pindex;
    this.data.list[pindex]["qualificationsNumber"] = e.detail.value;
    this.iscan();
  },

  iscan() {
    let flag = true;
    for (let i in this.data.list) {
      if (this.data.list[i].qualificationsPaths == null || this.data.list[i].qualificationsPaths.length == 0) {
        flag = false;
      }
      if (this.data.list[i].qualificationsNumber == "") {
        flag = false;
      }
      if (!this.data.list[i].check){
        if (this.data.list[i].expiryDate == null) {
          flag = false;
        }
      }
    }
    this.setData({
      isDisable: flag,
    })
  },

  /**
   * 选择有效期
   */
  pickDate(e) {
    const pindex = e.currentTarget.dataset.pindex;
    this.data.list[pindex]["expiryDate"] = e.detail.value
    this.setData({
      list: this.data.list
    });
    this.iscan();
  },
  //选择图片并保持到服务器
  async handleSelectImage(e) {
    try {
      this.data.qualificationsPaths = [];
      const pindex = e.currentTarget.dataset.pindex;
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
        this.data.list[pindex].qualificationsPaths?this.data.list[pindex].qualificationsPaths.push(imagePath):this.data.list[pindex].qualificationsPaths=[imagePath]
  
        this.setData({
            list:  this.data.list,
        })
        this.iscan();
      } else {
        wx.showToast({
          title: '文件上传失败',
          icon: 'none',
          duration: 2000
        })
      }
      wx.hideLoading();
    } catch (err) {
      console.log(err)
      wx.hideLoading();
    }
  },
  //保存并返回
  async handleSaveImage() {
    let qualifications = new Array();
    for (let i in this.data.list) {
      qualifications.push({
        expiryDate: this.data.list[i].check?null:this.data.list[i].expiryDate,
        certificationDate: this.data.list[i].certificationDate,
        qualificationsNumber: this.data.list[i].qualificationsNumber,
        valueId: this.data.list[i].valueId,
        qualificationsPaths: String(this.data.list[i].qualificationsPaths)
      })
    }

    // let data = {
    //   qualificationsNameId: this.data.item.nameId,
    //   qualificationsValueId: this.data.item.valueId,
    //   imgUrl: this.data.item.qualificationsPath.toString(),
    //   qualificationsNumber: this.data.item.qualificationsNumber,
    //   expiryDate: this.data.item.expiryDate,
    //   enterpriseId: this.data.item.enterpriseId
    // }
    // const res = await wx.$http.post('/ydh/mall/enterprisePhoto/update', data)

    const res = await wx.$http.post('/ydh/mall/enterprise/apply', {
      qualifications: qualifications
    })
    if (res.data.data == 1) {
      wx.showToast({
        title: '提交资料成功，请等待审核',
        icon: 'none',
        duration: 2000
      })
      timer = setTimeout(() => {
        wx.navigateBack({
          delta: 2
        })
      }, 1000)
    }
  },

  /**
   * 证件长期有效-check
   */
  checkHandle(e){
    let that = this;
    const pindex = e.currentTarget.dataset.pindex;
    that.data.list[pindex].check = !that.data.list[pindex].check;
    that.data.list[pindex].expiryDate = !that.data.list[pindex].check ? null : that.data.list[pindex].expiryDate;
    this.setData({
      list:that.data.list
    })
    this.iscan()
  }
})