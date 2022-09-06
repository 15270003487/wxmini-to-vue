// pages/mealOrder/details/details.js
const http = require('../../../config/api')
const time = require('../../../lib/time')
const {
  getShopConfigMerchant
} = require('../../../config/api')
var YpRequest = require("../../../lib/ypRequest");
const tcRequest = require('../../../lib/tcRequest');
const qrcode = require('../../../lib/weapp.qrcode.esm')

Page({
  data: {
    isdisfixed: false,
    // 折叠面板
    selectedFlag: false,
    activeNames: '',
    nutritionArr: [{
        id: "01",
        num: "1878",
        pre: "35",
        totalName: "蛋白质",
        weiV: "g"
      },
      {
        id: "02",
        num: "25.2",
        pre: "35",
        totalName: "能量",
        weiV: "Kcal"
      },
      {
        id: "03",
        num: "9.1",
        pre: "35",
        totalName: "脂肪",
        weiV: "g"
      },
    ],
    color: ['#76B2F5', '#6060F2', '#606060'],
    processArr: [{
        id: "001",
        name: "碳水化合物",
        status: 70,
        color: '#76B2F5'
      },
      {
        id: "002",
        name: "脂肪",
        status: 50,
        color: '#6060F2'
      },
      {
        id: "003",
        name: "膳食纤维",
        status: 30,
        color: '#606060'
      },
    ],
    numColor: ["num1", "num2", "num3"],
    exercise: [{
        name: '走路',
        num: '40',
        url: '../../../images/walking.png'
      }, {
        name: '跑步',
        num: '80',
        url: '../../../images/running.png'
      }, {
        name: '游泳',
        num: '90',
        url: '../../../images/swimming.png'
      }, {
        name: '骑车',
        num: '50',
        url: '../../../images/Cycling.png'
      }, {
        name: '跳绳',
        num: '120',
        url: '../../../images/Jumping.png'
      },
      {
        name: '篮球',
        num: '30',
        url: '../../../images/busketball.png'
      },
      {
        name: '滑雪',
        num: '30',
        url: '../../../images/skiing.png'
      },
      {
        name: '力量',
        num: '20',
        url: '../../../images/power.png'
      },
      {
        name: '体操',
        num: '60',
        url: '../../../images/gymnastics.png'
      },
    ],
    energyNum: '',
    orderData: {},
    showNutrients: false, //是否显示营养数据
    isComment: true, // 是否已评论
    discount: 0, //优惠
    merchantConfig: {}, //评价与营养数据
    y: 0, //营养数据位置
    WaitingNum: 0,
    WaitingTime: 0,
    WaitingISNum: 0
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  onLoad: function (options) {
    qrcode({
      width: 100,
      height: 100,
      canvasId: 'myQrcode',
      text: `H${options.orderNo}`, //二维码内容
    });
    let that = this;
    if (options.orderNo) {
      console.log(options.orderNo, 125);
      http.tzOrderDetails({
        orderNO: options.orderNo,
        shopId: this.data.shopId
      }).then(res => {
        if (res.code !== 200) {
          wx.showToast({
            icon: 'none',
            title: res.message || '接口错误',
          })
          return;
        }
        // 餐柜取餐码
        if (res.data.isMeals) {
          qrcode({
            width: 100,
            height: 100,
            canvasId: 'myQrcode',
            text: res.data.mealTakingNum || '暂无', //二维码内容
          });
        }
        // 0：无退款，1：退款中，2：退款失败，3：退款成功，4：部分退款中，5：部分退款失败，6：部分退款成功
        const statusTitleList = ['无退款', '退款中', '退款失败', '退款成功', '部分退款中', '部分退款失败', '部分退款成功'];
        // console.log(`statusTitleList[res.data.refundStatus] || '未知状态'`, statusTitleList[res.data.refundStatus] || '未知状态')
        const orderData = Object.assign({
          refundStatusDesc: statusTitleList[res.data.refundStatus] || '未知状态'
        }, res.data)
        that.setData({
          orderData: orderData
        });
        if (orderData.totalFee != orderData.realFee) {
          that.setData({
            discount: parseInt(orderData.totalFee) - parseInt(orderData.realFee)
          })
        }
        this.handleIsComment(orderData);
        that.data.orderData = orderData;
        this.syncOrderNutrients();
        getShopConfigMerchant({
          shopId: orderData.shopId
        }).then(res => {
          that.setData({
            merchantConfig: res.data
          })
        })
        // this.data.orderData.createTime = time.renderTime(this.data.orderData.createTime)
        this.setData({
          orderData: Object.assign({}, that.data.orderData)
        })
        // console.log(orderData, 'orderData');
        if (orderData.branchId) {
          //获取排队人数
          wx.request({
            url: "https://binguoai.com/api/wxapp/new/reserve/order/call/waiting/count",
            method: "POST",
            data: {
              "shopId": orderData.shopId,
              "branchId": orderData.branchId
            },
            success: function success(res) {
              try {
                let resData = res.data;
                if (resData != null) {
                  console.log(orderData.branchId, 100 % 10);
                  let num = resData.data.count || 0
                  let time = resData.data.count * 0.5 || 0
                  if (orderData.branchId == 718) {
                    console.log(180);
                    if (num % 12 == 0) {
                      time = num / 12 * 15
                    } else {
                      time = (parseInt(num / 12) + 1) * 15
                    }
                  }
                  that.setData({
                    WaitingNum: num,
                    WaitingTime: time,
                  })
                }
              } catch (error) {
                console.log(error);
              }

            }
          });

          //获取叫号号码
          wx.request({
            url: "https://binguoai.com/api/wxapp/new/reserve/order/call/list/query",
            method: "POST",
            data: {
              "shopId": orderData.shopId,
              "branchId": orderData.branchId
            },
            success: function success(res) {
              try {
                console.log(res.data.data.callingList[0]);
                let num = res.data.data.callingList[0]
                num ? num = num : num = '0001'
                that.setData({
                  WaitingISNum: num,
                })
              } catch (error) {
                console.log(error);
              }
            }
          });

        }

      })
    } else {
      console.log(options.orderNo, 228);
    }


  },
  onShow() {
    this.handleIsComment(this.data.orderData);
  },
  /**
   * 监听页面滚动
   */
  onPageScroll: function (e) {
    // let a = true
    // if (e.scrollTop > 105 && a) {
    //   a = false
    //   this.setData({
    //     isdisfixed: true
    //   })
    // }
  },
  isdisfixedFun() {
    this.setData({
      isdisfixed: false
    })
    wx.pageScrollTo({
      scrollTop: 0
    })
  },


  async handleIsComment(order) {

    var oid = order.orderNo; // const order = this.data.order;

    if (!order || !order.shopId) return;

    const res = await tcRequest.post(
      "/comment/record/getCommentRecords", {
        entityCode: "001",
        entityId: oid,
        bizId: {
          "1_merchantId": order.shopId,
          "2_branchId": order.branchId || 9 // TODO: 等字段中
        }
      }
    );

    this.setData({
      isComment: !(!res || !res.length)
    });
  },
  // 折叠面板
  changeToggle: function (e) {
    let that = this;
    if (that.data.selectedFlag) {
      that.data.selectedFlag = false;
    } else {
      that.data.selectedFlag = true;
    }
    that.setData({
      selectedFlag: that.data.selectedFlag
    })
    // wx.pageScrollTo({
    //   scrollTop: 92
    // })
  },
  handleClickAction: function handleClickAction(e) {
    var type = e.currentTarget.dataset.type;
    var localData = Object.assign({}, this.data.orderData, {
      orderItems: this.data.orderData.itemList
    });

    var oid = this.data.orderData.orderNo;
    wx.setStorageSync("o_" + oid, localData);

    if (type == "0") {
      wx.navigateTo({
        url: "/ypMerchant/comment/comment/index?oid=" + oid
      });
    } else {
      wx.navigateTo({
        url: "/ypMerchant/comment/detail/index?oid=" + oid
      });
    }
  },
  async syncOrderNutrients() {
    const orderNo = this.data.orderData.orderNo;
    try {
      if (this.data.orderData.orderType == 20) {
        wx.request({
          url: 'https://cz.yunpengai.com/iws/wxApplets/syncNutrients/' + orderNo,
          method: "POST",
          data: {},
          success: function success(res) {}
        })
      } else {
        await YpRequest.post("/api/order/syncNutrients/" + orderNo)
      }
      this.loadOrderNutrientsData(this.data.orderData);
      console.log(this.data.showNutrients, 'showNutrientsshowNutrients');
    } catch (error) {
      console.log(error);
    }
  },
  // 获取营养数据
  // 获取运动消耗
  loadOrderNutrientsData(order) {
    tcRequest.post("/nutrients/api/orderNutrients?orderId=" + order.orderId).then(res => {
      let nutrientsRes = res
      let arrDataList = JSON.parse(JSON.stringify(nutrientsRes));
      // console.log(JSON.parse(JSON.stringify(nutrientsRes)));
      arrDataList = arrDataList.snapshot.nutrients.sort((a, b) => {
        return a.seq - b.seq
      }); //总量
      // console.log(arrDataList, 'arrDataList');
      let arr = arrDataList.slice(3, 6),
        that = this
      if (!res.snapshot) {
        this.setData({
          showNutrients: false,
        })
        return
      }
      let energyNum
      arrDataList.map(item => {
        if (item.name == '卡路里') {
          item.name = '能量'
          arrDataList[0] = item
          energyNum = item.netContent || 0
        }
      })
      if (!!energyNum) {
        let arr = this.data.exercise.map(item => {
          switch (item.name) {
            case '走路':
              item.num = parseInt(energyNum / 255 * 60)
              return item
            case '跑步':
              item.num = parseInt(energyNum / 600 * 60)
              return item
            case '游泳':
              item.num = parseInt(energyNum / 550 * 60)
              return item
            case '骑车':
              item.num = parseInt(energyNum / 415 * 60)
              return item
            case '跳绳':
              item.num = parseInt(energyNum / 660 * 60)
              return item
            case '篮球':
              item.num = parseInt(energyNum / 500 * 60)
              return item
            case '滑雪':
              item.num = parseInt(energyNum / 600 * 60)
              return item
            case '力量':
              item.num = parseInt(energyNum / 300 * 60)
              return item
            case '体操':
              item.num = parseInt(energyNum / 350 * 60)
              return item
          }
        })
        this.setData({
          exercise: arr,
          energyNum: energyNum
        })
      } else {
        let arr = this.data.exercise.map(item => {
          item.num = 0
          return item
        })
        this.setData({
          exercise: arr,
          energyNum: 0
        })
      }

      //获取标准营养数据摄入量，分母
      wx.request({
        url: "https://tc.yunpengai.com/nutrients/ai/api/getUserHealthyProfile",
        method: "POST",
        data: {
          // "userCode": wx.getStorageSync('customerId'),
          "userCode": 'YP_NORMAL_USER_MALE'
        },
        success: function success(res) {
          let arrDataLists = JSON.parse(JSON.stringify(res.data.data.nutrientsConfigs));
          arrDataLists = arrDataLists.sort((a, b) => {
            return a.nutrientsCode - b.nutrientsCode
          }); //总量
          let processArrs = arrDataLists
          // console.log(processArrs, arr, 'processArrsarr');
          processArrs.map(item => {
            for (let i = 0; i < arr.length; i++) {
              if (item.nutrientsCode == arr[i].code) {
                arr[i].Content = parseInt(arr[i].netContent / item.lessValue * 100)
                // console.log(arr[i].netContent, item.lessValue);
              }
            }
          })
          that.setData({
            showNutrients: true,
            nutritionArr: arrDataList.slice(0, 3),
            processArr: arr
          })
        }
      });

    }).catch(error => {
      console.log(error);
    })
  },

  bindTapShowImage() {
    wx.previewImage({
      urls: [this.data.orderData.productOrderUrl],
    })
  },

  // 营养数据移动事件
  touchmove(e) {
    let y = e.touches[0].pageY - e.currentTarget.offsetTop

    if (y > -150 && y < 250) {
      this.setData({
        y
      })
    }
  },

  toNutrients(e) {
    if (e.currentTarget.dataset && e.currentTarget.dataset.index) {
      console.log(e.currentTarget, 'currentTargetcurrentTargetcurrentTarget');
      wx.navigateTo({
        url: `/pages/mealOrder/details/nutrients?orderNo=${this.data.orderData.orderNo}&productId=${e.currentTarget.dataset.index.productId}&quantity=${e.currentTarget.dataset.index.quantity}&productPic=${e.currentTarget.dataset.index.productPic}`,
      })
      console.log(111);
    } else {
      wx.navigateTo({
        url: `/pages/mealOrder/details/nutrients?orderNo=${this.data.orderData.orderNo}`,
      })
    }

  }
})