
var weCropper = require('../../../components/we-cropper/dist/weCropper.js')
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight <= 619 ? device.windowHeight - 65 :device.windowHeight -40

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      }
    }
  },
  touchStart(e) {
    this.wecropper.touchStart(e)
  },
  touchMove(e) {
    this.wecropper.touchMove(e)
  },
  touchEnd(e) {
    this.wecropper.touchEnd(e)
  },
    getCropperImage() {
      wx.showLoading({
        title: '正在上传',
      })
      this.wecropper.getCropperImage( (avatar) => {
      if (avatar) {
        //  获取到裁剪后的图片
        wx.$http.upload('/common/image/uploads', avatar).then(res=>{
          if (res) {
            wx.showToast({
              title: '上传成功',
              duration:1000,
              icon:'none'
            })
            wx.hideLoading();
            getApp().globalData["avatar"] = JSON.parse(res.data).data;
            wx.navigateBack({
              delta: 1
            });
          }
        })
      } else {
        console.log('获取图片失败，请稍后重试')
      }
    })
  },
  uploadTap() {
    const self = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        let src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.wecropper.pushOrign(src)
      }
    })
  },
  onLoad(option) {
    // do something
    const {
      cropperOpt
    } = this.data
    const {
      src
    } = option
    if (src) {
      Object.assign(cropperOpt, {
        src
      })

      new weCropper(cropperOpt)
        .on('ready', function(ctx) {})
        .on('beforeImageLoad', (ctx) => {
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 3000
          })
        })
        .on('imageLoad', (ctx) => {
          wx.hideToast()
        })
    }
  }
})