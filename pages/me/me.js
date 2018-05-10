let app = getApp();
// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      avatarUrl:'',         //用户头像
      nickName:'',          //用户名
      service_provider_admin: app.globalData.service_provider_admin
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    let info = app.globalData.userInfo;
    this.setData({
      avatarUrl:info.avatarUrl,
      nickName:info.nickName
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  //跳转到设备点检列表
  check: function (e) {
    wx.redirectTo({
      url: "/pages/inspect/checkList/service/service",
    })
  },
  //跳转到设备巡检列表
  inspection: function (e) {
    wx.redirectTo({
      url: "/pages/inspect/inspectionList/service/service",
    })
  },

  //跳转到工单分派页面
  to_repairAssignList: function (e) {
    wx.navigateTo({
      url: "/pages/repairAssignList/repairAssignList",
    })
  }
})