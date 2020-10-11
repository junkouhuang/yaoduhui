const common = require('../../../../utils/common');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    enterpriseName: '',
    auth: '', //0无修改权限 1有修改权限
    showSl:false,
    isDisable:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    //数据处理，将图片为null转化为[]
    let result = JSON.parse(options.item)
    result.forEach(item=>{
      item.qualificationsPath = item.qualificationsPath ? item.qualificationsPath : [];
      item.isCheck = item.nameId == 17 && !item.expiryDate ? true : false
    })
    this.setData({
      item: result,
      enterpriseName: options.enterpriseName,
      auth:await wx.getStorageSync('manageAuth')
    })
    this.isCan();
    if(this.data.item.changeStatus == 2){
      this.changeReadStatus();
    }
  },

    /**
   * 用户查看审核失败详情后，更改此条记录已读状态
   */
  async changeReadStatus(){
    let data = {
      enterpriseId:this.data.item.enterpriseId,
      qualificationsNameId:this.data.item.nameId,
      readStatus:1 //0未读  1已读
    }
    const res = await wx.$http.post('/ydh/mall/enterprisePhoto/changeReadStatus', data, {
      'content-type': 'application/x-www-form-urlencoded'
    });
  },

  /**
   * 示例
   */
  openSl: function () {
    this.setData({
      showSl: true
    })
  },

  //删除具体图片
  async handleCloseImage(e) {
    let that = this;
    const res = await wx.showModal({
      content: '是否删除该图片？',
    })
    if (res.confirm) {
      const pindex = e.currentTarget.dataset.index
      const cindex = e.currentTarget.dataset.cindex
      this.data.item[pindex].qualificationsPath.splice(cindex, 1)
      this.setData({
        item: this.data.item,
      })
      that.isCan();
    }
  },
  //获取证书编号
  qualificationsNumberInput(e) {
    //  this.data.qualificationsNumber = e.detail.value;
    let that = this;
    const pindex = e.currentTarget.dataset.index;
    that.data.item[pindex].qualificationsNumber = e.detail.value
    that.setData({
      item: that.data.item,
    })
    that.isCan();
  },
  //选择有效期
  pickDate(e) {
    let that = this;
    const pindex = e.currentTarget.dataset.index;
    this.data.item[pindex].expiryDate = e.detail.value
    this.setData({
      item: this.data.item,
    });
    that.isCan();
  },
  //选择图片并保持到服务器
  async handleSelectImage(e) {
    let that = this;
    const pindex = e.currentTarget.dataset.index;
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
        let newArr = this.data.item[pindex].qualificationsPath || [];
        newArr.push(imagePath)
        this.data.item[pindex].qualificationsPath = newArr
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
    let flag = true;
    for(let i in that.data.item){
      if (that.data.item[i].isCheck) {
        let result = that.data.item[i].qualificationsPath.length > 0 &&
        that.data.item[i].qualificationsNumber != ""
        if(!result){
          flag = false;
         }
      } else {
        if (that.data.item[i].check == 1) {
         let result = that.data.item[i].qualificationsPath.length > 0 &&
         that.data.item[i].qualificationsNumber != "" &&
         that.data.item[i].expiryDate != "" && that.data.item[i].expiryDate != undefined
         if(!result){
          flag = false;
         }
        } else {
          let result = that.data.item[i].qualificationsPath.length > 0 
          if(!result){
            flag = false;
           }
        }
      }
    }
    this.setData({
      isDisable:flag
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
    for(let i in this.data.item){
      let data = {
        qualificationsNameId: this.data.item[i].nameId,
        qualificationsValueId: this.data.item[i].valueId,
        imgUrl: this.data.item[i].qualificationsPath.toString(),
        qualificationsNumber: this.data.item[i].qualificationsNumber,
        expiryDate: this.data.item[i].expiryDate,
        enterpriseId: this.data.item[i].enterpriseId
      }
      arr.push(data);
    }
    const res = await wx.$http.post('/ydh/mall/enterprisePhoto/update', arr)
    if (res.data.returnCode == 'ERR_0000') {
      let num = this.data.item.length>1?'-1':this.data.item[0].nameId
      wx.redirectTo({
        url: '/packageB/pages/enter-detail/update/success/index?nameId='+num,
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
  checkHandle(e) {
    const index = e.currentTarget.dataset.index;
    let isCheck = !this.data.item[index].isCheck
    this.data.item[index].isCheck = isCheck;
    this.data.item[index].expiryDate = isCheck ? "" : this.data.expiryDate;
    this.setData({
      item: this.data.item
    })
    this.isCan();
  }
})