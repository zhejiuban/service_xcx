// pages/inspect/checkList/checkInfo/checkInfo.js

const config = require('../../../../config')

let app = new getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    check_id: '',
    org_id: '',
    //资产详情
    asset_id: '',
    asset_uuid: '',
    asset_name: '',
    asset_category: '',
    //设备组详情
    equipment_id: '',
    equipment_uuid: '',
    equipment_name: '',
    area: '',
    spec:'',
    img_url: '',
    items:[],
    status: '',
    bottom: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    wx.showLoading({
      title: '加载中...',
    })
    let that = this;
    that.setData({
      check_id: options.check_id,
      status: options.status
    });
    if (options.status==1){
      that.setData({
        bottom: 100
      });
    }
    wx.request({
      url: config.assetCheckUrl,
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
          let data = res.data;
          that.setData({
            check_id: data.check_id,
            org_id: data.org_id,

            //资产
            asset_uuid: data.asset_uuid ? data.asset_uuid : null,
            asset_id: data.asset_id ? data.asset_id : null,
            asset_name: data.asset_name ? data.asset_name : null,
            asset_category: data.asset_category ? data.asset_category : null,
            //设备组
            equipment_id: data.equipment_id ? data.equipment_id : null,
            equipment_uuid: data.equipment_uuid ? data.equipment_uuid : null,
            equipment_name: data.equipment_name ? data.equipment_name : null,

            img_url: JSON.stringify(data.img_url) == "{}" ? null : data.img_url,
            area: data.area,
            spec: data.spec ? data.spec : '暂无',
            items: data.check_list.data,
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

  asset_check:function(check_id){
    let that = this;
    wx.request({
      url: config.assetCheckUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        check_id: check_id
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
          let data = res.data;
          that.setData({
            check_id: data.check_id,
            org_id: data.org_id,
            asset_uuid: data.asset_uuid,
            asset_id: data.asset_id,
            asset_name: data.asset_name,
            asset_category: data.asset_category,
            img_url: JSON.stringify(data.img_url) == "{}" ? null : data.img_url,
            area: data.area,
            spec: data.spec ? data.spec : '暂无',
            items: data.check_list.data,
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
  to_recordList: function (e) {
    if (e.currentTarget.dataset.assetId){
      let asset_id = e.currentTarget.dataset.assetId;
      wx.navigateTo({
        url: '/pages/inspect/checkList/recordList/recordList?asset_id=' + asset_id
      })
    }else{
      let equipment_id = e.currentTarget.dataset.equipmentId;
      wx.navigateTo({
        url: '/pages/inspect/checkList/recordList/recordList?equipment_id=' + equipment_id
      })
    }
    
  },

  to_recordInfo: function (e) {
    let check_id = e.currentTarget.dataset.checkId;
    wx.navigateTo({
      url: '/pages/inspect/checkList/recordInfo/recordInfo?check_id='+check_id
    })
  },

  to_checkRecord: function (e) {
    wx.navigateTo({
      url: '/pages/inspect/checkList/checkRecord/checkRecord?asset_id='+e.currentTarget.dataset.id
    })
  },

  click_scan: function (e) {
    // 允许从相机和相册扫码
    var that = this;
    let check_id = e.currentTarget.dataset.checkId;
    let assetUuid = e.currentTarget.dataset.assetUuid;
    let equipmentUuid = e.currentTarget.dataset.equipmentUuid;
    let org_id = e.currentTarget.dataset.orgId;
    wx.scanCode({
      success: (res) => {
        let url = res.result;
        if (assetUuid){
          //扫描出的二维码
          let asset_uuid = app.getUrlParam(url, app.globalData.assets);
          //利用扫描出的二维码asset_uuid和本身点检单的assetUuid对比
          if (asset_uuid == assetUuid) {
            wx.navigateTo({
              url: '/pages/inspect/checkList/checkRecord/checkRecord?check_id=' + check_id + "&org_id=" + org_id,
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '请扫描对应资产二维码',
              showCancel: false
            })
          }
        }else{
          //扫描出的二维码
          let equipment_uuid = app.getUrlParam(url, app.globalData.equipments);
          //利用扫描出的二维码asset_uuid和本身点检单的assetUuid对比
          if (equipment_uuid == equipmentUuid) {
            wx.navigateTo({
              url: '/pages/inspect/checkList/checkRecord/checkRecord?check_id=' + check_id + "&org_id=" + org_id,
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '请扫描对应设备组二维码',
              showCancel: false
            })
          }
        }
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})