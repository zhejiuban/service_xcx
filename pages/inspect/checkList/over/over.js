// pages/inspect/checkList/over/over.js

const config = require('../../../../config')

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: "",//窗口高度
    currentTab: 1, //预设当前项的值
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
    page: 1,   //分页
    items: [],
    status: 1,
    content: '1',    //判断上拉是否还有数据
    itemsLength: ''  //获取有无数据 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    let that = this;
    wx.showLoading({
      mask: true,
      title: '加载中',
    });
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        let calc = clientHeight * rpxR - 180;
        that.setData({
          winHeight: calc
        });
      }
    });

    wx.request({
      url: config.checkListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: 2,
        openId: app.globalData.openId
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
            items: res.data,
            itemsLength: '1',
            page: that.data.page + 1
          });
        }
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

  onShow: function () {
    let that = this;
    that.setData({
      page: 1
    });
    that.onLoad();
  },

  swichNav1: function () {
    app.swichNav('/pages/inspect/checkList/service/service');
  },
  swichNav2: function () {
    app.swichNav('/pages/inspect/checkList/over/over');
  },

  // 回到首页
  toIndex: function () {
    app.toIndex();
  },

  // 我的
  toMe: function () {
    app.toMe();
  },

  // 图片预览
  prev_img: function (e) {
    let url = e.currentTarget.dataset.url['0']['0'];
    let urls = e.currentTarget.dataset.url['0'];
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },

  clickCheckInfo: function (e) {
    //携带的参数
    let check_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/inspect/checkList/checkInfo/checkInfo?check_id='+check_id+'&status=2',
    });
  },

  
})