let timerName1;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },
  pageLifetimes: {  
    hide: function () { 
      console.log("================")
      clearTimeout(timerName1);
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    ruleForm: {
      provinceId: '',
      provinceName: '请选择', //省份
      cityId: '',
      cityName: '请选择', //城市
      districtId: '',
      district: '请选择', //县区
    },
    opacity: 0,
    bottom: '-100%',
    show:false
  },


  /**
   * 组件生命周期函数，在组件实例进入页面节点树时执行
   */
  attached: function () {
    let that = this;
    that.getProvince();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    openMask() {
      console.log("===")
      this.setData({
        show:true,
      })
      timerName1 = setTimeout(() => {
        this.setData({
          opacity: 0.5,
          bottom: '0rpx'
        })
      }, 50)
    },
    //关闭Mask
    closeMask() {
      this.setData({
        opacity: 0,
        bottom: '-100%'
      })
      timerName1 = setTimeout(() => {
        this.setData({
          show: false
        })
      }, 300)
    },
    /**
     * 选择省份
     */
    selProvice: function (e) {
      let that = this;
      let {
        provinceid,
        provincename
      } = e.currentTarget.dataset;
      if (that.data.ruleForm.provinceName !== provincename) {
        that.setData({
          ['ruleForm.provinceName']: provincename,
          ['ruleForm.provinceId']: provinceid,
          ['ruleForm.cityName']: '请选择',
          ['ruleForm.district']: '请选择',
        })
      }
      that.getCity(); //获取对应城市
    },

    /**
     * 选择城市
     */
    selCity: function (e) {
      let that = this;
      let {
        cityid,
        cityname
      } = e.currentTarget.dataset;
      if (that.data.ruleForm.cityName !== cityname) {
        that.setData({
          ['ruleForm.cityName']: cityname,
          ['ruleForm.cityId']: cityid,
          ['ruleForm.district']: '请选择',
        })
      }
      that.getCounty();
    },

    /**
     * 选择区县
     */
    selCounty: function (e) {
      let that = this;
      let {
        districtid,
        district
      } = e.currentTarget.dataset;
      //if (that.data.ruleForm.district !== district) {
      that.setData({
        ['ruleForm.district']: district,
        ['ruleForm.districtId']: districtid,
      })
      this.closeMask();
      // }
      this.triggerEvent('getData', that.data.ruleForm)
    },

    /**
     * 获取省份
     */
    async getProvince() {
      let that = this;
      let res = await wx.$http.get('/common/province/guide?country=1', {}, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        that.setData({
          dataList: res.data.data,
          indexs: 0
        })
      }
    },

    /**
     * 城市
     */
    async getCity() {
      let that = this;
      let res = await wx.$http.get('/common/city/guide?country=1&province=' + that.data.ruleForm.provinceId, {}, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        that.setData({
          dataList: res.data.data,
          indexs: 1
        })
      }
    },

    /**
     * 区县
     */
    async getCounty() {
      let that = this;
      let res = await wx.$http.get('/common/area/display?city=' + that.data.ruleForm.cityId, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      if (res.data.returnCode == "ERR_0000") {
        that.setData({
          dataList: res.data.data,
          indexs: 2
        })
      }
    },
  }
})