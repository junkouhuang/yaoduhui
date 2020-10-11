let timer1,timer2;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status:0,
    opacity:0,
    bottom:'-622rpx',
    showMask:false,
    typeList:[
      {name:'全部',type:''},
      { name: '充值 ', type: '0' },
      { name: '转账（收）',type: '1' },
      { name: '转账（支）', type: '2'},
      { name: '提现', type: '3'},
      // { name: '支付', type: '4'},
    ],
    typeActiveIndex:null,
    wallerBillsPageQuery:{
      pageNum:1,
      pageSize:7,
      billType:''
    },
    accountList:[],
    hasNextPage:true,
    isRequset:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.getPageParams(options)
    await this.requsetAccountList()
  },

  onUnload(){
    clearTimeout(timer1)
    clearTimeout(timer2)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //显示mask
  handleShowMask(){
    this.setData({
      showMask:true
    })
    timer1 = setTimeout(()=>{
      this.setData({
        bottom: '0rpx',
        opacity: 0.5
      })
    },20)
  },
  //关闭mask
  closeMask(){
    this.setData({
      bottom: '-622rpx',
      opacity: 0
    })
    timer2 = setTimeout(()=>{
      this.setData({
        showMask: false
      })
    },300)
  },
  //选择交易类型
  async handleSelectItem(e){
    const {index,type} = e.currentTarget.dataset
    const wallerBillsPageQuery = Object.assign(this.data.wallerBillsPageQuery,{
      billType:type,
      pageNum:1
    })
    this.setData({
      typeActiveIndex:index,
      wallerBillsPageQuery,
      hasNextPage:true
    })
    this.closeMask()
    await this.requsetAccountList()
  },
  //请求账单列表
  async requsetAccountList(){
    try{
      this.setData({
        status:1
      })
      const data = this.data.wallerBillsPageQuery
      const res = await wx.$http.post('/ydh/mall/walletBasic/getBillList', data)
      if(res.data.returnCode=='ERR_0000'){
  
        const params = this.data.wallerBillsPageQuery
        let list = []
        if(params.pageNum==1){
          list = res.data.data.list
        }else{
          list = [...this.data.accountList,...res.data.data.list]
        }
        params.pageNum++
        this.setData({
          accountList:list,
          wallerBillsPageQuery: params,
          hasNextPage: res.data.data.hasNextPage,
          isRequset:true
        })
        if (!res.data.data.hasNextPage){
          this.setData({
            status:2
          })
        }
      }
      
    }catch(err){
      this.setData({
        isRequset:true
      })
    }
  },
  //获取页面参数
  async getPageParams(options){
    const wallerBillsPageQuery = Object.assign(this.data.wallerBillsPageQuery, options)
    this.setData({
      wallerBillsPageQuery
    })
  },
  //上拉加载
  async handleScrollBottom(){
    if(!this.data.hasNextPage) return
    await this.requsetAccountList()
  },
  //查询订单详情
  async handleLookDetail(e){
    const billsId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/member/account_detail/index?billsId=${billsId}`,
    })
  }
})