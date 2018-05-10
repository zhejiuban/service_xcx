// pages/evaluate/evaluate.js

const config = require('../../config');

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    repair_id:'',
    // repair_result:'1',
    //维修结果  1 已修好  0 未修好
    result_status: 1,

    //上传图片的url路径
    imgs: [],
    //上传图片的id
    img_ids: [],
    uploaderImg: "/images/upload.png",
    imgId: "",
    //可以上传图片数量
    img_count: 3,

    //资产详情
    asset_uuid: '',
    asset_name: '',
    category: '',
    field_path: '',
    user_imgs_url:[],
    org_id: '',
    org_name: '',
    equipment_id: '',
    equipment_name: '',
    remarks: ''
  },

  // 按钮触摸开始触发的事件
  touchStart: function (e) {
    this.touchStartTime = e.timeStamp
  },

  // 按钮触摸结束触发的事件
  touchEnd: function (e) {
    this.touchEndTime = e.timeStamp
  },

  // 长按
  longTap: function (e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      success: function (res) {
        if (res.confirm) {
          let imgs = that.data.imgs;
          let img_ids = that.data.img_ids;
          let index = e.currentTarget.dataset.index;
          imgs.splice(index, 1);
          img_ids.splice(index, 1);
          that.setData({
            imgs: imgs,
            img_ids: img_ids
          });
        } else if (res.cancel) {
        }
      }
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
    let that = this;

    //上传签到时间
    wx.request({
      url: config.signTimeUrl,
      method: "POST",
      data: {
        token: app.globalData.token,
        repair_id: options.id,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    })

    wx.request({
      url: config.repairAllInfoUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        repair_id: options.id,
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
          asset_uuid: res.data.asset_uuid,
          equipment_id: res.data.equipment_id ? res.data.equipment_id : '',
          equipment_name: res.data.equipment_name ? res.data.equipment_name : '',
          category: res.data.category ? res.data.category: '暂无分类',
          asset_name: res.data.asset_name,
          field_path: res.data.field_path,
          remarks: res.data.remarks,
          org_id: res.data.org_id,
          org_name: res.data.org_name,
          user_imgs_url: res.data.img_url,
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
    this.setData({
      repair_id: options.id
    });
  },

  radioChange: function (e) {
    let result_status = '';
    if(e.detail.value==1){
      result_status = 1;
    }else{
      result_status = 0;
    }
    this.setData({
      repair_result: e.detail.value,
      result_status: result_status
    });
  },

  selectImg: function () {
    let that = this;
    wx.chooseImage({
      count: that.data.img_count, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        let str = that.data.imgId;
        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            // url: app.globalData.url + 'wx/img_file',
            url: config.imgFileUrl,
            filePath: tempFilePaths[i],
            method: "POST",
            name: 'img',
            formData: {
              token: app.globalData.token,
              openId: app.globalData.openId,
              org_id: that.data.org_id
            },
            header: {
              'content-type': 'multipart/form-data' // 默认值
            },
            success: function (res) {
              if (res.data.code == 1403) {
                app.errorPrompt(res.data);
              }
              let arrs1 = that.data.img_ids.concat(res.data);
              that.setData({
                img_ids: arrs1
              });
            },
            fail: function () {
              wx.hideLoading();
              app.requestError();
            }
          })
        }
        var old_imgs = that.data.imgs.concat(tempFilePaths);
        var count = that.data.img_count - tempFilePaths.length;
        that.setData({
          imgs: old_imgs,
          img_count: count
        });
      }
    })
  },

  imgShow: function (e) {
    let that = this;
    if (that.touchEndTime - that.touchStartTime < 350) {
      let current_src = e.currentTarget.dataset.src;
      wx.previewImage({
        current: current_src, // 当前显示图片的http链接
        urls: [current_src] // 需要预览的图片http链接列表
      })
    }
  },

  //扫码之后填写维修报告
  // form表单提交
  formSubmit: function (e){
    wx.showLoading({
      mask: true,
      title: '加载中',
    });
    let that = this;
    if (e.detail.value.result.length == 0){
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '维修结果描述不能为空',
        showCancel: false,
        success: function (res) {
        }
      })
    } else{
      let result = e.detail.value.result;               //维修结果描述
      let repair_id = that.data.repair_id;              //维修工单id
      let result_status = that.data.result_status;      //维修结果状态
      let imgId = null;                                 //维修人员上传图片
      if (that.data.img_ids.length>0){
        imgId = that.data.img_ids.join(",");
      }

      wx.request({
        url: config.writeResultUrl,
        method: "POST",
        data: {
          role: app.globalData.role,
          token: app.globalData.token,
          openId: app.globalData.openId,
          repair_id: repair_id,
          result: result,
          img_id: imgId,
          result_status: result_status
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if(res.data.code==1){
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/index/over/over'
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
                    url: '/pages/index/over/over'
                  })
                }
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
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
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})