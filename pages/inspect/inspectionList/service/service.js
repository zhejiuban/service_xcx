// pages/inspect/checkList/service/service.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
  
  },

  swichNav1: function () {
    app.swichNav('/pages/inspect/inspectionList/service/service');
  },
  swichNav2: function () {
    app.swichNav('/pages/inspect/inspectionList/over/over');
  },

  // 回到首页
  toIndex: function () {
    app.toIndex();
  },

  // 我的
  toMe: function () {
    app.toMe();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})