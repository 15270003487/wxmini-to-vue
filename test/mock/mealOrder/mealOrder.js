// pages/order/order.js
const http = require('../../config/api')
const time = require('../../lib/time')
const {
  resolve
} = require('../../npm/promise-polyfill/promise')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    lastOrderNo: '',
    shopId: '',
    customerId: '',
    orderData: [],
    cancerOrder: "预定中",
    index: 0, //标注订单位置
    indexCancel: 0, //标注订单位置
    dataLength: 0,
    loading: false, //底部 加载中
    textShow: false, //底部 没有更多数据了 
  },
  // 更新数据
  getNewList() {
    this.setData({
      lastOrderNo: '',
      keyword: this.data.keyword,
      orderData: [],
    })
    this.getOrderList()
  },
  // keyword改变时就触发搜索，不太好，需要优化
  onChange(e) {
    this.setData({
      keyword: e.detail,
      // lastOrderNo: '',
      // orderData: [],
    });
  },
  onSearch() {
    this.getNewList()
  },
  onClick() {
    this.getNewList()
  },
  getOrderList() {
    if((this.data.textShow && this.data.lastOrderNo) || this.data.loading) return
    var that = this
    var shopId = this.data.shopId
    var customerId = this.data.customerId
    console.log(shopId);
    console.log(customerId);
    this.setData({
      loading: true,
      textShow: false
    })
    http.tzOrderList({
      // todo
      shopId,
      customerId,
      orderNo: this.data.keyword,
      lastOrderNo: this.data.lastOrderNo
    }).then(res => {
       
      if (res.data && res.data.length > 0) {
        that.setData({
          lastOrderNo: res.data[res.data.length - 1].orderNo
        })
      }
      let orderdata = [];
      res.data.forEach(item => {
        // 改变时间格式
        // item.payTime = time.renderTime(item.payTime)
        orderdata.push(item)
      })
      if (orderdata.length == 5) {
        that.setData({
          orderData: this.data.orderData.concat(orderdata)
        })
      } else {
        if(orderdata.length > 0) {
          this.setData({
            orderData: this.data.orderData.concat(orderdata)
          })
        }
        this.setData({
          textShow: true
        })
      }
      this.setData({
        loading: false
      })
    }).catch((e) => {
      wx.showToast({
        icon: 'none',
        title: e && e.message || '服务器异常',
      })
      this.setData({
        loading: false,
        textShow: false
      })
    })
  },
  handleCancel(e) {
    let that = this;
    var shopId = this.data.shopId;
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
          }).catch(() => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  goDetails(e) {
    const orderNo = this.data.orderData[e.target.dataset.index].orderNo;
    wx.navigateTo({
      url: './details/details?orderNo=' + orderNo,
    })
  },
  // 触底刷新
  onReachBottom: function () {
    //触底时继续请求下一页展示的数据
    this.getOrderList()
  },
  onPullDownRefresh: function () {
    this.getNewList()
    wx.stopPullDownRefresh()
  },
  getShopId(customerId) {
    return new Promise(resolve => {
      wx.request({
        // url: `http://192.168.10.27/api/wxapp/payCard/getMaster?customerId=${customerId}`,
        url: `https://binguoai.com/api/wxapp/payCard/getMaster?customerId=${customerId}`,
        data: {},
        method: 'post',
        success: (res) => {
          resolve(res.data)
        }
      });
    })
  },
  async loadData() {
    let that = this;
    const customerId = wx.getStorageSync('customerId');
    let masterData = await this.getShopId(customerId);
    this.setData({
      shopId: masterData.data.shopid,
      customerId: customerId
    })
    console.log(customerId);
    this.getNewList()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.loadData();
  },
  onShow: async function () {
    const paymentState = wx.getStorageSync('paymentState')
    if (paymentState) {
      wx.removeStorageSync('paymentState');
      this.loadData();
    }
  },

})