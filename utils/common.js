/**
 * 营业过期判断
 */
let validated = async () => {
  let that = this;
  const enterpriseList = await wx.getStorageSync('EnterpriseList');
  console.log(enterpriseList)
  console.log("=====");
  if(!enterpriseList) return;
  let res = await wx.$http.post('/ydh/mall/enterprise/validated', {});
  if (res.data.returnCode == "ERR_0000") {
    if (!res.data.data.list) return;
    let desc = res.data.data.list[0]["number"] == 0 ? '已过期' : '即将过期'
    let message = "";
    let arr = new Array();
    for (let i in res.data.data.list) {
      if (res.data.data.list[i].changeStatus != 0) {
        message += res.data.data.list[i]["qualificationsName"] + "、"
        arr.push(res.data.data.list[i]);
      }
    }
    message = message.substring(0, message.lastIndexOf('、'));
    if (message) {
      message += `${desc}，请重新上传`
      let model = await wx.showModal({
        title: '温馨提示',
        content: message,
        cancelText: "忽略",
        confirmText: "重新上传"
      })
      if (model.confirm) {
        wx.navigateTo({
          url: "/packageB/pages/enter-detail/update/index?item=" + JSON.stringify(arr) + "&enterpriseName=" + enterpriseList.enterpriseName
        })
      }
    }
  }
}

/**
 * 企业列表
 */
let getEnterpriseList = async () => {
  try {
    const res = await wx.$http.post('/ydh/mall/enterprise/getEnterpriseList')
    if (res.data.returnCode == 'ERR_0000') {
      let result = {};
      if (res.data.data) {
        let flag = res.data.data.some((item) => {
          return item.loginStatus == 1
        })
        if (flag) {
          const index = res.data.data.findIndex((item, index) => {
            return item.loginStatus == 1
          })
          result.enterpriseName = res.data.data[index].enterpriseName;
          result.enterpriseId = res.data.data[index].enterpriseId;
          result.bandingIndex = index;
          result.enterpriseList = res.data.data;
          result.provinceId = res.data.data[index].provinceId;
          result.supplierType = res.data.data[index].supplierType;
        } else {
          result.enterpriseName = '';
          result.enterpriseId = '';
          result.bandingIndex = '';
          result.enterpriseList = res.data.data;
          result.provinceId = '';
          result.supplierType = ""
        }
      } else {
        result = {
          enterpriseName: '',
          enterpriseId: '',
          bandingIndex: '',
          enterpriseList: [],
          provinceId: '',
          supplierType: ""
        }
      }
      console.log("====")
      console.log( result)
      wx.setStorageSync('EnterpriseList',result);
      return result;
    }
  } catch (err) {
    console.log(err)
  }
}

/**
 * 证件管理：判断是否具有修改权限
 */
let getManageAuth = async (data) => {
  const result = await wx.getStorageSync('EnterpriseList');
  if(!result) return;
  const enterpriseId = data?data:result.enterpriseId
  if (!enterpriseId) return;
  const res = await wx.$http.post('/ydh/mall/shop/getManageAuth', {
    enterpriseId
  }, {
    'content-type': 'application/x-www-form-urlencoded'
  })
  wx.setStorageSync('manageAuth', res.data.data)
  return res.data.data
}

/**
 * 购物车列表
 */
let carlist = async (type = 0) => { //0不操作徽标1操作徽标
  let that = this;
  let res = await wx.$http.post('/ydh/mall/shoppingcar/list', {
    pageNum: 1,
    pageSize: 200
  })
  if (res.data.returnCode == "ERR_0000") {
    let carLong = 0;
    if (res.data.data.length > 0) {
      for (let i in res.data.data) {
        carLong += res.data.data[i]["shoppingCarDTOList"].length;
      }
      wx.setStorageSync('car_alreadySelectNum', carLong);
    } else {
      wx.removeStorageSync('car_alreadySelectNum');
    }
    if (type == 1) {
      if (wx.getStorageSync('car_alreadySelectNum')) {
        wx.setTabBarBadge({ //tabbar右上角添加文本
          index: 2, ////tabbar下标
          text: wx.getStorageSync('car_alreadySelectNum').toString() //显示的内容
        })
      } else {
        wx.removeTabBarBadge({
          index: 2,
        });
      }
    }
    return carLong;
  }
}

/**
 * 浏览图片手指触摸动作点击
 */
let previewImg = (imgUrl, index = 0) => {
  let that = this;
  // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
  let imgArr = [];
  if (imgUrl.length > 10) {
    imgArr.push(imgUrl)
  } else {
    imgArr = imgUrl;
  }

  wx.previewImage({
    current: imgArr[index], // 当前显示图片的http链接  
    urls: imgArr // 需要预览的图片http链接列表  
  })
}


/**
 * 获取开户状态，提示公告
 */

async function getRequsetMemberDataBsyStatus(){
  let that = this;
  
  try {
    const res = await wx.$http.post('/ydh/mall/walletBasic/getBasicInfo')
    if (res.data.returnCode == 'ERR_0000') {
      const bsyStatus= res.data.data.enterpriseAccountResult.bsyStatus;
      const bsyStatus2= res.data.data.individualAccountResult.bsyStatus;
      if(bsyStatus==10){
        showModel(0,res.data.data);
      } else if(bsyStatus2==10){
        showModel(1,res.data.data);
      }
    }
  } catch (err) {
    console.log(err)
  }
 }

 /**
  * 弹框公告
  * @param {String} type 0企业1个人
  * @param {Object} data 数据参数
  */
function showModel(type,data){
  return wx.showModal({
    title:'系统公告',
    content: '为更加满足监管对于客户身份识别的要求，近期渤海银行将对系统开户进行优化调整，完善客户信息采集，您需要补充该账户开户资料后才能正常使用，对此给您带来的不变敬请谅解。',
    confirmText: '补充资料',
    cancelText: '取消',
    success: function (res) {
      //接口调用成功
      if (res.confirm) {
        let parameter = {
          accountType: type == 0 ? data.enterpriseAccountResult.accountType : data.individualAccountResult.accountType,
          userType: type == 0 ? data.enterpriseAccountResult.userType : data.individualAccountResult.userType,
          virtualAccountId: type == 0 ? data.enterpriseAccountResult.virtualAccountId : data.individualAccountResult.virtualAccountId,
          accountId: type == 0 ? data.enterpriseAccountResult.accountId : data.individualAccountResult.accountId,
          bizAddress: type == 0 ? data.enterpriseAccountResult.bizAddress : data.individualAccountResult.bizAddress,
          businessLicenseCode: type == 0 ? data.enterpriseAccountResult.businessLicenseCode : data.individualAccountResult.businessLicenseCode,
        }
        parameter = JSON.stringify(parameter);
        //账户类型和银行卡号
        wx.navigateTo({
          url: `/pages/member/manage-account-update/index?parameter=${parameter}`,
        })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    },
    fail: function (res) {
      //接口调用失败的回调函数 
    },
    complete: function (res) {
      //接口调用结束的回调函数  
    }
  })
}

module.exports = {
  getEnterpriseList,
  previewImg,
  carlist,
  getManageAuth,
  validated,
  getRequsetMemberDataBsyStatus,
}