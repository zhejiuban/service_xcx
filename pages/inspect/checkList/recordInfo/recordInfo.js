// pages/inspect/checkList/recordInfo/recordInfo.js

const config = require('../../../../config')

let app = new getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    let that = this;
    wx.request({
      url: config.checkInfoUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        check_id: options.check_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            itemsLength: '0'
          })
        } else if (res.data.code == 403) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  url: "/pages/home/home"
                })
              }
            }
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        } else {
          that.setData({
            item:res.data
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    })
  },

  // 图片预览
  prev_img: function (e) {
    let that = this;
    let url = e.currentTarget.dataset.url;
    let urls = that.data.item.imgs;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
})