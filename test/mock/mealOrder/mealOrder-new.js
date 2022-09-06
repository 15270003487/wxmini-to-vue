// src/pages/mealOrder/mealOrder-new.js
const http = require('../../config/api')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderData: [],
    keyword: '',
    lastOrderNo: '',
    reachBottom: true,
    issearch: true
  },

  onActiveSearch() {
    let issearch = !this.data.issearch
    this.setData({
      issearch: issearch
    })
  },

  // 搜索
  onSearch(e) {
    this.setData({
      keyword: e.detail,
      lastOrderNo: '',
      reachBottom: true
    })
    this.getOrderList()
    let issearch = !this.data.issearch
    this.setData({
      issearch: issearch
    })
  },

  // 取消 
  onClear(e) {
    this.setData({
      keyword: "",
    })
  },

  // 获取订单列表
  getOrderList() {
    if (!this.data.reachBottom) return
    var customerId = wx.getStorageSync('customerId')
    http.tzOrderList({
      customerId,
      orderNo: this.data.keyword,
      lastOrderNo: this.data.lastOrderNo
    }).then(res => {

      if (res.data && res.data.length > 0) {
        this.setData({
          lastOrderNo: res.data[res.data.length - 1].orderNo
        })
      }
      let orderdata = [];
      res.data.forEach(item => {
        // for (let i in item.itemList) {
          // item.itemList[i] = {
          //   fee: item.itemList[i].realprice,
          //   price: item.itemList[i].price,
          //   productId: item.itemList[i].productid,
          //   productName: item.itemList[i].productname,
          //   quantity: item.itemList[i].quantity,
          // }
        // }
        // 改变时间格式
        // item.payTime = time.renderTime(item.payTime)
        orderdata.push(item)
      })
      // if (this.data.keyword != "") {
      //   this.setData({
      //     orderData: orderdata
      //   })
      // } else {
      if (orderdata.length == 5) {
        this.setData({
          orderData: this.data.orderData.concat(orderdata)
        })
      } else {
        if (orderdata.length > 0) {
          this.setData({
            orderData: this.data.orderData.concat(orderdata)
          })
        }
        // }

        if (orderdata.length == 0) {
          wx.showToast({
            title: '暂无数据',
            duration: 1000,
            icon: 'none'
          })
        }
        this.setData({
          reachBottom: false
        })
      }
      //   res.data.forEach(item => {
      //     if (!!item.mealTakingNum && item.mealTakingNum.length > 0) {
      //       http.tzOrderDetails({
      //         orderNO: item.orderNo,
      //         shopId: item.shopId
      //       }).then(res => {
      //         if (res.code !== 200) {
      //           wx.showToast({
      //             icon: 'none',
      //             title: res.message || '接口错误',
      //           })
      //           return;
      //         }
      //         if (res.data.branchId) {
      //           //获取叫号号码
      //           wx.request({
      //             url: "https://binguoai.com/api/wxapp/new/reserve/order/call/list/query",
      //             method: "POST",
      //             data: {
      //               "shopId": res.data.shopId,
      //               "branchId": res.data.branchId
      //             },
      //             success: function success(res) {
      //               try {
      //                 if (res.data.code == 200) {
      //                   let num = res.data.data.callingList[0]
      //                   num ? num = num : num = '0001'
      //                   item.waitingISNum = num
      //                 }
      //               } catch (error) {
      //                 console.log(error);
      //               }
      //             }
      //           });
      //         }
      //       })
      //     }
      //   })
      //   console.log(res);
      // }).catch((e) => {
      //   wx.showToast({
      //     icon: 'none',
      //     title: e && e.message || '服务器异常',
      //   })
    })

  },
  onClickTabs(event) {
    // wx.showToast({
    //   title: `点击标签 ${event.detail.name}`,
    //   icon: 'none',
    // });
    console.log(event, 'tabs91');
  },
  // 更新数据
  getNewList() {
    this.setData({
      lastOrderNo: '',
      keyword: this.data.keyword,
      orderData: [],
      reachBottom: true
    })
    this.getOrderList()
  },

  // 取消订单
  handleCancel(e) {
    let that = this;
    var shopId = this.data.orderData[e.target.dataset.index].shopId;
    const orderNo = this.data.orderData[e.target.dataset.index].orderNo;

    wx.showModal({
      title: '确定要取消该订单吗',
      content: '',
      confirmText: "确定",
      cancelColor: "#000000",
      confirmColor: "#F11D1E",
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '取消中',
            mask: true
          });
          http.tzCancelOrder({
            shopId,
            orderNo
          }).then(res => {
            wx.hideLoading()
            if (res.code != 200) {
              wx.showToast({
                title: res.message,
                icon: 'none',
                duration: 1000,
                mask: true
              })
            } else if (res.code == 200) {
              wx.showToast({
                title: '取消订单成功',
                icon: 'success',
                duration: 1000,
                mask: true,
                complete: res => {
                  that.getNewList()
                }
              })
            }
          }).catch((e) => {
            wx.hideLoading()
            wx.showToast({
              title: e.message || '服务器异常',
              duration: 1000,
              icon: 'none'
            })
          })
        }
      }
    })
  },
  // 订单详情
  goDetails(e) {
    const orderNo = this.data.orderData[e.target.dataset.index].orderNo;
    wx.navigateTo({
      url: '/pages/mealOrder/details/details?orderNo=' + orderNo,
    })
  },

  // 去评价
  handleClickAction(e) {
    const orderData = this.data.orderData[e.target.dataset.index];
    var localData = Object.assign({}, orderData, {
      orderItems: orderData.itemList
    });
    localData.customerId = wx.getStorageSync('customerId')
    localData.customerName = wx.getStorageSync('realName')
    var oid = orderData.orderNo;
    wx.setStorageSync("o_" + oid, localData);

    wx.navigateTo({
      url: "/ypMerchant/comment/comment/index?oid=" + oid
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList()
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  async onPullDownRefresh() {
    await this.getNewList()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    this.getOrderList()
  }
})