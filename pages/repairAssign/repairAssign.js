let app = getApp();

const config = require('../../config');

Page({
  data: {
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../../images/normal.png',
    selectedSrc: '../../images/selected.png',
    halfSrc: '../../images/half.png',

    //工单详情
    repair_id: '',
    asset_id: '',
    asset_name: '',
    field_path: '',
    remarks: '',
    img_url: [],
    stars_key: '',
    appraisal: '',
    complain: '',
    repair_status: '',    //工单状态
    service_status: '',  //维修状态
    service_worker: '',
    result: '',
    service_img_url: [],
    create_time: '',
    finish_time: '',
    user_phone: '',
    //维修人员列表
    worker_list: [],
    index: 0
  },

  bindPickerChangeWorker: function (e) {
    let that = this;
    that.setData({
      index: e.detail.value,
    });
  },


  onLoad: function (options) {
    app.network_state();
    let repair_id = 184;
    let that = this;
    wx.request({
      url: config.repairAllInfoUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
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
          stars_key: res.data.stars_key,
          appraisal: res.data.appraisal,
          complain: res.data.complain,
          service_status: res.data.service_status,
          service_worker: res.data.service_worker,
          result: res.data.result,
          service_img_url: res.data.service_img_url,
          repair_status: res.data.repair_status,
          create_time: res.data.create_time,
          finish_time: res.data.finish_time,
          user_phone: res.data.user_phone
        });
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      },
      complete: function () {
        wx.hideLoading();
      }
    });

    wx.request({
      url: config.workerListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        repair_id: repair_id,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        }
        let data = res.data;
        let worker_list = [];
        for (let i=0;i<data.length;i++) {
          worker_list[i] = data[i];
        };
        that.setData({
          worker_list: worker_list
        })
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    })
  },

  to_submit: function () {
    let that = this;
    let service_worker = that.data.worker_list[that.data.index];
    let service_worker_id = service_worker.id;
    wx.request({
      url: config.assignWorkerUrl,
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        repair_id: that.data.repair_id,
        service_worker_id: service_worker_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if(res.data.code==1){
          wx.showModal({
            title: '提示',
            content: '维修工单分派成功',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/repairAssignList/repairAssignList',
                })
              }
            }
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    }) 
  }

})