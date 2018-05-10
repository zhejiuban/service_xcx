// pages/inspect/checkList/checkRecord/checkRecord.js

const config = require('../../../../config')

let app = new getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: [{ status: 0, name: '有问题暂时无法解决，请求支持' }, { status: 1, name: '检查正常' },{status:2,name:'有问题已整改'}],
    index: 1,

    //上传图片的url路径
    imgs: [],
    //上传图片的id
    img_ids: [],
    uploaderImg: "/images/upload.png",
    imgId: "",
    //可以上传图片数量
    img_count: 3,

    org_id: '',
    check_id: '',
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    });
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
            url: app.globalData.url + 'wx/img_file',
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


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.network_state();
    //获取到点检单的id  check_id
    this.setData({
      check_id: options.check_id,
      org_id: options.org_id
    });
  },

  formSubmit: function(e) {
    let that = this;
    let imgId = that.data.img_ids.join(",");
    wx.request({
      url: config.checkResultUrl,
      method: "POST",
      data: {
        token: app.globalData.token,
        openId: app.globalData.openId,
        check_id: that.data.check_id,
        asset_status: e.detail.value.asset_status,
        remarks: e.detail.value.remarks,
        img_id: imgId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/inspect/checkList/service/service'
                })
              }
            }
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
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
      }
    })
  }
})