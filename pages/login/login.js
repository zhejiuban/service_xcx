// pages/login/login.js

const config = require('../../config');

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  // 输入工号和密码
  formSubmit: function (e) {
    let job_number = e.detail.value.number;
    let password = e.detail.value.password;
    wx.request({
      url: config.jobNumberUrl,
      method: "POST",
      data: {
        role: 2,
        token: app.globalData.token,
        job_number: job_number,
        password: password,
        openId: app.globalData.openId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                if(app.globalData.uuid){
                  wx.redirectTo({
                    url: '/pages/manual/manual'
                  })
                }else{
                  wx.redirectTo({
                    url: '/pages/index/service/service'
                  })
                }
                
              }
            }
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
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
})