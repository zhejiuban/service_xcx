// pages/phone/phone.js

const config = require('../../config');

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // uuid : ''
    pageShow: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  formSubmit: function (e) {
    let that = this;
    let phone = e.detail.value.phone;
    let password = e.detail.value.password;
    if (!phone) {
      wx.showModal({
        title: '提示',
        content: '请输入手机号',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      })
    } else if (!password) {
      wx.showModal({
        title: '提示',
        content: '请输入密码',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      })
    } else {
      wx.request({
        url: config.findPhoneUrl,
        method: "POST",
        data: {
          role: 2,    //用户角色
          token: app.globalData.token,
          phone: phone,
          password: password,
          union_id: app.globalData.unionid,
          openid: app.globalData.openId
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: res.data.message,
              success: function (res) {
                if (res.confirm) {
                }
              }
            });
          } else if (res.data.code == 1403) {
            app.errorPrompt(res.data);
          } else {
            wx.reLaunch({
              url: "/pages/index/service/service"
            });
          }
        },
        fail: function () {
          wx.hideLoading();
          app.requestError();
        }
      })
    }
  },


  close_order: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  btn_click: function () {
    let that = this;
    that.setData({
      pageShow: false
    });
  },

  /**
 * 点击授权绑定手机号
 */
  getPhoneNumber: function (e) {
    let that = this;
    let iv = e.detail.iv;
    let encryptedData = e.detail.encryptedData;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      that.setData({
        pageShow: true
      });
    } else {
      wx.login({
        success: res => {
          let code = res.code;
          wx.getUserInfo({
            success: res => {
              //发起网络请求
              wx.request({
                url: config.findPhoneUrl,
                method: "POST",
                data: {
                  role: 2,    //用户角色
                  token: app.globalData.token,
                  code: code,
                  iv: iv,
                  encryptedData: encryptedData,
                  union_id: app.globalData.unionid,
                  openid: app.globalData.openId
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  if (res.data.code == 0) {
                    wx.showModal({
                      title: '提示',
                      showCancel: false,
                      content: res.data.message,
                      success: function (res) {
                        if (res.confirm) {
                        }
                      }
                    });
                  } else if (res.data.code == 1403) {
                    app.errorPrompt(res.data);
                  } else {
                    wx.reLaunch({
                      url: "/pages/index/service/service"
                    });
                  }
                },
                fail: function () {
                  wx.hideLoading();
                  app.requestError();
                }
              })
            }
          })
        }
      })
    }
  }
})