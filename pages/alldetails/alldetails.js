// pages/details/details.js

const config = require('../../config')

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../../images/normal.png',
    selectedSrc: '../../images/selected.png',
    halfSrc: '../../images/half.png',

    //工单详情
    all_info: null,
    repair_id: '',
    repair_no: '',
    asset_id: '',
    area_id: '',
    equipment_id: '',
    equipment_name: '',
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
    result_status: '',
    service_img_url: [],
    create_time: '',
    finish_time: '',
    user_name: '',
    user_phone: '',
    method: '',
    sign_date: '',
    evaluation_time: '',
    appointment: '',
    org_id: '',
    org_name: '',
    worker_phone: '',

    //接单
    items: [
      { code: 1, name: '上门维修' },
      { code: 2, name: '远程协助维修' }
    ],
    service_method: '',

  },
  imgShow: function (e) {
    var that = this;
    var current_url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: current_url, // 当前显示图片的http链接
      urls: that.data.img_url // 需要预览的图片http链接列表
    })
  },

  serviceImgShow: function (e) {
    var that = this;
    var current_url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: current_url, // 当前显示图片的http链接
      urls: that.data.service_img_url // 需要预览的图片http链接列表
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

  click_scan: function (e) {
    // 允许从相机和相册扫码
    var that = this;
    if (e.currentTarget.dataset.assetId == null) {
      //场地报修
      let repair_id = e.currentTarget.dataset.id;
      let area_id = e.currentTarget.dataset.areaId;
      wx.scanCode({
        success: (res) => {
          let url = res.result;
          let area_uuid = app.getUrlParam(url, app.globalData.areas);
          if (area_uuid == '') {
            wx.showModal({
              title: '提示',
              content: '请扫描相对应场地二维码',
              showCancel: false
            })
          } else {
            wx.request({
              url: config.findAreaUrl,
              method: "POST",
              data: {
                role: app.globalData.role,
                token: app.globalData.token,
                openId: app.globalData.openId,
                uuid: area_uuid
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                //比较是否是相对应的场地id
                if (area_id == res.data.area_id) {
                  wx.navigateTo({
                    url: '/pages/result/result?id=' + repair_id,
                  })
                } else if (res.data.code == 1403) {
                  app.errorPrompt(res.data);
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请扫描相对应二维码',
                    showCancel: false
                  })
                }
              },
              fail: function () {
                wx.hideLoading();
                app.requestError();
              }
            });
          }

        }
      });
    } else {
      //判断是设备组报修还是单纯资产报修
      if (e.currentTarget.dataset.equipmentId) {
        //设备组资产报修
        let repair_id = e.currentTarget.dataset.id;
        let equipment_id = e.currentTarget.dataset.equipmentId;
        wx.scanCode({
          success: (res) => {
            let url = res.result;
            let equipment_uuid = app.getUrlParam(url, app.globalData.equipments);
            wx.request({
              url: config.findEquipmentUrl,
              method: "POST",
              data: {
                role: app.globalData.role,
                token: app.globalData.token,
                openId: app.globalData.openId,
                equipment_uuid: equipment_uuid
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                //比较是否是相对应的资产id
                if (equipment_id == res.data.equipment_id) {
                  wx.navigateTo({
                    url: '/pages/result/result?id=' + repair_id,
                  })
                } else if (res.data.code == 1403) {
                  app.errorPrompt(res.data);
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请扫描相对应设备组资产二维码',
                    showCancel: false
                  })
                }
              },
              fail: function () {
                wx.hideLoading();
                app.requestError();
              }
            });
          }
        });
      } else {
        //资产报修
        let repair_id = e.currentTarget.dataset.id;
        let asset_id = e.currentTarget.dataset.assetId;
        wx.scanCode({
          success: (res) => {
            let url = res.result;
            let asset_uuid = app.getUrlParam(url, app.globalData.assets);
            wx.request({
              url: config.assetFindUrl,
              method: "POST",
              data: {
                role: app.globalData.role,
                token: app.globalData.token,
                openId: app.globalData.openId,
                asset_uuid: asset_uuid
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                //比较是否是相对应的资产id
                if (asset_id == res.data.id) {
                  wx.navigateTo({
                    url: '/pages/result/result?id=' + repair_id,
                  })
                } else if (res.data.code == 1403) {
                  app.errorPrompt(res.data);
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请扫描相对应资产二维码',
                    showCancel: false
                  })
                }
              },
              fail: function () {
                wx.hideLoading();
                app.requestError();
              }
            });
          }
        });
      }
    }
  },

  click_help: function (e) {
    let repair_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/result/result?id=' + repair_id,
    })
  },

  to_sign_date: function (e) {
    // 允许从相机和相册扫码
    var that = this;
    let repair_id = e.currentTarget.dataset.id;
    if (e.currentTarget.dataset.assetId == null) {
      //场地报修
      let area_id = e.currentTarget.dataset.areaId;
      wx.scanCode({
        success: (res) => {
          let url = res.result;
          let area_uuid = app.getUrlParam(url, app.globalData.areas);
          if (area_uuid == '') {
            wx.showModal({
              title: '提示',
              content: '请扫描相对应场地二维码',
              showCancel: false
            })
          } else {
            wx.request({
              url: config.findAreaUrl,
              method: "POST",
              data: {
                role: app.globalData.role,
                token: app.globalData.token,
                openId: app.globalData.openId,
                uuid: area_uuid
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                //比较是否是相对应的场地id
                if (area_id == res.data.area_id) {
                  that.sign_date(repair_id);
                } else if (res.data.code == 1403) {
                  app.errorPrompt(res.data);
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请扫描相对应二维码',
                    showCancel: false
                  })
                }
              },
              fail: function () {
                wx.hideLoading();
                app.requestError();
              }
            });
          }
        }
      });
    } else {
      //判断是设备组报修还是单纯资产报修
      if (e.currentTarget.dataset.equipmentId) {
        //设备组资产报修
        let equipment_id = e.currentTarget.dataset.equipmentId;
        wx.scanCode({
          success: (res) => {
            let url = res.result;
            let equipment_uuid = app.getUrlParam(url, app.globalData.equipments);
            wx.request({
              url: config.findEquipmentUrl,
              method: "POST",
              data: {
                role: app.globalData.role,
                token: app.globalData.token,
                openId: app.globalData.openId,
                equipment_uuid: equipment_uuid
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                //比较是否是相对应的资产id
                if (equipment_id == res.data.equipment_id) {
                  that.sign_date(repair_id);
                } else if (res.data.code == 1403) {
                  app.errorPrompt(res.data);
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请扫描相对应设备组资产二维码',
                    showCancel: false
                  })
                }
              },
              fail: function () {
                wx.hideLoading();
                app.requestError();
              }
            });
          }
        });
      } else {
        //资产报修
        let asset_id = e.currentTarget.dataset.assetId;
        wx.scanCode({
          success: (res) => {
            let url = res.result;
            let asset_uuid = app.getUrlParam(url, app.globalData.assets);
            wx.request({
              url: config.assetFindUrl,
              method: "POST",
              data: {
                role: app.globalData.role,
                token: app.globalData.token,
                openId: app.globalData.openId,
                asset_uuid: asset_uuid
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                //比较是否是相对应的资产id
                if (asset_id == res.data.id) {
                  that.sign_date(repair_id);
                } else if (res.data.code == 1403) {
                  app.errorPrompt(res.data);
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请扫描相对应资产二维码',
                    showCancel: false
                  })
                }
              },
              fail: function () {
                wx.hideLoading();
                app.requestError();
              }
            });
          }
        });
      }
    }
  },

  sign_date: function (repair_id) {
    let that = this;
    //上传签到时间
    wx.request({
      url: config.signTimeUrl,
      method: "POST",
      data: {
        token: app.globalData.token,
        repair_id: repair_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.showModal({
            title: '提示',
            content: '签到成功',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/alldetails/alldetails?repair_id=' + repair_id,
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
  },

  radioChange: function (e) {
    let that = this;
    that.setData({
      service_method: e.detail.value
    })
  },

  //确认接单
  confirm_repair: function (e) {
    let that = this;
    if(!that.data.service_method){
      wx.showModal({
        title: '提示',
        content: '请选择维修方式',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            return false;
          }
        }
      })
    }else{
      wx.request({
        url: config.confirmRepairUrl,
        method: "POST",
        data: {
          role: app.globalData.role,
          token: app.globalData.token,
          status: '4',
          openId: app.globalData.openId,
          repair_id: that.data.repair_id,
          methods: that.data.service_method
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == '1') {
            wx.showModal({
              title: '提示',
              content: '接单成功',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/index/assess/assess'
                  })
                }
              }
            })
          } else if (res.data.code == 1403) {
            app.errorPrompt(res.data);
          } else if (res.data.code == 0) {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/index/assess/assess'
                  })
                }
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/index/assess/assess'
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

  //拒单
  refuse_repair: function (e) {
    let repair_id = e.currentTarget.dataset.id;
    let order_status = e.currentTarget.dataset.orderStatus;
    wx.navigateTo({
      url: '/pages/refuse/refuse?repair_id=' + repair_id + "&order_status=" + order_status
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
        } else if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: "/pages/index/service/service"
                })
              }
            }
          })
        }
        let data = res.data;
        that.setData({
          all_info: data,
          repair_id: data.repair_id,
          repair_no: data.repair_no ? data.repair_no : '',
          asset_id: data.asset_id,
          area_id: data.area_id,
          equipment_id: data.equipment_id ? data.equipment_id : '',
          equipment_name: data.equipment_name ? data.equipment_name : '',
          asset_name: data.asset_name,
          field_path: data.field_path,
          remarks: data.remarks,
          img_url: data.img_url,
          stars_key: data.stars_key,
          appraisal: data.appraisal,
          complain: data.complain,
          service_status: data.service_status,
          service_worker: data.service_worker,
          result: data.result,
          service_img_url: data.service_img_url,
          repair_status: data.repair_status,
          create_time: data.create_time,
          finish_time: data.finish_time,
          user_name: data.user_name,
          user_phone: data.user_phone,
          worker_phone: data.worker_phone,
          method: data.method,
          appointment: data.appointment ? data.appointment :'',
          sign_date: data.sign_date,
          evaluation_time: data.evaluation_time,
          result_status: data.result_status,
          org_id: data.org_id,
          org_name: data.org_name,
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

  //下拉刷新
  onPullDownRefresh: function () {
    let that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载

    wx.request({
      url: config.repairAllInfoUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        repair_id: that.data.repair_id,
        openId: app.globalData.openId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        if (res.data.code == 403) {
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
        } else if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: "/pages/index/service/service"
                })
              }
            }
          })
        } else {
          let data = res.data;
          that.setData({
            all_info: data,
            repair_id: data.repair_id,
            repair_no: data.repair_no ? data.repair_no:'',
            asset_id: data.asset_id,
            area_id: data.area_id,
            equipment_id: data.equipment_id ? data.equipment_id : '',
            equipment_name: data.equipment_name ? data.equipment_name : '',
            asset_name: data.asset_name,
            field_path: data.field_path,
            remarks: data.remarks,
            img_url: data.img_url,
            stars_key: data.stars_key,
            appraisal: data.appraisal ? data.appraisal : '',
            complain: data.complain,
            service_status: data.service_status,
            service_worker: data.service_worker,
            result: data.result,
            service_img_url: data.service_img_url,
            repair_status: data.repair_status,
            create_time: data.create_time,
            finish_time: data.finish_time,
            user_name: data.user_name,
            user_phone: data.user_phone,
            worker_phone: data.worker_phone,
            method: data.method,
            appointment: data.appointment,
            result_status: data.result_status,
            sign_date: data.sign_date,
            org_id: data.org_id,
            org_name: data.org_name
          });
        }
      },
      fail: function () {
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