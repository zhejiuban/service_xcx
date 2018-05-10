// pages/inspect/checkList/recordList/recordList.js

const config = require('../../../../config')

let app = new getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [],
    asset_id: '',
    equipment_id: '',
    page: 1,   //分页
    content: '1',    //判断上拉是否还有数据
    itemsLength: ''  //获取有无数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    let that = this;
    if (options.asset_id){
      that.setData({
        asset_id: options.asset_id
      });
    }else{
      that.setData({
        equipment_id: options.equipment_id
      });
    }
    
    wx.request({
      url: config.assetCheckListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        asset_id: that.data.asset_id,
        equipment_id: that.data.equipment_id,
        page:1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.data.length == 0) {
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
            items: res.data.data
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let that = this;
    wx.request({
      url: config.assetCheckListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        asset_id: that.data.asset_id,
        page: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        if (res.data.data.length != '0') {
          that.setData({
            items: res.data.data,
            page: 1
          })
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
      url: config.assetCheckListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        asset_id: that.data.asset_id,
        page: that.data.page + 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.data.length > 0) {
          let data = res.data.data;
          let arr1 = that.data.items;
          let arrs = arr1.concat(data);
          that.setData({
            items: arrs,
            page: that.data.page + 1
          });
        }
        if (res.data.length < 10) {
          that.setData({
            content: '0'
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

  to_recordInfo: function (e) {
    let check_id = e.currentTarget.dataset.checkId;
    wx.navigateTo({
      url: '/pages/inspect/checkList/recordInfo/recordInfo?check_id='+check_id
    })
  }
})