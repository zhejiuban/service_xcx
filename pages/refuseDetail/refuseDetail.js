// pages/refuseDetail/refuseDetail.js

const config = require('../../config');

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //工单详情
    repair_id: '',
    asset_id: '',
    asset_name: '',
    field_path: '',
    remarks: '',
    img_url: [],
    complain: '',
    create_time: '',
    refuse_time: '',
    reason: '',
    user_phone: ''
  },
  imgShow: function (e) {
    var that = this;
    var current_url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: current_url, // 当前显示图片的http链接
      urls: that.data.img_url // 需要预览的图片http链接列表
    })
  },

  // 点击跳转到维修日志记录
  to_processLog: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/serviceLog/serviceLog?id=' + id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    wx.showLoading({
      mask: true,
      title: '加载中',
    });
    let repair_id = options.repair_id;
    let processLog_id = options.processLog_id;
    let that = this;
    wx.request({
      url: config.refuseRepairInfoUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        processLog_id: processLog_id,
        repair_id: repair_id,
        openId: app.globalData.openId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        }
        that.setData({
          repair_id: res.data.repair_id,
          asset_id: res.data.asset_id,
          asset_name: res.data.asset_name,
          field_path: res.data.field_path,
          remarks: res.data.remarks,
          img_url: res.data.img_url,
          create_time: res.data.create_time,
          refuse_time: res.data.refuse_time,
          reason: res.data.reason,
        });
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  phoneCall: function (e) {
    wx.showModal({
      title: '提示',
      content: '是否拨打：' + e.currentTarget.dataset.phone,
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
          })
        } else if (res.cancel) {
        }
      }
    })
  }
})