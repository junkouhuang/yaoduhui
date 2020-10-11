// pages/login/index.js
const common = require('../../../utils/common.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    score:'',
    username:'',
    password:'',
    passcode:'',
    hide:true,//控制小眼睛和密码明文
    focus:-1, //文本框获得焦点边框高亮
    can:false,//登錄按鈕呈半透明
    userInfo:{
      nickname: null,
      sex: null,
      avatar: null,
      birthday: '',
    },
    sysTime:'',//系统时间
    timestamp:'',//系统时间戳
    close:false,
    remember_pwd:false //记住密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let remember_pwd = wx.getStorageSync('remember_pwd', that.data.checked);
    if (!remember_pwd) return false;
    let passcode = wx.getStorageSync('login_passcode');
    let username = wx.getStorageSync('login_username');
    let password = wx.getStorageSync('login_password');
    that.setData({
      passcode,
      username,
      password,
      remember_pwd
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    //刷新界面判断是否可按钮点击
    if (that.data.username != "" && that.data.password != "") {
      that.setData({
        can: true
      })
    }
  },

  /**
   * 记住密码
   */
  radioChange(){
    let that = this;
    that.setData({
      remember_pwd: !that.data.remember_pwd
    })
  },

  /**
   * 忘记密码
   */
  forget(){
    wx.navigateTo({
      url: '/packageC/pages/forget/template/verify_phone_number/index',
    })
  },

  /**
  * 登录
  */
  async login() {
    let that = this;
    if (that.data.username === '') {
      wx.showToast({
        title: '用户名/手机号不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (that.data.password === '') {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    wx.showLoading({
      title: '登录中...'
    })
    let data = {
      username: that.data.username,
      password: that.data.password,
      rookie: that.data.remember_pwd,
      passcode: that.data.passcode
    }
    let res = await wx.$http.post('/authorize/security/user/passport', data,{'content-type': 'application/x-www-form-urlencoded'})
    if (res.data.returnCode == "ERR_0000") {
      //将登陆凭证保存起来，失效则跳转到登陆界面
      let access_token = res.data.data.token.access_token;
      let token_type = res.data.data.token.token_type;
      wx.setStorageSync('access_token', `${token_type} ${access_token}`);
      //记住密码后保存用户名，密码，passcode，remember_pwd
      if (that.data.remember_pwd) {
        wx.setStorageSync('login_username', that.data.username);
        wx.setStorageSync('login_password', that.data.password);
        wx.setStorageSync('passcode', res.data.data.passcode);
        wx.setStorageSync('remember_pwd', that.data.remember_pwd);
      }else{
        wx.removeStorageSync('login_username');
        wx.removeStorageSync('login_password');
        wx.removeStorageSync('passcode');
        wx.removeStorageSync('remember_pwd');
      }
      await common.getEnterpriseList();
      await common.getManageAuth();
      //跳转主页
      wx.switchTab({ //关闭所有页面，打开到应用内的某个页面
        url: '/pages/home/index'
      })
      wx.showToast({
        icon: "none",
        title: "登录成功"
      })
      await common.validated();
    } else if (res.data.returnCode == "ERR_0007"){
      let arr = wx.getStorageSync('user_bad_count');
      if (arr != "") {
        let flag = arr.some((item, index, arr) => {
          return item.name == that.data.username;
        });
        let index = arr.findIndex(item => item.name === that.data.username);
        if (flag) {
          //当前的时间戳-历史缓存的时间戳比较是否大于8小时时间戳
          //当前时间戳
          let presentTimSamp = Date.parse(new Date()) / 1000;
          //历史缓存时间戳
          let historyTimStamp = arr[index].timestamp;
          //大于说明接触账号锁定，缓存里的记录也要被删除
          //8小时时间戳
          let eight = 8*60*60;
          console.log(presentTimSamp)
          console.log(historyTimStamp)
          console.log(eight)
          console.log(presentTimSamp - historyTimStamp)
          console.log(presentTimSamp - historyTimStamp > eight)
          if (presentTimSamp - historyTimStamp > eight){
            arr.splice(index, 1);
            wx.setStorageSync('user_bad_count', arr)
            return false;
          }else{
            arr[index].count = ++arr[index].count;
          }
        }else{
          that.getTime();
          arr.unshift({ 'name': that.data.username, 'count': 1, 'sysTime': that.data.sysTime, 'timestamp': that.data.timestamp });
        }
        wx.setStorageSync('user_bad_count', arr)
        if (arr[index].count>=5){
          wx.showModal({
            title: '账号或密码多次错误，请8小时后再试试',
            content: '',
          })
        }
      }else{
        that.getTime();
        wx.setStorageSync('user_bad_count', [{ 'name': that.data.username, 'count': 1, 'sysTime': that.data.sysTime,'timestamp':that.data.timestamp}])
      }
    }
  },

  /**
   * 获取当前系统时间
   */
  getTime(){
    let  that = this;
    //获取当前时间戳  
    var timestamp = Date.parse(new Date()) / 1000;
    that.data.timestamp = timestamp;
    //获取当前时间  
    var n = timestamp * 1000;
    var date = new Date(n);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日  
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    //时  
    var h = date.getHours();
    //分  
    var m = date.getMinutes();
    //秒  
    var s = date.getSeconds();
    that.data.sysTime = Y + '-' + M + '-' + D + ' ' + h + ":" + m + ":" + s;
  },

  /**
   * 注册
   */
  register:function(res){
    let that = this;
    if (res.detail.errMsg == "getUserInfo:ok"){
      wx.getUserInfo({
        success: function (res) {
          that.data.userInfo.nickname = JSON.parse(res.rawData).nickName;
          that.data.userInfo.sex = JSON.parse(res.rawData).gender;
          that.data.userInfo.avatar = JSON.parse(res.rawData).avatarUrl;
          getApp().globalData.userInfo = that.data.userInfo;
          wx.navigateTo({
            url: '/packageC/pages/register/template/verify_phone_number/index' 
          })
        }
      })
    }
  },

  /**
   * 用户名正在输入
   */
  usernameInput: function (e) {
    let that = this;
    that.setData({
      close: e.detail.value != "" ? true : false,
      can: e.detail.value != '' && that.data.password!=''?true:false
    });
    that.data.username = e.detail.value; //配合按钮
  },

  /**
    * 用户名获得焦点
    */
  usernameFocus: function () {
    let that = this;
    that.setData({
      focus: 0,
      close:that.data.username!=""?true:false
    });
  },

  /**
   * 用户名失焦
   */
  usernameBlur: function () {
    let that = this;
    that.setData({
      close: false
    });
  },

  /**
  * 密码正在输入
  */
  passwordInput: function (e) {
    let that = this;
    that.setData({
      can: that.data.username != '' && e.detail.value != '' ? true : false
    })
    that.data.password = e.detail.value;//配合按钮
  },

  /**
  * 密码获得焦点
  */
  passwordFocus: function () {
    let that = this;
    that.setData({
      focus: 1
    });
  },

  /**
   * 顯示或隱藏密碼
   */
  seen: function () {
    let that = this;
    that.setData({
      hide: !that.data.hide,
      password: that.data.password
    });
  },

  /**
  * 清除用户名
  */
  clearHandle: function () {
    let that = this;
    that.setData({
      username: "",
      close:false,
      can:false
    });
  },
})