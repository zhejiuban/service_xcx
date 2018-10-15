// pages/refuse/refuse.js

const config = require('../../config');

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    repair_id:'',
    order_status:'',
    order_reason: '',
    //拒单原因
    refuse:[
      '请选择',
      '病假',
      '事假',
      '其他'
    ],
    index: 0
  },

  bindPickerChangeRefuse: function (e) {
    let that = this;
    let str = that.data.refuse[e.detail.value] + ',';
    that.setData({
      index: e.detail.value,
      order_reason: str
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    this.setData({
      repair_id: options.repair_id,
      order_status: options.order_status
    });
  },

  formSubmit: function(e){
    let that = this;
    let order_reason = that.data.order_reason+e.detail.value.order_reason;
    let repair_id = that.data.repair_id;
    if(that.data.index==0){
      wx.showModal({
        title: '提示',
        content: '请选择拒单原因',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            
          }
        }
      })
    }else{
      wx.request({
        url: config.refuseRepairUrl,
        method: "POST",
        data: {
          role: app.globalData.role,
          token: app.globalData.token,
          openId: app.globalData.openId,
          repair_id: repair_id,
          order_reason: order_reason,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.code == 1403) {
            app.errorPrompt(res.data);
          }else if(res.data.code == 1) {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/index/service/service'
                  })
                }
              }
            })
          }else{
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/index/service/service'
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
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})