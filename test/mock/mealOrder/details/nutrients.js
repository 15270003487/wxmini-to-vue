const tcRequest = require('../../../lib/tcRequest');
const ypRequest = require('../../../lib/ypRequest');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isurl: true,
    url: '',
    detailRes: [],
    dishes: '', //单个菜品
    nutrients: '', //营养总量
    orderNo: '',
    resData: '' //重构营养总量
  },

  async getOrderNutrients() {
    let detailRes
    console.log(this.data.orderNo, 20);
    if (this.data.orderNo) {
      detailRes = await ypRequest.post('/api/wxapp/reserve/findOrderDetail', {
        orderNO: this.data.orderNo
      })
    }

    if (!!this.data.productId) {
      this.setData({
        isurl: false,
        url: 'https://tc.yunpengai.com/nutritionData/#/nutritionData/OrderNutData?orderId=' + detailRes.orderId + '&productId=' + this.data.productId + '&quantity=' + this.data.quantity + '&productPic=' + this.data.productPic
      })
    }
    // this.setData({
    //   detailRes: detailRes
    // })
    // let nutrientsRes = await tcRequest.post(`/nutrients/api/orderNutrients?orderId=${detailRes.orderId}`)
    // let dishesCopy = []
    // try {
    //   dishesCopy = JSON.parse(JSON.stringify(nutrientsRes.snapshot.dishes))
    // } catch (error) {
    //   console.log(error);
    // }

    // let arrDataList = JSON.parse(JSON.stringify(nutrientsRes));
    // arrDataList = arrDataList.snapshot.nutrients.sort((a, b) => {
    //   return a.seq - b.seq
    // });
    // this.setData({
    //   resData: arrDataList
    // })
    // let nutrients = dishesCopy.map(item => {
    //   for (const iterator of detailRes.itemList) {
    //     if (iterator.productId == item.merchantDishesId) {
    //       item.nutrients.forEach(item2 => {
    //         item2.netContent = item2.netContent * iterator.quantity
    //       })
    //     }
    //   }
    //   return item.nutrients
    // })
    // let nutrientsData = {}
    // nutrients[0].map(item => {
    //   nutrientsData[item.code] = {
    //     name: item.name,
    //     netContent: item.netContent,
    //     unit: item.unit
    //   }
    // })
    // for (let i = 1; i < nutrients.length; i++) {
    //   nutrients[i].forEach(item => {
    //     if (nutrientsData.hasOwnProperty(item.code)) {
    //       nutrientsData[item.code].netContent += item.netContent
    //     } else {
    //       nutrientsData[item.code] = {
    //         name: item.name,
    //         netContent: item.netContent,
    //         unit: item.unit
    //       }
    //     }
    //   })
    // }
    // for (let i = 0; i < nutrientsRes.snapshot.dishes.length; i++) {
    //   let ItemarrDataList = nutrientsRes.snapshot.dishes[i];
    //   nutrientsRes.snapshot.dishes[i].nutrients = ItemarrDataList.nutrients.sort((a, b) => {
    //     return a.seq - b.seq
    //   });
    // }
    // console.log(nutrientsRes.snapshot.dishes);
    // this.setData({
    //   dishes: nutrientsRes.snapshot.dishes,
    //   nutrients: nutrientsData
    // })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderNo: options.orderNo,
      productId: options.productId,
      quantity: options.quantity,
      productPic: options.productPic
    })
    this.getOrderNutrients()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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


})