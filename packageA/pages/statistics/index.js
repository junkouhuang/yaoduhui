
import * as echarts from '../../../ec-canvas/echarts';
function setOption(chart, xlist, ylist1) {
  var option = {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xlist
    },
    yAxis: {
      type: 'value',
      splitLine:{  
        show:true  ,
        lineStyle:{
          color:'#DCDCDC',
          width: 1
        }
      }
    },
    grid: {
      left: '2%',
      right: '8%',
      bottom: '0%',
      containLabel: true
    },
    series: [
      {
        name: '邮件营销',
        type: 'line',
        label: {
          normal: {
              show: true,
              position: 'top'
          }
      },
      itemStyle: {
				normal: {
					color: 'rgba(48,148,241,1)', //改变折线点的颜色
					lineStyle: {
						color: 'rgba(48,148,241,1)' //改变折线颜色
					}
				}
			},
        areaStyle: {},
        data: ylist1
      },
    ]
  };
  chart.setOption(option);
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      lazyLoad: true
    },
    arr:[],
    reactiveWidth:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    let that= this
    this.oneComponent = this.selectComponent('#mychart-one');
    const res = await wx.$http.post('/ydh/mall/userAgent/partnerStatistics');
    this.setData({
      arr:res.data.data
    })
    wx.getSystemInfo({
      success: (res) => {
        this.data.reactiveWidth = res.windowWidth
      },
    })
    let categorieArr = [];
    let profitArr = [];
    for (let i in res.data.data.partnerStatisticsVos) {
      categorieArr.push(res.data.data.partnerStatisticsVos[i].date.split("-")[1] + '-' + res.data.data.partnerStatisticsVos[i].date.split("-")[2]);
      profitArr.push(res.data.data.partnerStatisticsVos[i].profit);
    }

    this.init_one(categorieArr, profitArr)
  },

  init_one: function (xdata, ylist1) {           //初始化第一个图表
    this.oneComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: 2.5
      });
      setOption(chart, xdata, ylist1)  //赋值给echart图表
      this.chart = chart;
      return chart;
    });
  },

  /**
   * 返回上一页
   */
  return() {
    wx.navigateBack();
  },
})