const config = require('../../../config')

let app = getApp();

Page({
  data: {
    winHeight: "",//窗口高度
    currentTab: 1, //预设当前项的值
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
    page: 1,   //分页
    items: [],
    status: 3,
    content: '1',    //判断上拉是否还有数据
    itemsLength: '1'  //获取有无数据
  },
  swichNav1: function () {
    app.swichNav('/pages/index/service/service');
  },
  swichNav2: function () {
    app.swichNav('/pages/index/assess/assess');
  },
  swichNav3: function () {
    app.swichNav('/pages/index/over/over');
  },
  swichNav4: function () {
    app.swichNav('/pages/index/all/all');
  },

  onLoad: function () {
    app.network_state();
    wx.showLoading({
      mask: true,
      title: '加载中',
    });
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
      url: config.serviceListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: that.data.status,
        openId: app.globalData.openId,
        page: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            itemsLength: '0',
            page: 1
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
            arr[i] = {
              img_url: data[i].img_url,
              name: data[i].name,
              path: data[i].path,
              repair_id: data[i].repair_id,
              asset_id: data[i].asset_id,
              area_id: data[i].area_id,
              equipment_id: data[i].equipment_id,
              method: data[i].method,
              sign_date: data[i].sign_date,
              org: data[i].org
            };
          }
          that.setData({
            items: arr,
            itemsLength: '1'
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
    //that.onLoad();
  },

  click_scan: function (e) {
    // 允许从相机和相册扫码
    var that = this;
    if (e.currentTarget.dataset.assetId==null){
      //场地报修
      let repair_id = e.currentTarget.dataset.id;
      let area_id = e.currentTarget.dataset.areaId;
      wx.scanCode({
        success: (res) => {
          let url = res.result;
          let area_uuid = app.getUrlParam(url, app.globalData.areas);
          if (area_uuid==''){
            wx.showModal({
              title: '提示',
              content: '请扫描相对应场地二维码',
              showCancel: false
            })
          }else{
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
    } else{
      //判断是设备组报修还是单纯资产报修
      if (e.currentTarget.dataset.equipmentId){
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
              },
            });
          }
        });
      }else{
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

  to_sign_time: function (e) {
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
                  that.sign_time(repair_id);
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
              },
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
                  that.sign_time(repair_id);
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
              },
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
                  that.sign_time(repair_id);
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

  sign_time: function (repair_id) {
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
                wx.redirectTo({
                  url: '/pages/index/assess/assess',
                });
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
      },
    })
  },

  click_help: function (e) {
    let repair_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/result/result?id=' + repair_id,
    })
  },

  // 查看详情包括评论
  clickAllDetail: function (e) {
    let repair_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/alldetails/alldetails?status=' + this.data.status + '&repair_id=' + repair_id,
    })
  },

  // 扫码报修
  scanCode: function () {
    app.scanCode();
  },

  // 回到首页
  toIndex: function () {
    app.toIndex();
  },

  // 我的
  toMe: function () {
    app.toMe();
  },

  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },

  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    let cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
  },

  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 4) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },

  // 点击跳转到填写维修结果页面
  to_result: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/result/result?id=' + id,
    })
  },

  // 图片预览
  prev_img: function (e) {
    let url = e.currentTarget.dataset.url['0'];
    let urls = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    // console.log(1);
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let that = this;
    wx.request({
      url: config.serviceListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: that.data.status,
        openId: app.globalData.openId,
        page: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({
          items: [],
          page: 1,
          itemsLength: '1',
          content: '1',
        });
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        if (res.data.code == 0) {
          that.setData({
            itemsLength: '0',
            content: '1',
            page: 1
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        } else {
          let arr = [];
          let data = res.data;
          for (var i = 0; i < data.length; i++) {
            arr[i] = {
              img_url: data[i].img_url,
              name: data[i].name,
              path: data[i].path,
              repair_id: data[i].repair_id,
              asset_id: data[i].asset_id,
              area_id: data[i].area_id,
              equipment_id: data[i].equipment_id,
              method: data[i].method,
              sign_date: data[i].sign_date,
              org: data[i].org
            };
          }
          that.setData({
            items: arr,
            page: 1,
            itemsLength: 1,
            content: '1',
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
    console.log(12);
    let that = this;
    wx.showLoading();
    wx.request({
      url: config.serviceListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: that.data.status,
        openId: app.globalData.openId,
        page: that.data.page + 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.message,
            success: function (res) {
            }
          })
        } else if (res.data.code == 0) {
          that.setData({
            content: '0'
          })
        } else if (res.data.length > 0) {
          let arr = [];
          let data = res.data;
          for (var i = 0; i < data.length; i++) {
            arr[i] = {
              img_url: data[i].img_url,
              name: data[i].name,
              path: data[i].path,
              repair_id: data[i].repair_id,
              asset_id: data[i].asset_id,
              area_id: data[i].area_id,
              equipment_id: data[i].equipment_id,
              method: data[i].method,
              sign_date: data[i].sign_date,
              org: data[i].org
            };
          }
          let arr1 = that.data.items;
          let arrs = arr1.concat(arr);
          that.setData({
            items: arr,
            page: that.data.page + 1
          });
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
  // 转发
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '这就办维修平台',
      path: '/pages/index/inde',
      imageUrl: '/images/1.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  footerTap: app.footerTap
})