// pages/serviceMode/serviceMode.js

const config = require('../../config');

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    repair_id: '',
    items:[
      { code: 1, name: '上门维修', checked: 'true'},
      {code:2,name:'远程协助维修'}
    ],
    method: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    app.network_state();
    that.setData({
      repair_id: options.repair_id
    })
  },

  radioChange: function (e) {
    this.setData({
      method: e.detail.value
    })
  },

  //确认接单
  formSubmit: function (e) {
    let that = this;
    wx.request({
      url: config.confirmRepairUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: '4',
        openId: app.globalData.openId,
        repair_id: that.data.repair_id,
        methods: that.data.method
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == '1') {
          wx.showModal({
            title: '提示',
            content: '接单成功',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/index/assess/assess'
                })
              }
            }
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        }else if(res.data.code == 0){
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/index/assess/assess'
                })
              }
            }
          })
        }else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/index/assess/assess'
                })
              }
            }
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    })
  },

})