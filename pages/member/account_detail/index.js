// pages/member/account_detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountData:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    const billsId = options.billsId
    await this.requsetOrderDetaill(billsId)
  },

  async requsetOrderDetaill(billsId){
    try{
      const res = await wx.$http.post(`/ydh/mall/walletBasic/getBillDetails?billsId=${billsId}`)
      if(res.data.returnCode="ERR_0000"){
        const accountData = res.data.data
        this.setData({
          accountData
        })
      }
    }catch(err){
      console.log(err)
    }
  }
})