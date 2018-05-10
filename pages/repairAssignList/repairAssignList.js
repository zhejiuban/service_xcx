const config = require('../../config');

let app = getApp();
Page({
  data: {
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
    page: 1,   //分页
    items: [1,2,3,4,5,6,7,7,8,8,9,9,0,9,8,7,7,7,7,],
    content: '1',    //判断上拉是否还有数据
    itemsLength: ''  //获取有无数据
  },

  repair_assign: function (e) {
    let repair_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/repairAssign/repairAssign?repair_id=' + repair_id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    let that = this;
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
      url: config.assignRepairListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        page: 1
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
          let arr = [];
          let data = res.data;
          for (var i = 0; i < data.length; i++) {
            arr[i] = [[data[i].img_url], data[i].name, data[i].path, data[i].repair_id];
          }
          that.setData({
            items: arr,
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

  // 查看详情包括评论
  clickAllDetail: function (e) {
    let repair_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/alldetails/alldetails?status=' + this.data.status + '&repair_id=' + repair_id,
    })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let that = this;
    wx.request({
      url: config.assignRepairListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        page: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        if (res.data.length != '0') {
          let arr = [];
          let data = res.data;
          for (var i = 0; i < data.length; i++) {
            arr[i] = [[data[i].img_url], data[i].name, data[i].path, data[i].repair_id];
          }
          that.setData({
            items: arr,
            page: 1
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        } else {
          that.setData({
            itemsLength: '0',
            page: 1
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    })
  },

  //上拉加载更多 
  //滚动到底部触发事件  
  searchScrollLower: function () {
    let that = this;
    wx.showLoading();
    wx.request({
      url: config.assignRepairListUr,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        page: that.data.page + 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.length > 0) {
          let arr = [];
          let data = res.data;
          for (var i = 0; i < data.length; i++) {
            arr[i] = [[data[i].img_url], data[i].name, data[i].path, data[i].repair_id];
          }
          let arr1 = that.data.items;
          let arrs = arr1.concat(arr);
          that.setData({
            items: arrs,
            page: that.data.page + 1
          });
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        }
        if (res.data.length < 10) {
          that.setData({
            content: '0'
          })
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

  footerTap: app.footerTap
})