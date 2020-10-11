// packageC/pages/company/index.js
const common = require("../../../utils/common");
let pageNum = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0, //banner
    categoryId: '', //一级分类Id
    categoryName: '',
    classifyList: [], //一级分类
    currentIndex: 0,
    num: 1, //总条数
    promotion: [], //二级分类
    pageSize: 12,
    pages: 1,
    windowHeight: null, //可使用窗口宽度
    currentIndex: 0,
    switchPage: 0,
    isShow: false,
    enterpriseId: '', //企业Id
    enterpriseList: [], //商铺列表
    enterpriseList2: [], //账户企业列表
    status2: 2, //status: 0建档中   status: 1 || null申请建档   status:2公告
    enterpriseShopInfoList: [],
    status: '',
    isSticky: false,
    enterpriseId2:'',//当前账号企业Id
    index:-1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let that = this;
    that.setData({
      enterpriseId: options.enterpriseId,
      // enterpriseId2: result.enterpriseId,
      // enterpriseList2:result
    });
    console.log(options.provinceId)
    if (options.provinceId == 12) {
      wx.setNavigationBarTitle({
        title: '华源医药'
      });
    } else if (options.provinceId == 15) {
      wx.setNavigationBarTitle({
        title: '天瑞医药'
      });
    }

    that.getClassify1(); //一级分类
    //获得系统信息
    wx.getSystemInfo({
      success: (res) => {
        that.data.windowHeight = res.windowHeight;
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let that = this;
    // wx.showLoading({
    //   title: '加载中...',
    // })
    let result= await wx.getStorageSync('EnterpriseList');
    if(!result){
      //当缓存数据不存在时
      result = await common.getEnterpriseList();
    }
    let index = await wx.getStorageSync('manageAuth')
    console.log(result)
    this.data.enterpriseId2 = result.enterpriseId,
    this.data.enterpriseList2 = result,
    console.log(index)
    that.setData({
      index
    });
    //await that.getManageAuth();
    await that.findEnterprise();
    
    //wx.hideLoading(); 
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
  // onShareAppMessage: function () {

  // },

  //页面滚动监听
  onPageScroll(e) {
    if (e.scrollTop > 105) { 
      if (!this.data.isSticky) {
        this.setData({
          isSticky: true
        })
      }
    } else {
      if (this.data.isSticky) {
        this.setData({
          isSticky: false
        })
      }
    }
  },

  /**
   * 切换
   */
  goSwitch(e) {
    console.log(e);
    this.setData({
      switchPage: e.currentTarget.dataset.i,
    });
    if (e.currentTarget.dataset.i == 1) {
      this.enterpriseShopInfo();
    }
  },

  /**
   * 展开收起
   */
  open() {
    this.setData({
      isShow: !this.data.isShow
    });
  },

  /**
   * 搜索
   */
  search() {
    let that = this;
    let areaName = that.data.enterpriseList.provinceId == 12 ? '华源医药' : '天瑞医药';
    let enterpriseId = that.data.enterpriseList.enterpriseId;
    let regionId = that.data.enterpriseList.regionId;
    //let provinceId = that.data.enterpriseList.provinceId
    wx.setStorageSync('enterpriseIdStorage', enterpriseId);
    wx.setStorageSync('regionIdStorage', regionId);
    wx.navigateTo({
      url: '/packageC/pages/company_search/index?showHistory=true&enterpriseId=' + enterpriseId + "&areaName=" + areaName + "&source=company&regionId=" + regionId,
    })
  },

  /**
   * 获取商铺简介
   */
  async enterpriseShopInfo() {
    let that = this;
    let res = await wx.$http.post('/ydh/mall/stores/enterpriseShopInfo', {
      enterpriseId: parseInt(that.data.enterpriseId)
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (res.data.returnCode == "ERR_0000") {
      that.setData({
        enterpriseShopInfoList: res.data.data
      });
    }
  },

  /**
   * 获取商铺列表
   */
  async findEnterprise() {
    let that = this;
    let res = await wx.$http.post('/ydh/mall/stores/findEnterprise', {});
    if (res.data.returnCode == "ERR_0000") {
      let enterpriseList = [];
      let arrayData = res.data.data;
      arrayData.forEach(function (val, index, array) {
        if (that.data.enterpriseId == val.enterpriseId) {
          enterpriseList = array[index];
        }
      });
      console.log("findAnnouncement"+enterpriseList.provinceId+"--"+that.data.enterpriseId2);
      that.getBuildInfo(enterpriseList.provinceId, that.data.enterpriseId2)
      that.setData({
        enterpriseList: enterpriseList
      })
    }
  },


  //获取建档信息
  async getBuildInfo(regionIdList, enterpriseId) {
    const that = this;
    let resData = await wx.$http.post('/ydh/mall/archive/findAnnouncement', {
      regionIdList,
      enterpriseId
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (resData.data.returnCode == "ERR_0000") {
      that.setData({
        status2: resData.data.data[0].status
      });
      console.log("建档状态"+this.data.status2)
    }
  },

  //获取当前用户有无申请建档权限
  async getManageAuth() {
 
    const that = this;
    console.log(that.data.enterpriseId)
    let index = '';
    let resData = await wx.$http.post('/ydh/mall/shop/getManageAuth', {
      enterpriseId: that.data.enterpriseId2
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    });
    if (resData.data.returnCode == "ERR_0000") {
      //enterpriseId，返回1有权限，返回0无权限     判断有无建档权限
      index = resData.data.data;
      that.setData({
        index: index
      });
    }
    return index;
  },

  /**
   * 去建档
   */
  goRecord() {
    // let index = this.getManageAuth();
    // if (index == 0) {
    //   return wx.showToast({
    //     title: '无建档权限',
    //     icon: 'none'
    //   })
    // }
    let array = [];
    array.push(this.data.enterpriseList);
    console.log(this.data.enterpriseList)
    wx.navigateTo({
      url: '/packageB/pages/enter-detail/sent/index?arr=' + JSON.stringify(array) + "&enterpriseId=" + this.data.enterpriseId2 + "&enterpriseName=" + this.data.enterpriseList2.enterpriseName + "&auth=" + this.data.status2
    })
  },

  /**
   * 拨打电话
   */
  tel(e) {
    //i 1客服  2 投诉
    let i = e.currentTarget.dataset.phone;
    let Telephone=false;
    if(i==1){
      if(this.data.enterpriseShopInfoList.customerServiceTelephone1 && this.data.enterpriseShopInfoList.customerServiceTelephone2){
        Telephone =true;
      }else{
        Telephone =false;
      }
    }else{
      Telephone = this.data.enterpriseShopInfoList.complaintTelephone.indexOf(' ') != -1;
    }
    console.log(Telephone)
    if(Telephone){
      let phoneArray = []
      if(i==1){
        //phoneArray=this.data.enterpriseShopInfoList.customerServiceTelephone.split('   ');
        phoneArray.push(this.data.enterpriseShopInfoList.customerServiceTelephone1);
        phoneArray.push(this.data.enterpriseShopInfoList.customerServiceTelephone2);
      }else{
        phoneArray.push(this.data.enterpriseShopInfoList.complaintTelephone.slice(0,12));
        phoneArray.push(this.data.enterpriseShopInfoList.complaintTelephone.slice(this.data.enterpriseShopInfoList.complaintTelephone.length-12,this.data.enterpriseShopInfoList.complaintTelephone.length));
      }
      console.log(phoneArray)
      wx.showActionSheet({
        itemList: phoneArray,
        success: function (res) {
          if (res) {
            console.log(res)
            wx.makePhoneCall({
              phoneNumber: phoneArray[res.tapIndex],
            })
          }
        },
        fail(res) {
         
        }
      })
    }else{
      let customerServiceTelephone=this.data.enterpriseShopInfoList.customerServiceTelephone1?this.data.enterpriseShopInfoList.customerServiceTelephone1:this.data.enterpriseShopInfoList.customerServiceTelephone2;
      wx.makePhoneCall({
        phoneNumber: i == 1 ? customerServiceTelephone : this.data.enterpriseShopInfoList.complaintTelephone, //仅为示例，并非真实的电话号码
      })
    }  
  },

  /**
   * 查看图片
   */
  goPreviewImage(e) {
    let index = e.currentTarget.dataset.i;
    let img = e.currentTarget.dataset.img;
    wx.previewImage({
      current: this.data.enterpriseShopInfoList.qualificationsDTOList[img].qualificationsPath[index], // 当前显示图片的http链接
      urls: this.data.enterpriseShopInfoList.qualificationsDTOList[img].qualificationsPath, // 需要预览的图片http链接列表
    })
  },

 /*
  * 滑动时改变获取下标
  */
 bannerChange(e) {
   let that = this;
   that.setData({
     active: e.detail.current
   })
 },

 /**
  * 一级菜单事件
  */
 flHandle(e) {
   let that = this;
   that.data.categoryId = e.currentTarget.dataset.id; //获取一级分类id
   that.data.categoryName = e.currentTarget.dataset.typename; //一级分类
   that.data.typeName = e.currentTarget.dataset.typename;
   let currentIndex = e.currentTarget.dataset.index;
   let singleNavHeight = that.data.windowHeight / 11; //每个单元格高度
   let nowNavHeight = currentIndex * singleNavHeight; //当前选中tab在导航的位置
   let firstCenterNavHeight = 5 * singleNavHeight; //第一个临界值
   let lastCenterNavHeight = (that.data.num - 5) * singleNavHeight; //最后一个临界值
   if (nowNavHeight > firstCenterNavHeight && nowNavHeight < lastCenterNavHeight) {
     this.setData({
       currentIndex: currentIndex,
       navScrollTop: (currentIndex - 5) * singleNavHeight
     })
   } else {
     this.setData({
       currentIndex: currentIndex,
     })
   }
   that.getClassify2();
 },

 /**
  * 分类一
  */
 async getClassify1() {
   let that = this;
   let res = await wx.$http.get('/ydh/mall/drugType/categoryList', {
     status: ''
   });
   if (res.data.returnCode == "ERR_0000") {
     that.setData({
       classifyList: res.data.data
     })
     that.data.num = res.data.data.length;
     that.data.categoryId = res.data.data[0].id; //一级分类id
     that.data.categoryName = res.data.data[0].typeName; //一级分类id
     that.getClassify2();
   }
 },

 /**
  * 分类二
  */
 async getClassify2() {
   let that = this;
   let res = await wx.$http.get('/ydh/mall/drugType/list', {
     categoryId: that.data.categoryId,
     pageNum,
     pageSize: 100,
     remarks: "",
     sellWell: "",
     sort: "",
     status: "",
     typeName: ""
   }, {
     'content-type': 'application/x-www-form-urlencoded'
   })
   if (res.data.returnCode == "ERR_0000") {
     if(res.data.data.list.length>0){
     that.setData({
       promotion: res.data.data.list,
       pages:res.data.data.pages
     })
   }else{
     that.setData({
       pages: res.data.data.list
     })
   }
   }
 },

 /**
  * 搜索商品界面
  * 2020-04-25
  */
 search_good(e) {
   let that = this;
   let id = e.currentTarget.dataset.id;
   let categoryId = e.currentTarget.dataset.categoryid;
   let typeName = e.currentTarget.dataset.typename;
   let areaName=that.data.enterpriseList.provinceId==12?'华源医药':'天瑞医药';
   let enterpriseId=that.data.enterpriseList.enterpriseId;
   let regionId=that.data.enterpriseList.regionId;
   wx.navigateTo({
     url: '/packageC/pages/search_goods/index?drugTypeId=' + id + "&typeName=" + typeName + "&categoryId=" + categoryId + "&showHistory=false&source=2&level=2&categoryName="+that.data.categoryName+"&areaName="+areaName+"&source2=company&enterpriseId="+enterpriseId+"&regionId="+regionId,
   })
 }

})