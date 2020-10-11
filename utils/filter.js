const formatTime = date => {
  var date = new Date(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('-')
}

const formatMonth = date => {
  var date = new Date(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return [year, month].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/*函数节流*/
const throttle = (fn, interval) => {
  var enterTime = 0; //触发的时间
  var gapTime = interval || 300; //间隔时间，如果interval不传，则默认300ms
  return function () {
    var context = this;
    var backTime = new Date(); //第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments);
      enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

/*函数防抖*/
const debounce = (fn, interval) => {
  var timer;
  var gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
  return function () {
    clearTimeout(timer);
    var context = this;
    var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function () {
      fn.call(context, args);
    }, gapTime);
  };
}

// 数字转大写
const convertCurrency = money => {
  //汉字的数字
  var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
  //基本单位
  var cnIntRadice = new Array('', '拾', '佰', '仟');
  //对应整数部分扩展单位
  var cnIntUnits = new Array('', '万', '亿', '兆');
  //对应小数部分单位
  var cnDecUnits = new Array('角', '分', '毫', '厘');
  //整数金额时后面跟的字符
  var cnInteger = '整';
  //整型完以后的单位
  var cnIntLast = '元';
  //最大处理的数字
  var maxNum = 999999999999999.9999;
  //金额整数部分
  var integerNum;
  //金额小数部分
  var decimalNum;
  //输出的中文金额字符串
  var chineseStr = '';
  //分离金额后用的数组，预定义
  var parts;
  if (money == '') {
    return '';
  }
  money = parseFloat(money);
  if (money >= maxNum) {
    //超出最大处理数字
    return '';
  }
  if (money == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  //转换为字符串
  money = money.toString();
  if (money.indexOf('.') == -1) {
    integerNum = money;
    decimalNum = '';
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  //获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    var zeroCount = 0;
    var IntLen = integerNum.length;
    for (var i = 0; i < IntLen; i++) {
      var n = integerNum.substr(i, 1);
      var p = IntLen - i - 1;
      var q = p / 4;
      var m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        //归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  //小数部分
  if (decimalNum != '') {
    var decLen = decimalNum.length;
    for (var i = 0; i < decLen; i++) {
      var n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
}

//时间倒计时
const timeDown = unixtime => {
  // 小时
  var hr = Math.floor(unixtime / 3600 % 24);
  // 分钟
  var min = Math.floor(unixtime / 60 % 60);
  // 秒
  var sec = Math.floor(unixtime % 60);
  return  hr + "小时" + min + "分钟" + sec + "秒";

}

/**
 * 验证金额
 * @param {金额} val 
 */
const checkMoney = val => {
  let num = val.toString(); //先转换成字符串类型
  if (num.indexOf('.') == 0) { //第一位就是 .
    num = '0' + num
  }
  num = num.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
  num = num.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
  num = num.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  num = num.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
  if (num.indexOf(".") < 0 && num != "") {
    num = parseFloat(num);
  }
  return num;
}


//匹配手机号
export function validatePhone(phone){
  const reg = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/
  return reg.test(phone);
}

//匹配身份证 身份证正则校验支持最后一位带X
export function validateCardId(text){
  const reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/
  return reg.test(text);
}

module.exports = {
  formatTime: formatTime,
  formatMonth: formatMonth,
  convertCurrency,
  throttle,
  debounce,
  timeDown,
  checkMoney,
  validatePhone,
  validateCardId,
}