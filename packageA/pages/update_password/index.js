// pages/my/template/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    seen1:true,
    seen2:true,
    seen3:true,
    realData: {},
    oldPassword:'',
    newPassword:'',
    confirmPassword:'',
    can:false,
    type1: 'password',
    type2: 'password',
    type3: 'password'
  },

  /**
    * 生命周期函数--监听页面显示
    */
  async onShow() {
    
  },

  /**
   * 显示或关闭密码
   */
  seen1(){
    this.setData({
      seen1: !this.data.seen1,
      type1: this.data.type1 == "password"?"text":"password"
    })
  },
  seen2() {
    this.setData({
      seen2: !this.data.seen2
    })
    type2= this.data.type2 == "password" ? "text" : "password"
  },
  seen3() {
    this.setData({
      seen3: !this.data.seen3
    })
    type3= this.data.type3 == "password" ? "text" : "password"
  },

  /**
   * 保存
   * */
  async saveBtn() {
    //let reg = new RegExp('^(?=.*\\d)(?=.*[a-zA-Z]).{6,18}$');
    let reg = /^[a-zA-Z][0-9A-Za-z]{6,20}$/;
    if (this.data.oldPassword=='') {
      wx.showToast({
        title: '原密码不能为空',
        icon:'none'
      })
      return false;
    }
    if (!reg.test(this.data.oldPassword)) {
      wx.showToast({
        title: '原密码必须至少6个字符，以字母开头，同时包含字母和数字', //标题，不写默认正在加载
        icon: 'none'
      })
      return false;
    }
    if (this.data.newPassword == '') {
      wx.showToast({
        title: '新密码不能为空',
        icon: 'none'
      })
      return false;
    }
    if (!reg.test(this.data.newPassword)) {
      wx.showToast({
        title: '新密码必须至少6个字符，以字母开头，同时包含字母和数字', //标题，不写默认正在加载
        icon: 'none'
      })
      return false;
    }
    if (this.data.newPassword == this.data.oldPassword) {
      wx.showToast({
        title: '新密码不能与原密码相同',
        icon: 'none'
      })
      return false;
    }
    if (this.data.confirmPassword == '') {
      wx.showToast({
        title: '确认密码不能为空',
        icon: 'none'
      })
      return false;
    }
    if (!reg.test(this.data.confirmPassword)) {
      wx.showToast({
        title: '确认密码必须至少6个字符，以字母开头，同时包含字母和数字', //标题，不写默认正在加载
        icon: 'none'
      })
      return false;
    }
    if (this.data.newPassword != this.data.confirmPassword ) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      })
      return false;
    }
    const res = await wx.$http.post('/authorizes/user/passport', 
    { password: this.data.newPassword,oldPassword: this.data.oldPassword}, 
    { 'content-type': 'application/x-www-form-urlencoded' })
    if (res.data.returnCode == "ERR_0000") {
      wx.showToast({
        title: '修改成功',
        icon:'none',
        success:function(){
          wx.navigateBack();
        }
      })
    }
    if (res.data.returnCode == "ERR_0012") {
      wx.showToast({
        title: '新密码不能与原密码不能相同',
        icon:'none'
      })
    }
  },


  /**
   * 设置新密码
   * 
   */
  save() {

  },

  /**
   * 旧密码
   */
  ioldPassword(e){
    this.setData({
      oldPassword: e.detail.value,
      can: e.detail.value != '' && this.data.newPassword && this.data.confirmPassword?true:false
    })
  },

  /**
 * 新密码
 */
  inewPassword(e) {
    this.setData({
      newPassword: e.detail.value,
      can: e.detail.value != '' && this.data.oldPassword && this.data.confirmPassword ? true : false
    })
  },

  /**
  * 确认密码
  */
  iconfirmPassword(e) {
    this.setData({
      confirmPassword: e.detail.value,
      can: e.detail.value != '' && this.data.oldPassword && this.data.newPassword ? true : false
    })
  },
})